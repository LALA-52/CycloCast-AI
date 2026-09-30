from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes_infrastructure import router as infrastructure_router

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

# Mount Infrastructure API
app.include_router(infrastructure_router, prefix="/api")

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
