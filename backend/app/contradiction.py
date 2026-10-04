"""
Contradiction & Forensic Claim Verification Engine (Innovation / Bonus Requirement).
Detects unsupported claims, impossible technology timelines, keyword stuffing,
and chronology paradoxes instead of blindly rewarding keyword density.
"""

import re
import datetime
from typing import List, Dict, Any, Tuple
from .models import CandidateProfile, ContradictionReport, AnomalyFlag
from .ontology import TECH_RELEASE_YEARS, SKILL_ALIASES, normalize_skill
from .parser import segment_sections

CURRENT_YEAR = datetime.date.today().year

# Regex to detect claimed technology duration like "10 years of Kubernetes" or "Flutter (12 yrs)"
TECH_DURATION_REGEX = re.compile(
    r'([a-zA-Z\.\+#0-9\s]{2,25}?)\s*(?:\(|:|-|\b)\s*(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+(?:of|in|with))?',
    re.IGNORECASE
)

# Regex to detect work tenure with technology: "Senior React Engineer 2010 - 2015"
TITLE_TECH_YEARS_REGEX = re.compile(
    r'(?:^|\n)([^\n]{5,50}?)\b(19\d{2}|20\d{2})\s*(?:-|–|to)\s*(19\d{2}|20\d{2}|present|current)\b([^\n]{0,100})',
    re.IGNORECASE
)

def audit_tech_inception_violations(candidate: CandidateProfile) -> List[AnomalyFlag]:
    """
    Detect claims where candidate claims to have used a technology
    BEFORE it was invented or claims more years of experience than the technology has existed.
    """
    flags: List[AnomalyFlag] = []
    text = candidate.raw_text.lower()

    # 1. Check explicit "X years of [Tech]" claims
    matches = TECH_DURATION_REGEX.findall(text)
    for tech_candidate, years_str in matches:
        years = int(years_str)
        cleaned_tech = tech_candidate.strip().lower()
        
        # Check against canonical tech release years
        for tech_key, launch_year in TECH_RELEASE_YEARS.items():
            if tech_key in cleaned_tech:
                max_possible_years = CURRENT_YEAR - launch_year
                if years > max_possible_years:
                    flags.append(AnomalyFlag(
                        type="TECH_INCEPTION_VIOLATION",
                        severity="CRITICAL",
                        claim=f"Claims {years}+ years of experience with {tech_key.title()}",
                        reason=(
                            f"{tech_key.title()} was released in {launch_year}. "
                            f"The maximum mathematically possible experience in {CURRENT_YEAR} is {max_possible_years} years."
                        ),
                        evidence=f"Claim in resume: '{tech_candidate.strip()} {years_str} years'"
                    ))

    # 2. Check work history blocks with start dates before tech inception
    for work in candidate.work_history:
        if not work.start_year:
            continue
        for tech in work.technologies:
            tech_lower = tech.lower()
            if tech_lower in TECH_RELEASE_YEARS:
                launch_year = TECH_RELEASE_YEARS[tech_lower]
                if work.start_year < launch_year - 1:  # 1 year margin for beta/alpha
                    flags.append(AnomalyFlag(
                        type="TECH_INCEPTION_VIOLATION",
                        severity="CRITICAL",
                        claim=f"Claims using {tech} in role '{work.title}' starting in {work.start_year}",
                        reason=(
                            f"{tech} was not publicly released until {launch_year}. "
                            f"Role started {launch_year - work.start_year} year(s) prior to technology existence."
                        ),
                        evidence=f"Role: {work.title} ({work.start_year} - {work.end_year or 'Present'})"
                    ))

    return flags

def audit_keyword_stuffing_and_unsupported_skills(candidate: CandidateProfile) -> Tuple[List[AnomalyFlag], float]:
    """
    Check if skills listed in 'Skills' section are substantiated in work experience or projects.
    Computes Claim Evidence Ratio (CER).
    """
    flags: List[AnomalyFlag] = []
    sections = segment_sections(candidate.raw_text)
    skills_section = sections.get("skills", "").lower()
    
    # Text from experience and projects where actual accomplishments are detailed
    evidence_text = (sections.get("experience", "") + "\n" + sections.get("projects", "")).lower()

    if not skills_section or len(candidate.skills) < 10:
        # Not enough skills to indicate stuffing
        return flags, 1.0

    claimed_skills = candidate.skills
    substantiated_skills = []
    unsubstantiated_skills = []

    for skill in claimed_skills:
        skill_lower = skill.lower()
        # Check if mentioned in work experience or project bullets
        pattern = rf'\b{re.escape(skill_lower)}\b'
        if re.search(pattern, evidence_text):
            substantiated_skills.append(skill)
        else:
            unsubstantiated_skills.append(skill)

    total_claimed = len(claimed_skills)
    cer = round(len(substantiated_skills) / total_claimed, 2) if total_claimed > 0 else 1.0

    # If candidate lists > 25 skills and less than 35% appear in project/work bullets
    if total_claimed >= 22 and cer < 0.40:
        unsub_sample = ", ".join(unsubstantiated_skills[:8])
        flags.append(AnomalyFlag(
            type="KEYWORD_STUFFING",
            severity="HIGH",
            claim=f"Lists {total_claimed} technologies in skills section with only {len(substantiated_skills)} verified in work/project descriptions",
            reason=(
                f"Low Claim Evidence Ratio ({int(cer * 100)}%). {len(unsubstantiated_skills)} skills appear as raw buzzwords "
                f"without demonstrable responsibilities, metrics, or project context."
            ),
            evidence=f"Unsubstantiated skills sample: {unsub_sample}..."
        ))
    elif total_claimed >= 35:
        flags.append(AnomalyFlag(
            type="KEYWORD_STUFFING",
            severity="MEDIUM",
            claim=f"High density skill matrix ({total_claimed} distinct technologies declared)",
            reason="Unusually high skill enumeration often indicates algorithmic ATS spamming.",
            evidence=f"Total declared technologies: {total_claimed}"
        ))

    return flags, cer

def audit_chronology_paradoxes(candidate: CandidateProfile) -> List[AnomalyFlag]:
    """
    Check for chronological contradictions:
    - Claiming senior/lead professional roles before college graduation
    - Overlapping concurrent full-time employment overload
    """
    flags: List[AnomalyFlag] = []

    # 1. Graduation vs Senior Work Timeline
    if candidate.graduation_year:
        grad_year = candidate.graduation_year
        for work in candidate.work_history:
            if work.start_year and (grad_year - work.start_year) >= 3:
                # Started professional work 3+ years before college graduation
                title_lower = work.title.lower()
                is_senior_title = any(kw in title_lower for kw in ['senior', 'lead', 'principal', 'staff', 'manager', 'head', 'architect'])
                if is_senior_title:
                    flags.append(AnomalyFlag(
                        type="CHRONOLOGY_PARADOX",
                        severity="HIGH",
                        claim=f"Claims senior role '{work.title}' in {work.start_year}, prior to graduation ({grad_year})",
                        reason=(
                            f"Candidate claims a senior technical title {grad_year - work.start_year} years before "
                            f"completing their degree ({grad_year}). This strongly indicates exaggerated seniority."
                        ),
                        evidence=f"Role: {work.title} started {work.start_year}, Graduation: {grad_year}"
                    ))

    # 2. Concurrent Full-Time Roles Overlap
    # Check if multiple overlapping jobs span across > 1 year
    concurrent_overlaps = 0
    history = candidate.work_history
    for i in range(len(history)):
        for j in range(i + 1, len(history)):
            w1 = history[i]
            w2 = history[j]
            if w1.start_year and w2.start_year:
                # Check overlap
                w1_end = w1.end_year or CURRENT_YEAR
                w2_end = w2.end_year or CURRENT_YEAR
                overlap_start = max(w1.start_year, w2.start_year)
                overlap_end = min(w1_end, w2_end)
                if (overlap_end - overlap_start) >= 2:
                    # Exclude internships
                    if "intern" not in w1.title.lower() and "intern" not in w2.title.lower():
                        concurrent_overlaps += 1

    if concurrent_overlaps >= 2:
        flags.append(AnomalyFlag(
            type="CONCURRENT_OVERLOAD",
            severity="MEDIUM",
            claim=f"Multiple concurrent full-time engagements detected ({concurrent_overlaps} overlapping timelines)",
            reason="Simultaneous multi-year full-time employment timelines detected. May indicate moonlighting or inflated duration.",
            evidence="Overlapping full-time professional experience intervals."
        ))

    return flags

def verify_candidate_claims(candidate: CandidateProfile) -> ContradictionReport:
    """
    Run comprehensive forensic audit against candidate claims.
    Returns ContradictionReport with integrity score, risk level, and detailed flags.
    """
    anomalies: List[AnomalyFlag] = []

    # 1. Tech Inception Check
    tech_flags = audit_tech_inception_violations(candidate)
    anomalies.extend(tech_flags)

    # 2. Keyword Stuffing Check
    stuffing_flags, cer = audit_keyword_stuffing_and_unsupported_skills(candidate)
    anomalies.extend(stuffing_flags)

    # 3. Chronology Paradoxes Check
    chrono_flags = audit_chronology_paradoxes(candidate)
    anomalies.extend(chrono_flags)

    # Calculate Integrity Score
    # Base 100, deduct based on anomaly severity
    integrity_score = 100.0
    for anomaly in anomalies:
        if anomaly.severity == "CRITICAL":
            integrity_score -= 35.0
        elif anomaly.severity == "HIGH":
            integrity_score -= 20.0
        elif anomaly.severity == "MEDIUM":
            integrity_score -= 10.0
        elif anomaly.severity == "LOW":
            integrity_score -= 5.0

    integrity_score = max(0.0, min(100.0, round(integrity_score, 1)))

    # Determine Risk Level
    if integrity_score >= 88.0:
        risk_level = "LOW"
    elif integrity_score >= 68.0:
        risk_level = "MEDIUM"
    elif integrity_score >= 45.0:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    has_contradictions = len(anomalies) > 0

    # Build audit summary
    if not has_contradictions:
        summary = "No chronological contradictions or suspicious keyword stuffing patterns detected. Claims are well-supported by project context."
    else:
        critical_count = sum(1 for a in anomalies if a.severity in ["CRITICAL", "HIGH"])
        summary = (
            f"Flagged {len(anomalies)} anomaly(ies) ({critical_count} high/critical). "
            f"Integrity Score: {integrity_score}%. Review flagged claims prior to interview scheduling."
        )

    return ContradictionReport(
        has_contradictions=has_contradictions,
        risk_level=risk_level,
        integrity_score=integrity_score,
        claim_evidence_ratio=cer,
        anomalies=anomalies,
        audit_summary=summary
    )
