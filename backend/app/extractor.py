"""
Entity and Information Extraction module.
Extracts contact details, education, work experience timeline, and canonical skills.
"""

import re
import datetime
from typing import List, Dict, Any, Optional, Tuple, Set
from .models import CandidateProfile, WorkExperienceItem, EducationItem
from .ontology import SKILL_ALIASES, normalize_skill, SKILL_DOMAINS
from .parser import segment_sections

CURRENT_YEAR = datetime.date.today().year

# Regex patterns for contact information
EMAIL_REGEX = re.compile(r'[\w\.-]+@[\w\.-]+\.\w{2,}')
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}')
LINKEDIN_REGEX = re.compile(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'(?:https?://)?(?:www\.)?github\.com/[\w-]+', re.IGNORECASE)

# Education degree patterns
DEGREE_PATTERNS = [
    (r"\b(ph\.?d|doctor\s+of\s+philosophy|doctorate)\b", "PhD", 4),
    (r"\b(m\.?s|master\s+of\s+science|m\.?tech|master\s+of\s+technology|mca|mba|master'?s)\b", "Master", 3),
    (r"\b(b\.?s|bachelor\s+of\s+science|b\.?e|bachelor\s+of\s+engineering|b\.?tech|bachelor\s+of\s+technology|bca|bachelor'?s)\b", "Bachelor", 2),
    (r"\b(associate'?s|associate\s+degree)\b", "Associate", 1),
    (r"\b(high\s+school|diploma|secondary\s+school)\b", "High School", 0)
]

YEAR_REGEX = re.compile(r'\b(19\d{2}|20\d{2})\b')
DATE_RANGE_REGEX = re.compile(
    r'(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+)?\b(19\d{2}|20\d{2})\b\s*(?:-|–|—|to)\s*(?:(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+)?\b(19\d{2}|20\d{2})\b|(present|current|now))',
    re.IGNORECASE
)

JOB_TITLE_KEYWORDS = [
    "engineer", "developer", "architect", "lead", "manager", "scientist", 
    "analyst", "intern", "director", "consultant", "specialist", "administrator"
]

def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extract candidate name, email, phone number, and social links."""
    emails = EMAIL_REGEX.findall(text)
    phones = PHONE_REGEX.findall(text)
    linkedin = LINKEDIN_REGEX.findall(text)
    github = GITHUB_REGEX.findall(text)

    # Candidate name extraction heuristic:
    # First 1-3 lines usually contain the candidate name.
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    candidate_name = "Candidate"
    for line in lines[:5]:
        # Filter out lines that look like emails, URLs, or headers
        if '@' in line or 'http' in line or len(line) > 40:
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and not any(kw in line.lower() for kw in ['resume', 'curriculum', 'vitae', 'page', 'profile']):
            candidate_name = line
            break

    links = []
    if linkedin:
        links.append(linkedin[0])
    if github:
        links.append(github[0])

    return {
        "name": candidate_name,
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "links": links
    }

def extract_skills_from_text(text: str) -> List[str]:
    """
    Search text for technology and skill mentions using boundary-aware regex.
    Returns list of unique canonical skill names.
    """
    found_skills: Set[str] = set()
    text_lower = f" {text.lower()} "

    # Sort aliases by length descending so longer phrases match first (e.g. 'react native' before 'react')
    sorted_aliases = sorted(SKILL_ALIASES.keys(), key=lambda x: len(x), reverse=True)

    for alias in sorted_aliases:
        # Check boundary
        # For special symbols like C++, C#, .NET
        escaped = re.escape(alias)
        pattern = rf'(?:^|[\s,;:\(\)\[\]\/\*•|]){escaped}(?:[\s,;:\(\)\[\]\/\*•|]|$)'
        if re.search(pattern, text_lower, re.IGNORECASE):
            canonical = SKILL_ALIASES[alias]
            found_skills.add(canonical)

    return sorted(list(found_skills))

def extract_education(education_section_text: str, full_text: str) -> Tuple[List[EducationItem], str, Optional[int]]:
    """Extract degree levels, institutions, and graduation years."""
    search_text = education_section_text if len(education_section_text) > 30 else full_text
    education_items: List[EducationItem] = []
    
    highest_degree = "Unknown"
    highest_rank = -1
    latest_grad_year: Optional[int] = None

    lines = search_text.splitlines()
    for line in lines:
        for pattern, degree_name, rank in DEGREE_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                # Look for year in the same line or context
                years = [int(y) for y in YEAR_REGEX.findall(line) if 1970 <= int(y) <= CURRENT_YEAR + 5]
                grad_year = max(years) if years else None

                item = EducationItem(
                    degree=degree_name,
                    field="Computer Science / Engineering" if "computer" in line.lower() else "Technical",
                    institution=line[:60],
                    graduation_year=grad_year
                )
                education_items.append(item)

                if rank > highest_rank:
                    highest_rank = rank
                    highest_degree = degree_name

                if grad_year and (latest_grad_year is None or grad_year > latest_grad_year):
                    latest_grad_year = grad_year

    if not education_items and highest_rank == -1:
        # Fallback check across full text
        for pattern, degree_name, rank in DEGREE_PATTERNS:
            if re.search(pattern, full_text, re.IGNORECASE):
                highest_degree = degree_name
                break

    return education_items, highest_degree, latest_grad_year

def extract_work_history_and_experience(experience_text: str, full_text: str) -> Tuple[List[WorkExperienceItem], float]:
    """
    Parse work experience blocks, timeline dates, and compute total experience in years.
    """
    search_text = experience_text if len(experience_text) > 50 else full_text
    
    items: List[WorkExperienceItem] = []
    ranges_found = list(DATE_RANGE_REGEX.finditer(search_text))

    total_months = 0
    intervals: List[Tuple[int, int]] = []

    for match in ranges_found:
        start_year = int(match.group(2))
        end_str = match.group(4) or match.group(5)
        
        if end_str and end_str.lower() in ["present", "current", "now"]:
            end_year = CURRENT_YEAR
        elif end_str and end_str.isdigit():
            end_year = int(end_str)
        else:
            end_year = start_year + 1

        if start_year > end_year:
            # Anomaly / flip
            start_year, end_year = end_year, start_year

        duration = max(0.5, float(end_year - start_year))
        
        # Surrounding context for job title and tech
        start_pos = max(0, match.start() - 120)
        end_pos = min(len(search_text), match.end() + 250)
        snippet = search_text[start_pos:end_pos]

        # Extract title keywords
        detected_title = "Software Professional"
        for line in snippet.splitlines():
            if any(kw in line.lower() for kw in JOB_TITLE_KEYWORDS):
                detected_title = line[:50].strip()
                break

        tech_used = extract_skills_from_text(snippet)

        items.append(WorkExperienceItem(
            title=detected_title,
            start_year=start_year,
            end_year=end_year,
            duration_years=duration,
            description=snippet[:300].strip(),
            technologies=tech_used
        ))

        # Add to non-overlapping timeline interval calculation
        intervals.append((start_year * 12, end_year * 12))

    # Merge overlapping intervals to avoid double-counting concurrent years
    if intervals:
        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]
        for start, end in intervals[1:]:
            prev_start, prev_end = merged[-1]
            if start <= prev_end:
                merged[-1] = (prev_start, max(prev_end, end))
            else:
                merged.append((start, end))

        total_months = sum(end - start for start, end in merged)
        total_years = round(total_months / 12.0, 1)
    else:
        # Heuristic fallback: check for phrases like "X years of experience"
        exp_match = re.search(r'(\d+)\+?\s*years(?:\s+of)?\s+experience', full_text, re.IGNORECASE)
        if exp_match:
            total_years = float(exp_match.group(1))
        else:
            total_years = 1.0

    return items, total_years

def extract_candidate_profile(filename: str, raw_text: str) -> CandidateProfile:
    """Extract complete structured profile from document text."""
    candidate_id = re.sub(r'[^a-zA-Z0-9_-]', '_', filename.split('.')[0])
    sections = segment_sections(raw_text)
    
    contact = extract_contact_info(raw_text)
    all_skills = extract_skills_from_text(raw_text)
    education_items, highest_degree, grad_year = extract_education(sections.get("education", ""), raw_text)
    work_history, total_exp = extract_work_history_and_experience(sections.get("experience", ""), raw_text)

    # Extract projects
    projects_text = sections.get("projects", "")
    project_bullets = [p.strip() for p in projects_text.splitlines() if len(p.strip()) > 20]

    # Certifications
    cert_text = sections.get("certifications", "")
    certs = [c.strip() for c in cert_text.splitlines() if len(c.strip()) > 10]

    return CandidateProfile(
        id=candidate_id,
        name=contact["name"],
        email=contact["email"],
        phone=contact["phone"],
        links=contact["links"],
        filename=filename,
        total_experience_years=total_exp,
        education=education_items,
        highest_degree=highest_degree,
        graduation_year=grad_year,
        skills=all_skills,
        work_history=work_history,
        projects=project_bullets[:10],
        certifications=certs[:10],
        raw_text=raw_text
    )
