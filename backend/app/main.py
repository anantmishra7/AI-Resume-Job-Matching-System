"""
FastAPI Main Application Gateway.
Provides endpoints for Job Descriptions, Resume Uploads, Candidate Ranking,
Explainable Analysis, and Forensic Claim Audits.
"""

import os
import shutil
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .models import (
    JobDescription, CandidateProfile, CandidateRankResult,
    ScoreBreakdown, ContradictionReport, ExplainableMatch
)
from .parser import parse_document
from .extractor import extract_candidate_profile
from .contradiction import verify_candidate_claims
from .scoring import compute_candidate_score
from .explainability import build_explainable_match
from .sample_data import SAMPLE_JOBS, SAMPLE_CANDIDATE_TEXTS

app = FastAPI(
    title="AI Resume & Job Matching API (ALG-AI-01)",
    description="Intelligent ATS with Multi-Vector Ranking & Forensic Claim Contradiction Detection",
    version="1.0.0"
)

# Enable CORS for local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-Memory Cache
JOBS_DB: Dict[str, JobDescription] = {}
CANDIDATES_DB: Dict[str, CandidateProfile] = {}

def initialize_samples():
    """Populate database with sample jobs and realistic resumes."""
    JOBS_DB.clear()
    CANDIDATES_DB.clear()

    for job in SAMPLE_JOBS:
        JOBS_DB[job.id] = job

    for filename, raw_text in SAMPLE_CANDIDATE_TEXTS:
        profile = extract_candidate_profile(filename, raw_text)
        CANDIDATES_DB[profile.id] = profile

initialize_samples()

# ==========================================
# API Endpoints
# ==========================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "AI Resume & Job Matching System",
        "jobs_count": len(JOBS_DB),
        "candidates_count": len(CANDIDATES_DB)
    }

@app.get("/api/jobs", response_model=List[JobDescription])
def get_jobs():
    """List all available job requisitions."""
    return list(JOBS_DB.values())

@app.get("/api/jobs/{job_id}", response_model=JobDescription)
def get_job(job_id: str):
    """Retrieve details for a specific job."""
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job description not found")
    return JOBS_DB[job_id]

@app.post("/api/jobs", response_model=JobDescription)
def create_job(job: JobDescription):
    """Create or update a job description."""
    if not job.id:
        job.id = f"job-{len(JOBS_DB) + 1}"
    JOBS_DB[job.id] = job
    return job

@app.post("/api/upload")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    Upload multiple resumes (PDF, DOCX, TXT),
    extract entities, and register candidates into the platform.
    """
    processed = []
    for file in files:
        filename = file.filename or "resume.txt"
        contents = await file.read()
        
        # Save to uploads dir
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(contents)

        # Parse and extract
        raw_text = parse_document(filename, contents)
        profile = extract_candidate_profile(filename, raw_text)
        CANDIDATES_DB[profile.id] = profile
        processed.append({
            "id": profile.id,
            "name": profile.name,
            "filename": profile.filename,
            "skills_count": len(profile.skills),
            "experience_years": profile.total_experience_years,
            "degree": profile.highest_degree
        })

    return {
        "message": f"Successfully parsed and registered {len(processed)} resumes.",
        "candidates": processed
    }

@app.get("/api/candidates", response_model=List[CandidateRankResult])
def get_ranked_candidates(job_id: Optional[str] = Query(None)):
    """
    Rank all registered candidates against selected job description.
    Runs multi-vector scoring, contradiction verification, and builds explainability.
    """
    if not JOBS_DB:
        return []

    # Clean job_id if invoked programmatically
    actual_job_id = job_id if isinstance(job_id, str) and job_id.strip() else None
    target_job = JOBS_DB.get(actual_job_id) if actual_job_id else list(JOBS_DB.values())[0]
    if not target_job:
        raise HTTPException(status_code=404, detail="No active job description found.")

    results: List[CandidateRankResult] = []

    for candidate_id, candidate in CANDIDATES_DB.items():
        # 1. Forensic Claim Verification (Innovation Bonus)
        contradiction_report = verify_candidate_claims(candidate)

        # 2. Multi-Vector Algorithmic Scoring
        score, matched_req, matched_pref, missing_req, missing_pref = compute_candidate_score(
            candidate, target_job, contradiction_report
        )

        # 3. Explainability Engine
        explainability = build_explainable_match(
            candidate, target_job, score, contradiction_report,
            matched_req, matched_pref, missing_req, missing_pref
        )

        results.append(CandidateRankResult(
            rank=1,
            candidate=candidate,
            score=score,
            contradiction_report=contradiction_report,
            explainability=explainability
        ))

    # Sort candidates descending by final score
    results.sort(key=lambda x: x.score.final_score, reverse=True)

    # Assign 1-indexed ranks
    for idx, res in enumerate(results):
        res.rank = idx + 1

    return results

@app.get("/api/candidate/{candidate_id}", response_model=CandidateRankResult)
def get_candidate_detail(candidate_id: str, job_id: Optional[str] = Query(None)):
    """Retrieve full explainable match breakdown for a single candidate."""
    if candidate_id not in CANDIDATES_DB:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate = CANDIDATES_DB[candidate_id]
    actual_job_id = job_id if isinstance(job_id, str) and job_id.strip() else None
    target_job = JOBS_DB.get(actual_job_id) if actual_job_id else list(JOBS_DB.values())[0]

    contradiction_report = verify_candidate_claims(candidate)
    score, matched_req, matched_pref, missing_req, missing_pref = compute_candidate_score(
        candidate, target_job, contradiction_report
    )
    explainability = build_explainable_match(
        candidate, target_job, score, contradiction_report,
        matched_req, matched_pref, missing_req, missing_pref
    )

    return CandidateRankResult(
        rank=1,
        candidate=candidate,
        score=score,
        contradiction_report=contradiction_report,
        explainability=explainability
    )

@app.post("/api/compare")
def compare_candidates(payload: Dict[str, Any]):
    """Compare 2-3 candidates side-by-side across all evaluation vectors."""
    candidate_ids = payload.get("candidate_ids", [])
    job_id = payload.get("job_id")
    target_job = JOBS_DB.get(job_id) if job_id else list(JOBS_DB.values())[0]

    compared = []
    for cid in candidate_ids:
        if cid in CANDIDATES_DB:
            c = CANDIDATES_DB[cid]
            contra = verify_candidate_claims(c)
            sc, mr, mp, xr, xp = compute_candidate_score(c, target_job, contra)
            exp = build_explainable_match(c, target_job, sc, contra, mr, mp, xr, xp)
            compared.append({
                "candidate": c,
                "score": sc,
                "contradiction": contra,
                "explainability": exp
            })

    return {
        "job": target_job,
        "comparisons": compared
    }

@app.post("/api/reset-samples")
def reset_samples():
    """Reset to clean initial state with sample jobs and benchmark resumes."""
    initialize_samples()
    return {"message": "Database successfully reset to standard benchmark state."}

# Mount static files if frontend is built
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "..", "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
