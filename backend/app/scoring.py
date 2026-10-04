"""
Candidate scoring and ranking engine.
Implements multi-vector scoring: Hard Skills, Experience Fit, Education, Semantic Cosine Similarity,
and incorporates Forensic Claim Verification penalties.
"""

import math
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .models import JobDescription, CandidateProfile, ScoreBreakdown, ContradictionReport
from .ontology import normalize_skill

DEGREE_WEIGHTS = {
    "PhD": 4,
    "Master": 3,
    "Bachelor": 2,
    "Associate": 1,
    "High School": 0,
    "Unknown": 1
}

def calculate_skills_score(candidate: CandidateProfile, job: JobDescription) -> Tuple[float, List[str], List[str], List[str], List[str]]:
    """
    Compute overlap of required and preferred skills.
    Returns (score, matched_req, matched_pref, missing_req, missing_pref).
    """
    candidate_skills_set = set(s.lower() for s in candidate.skills)

    matched_req = []
    missing_req = []
    for req in job.required_skills:
        req_norm = normalize_skill(req).lower()
        if req_norm in candidate_skills_set or any(req_norm in s for s in candidate_skills_set):
            matched_req.append(req)
        else:
            missing_req.append(req)

    matched_pref = []
    missing_pref = []
    for pref in job.preferred_skills:
        pref_norm = normalize_skill(pref).lower()
        if pref_norm in candidate_skills_set or any(pref_norm in s for s in candidate_skills_set):
            matched_pref.append(pref)
        else:
            missing_pref.append(pref)

    req_score = (len(matched_req) / len(job.required_skills)) if job.required_skills else 1.0
    pref_score = (len(matched_pref) / len(job.preferred_skills)) if job.preferred_skills else 1.0

    # 70% required skills, 30% preferred skills
    skill_score = (req_score * 0.70) + (pref_score * 0.30)
    return round(skill_score * 100.0, 1), matched_req, matched_pref, missing_req, missing_pref

def calculate_experience_score(candidate_exp: float, required_exp: float) -> float:
    """
    Compute experience fit score.
    Satisfies minimum experience: 90 - 100%
    Slight deficit: scaled proportional penalty
    """
    if required_exp <= 0:
        return 100.0
    
    ratio = candidate_exp / required_exp
    if ratio >= 1.0:
        # Meets or exceeds: 92% to 100%
        bonus = min(8.0, (ratio - 1.0) * 3.0)
        return min(100.0, round(92.0 + bonus, 1))
    else:
        # Deficit
        score = max(20.0, round(ratio * 90.0, 1))
        return score

def calculate_education_score(candidate_degree: str, required_degree: str) -> float:
    """Compare candidate degree against job requirement."""
    cand_weight = DEGREE_WEIGHTS.get(candidate_degree, 1)
    req_weight = DEGREE_WEIGHTS.get(required_degree, 2)

    if cand_weight >= req_weight:
        return 100.0
    elif cand_weight == req_weight - 1:
        return 80.0
    elif cand_weight == req_weight - 2:
        return 55.0
    else:
        return 40.0

def calculate_semantic_similarity(candidate_text: str, job_text: str) -> float:
    """
    Compute dense TF-IDF cosine similarity between candidate resume and job description.
    Uses unigrams + bigrams with sublinear TF scaling.
    """
    if not candidate_text.strip() or not job_text.strip():
        return 50.0

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True,
            max_features=5000
        )
        tfidf_matrix = vectorizer.fit_transform([job_text, candidate_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Rescale cosine similarity (typically 0.15 - 0.70 in text) to 0 - 100%
        scaled = min(100.0, max(0.0, (sim * 140.0)))
        return round(scaled, 1)
    except Exception:
        return 65.0

def compute_candidate_score(
    candidate: CandidateProfile,
    job: JobDescription,
    contradiction_report: ContradictionReport
) -> Tuple[ScoreBreakdown, List[str], List[str], List[str], List[str]]:
    """
    Calculate composite multi-vector candidate score with weights:
    - Skills Match: 35%
    - Experience Match: 25%
    - Education Match: 15%
    - Semantic Similarity: 25%
    - Integrity Penalty: deducted based on contradiction audit severity.
    """
    skills_score, matched_req, matched_pref, missing_req, missing_pref = calculate_skills_score(candidate, job)
    exp_score = calculate_experience_score(candidate.total_experience_years, job.min_experience_years)
    edu_score = calculate_education_score(candidate.highest_degree, job.required_education)

    job_full_text = f"{job.title} {job.description_text} {' '.join(job.required_skills)} {' '.join(job.preferred_skills)}"
    candidate_full_text = f"{candidate.name} {candidate.raw_text} {' '.join(candidate.skills)}"
    semantic_score = calculate_semantic_similarity(candidate_full_text, job_full_text)

    # Base weighted score
    raw_composite = (
        (skills_score * 0.35) +
        (exp_score * 0.25) +
        (edu_score * 0.15) +
        (semantic_score * 0.25)
    )

    # Calculate integrity discount penalty (Innovation Bonus)
    # If candidate integrity is 100%, penalty is 0.
    # If candidate integrity is 40%, penalty is (100 - 40) * 0.3 = 18 points.
    integrity_penalty = 0.0
    if contradiction_report.has_contradictions:
        integrity_gap = 100.0 - contradiction_report.integrity_score
        integrity_penalty = round(integrity_gap * 0.30, 1)

    final_score = max(0.0, min(100.0, round(raw_composite - integrity_penalty, 1)))

    breakdown = ScoreBreakdown(
        skills_match=skills_score,
        experience_match=exp_score,
        education_match=edu_score,
        semantic_match=semantic_score,
        integrity_penalty=integrity_penalty,
        final_score=final_score
    )

    return breakdown, matched_req, matched_pref, missing_req, missing_pref
