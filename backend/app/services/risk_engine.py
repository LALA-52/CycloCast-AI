import math
from datetime import datetime, timezone
from typing import List, Tuple
from app.models.cyclone import Cyclone
from app.models.infrastructure import Infrastructure, InfrastructureType
from app.models.risk import (
    InfrastructureRiskAssessment,
    RiskCategory,
    RiskOverviewSummary
)

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    R = 6371.0 # Radius of earth in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class RiskEngine:
    """
    Transparent Risk Model Implementation:
    Risk Score = 40% Hazard Exposure + 30% Infrastructure Vulnerability + 20% Infrastructure Criticality + 10% Accessibility Risk
    Categories:
    0–30 = LOW
    31–60 = MODERATE
    61–80 = HIGH
    81–100 = CRITICAL
    """

    @staticmethod
    def calculate_risk(
        hazard_exposure: float,
        vulnerability: float,
        criticality: float,
        accessibility_risk: float
    ) -> Tuple[float, RiskCategory]:
        """
        Pure transparent risk calculation service:
        Risk = 40% Hazard Exposure + 30% Vulnerability + 20% Criticality + 10% Accessibility Risk
        Normalized to 0–100.
        Categories:
          0–30 LOW
          31–60 MODERATE
          61–80 HIGH
          81–100 CRITICAL
        """
        raw_score = (
            (0.40 * hazard_exposure)
            + (0.30 * vulnerability)
            + (0.20 * criticality)
            + (0.10 * accessibility_risk)
        )
        risk_score = round(max(0.0, min(100.0, raw_score)), 1)

        if risk_score <= 30.0:
            category = RiskCategory.LOW
        elif risk_score <= 60.0:
            category = RiskCategory.MODERATE
        elif risk_score <= 80.0:
            category = RiskCategory.HIGH
        else:
            category = RiskCategory.CRITICAL

        return risk_score, category

    @staticmethod
    def calculate_hazard_exposure(
        distance_km: float,
        cyclone: Cyclone,
        infra: Infrastructure
    ) -> Tuple[float, bool, bool, float]:
        """
        Calculates local hazard exposure (0-100) based on wind radii, distance to cyclone center,
        and elevation vs projected storm surge.
        Returns: (hazard_exposure, in_destructive_zone, in_gale_zone, projected_surge_threat_m)
        """
        in_destructive = distance_km <= cyclone.radius_destructive_km
        in_gale = distance_km <= cyclone.radius_gale_km

        # 1. Wind component (0 to 100)
        if in_destructive:
            # Inside destructive core
            ratio = max(0.0, 1.0 - (distance_km / max(1.0, cyclone.radius_destructive_km)))
            wind_exposure = 85.0 + (ratio * 15.0) # 85 - 100
        elif in_gale:
            # Between destructive radius and gale radius
            gale_span = max(1.0, cyclone.radius_gale_km - cyclone.radius_destructive_km)
            dist_in_gale = distance_km - cyclone.radius_destructive_km
            decay = 1.0 - (dist_in_gale / gale_span)
            wind_exposure = 45.0 + (decay * 40.0) # 45 - 85
        else:
            # Outside gale radius; falls off rapidly
            excess_dist = distance_km - cyclone.radius_gale_km
            decay = max(0.0, 1.0 - (excess_dist / 150.0))
            wind_exposure = decay * 40.0 # 0 - 40

        # Adjust for storm intensity (category multiplier)
        intensity_factor = min(1.2, 0.7 + (cyclone.category * 0.1))
        adjusted_wind_exposure = min(100.0, wind_exposure * intensity_factor)

        # 2. Surge / Inundation component (0 to 100)
        # Higher if elevation is low and within coastal surge reach
        surge_threat = max(0.0, cyclone.estimated_storm_surge_m - (infra.elevation * 0.4))
        
        # Surge attenuates with distance from coast/center
        distance_attenuation = max(0.0, 1.0 - (distance_km / max(50.0, cyclone.radius_gale_km)))
        surge_exposure = min(100.0, (surge_threat / 4.0) * 100.0 * distance_attenuation)
        
        # Factor in asset's historical flood exposure
        surge_exposure = (0.6 * surge_exposure) + (0.4 * infra.flood_exposure)

        # Composite Hazard Exposure (60% Wind Hazard + 40% Surge/Flood Hazard)
        composite_hazard = (0.60 * adjusted_wind_exposure) + (0.40 * surge_exposure)
        composite_hazard = max(0.0, min(100.0, round(composite_hazard, 1)))

        return composite_hazard, in_destructive, in_gale, round(surge_threat, 2)

    @classmethod
    def assess_infrastructure(
        cls,
        infra: Infrastructure,
        cyclone: Cyclone
    ) -> InfrastructureRiskAssessment:
        distance_km = calculate_haversine_distance(
            cyclone.center_lat,
            cyclone.center_lon,
            infra.latitude,
            infra.longitude
        )

        hazard_exposure, in_destructive, in_gale, surge_threat = cls.calculate_hazard_exposure(
            distance_km,
            cyclone,
            infra
        )

        # Standard transparent weights per specification:
        # 40% Hazard Exposure + 30% Infrastructure Vulnerability + 20% Infrastructure Criticality + 10% Accessibility Risk
        hazard_comp = round(0.40 * hazard_exposure, 2)
        vuln_comp = round(0.30 * infra.vulnerability, 2)
        crit_comp = round(0.20 * infra.criticality, 2)
        access_comp = round(0.10 * infra.accessibility_risk, 2)

        risk_score = round(hazard_comp + vuln_comp + crit_comp + access_comp, 1)
        risk_score = max(0.0, min(100.0, risk_score))

        # Risk categories: 0–30 LOW, 31–60 MODERATE, 61–80 HIGH, 81–100 CRITICAL
        if risk_score <= 30.0:
            category = RiskCategory.LOW
        elif risk_score <= 60.0:
            category = RiskCategory.MODERATE
        elif risk_score <= 80.0:
            category = RiskCategory.HIGH
        else:
            category = RiskCategory.CRITICAL

        # Primary failure mode and mitigation recommendation
        failure_mode, mitigation = cls._derive_failure_and_mitigation(
            infra, hazard_exposure, in_destructive, surge_threat, risk_score
        )

        return InfrastructureRiskAssessment(
            infrastructure=infra,
            distance_to_eye_km=distance_km,
            hazard_exposure=hazard_exposure,
            vulnerability_component=vuln_comp,
            hazard_component=hazard_comp,
            criticality_component=crit_comp,
            accessibility_component=access_comp,
            risk_score=risk_score,
            risk_category=category,
            in_destructive_zone=in_destructive,
            in_gale_zone=in_gale,
            projected_surge_threat_m=surge_threat,
            recommended_priority_level=1, # Will be set during sorting
            primary_failure_mode=failure_mode,
            recommended_mitigation=mitigation
        )

    @classmethod
    def evaluate_all(
        cls,
        infrastructures: List[Infrastructure],
        cyclone: Cyclone
    ) -> RiskOverviewSummary:
        assessments: List[InfrastructureRiskAssessment] = []
        for infra in infrastructures:
            assessments.append(cls.assess_infrastructure(infra, cyclone))

        # Sort descending by risk score, then criticality
        assessments.sort(
            key=lambda a: (a.risk_score, a.infrastructure.criticality, a.infrastructure.population_served),
            reverse=True
        )

        # Assign priority ranking (1 is highest risk)
        for idx, item in enumerate(assessments):
            item.recommended_priority_level = idx + 1

        critical_count = sum(1 for a in assessments if a.risk_category == RiskCategory.CRITICAL)
        high_count = sum(1 for a in assessments if a.risk_category == RiskCategory.HIGH)
        moderate_count = sum(1 for a in assessments if a.risk_category == RiskCategory.MODERATE)
        low_count = sum(1 for a in assessments if a.risk_category == RiskCategory.LOW)

        avg_score = round(
            sum(a.risk_score for a in assessments) / max(1, len(assessments)), 1
        ) if assessments else 0.0

        pop_critical = sum(
            a.infrastructure.population_served
            for a in assessments
            if a.risk_category == RiskCategory.CRITICAL
        )
        pop_high = sum(
            a.infrastructure.population_served
            for a in assessments
            if a.risk_category == RiskCategory.HIGH
        )

        # By type breakdown
        by_type: dict = {}
        for a in assessments:
            t = a.infrastructure.type.value
            if t not in by_type:
                by_type[t] = {"CRITICAL": 0, "HIGH": 0, "MODERATE": 0, "LOW": 0, "TOTAL": 0}
            by_type[t][a.risk_category.value] += 1
            by_type[t]["TOTAL"] += 1

        avg_flood = round(
            sum(a.hazard_exposure for a in assessments) / max(1, len(assessments)), 1
        ) if assessments else 0.0

        avg_infra = round(
            sum(a.infrastructure.vulnerability for a in assessments) / max(1, len(assessments)), 1
        ) if assessments else 0.0

        avg_evac = round(
            sum(a.infrastructure.accessibility_risk for a in assessments) / max(1, len(assessments)), 1
        ) if assessments else 0.0

        return RiskOverviewSummary(
            total_assets=len(assessments),
            critical_count=critical_count,
            critical_asset_count=critical_count,
            high_count=high_count,
            moderate_count=moderate_count,
            low_count=low_count,
            average_risk_score=avg_score,
            overall_risk_score=avg_score,
            flood_risk_score=avg_flood,
            infrastructure_risk_score=avg_infra,
            evacuation_risk_score=avg_evac,
            population_at_critical_risk=pop_critical,
            population_at_high_risk=pop_high,
            highest_risk_infrastructure=assessments,
            by_type_breakdown=by_type,
            cyclone_id=cyclone.id,
            calculation_timestamp=datetime.now(timezone.utc).isoformat(),
            model_version="transparent-v1.0 (40% Haz + 30% Vuln + 20% Crit + 10% Access)"
        )

    @staticmethod
    def _derive_failure_and_mitigation(
        infra: Infrastructure,
        hazard_exposure: float,
        in_destructive: bool,
        surge_threat: float,
        risk_score: float
    ) -> Tuple[str, str]:
        itype = infra.infrastructure.type if hasattr(infra, "infrastructure") else infra.type

        if itype == InfrastructureType.HOSPITAL:
            if surge_threat > 1.0 or infra.flood_exposure > 70:
                return (
                    "Ground floor flooding and backup generator failure due to low elevation and storm surge",
                    "Deploy submersible pumps, move critical ICU equipment/patients to upper floors, pre-position mobile generators on elevated pads."
                )
            elif in_destructive:
                return (
                    "Structural roof damage and access road blockage from high wind debris",
                    "Inspect structural anchors, secure backup medical oxygen cylinders, pre-stage road clearance crews."
                )
            else:
                return (
                    "Access disruption and patient overload during evacuation",
                    "Activate mass-casualty surge protocol, establish tele-medicine relay and backup satellite comms."
                )

        elif itype == InfrastructureType.POWER_STATION:
            if surge_threat > 1.2 or infra.elevation < 5.0:
                return (
                    "Substation control room flooding and high-voltage transformer short-circuit",
                    "Execute controlled sectional isolation, install temporary flood deflection barriers, ready mobile emergency substations."
                )
            elif in_destructive:
                return (
                    "Transmission tower buckling and line snap under gale-force gusts",
                    "De-energize vulnerable feeder lines prior to landfall to prevent transformer explosions; stage emergency recon poles."
                )
            else:
                return (
                    "Feeder line tripping due to wind-blown vegetation and salt spray",
                    "Trim perimeter tree branches along 33kV lines, wash insulators to prevent flashover."
                )

        elif itype == InfrastructureType.BRIDGE:
            if surge_threat > 1.5 or hazard_exposure > 75:
                return (
                    "Hydrodynamic wave impact on superstructure and approach road scouring",
                    "Close bridge to non-emergency heavy traffic 6h before landfall; inspect pier scour sensors; place rock armor along abutments."
                )
            else:
                return (
                    "Wind gust hazard for high-profile emergency relief vehicles",
                    "Enforce speed restrictions and temporary truck closures if gusts exceed 80 km/h."
                )

        elif itype == InfrastructureType.ROAD:
            if surge_threat > 0.8 or infra.elevation < 4.0:
                return (
                    "Complete inundation and coastal embankment washout cutting off evacuation corridor",
                    "Establish bypass detours via elevated inland routes (e.g. NH-16); mark flood poles; deploy water-rescue boats."
                )
            else:
                return (
                    "Tree falls and utility pole collapse blocking emergency transit",
                    "Pre-position heavy JCB excavators and motorized chainsaw teams every 10 km along corridor."
                )

        elif itype == InfrastructureType.EMERGENCY_SHELTER:
            if risk_score > 60:
                return (
                    "Access road impassability preventing evacuees from reaching shelter",
                    "Initiate priority bus evacuations at least 12 hours prior to landfall; test auxiliary solar power and potable water supply."
                )
            else:
                return (
                    "Overcapacity and communication blackout during peak storm intensity",
                    "Verify satellite phone link, verify stock of emergency rations for 5 days, manage intake registration."
                )

        return (
            "Multi-hazard environmental exposure",
            "Continuous monitoring and deployment of rapid assessment team post-landfall."
        )

risk_engine = RiskEngine()
