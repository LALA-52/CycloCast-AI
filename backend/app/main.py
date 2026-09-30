from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes_infrastructure import router as infrastructure_router
from app.api.routes_cyclone import router as cyclone_router
from app.api.routes_risk import router as risk_router
from app.api.routes_gemini import router as gemini_router
from app.api.routes_gee import router as gee_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(infrastructure_router, prefix="/api")
app.include_router(cyclone_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(gemini_router, prefix="/api")
app.include_router(gee_router, prefix="/api")

@app.get("/health")
def health_check():
    """
    Health check endpoint returning service status.
    """
    return {
        "status": "ok",
        "service": "CycloCast AI"
    }

@app.get("/")
def read_root():
    """
    Root endpoint for service discovery.
    """
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
