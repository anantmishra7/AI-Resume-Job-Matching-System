from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class JobDescription(BaseModel):
    id: str
    title: str
    company: str = "Enterprise Corp"
    role_level: str = "Senior"  # Entry, Mid, Senior, Lead
    min_experience_years: float = 3.0
    required_education: str = "Bachelor"  # High School, Bachelor, Master, PhD
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    description_text: str = ""

class WorkExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    duration_years: float = 0.0
    description: str = ""
    technologies: List[str] = Field(default_factory=list)

class EducationItem(BaseModel):
    degree: str = ""
    field: str = ""
    institution: str = ""
    graduation_year: Optional[int] = None

class CandidateProfile(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    links: List[str] = Field(default_factory=list)
    filename: str = ""
    total_experience_years: float = 0.0
    education: List[EducationItem] = Field(default_factory=list)
    highest_degree: str = "Unknown"
    graduation_year: Optional[int] = None
    skills: List[str] = Field(default_factory=list)
    work_history: List[WorkExperienceItem] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    raw_text: str = ""

class AnomalyFlag(BaseModel):
    type: str  # TECH_INCEPTION_VIOLATION, KEYWORD_STUFFING, CHRONOLOGY_PARADOX, CONCURRENT_OVERLOAD
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    claim: str
    reason: str
    evidence: str

class ContradictionReport(BaseModel):
    has_contradictions: bool = False
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, CRITICAL
    integrity_score: float = 100.0  # 0 to 100
    claim_evidence_ratio: float = 1.0  # skills in context / skills in list
    anomalies: List[AnomalyFlag] = Field(default_factory=list)
    audit_summary: str = ""

class ScoreBreakdown(BaseModel):
    skills_match: float = 0.0
    experience_match: float = 0.0
    education_match: float = 0.0
    semantic_match: float = 0.0
    integrity_penalty: float = 0.0
    final_score: float = 0.0

class ExplainableMatch(BaseModel):
    score_breakdown: ScoreBreakdown
    match_status: str  # Strong Match, Moderate Match, Weak Match, Flagged / High Risk
    top_strengths: List[str] = Field(default_factory=list)
    critical_gaps: List[str] = Field(default_factory=list)
    matched_required_skills: List[str] = Field(default_factory=list)
    matched_preferred_skills: List[str] = Field(default_factory=list)
    missing_required_skills: List[str] = Field(default_factory=list)
    missing_preferred_skills: List[str] = Field(default_factory=list)
    evidence_quotes: List[Dict[str, str]] = Field(default_factory=list)  # {skill: quote}
    suggested_interview_questions: List[str] = Field(default_factory=list)
    executive_summary: str = ""

class CandidateRankResult(BaseModel):
    rank: int = 1
    candidate: CandidateProfile
    score: ScoreBreakdown
    contradiction_report: ContradictionReport
    explainability: ExplainableMatch
