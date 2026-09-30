# CYCLOCAST AI
### Cyclone Impact & Infrastructure Vulnerability Forecaster
> **Tagline:** *Predict. Prioritize. Protect.*

---

## 📌 Project Overview
**CYCLOCAST AI** is an AI-powered disaster intelligence platform engineered to estimate localized cyclone impact, evaluate critical infrastructure vulnerability, prioritize emergency interventions, and generate automated early-warning advisories.

The core workflow:
```
Cyclone/Weather Data
  ↳ Hazard Analysis
    ↳ Infrastructure Exposure
      ↳ Vulnerability/Risk Calculation (40/30/20/10)
        ↳ Gemini Multimodal Reasoning
          ↳ Priority Actions
            ↳ Emergency Advisory
```

---

## 🧮 Transparent Risk Model

Risk scores are strictly deterministic and explainable:

$$\text{Risk Score} = 40\% \text{ Hazard Exposure} + 30\% \text{ Infrastructure Vulnerability} + 20\% \text{ Infrastructure Criticality} + 10\% \text{ Accessibility Risk}$$

### Risk Categorization:
- **`0 – 30`**: **LOW**
- **`31 – 60`**: **MODERATE**
- **`61 – 80`**: **HIGH**
- **`81 – 100`**: **CRITICAL**

### Evaluated Infrastructure Types:
1. **Hospitals** (Trauma care, ICU, backup power)
2. **Roads** (Evacuation corridors, flood chokepoints)
3. **Bridges** (River causeways, pier scour risks)
4. **Power Stations** (220kV/132kV transmission nodes, flood-susceptible transformers)
5. **Emergency Shelters** (Stilt-mounted high-elevation cyclone centers)

Each asset tracks: `name`, `type`, `latitude`, `longitude`, `criticality`, `elevation`, `population_served`, `flood_exposure`, `vulnerability`, and `accessibility_risk`.

---

## 🏗️ Architecture

```
CycloCast AI/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI REST Endpoints (cyclone, risk, infra, ai)
│   │   ├── models/              # Pydantic Schemas (cyclone, infrastructure, risk)
│   │   ├── services/            # RiskEngine (40/30/20/10), DataLoader, GeminiService
│   │   ├── config.py            # Environment configuration
│   │   └── main.py              # FastAPI app & CORS
│   ├── data/
│   │   ├── sample_cyclones.json # Realistic storm tracks (Cyclone Dana, Cat 4, Super Cyclone)
│   │   └── sample_infrastructure.json # 18 coastal infrastructure nodes
│   ├── requirements.txt
│   └── run.py                   # Runner script (port 8000)
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js 16 App Router
│   │   ├── components/          # Map, Metrics, ControlPanel, InfrastructureList, GeminiPanel
│   │   ├── services/api.ts      # API client with automatic client fallback
│   │   └── types/               # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
# Copy environment template
cp .env.example .env
# Start the backend server
python run.py
```
Backend API will be running at `http://localhost:8000`. Swagger documentation available at `http://localhost:8000/docs`.

### 2. Frontend (Next.js + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`):
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_MAPS_API_KEY=
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```
> *Note:* If `GEMINI_API_KEY` is not provided, the platform automatically switches to its deterministic grounded rule-based reasoning engine so all features remain functional out-of-the-box.

### Frontend (`frontend/.env.local`):
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
