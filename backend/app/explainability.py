"""
Explainability and Match Justification Engine.
Generates line-level evidence citations, gap analysis, top strengths,
and custom technical interview probing questions.
"""

import re
from typing import List, Dict, Any
from .models import CandidateProfile, JobDescription, ScoreBreakdown, ContradictionReport, ExplainableMatch

def find_evidence_quotes(candidate: CandidateProfile, matched_skills: List[str]) -> List[Dict[str, str]]:
    """
    Search candidate's raw text and work history for the best sentence
    demonstrating practical application of each matched skill.
    """
    quotes: List[Dict[str, str]] = []
    # Split text into candidate sentences / bullet points
    sentences = re.split(r'[\n\.\*•;]+', candidate.raw_text)
    clean_sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    for skill in matched_skills[:6]:
        skill_lower = skill.lower()
        best_sentence = None
        for s in clean_sentences:
            # Check if skill is in sentence
            if re.search(rf'\b{re.escape(skill_lower)}\b', s, re.IGNORECASE):
                # Prefer sentences with active verbs or metrics
                if any(metric in s for metric in ['%', '$', 'scale', 'built', 'led', 'architected', 'optimized', 'reduced', 'improved', 'designed']):
                    best_sentence = s
                    break
                elif best_sentence is None:
                    best_sentence = s

        if best_sentence:
            quotes.append({
                "skill": skill,
                "quote": best_sentence[:220].strip() + ("..." if len(best_sentence) > 220 else "")
            })

    return quotes

def generate_interview_questions(
    candidate: CandidateProfile,
    job: JobDescription,
    missing_req: List[str],
    contradiction_report: ContradictionReport
) -> List[str]:
    """Generate 3-5 tailored interview questions based on gaps and forensic flags."""
    questions: List[str] = []

    # 1. Questions targeting flagged anomalies
    for anomaly in contradiction_report.anomalies:
        if anomaly.type == "TECH_INCEPTION_VIOLATION":
            questions.append(
                f"Timeline Verification: Your resume mentions '{anomaly.claim}'. Could you clarify your project adoption timeline with this technology?"
            )
        elif anomaly.type == "KEYWORD_STUFFING":
            questions.append(
                "Skill Verification: You list several specialized tools in your skill matrix; can you walk through a production implementation where you used these in tandem?"
            )
        elif anomaly.type == "CHRONOLOGY_PARADOX":
            questions.append(
                f"Seniority Check: Can you detail the responsibilities and scope of ownership in your role: '{anomaly.claim}'?"
            )

    # 2. Questions targeting missing required skills
    for missing in missing_req[:2]:
        questions.append(
            f"Competency Probe: The role requires hands-on experience with {missing}. Have you worked with {missing} or equivalent technologies in side projects or past roles?"
        )

    # 3. Standard deep-dive architectural question
    if job.required_skills:
        core_skill = job.required_skills[0]
        questions.append(
            f"Architecture: Can you describe the most complex technical challenge you solved using {core_skill} in a production environment?"
        )

    return questions[:5]

def build_explainable_match(
    candidate: CandidateProfile,
    job: JobDescription,
    score: ScoreBreakdown,
    contradiction_report: ContradictionReport,
    matched_req: List[str],
    matched_pref: List[str],
    missing_req: List[str],
    missing_pref: List[str]
) -> ExplainableMatch:
    """Construct full explainability payload for recruiter UI."""
    top_strengths: List[str] = []
    critical_gaps: List[str] = []

    # Experience evaluation
    exp_delta = round(candidate.total_experience_years - job.min_experience_years, 1)
    if exp_delta >= 0:
        top_strengths.append(
            f"Possesses {candidate.total_experience_years} years of verified experience (exceeds {job.min_experience_years} yr requirement by +{exp_delta} yrs)."
        )
    else:
        critical_gaps.append(
            f"Experience deficit: Has {candidate.total_experience_years} years vs {job.min_experience_years} years required ({abs(exp_delta)} year shortfall)."
        )

    # Skills evaluation
    if len(matched_req) == len(job.required_skills) and len(job.required_skills) > 0:
        top_strengths.append(
            f"100% Core Competency Match: Validated all {len(matched_req)} required technical skills ({', '.join(matched_req)})."
        )
    elif len(matched_req) > 0:
        top_strengths.append(
            f"Matches {len(matched_req)} of {len(job.required_skills)} required skills ({', '.join(matched_req)})."
        )

    if missing_req:
        critical_gaps.append(
            f"Missing required technical competencies: {', '.join(missing_req)}."
        )

    # Education evaluation
    if score.education_match >= 90:
        top_strengths.append(f"Education standard met: Holds a {candidate.highest_degree} degree.")
    else:
        critical_gaps.append(f"Degree alignment: Has {candidate.highest_degree}, role prefers {job.required_education}.")

    # Status classification
    if contradiction_report.risk_level in ["HIGH", "CRITICAL"]:
        match_status = "Flagged / High Anomaly Risk"
    elif score.final_score >= 82.0:
        match_status = "Strong Match"
    elif score.final_score >= 65.0:
        match_status = "Moderate Match"
    else:
        match_status = "Low Match"

    # Evidence citations
    evidence = find_evidence_quotes(candidate, matched_req + matched_pref)

    # Tailored interview questions
    questions = generate_interview_questions(candidate, job, missing_req, contradiction_report)

    # Executive Summary text
    if match_status == "Strong Match":
        summary = (
            f"{candidate.name} is a top-tier candidate for the {job.title} role with an overall score of {score.final_score}%. "
            f"Demonstrates verified strength in {', '.join(matched_req[:3])} and has a clean integrity score of {contradiction_report.integrity_score}%."
        )
    elif match_status == "Flagged / High Anomaly Risk":
        summary = (
            f"⚠️ Caution: While {candidate.name} scored {score.final_score}%, the forensic audit flagged critical contradictions "
            f"({contradiction_report.risk_level} risk, Integrity: {contradiction_report.integrity_score}%). Claims require manual verification."
        )
    elif match_status == "Moderate Match":
        summary = (
            f"{candidate.name} is a viable contender ({score.final_score}%) with good foundational overlap, but has deficits in "
            f"{', '.join(missing_req[:2]) if missing_req else 'experience depth'}."
        )
    else:
        summary = (
            f"{candidate.name} scored {score.final_score}% and exhibits substantial gaps against the core requirements for {job.title}."
        )

    return ExplainableMatch(
        score_breakdown=score,
        match_status=match_status,
        top_strengths=top_strengths,
        critical_gaps=critical_gaps,
        matched_required_skills=matched_req,
        matched_preferred_skills=matched_pref,
        missing_required_skills=missing_req,
        missing_preferred_skills=missing_pref,
        evidence_quotes=evidence,
        suggested_interview_questions=questions,
        executive_summary=summary
    )
