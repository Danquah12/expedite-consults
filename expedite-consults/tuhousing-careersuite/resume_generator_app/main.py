import os
import asyncio
import json
import requests
from dotenv import load_dotenv
load_dotenv()
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Depends, Header, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from resume_generator_app.generator import (
    generate_resume, generate_cover_letter, generate_interview_prep,
    generate_thank_you_note, generate_90_day_plan, generate_ats_report,
    generate_federal_resume, generate_ksa_narrative
)
from resume_generator_app.database import (
    init_db, save_application, get_history, delete_history,
    create_session, get_user_from_session, get_user_by_id, delete_session,
    register_user, authenticate_user, update_user_profile,
    change_user_password, reset_user_password_by_identity, admin_reset_user_password,
    save_user_last_resume, get_application_by_id,
    save_manual_application, update_application, delete_application,
    migrate_guest_history, add_timeline_event, get_timeline_events,
    delete_timeline_event, log_audit
)

# Initialize database
init_db()

app = FastAPI()

# Mount static directory for frontend
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(CURRENT_DIR, "static")
try:
    os.makedirs(static_dir, exist_ok=True)
except Exception:
    pass

IS_VERCEL = "VERCEL" in os.environ
OUTPUT_DIR = "/tmp" if IS_VERCEL else "output"
try:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
except Exception:
    pass

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    err = traceback.format_exc()
    from fastapi.responses import JSONResponse
    try:
        log_path = os.path.join(OUTPUT_DIR, "crash.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(err + "\n")
    except Exception:
        pass
    return JSONResponse(
        status_code=500,
        content={"detail": f"Unhandled Server Error: {str(exc)}"}
    )

def sanitize_error(err_str: str, api_key: str) -> str:
    """Remove the API key from error messages before showing to the user."""
    if api_key:
        err_str = err_str.replace(api_key, "[REDACTED]")
    return err_str

def robust_json_loads(text: str) -> dict:
    import re
    
    json_str = text.strip()
    if json_str.startswith("```"):
        json_str = re.sub(r'^```(?:json)?\n', '', json_str)
    if json_str.endswith("```"):
        json_str = re.sub(r'\n```$', '', json_str)
        
    # Fix trailing commas
    json_str = re.sub(r',\s*([\]}])', r'\1', json_str)
    
    # Try parsing directly first
    try:
        return json.loads(json_str, strict=False)
    except json.JSONDecodeError:
        pass

    # Fallback: State-machine to repair unescaped quotes and control characters
    result = []
    in_string = False
    escape_next = False
    i = 0
    n = len(json_str)
    
    while i < n:
        char = json_str[i]
        
        if escape_next:
            result.append(char)
            escape_next = False
            i += 1
            continue
            
        if char == '\\':
            result.append(char)
            escape_next = True
            i += 1
            continue
            
        if char == '"':
            is_boundary = False
            
            j = i + 1
            while j < n and json_str[j].isspace():
                j += 1
            
            k = i - 1
            while k >= 0 and json_str[k].isspace():
                k -= 1
                
            if not in_string:
                is_boundary = True
            else:
                if j < n and json_str[j] in (':', ',', '}', ']'):
                    is_boundary = True
                elif k >= 0 and json_str[k] in ('[', ','):
                    is_boundary = True
            
            if is_boundary:
                in_string = not in_string
                result.append('"')
            else:
                result.append('\\"')
        else:
            if in_string and char == '\n':
                result.append('\\n')
            elif in_string and char == '\r':
                result.append('\\r')
            elif in_string and char == '\t':
                result.append('\\t')
            else:
                result.append(char)
        i += 1
        
    repaired_str = "".join(result)
    return json.loads(repaired_str, strict=False)

def call_gemini_api_rest(prompt_text: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt_text}]}],
        "generationConfig": {"maxOutputTokens": 65536, "temperature": 0.1, "topP": 0.1},
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ]
    }
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    if response.status_code != 200:
        raise ValueError(f"API Error {response.status_code}: {response.text}")
    data = response.json()
    
    if "candidates" in data and len(data["candidates"]) > 0:
        candidate = data["candidates"][0]
        parts = candidate.get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts)
        return text, candidate.get("finishReason")
    return "", "UNKNOWN"

def safe_convert_to_pdf(docx_path):
    import platform
    if platform.system() != "Windows":
        return docx_path
        
    pdf_path = docx_path.replace(".docx", ".pdf")
    try:
        import pythoncom
        from docx2pdf import convert as docx2pdf_convert
        pythoncom.CoInitialize()
        docx2pdf_convert(docx_path, pdf_path)
        return pdf_path
    except Exception:
        return docx_path
    finally:
        try:
            import pythoncom
            pythoncom.CoUninitialize()
        except Exception:
            pass

try:
    os.makedirs("static", exist_ok=True)
except Exception:
    pass

class GenerationRequest(BaseModel):
    master_resume: Optional[str] = ""
    linkedin_experience: Optional[str] = ""
    job_description: str
    api_key: str
    user_id: Optional[str] = ""
    candidate_name: Optional[str] = ""
    candidate_contact: Optional[str] = ""
    target_company: Optional[str] = ""
    possible_interview_questions: Optional[str] = ""
    resume_template: Optional[str] = "cyber_navy"

class FederalGenerationRequest(GenerationRequest):
    federal_gs_grade: Optional[str] = ""
    federal_series: Optional[str] = ""
    federal_ksa_prompts: Optional[str] = ""

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    try:
        token = authorization
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        user = get_user_from_session(token)
        return user
    except Exception:
        return None

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    candidate_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    target_role: Optional[str] = None
    clearance: Optional[str] = None
    candidate_contact: Optional[str] = None
    master_resume: Optional[str] = None
    linkedin_experience: Optional[str] = None
    api_key: Optional[str] = None
    preferred_template: Optional[str] = "cyber_navy"

class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    username: str
    email: str
    new_password: str
    confirm_password: Optional[str] = None

class AdminResetPasswordRequest(BaseModel):
    new_password: str

class MigrateRequest(BaseModel):
    guest_id: str

class ProfileUpdateRequest(BaseModel):
    api_key: Optional[str] = None
    master_resume: Optional[str] = None
    linkedin_experience: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    target_role: Optional[str] = None
    clearance: Optional[str] = None
    preferred_template: Optional[str] = None

class ManualApplicationRequest(BaseModel):
    target_company: str
    job_title: str
    status: str
    notes: Optional[str] = None
    applied_date: Optional[str] = None

class ApplicationUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[str] = None
    interview_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    target_company: Optional[str] = None
    job_title: Optional[str] = None

class TimelineEventRequest(BaseModel):
    application_id: Optional[int] = None
    title: str
    event_date: str
    description: Optional[str] = None

def get_gemini_prompt(master_resume: str, job_description: str, linkedin_experience: str = "", possible_interview_questions: str = "") -> str:
    linkedin_section = f"\nLINKEDIN EXPERIENCE:\n{linkedin_experience}\n(Please reconcile and merge any relevant details from this LinkedIn experience into the final output.)\n" if linkedin_experience else ""
    return f"""
You are an expert executive resume writer and federal cybersecurity SME.
I will provide you with a MASTER RESUME, a JOB DESCRIPTION, and optionally additional LinkedIn experience.
Your task is to tailor the master resume (and reconcile with LinkedIn experience) to perfectly match the job description, emphasizing the most relevant skills, tools, and experiences.

CRITICAL INSTRUCTION FOR 100% MATCH:
You must identify ALL technical tools, protocols, certifications, methodologies, and requirements in the JOB DESCRIPTION. If any of these are missing or weak in the MASTER RESUME, you MUST weave them directly into the tailored resume (specifically inside the "summary", the "skills" object categories, and the "bullets" for tailored roles). You must integrate these missing requirements realistically, describing them in a grounded engineering tone as active hands-on capabilities, to guarantee a 100% ATS score. No keywords from the job description should be left out.

MASTER RESUME:
{master_resume}
{linkedin_section}
JOB DESCRIPTION:
{job_description}

TONE AND STYLE: Write strictly in a human, grounded, and factual tone. DO NOT use AI buzzwords, fluff, or overly sensational verbs (e.g., "spearheaded", "revolutionized", "synergized", "leveraged"). Maintain deterministic, direct, and professional engineering language.

You MUST return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting or anything outside the JSON object. CRITICAL: All string values MUST be single-line strings. Do not use literal line breaks inside the JSON strings.

{{
  "name": "Applicant Name",
  "contact": "Email | Phone | LinkedIn",
  "clearance": "Active Top Secret (or relevant from master resume)",
  "job_title": "Target Job Title (extract from JD)",
  "summary": "A powerful 3-4 sentence summary tailored to the JD. YOU MUST weave missing keywords from the JD into this summary.",
  "skills": {{
    "Category 1 (e.g. Security Architecture)": "Comma separated list of highly relevant skills",
    "Category 2": "Comma separated list of highly relevant skills"
  }},
  "roles": [
    {{
      "title": "Job Title (CRITICAL: You MUST use the exact Job Title from the master resume. DO NOT change, alter, or hallucinate position names.)",
      "company": "Company Name (CRITICAL: Use exact company name from master resume.)",
      "dates": "Start Month Year - End Month Year (CRITICAL: You MUST strictly preserve and use the exact dates from the master resume. DO NOT alter, fix, or change the dates in any way.)",
      "bullets": [
        "Tailored bullet point 1 (use STAR method, aggressively weave JD keywords into your achievements. Be highly detailed and comprehensive.)",
        "Tailored bullet point 2 (Expand and add detailed achievements based on the job description.)",
        "Tailored bullet point 3",
        "Tailored bullet point 4",
        "Tailored bullet point 5",
        "Tailored bullet point 6"
      ]
    }}
  ],
  "education": ["Degree - University - Year (CRITICAL: Include ALL education listed in the master resume, do not drop any)"],
  "certifications": ["Cert 1 (CRITICAL: Include ALL certifications and training listed in the master resume perfectly preserved, do not drop any)"],
  "recruiter_name": "Hiring Manager (or extract from JD if present)",
  "company_name": "Target Company (extract from JD)"
}}
CRITICAL INSTRUCTION: Include ALL roles PERFECTLY SEPARATE exactly as they appear in the master resume. DO NOT merge, combine, or consolidate any positions under any circumstances. If you see multiple roles at the same company, list them as completely separate entries. Do not artificially limit the resume length; a multi-page resume is perfectly acceptable.
"""

def get_ats_analysis_prompt(master_resume: str, job_description: str, linkedin_experience: str = "") -> str:
    linkedin_section = f"\nLINKEDIN EXPERIENCE:\n{linkedin_experience}\n" if linkedin_experience else ""
    return f"""
You are an expert ATS (Applicant Tracking System) Analyzer and technical recruiter.
I will provide you with a MASTER RESUME and a JOB DESCRIPTION.
Your task is to analyze the resume against the job description and generate a detailed ATS analysis report.

MASTER RESUME:
{master_resume}
{linkedin_section}
JOB DESCRIPTION:
{job_description}

You MUST return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting or anything outside the JSON object.
CRITICAL: Keep 'top_strengths', 'missing_keywords', and 'recommendations' extremely concise (maximum 1 sentence per item) to prevent output truncation.

{{
  "fit_score": 95,
  "top_strengths": ["Skill 1", "Skill 2", "Skill 3"],
  "missing_keywords": ["Any leftover JD keywords you couldn't possibly fit into the resume (CRITICAL: You MUST try your hardest to make this array EMPTY [] by including all keywords in the skills or summary)"],
  "recommendations": ["Actionable tip 1 on how to improve the application for this ATS", "Actionable tip 2"],
  "requirements_mapping": [
    {{
      "requirement": "Core Requirement 1 from JD",
      "satisfaction": "How the candidate satisfies this (referencing a specific bullet point or skill)"
    }},
    {{
      "requirement": "Core Requirement 2 from JD",
      "satisfaction": "How the candidate satisfies this"
    }}
  ]
}}
"""

def get_letters_prompt(master_resume: str, job_description: str, linkedin_experience: str = "") -> str:
    linkedin_section = f"\nLINKEDIN EXPERIENCE:\n{linkedin_experience}\n" if linkedin_experience else ""
    return f"""
You are an expert executive resume writer and federal cybersecurity SME.
I will provide you with a MASTER RESUME and a JOB DESCRIPTION.
Your task is to write a highly persuasive Cover Letter.
You must generate a highly professional post-interview Thank You Note, structured as a list of paragraphs, referencing the candidate's strengths relative to the JD.
You must draft a short, punchy Recruiter Outreach Message for LinkedIn/Email.
Finally, you must generate a strategic 90-Day Success Plan based on the JD.
You must also generate an optimized LinkedIn headline and About section.

MASTER RESUME:
{master_resume}
{linkedin_section}
JOB DESCRIPTION:
{job_description}

You MUST return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting or anything outside the JSON object. CRITICAL: All string values MUST be single-line strings. Do not use literal line breaks inside the JSON strings.

{{
  "cover_letter_paragraphs": [
    "Paragraph 1: Introduction, clearance, willingness to work onsite, salary (if applicable).",
    "Paragraph 2: Highlight top 2-3 technical skills that directly match the JD.",
    "Paragraph 3: Leadership, compliance, or soft skills.",
    "Paragraph 4: Conclusion and call to action."
  ],
  "thank_you_note": [
    "Paragraph 1: Thank the interviewers for their time and reiterate excitement for the role.",
    "Paragraph 2: Highlight a specific strength or experience discussed that aligns perfectly with their needs.",
    "Paragraph 3: Reiterate value proposition and professionalism. Call to action for next steps."
  ],
  "outreach_message": "Hi [Name], I noticed the opening for [Role] and wanted to connect. With my background in [Strength], I am confident I can make an immediate impact at [Company]. I have applied online and would love to chat.",
  "90_day_plan": [
    {{
      "phase": "First 30 Days: Learn & Assess",
      "goals": ["Tailored goal 1 based on JD", "Tailored goal 2 based on JD"]
    }},
    {{
      "phase": "Days 31-60: Implement & Optimize",
      "goals": ["Tailored goal 1 based on JD", "Tailored goal 2 based on JD"]
    }},
    {{
      "phase": "Days 61-90: Lead & Scale",
      "goals": ["Tailored goal 1 based on JD", "Tailored goal 2 based on JD"]
    }}
  ],
  "linkedin_headline": "A punchy, SEO-optimized LinkedIn headline tailored to this JD.",
  "linkedin_about": "A 2-paragraph optimized About section for LinkedIn, summarizing the fit for this specific role."
}}
"""

def get_interview_prep_prompt_part1(master_resume: str, job_description: str, possible_interview_questions: str = "", linkedin_experience: str = "") -> str:
    linkedin_section = f"\nLINKEDIN EXPERIENCE:\n{linkedin_experience}\n" if linkedin_experience else ""
    provided_q_section = f"\nPROVIDED INTERVIEW QUESTIONS (Please prioritize answering these exact questions first):\n{possible_interview_questions}\n" if possible_interview_questions else ""
    return f"""
You are an expert executive interview coach.
I will provide you with a MASTER RESUME and a JOB DESCRIPTION.
You must generate exactly 9 highly likely interview questions covering ALL of the following focus areas (3 questions each):
1. Core technical requirements, system architecture, and specific engineering tools in the JD.
2. Leadership, compliance (RMF, NIST, DISA STIGs), incident response, and cross-functional collaboration.
3. Behavioral: adaptability, unforeseen challenges, high-pressure environments.

For each question provide a STAR method answer. Answers MUST be concise (max 200 words each). Use single-line strings only.

MASTER RESUME:
{master_resume}
{linkedin_section}
JOB DESCRIPTION:
{job_description}
{provided_q_section}
TONE: Human, grounded, factual. No AI buzzwords or fluff.

Return ONLY a valid JSON object:
{{
  "interview_prep": [
    {{
      "question": "The interview question",
      "rationale": "Why they are asking this based on the JD.",
      "answer": "STAR method answer in a single-line string."
    }}
  ]
}}
"""

def get_interview_prep_prompt_part2(master_resume: str, job_description: str, linkedin_experience: str = "") -> str:
    linkedin_section = f"\nLINKEDIN EXPERIENCE:\n{linkedin_experience}\n" if linkedin_experience else ""
    return f"""
You are an expert executive interview coach.
I will provide you with a MASTER RESUME and a JOB DESCRIPTION.
You must generate exactly 9 highly likely interview questions covering ALL of the following focus areas (3 questions each):
4. Behavioral: conflict resolution, stakeholder disagreements, negotiation.
5. Behavioral: communication, cross-functional teamwork, mentoring junior staff.
6. Behavioral: ethics, core values, cultural fit, and long-term strategic vision.

For each question provide a STAR method answer. Answers MUST be concise (max 200 words each). Use single-line strings only.

MASTER RESUME:
{master_resume}
{linkedin_section}
JOB DESCRIPTION:
{job_description}
TONE: Human, grounded, factual. No AI buzzwords or fluff.

Return ONLY a valid JSON object:
{{
  "interview_prep": [
    {{
      "question": "The interview question",
      "rationale": "Why they are asking this based on the JD.",
      "answer": "STAR method answer in a single-line string."
    }}
  ]
}}
"""

@app.get("/api/models")
async def list_models(api_key: str):
    """Diagnostic endpoint - lists available models for the given API key."""
    import requests as req_lib
    api_key_clean = api_key.strip()
    url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key_clean}"
    try:
        r = req_lib.get(url)
        data = r.json()
        models = [m["name"] for m in data.get("models", [])]
        return {"available_models": models, "status_code": r.status_code}
    except Exception as e:
        return {"error": str(e)}

@app.get("/", response_class=HTMLResponse)
async def read_index():
    static_index = os.path.join(CURRENT_DIR, "static", "index.html")
    with open(static_index, "r", encoding="utf-8") as f:
        return f.read()

def get_federal_gemini_prompt(master_resume: str, job_description: str, gs_grade: str, series: str, linkedin_experience: str = "") -> str:
    linkedin_section = f"\nLINKEDIN EXPERIENCE:\n{linkedin_experience}\n(Please reconcile and merge any relevant details from this LinkedIn experience into the final output.)\n" if linkedin_experience else ""
    return f"""
You are an expert federal resume writer and former OPM hiring manager.
I will provide you with a MASTER RESUME, a target JOB DESCRIPTION, and target GS GRADE/SERIES.
Your task is to tailor the master resume (and reconcile with LinkedIn experience) to perfectly match the job description, emphasizing the most relevant skills for a federal hiring context.
You must also write a highly persuasive Federal Cover Letter.

CRITICAL INSTRUCTION FOR 100% MATCH:
You must identify ALL technical tools, protocols, certifications, methodologies, and requirements in the JOB DESCRIPTION. If any of these are missing or weak in the MASTER RESUME, you MUST weave them directly into the tailored resume (specifically inside the "summary", the "technical_skills" object categories, and the "bullets" for tailored roles). You must integrate these missing requirements realistically, describing them in a grounded government engineering tone as active hands-on capabilities, to guarantee a 100% ATS score. No keywords from the job description should be left out.

MASTER RESUME:
{master_resume}
{linkedin_section}
JOB DESCRIPTION:
{job_description}

TARGET GS GRADE & SERIES:
{gs_grade} {series}

TONE AND STYLE: Write strictly in a human, grounded, and factual tone. DO NOT use AI buzzwords, fluff, or overly sensational verbs (e.g., "spearheaded", "revolutionized", "synergized", "leveraged"). Maintain deterministic, direct, and professional government language.

You MUST return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting or anything outside the JSON object. CRITICAL: All string values MUST be single-line strings. Do not use literal line breaks inside the JSON strings.

{{
  "name": "Applicant Name",
  "contact": "Location • Phone • Email",
  "linkedin": "linkedin.com/in/username",
  "clearance": "Active TS/SCI Clearance (or relevant from master resume)",
  "headline": "TARGET JOB TITLE 1 | TARGET JOB TITLE 2 | TARGET JOB TITLE 3",
  "summary": "A powerful 4-5 sentence summary tailored to the federal JD.",
  "core_competencies": ["Competency 1", "Competency 2", "Competency 3", "Competency 4"],
  "technical_skills": {{
    "Category 1 (e.g. Security Tools)": "Comma separated list of highly relevant skills",
    "Category 2": "Comma separated list of highly relevant skills"
  }},
  "roles": [
    {{
      "title": "Job Title (CRITICAL: You MUST use the exact Job Title from the master resume. DO NOT change, alter, or hallucinate position names.)",
      "company_and_location": "Company Name \u2014 City, State (CRITICAL: Use exact company name and location from master resume.)",
      "dates": "Start Month Year \u2013 End Month Year (CRITICAL: strictly preserve exact dates.)",
      "hours": "40 Hours/Week (extract or estimate)",
      "supervisor": "Supervisor Name, Phone (or 'Available upon request')",
      "may_contact": "Yes/No",
      "bullets": [
        "Tailored bullet point 1 (use STAR method, aggressively weave JD keywords into your achievements. Be highly detailed and comprehensive.)",
        "Tailored bullet point 2 (Expand and add detailed achievements based on the job description.)",
        "Tailored bullet point 3",
        "Tailored bullet point 4",
        "Tailored bullet point 5",
        "Tailored bullet point 6"
      ],
      "key_technologies": "Comma-separated list of tools/skills used in this specific role"
    }}
  ],
  "education": ["Degree - University - Year (CRITICAL: Include ALL education listed in the master resume, do not drop any)"],
  "certifications": ["Cert 1 (CRITICAL: Include ALL certifications and training listed in the master resume perfectly preserved, do not drop any)"],
  "recruiter_name": "Hiring Manager",
  "company_name": "Target Federal Agency (extract from JD)",
  "job_title": "Target Job Title (extract from JD)",
  "cover_letter_paragraphs": [
    "Paragraph 1: Introduction, referencing the announcement number (if available), GS grade, and clearance.",
    "Paragraph 2: Highlight top 2-3 technical skills that directly match the federal JD.",
    "Paragraph 3: Leadership, compliance, or soft skills.",
    "Paragraph 4: Conclusion and call to action."
  ]
}}
"""

def get_federal_ksa_prompt(master_resume: str, job_description: str, ksa_prompts: str) -> str:
    return f"""
You are an expert federal resume writer and former OPM hiring manager.
I will provide you with a MASTER RESUME, a target JOB DESCRIPTION, and KSA (Knowledge, Skills, and Abilities) PROMPTS.
You must generate narrative responses for the provided KSA Prompts using the CCAR (Challenge, Context, Action, Result) method.
The narratives should draw heavily on the provided master resume and perfectly match the tone of the federal job description.

MASTER RESUME:
{master_resume}

JOB DESCRIPTION:
{job_description}

KSA PROMPTS:
{ksa_prompts}

You MUST return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting or anything outside the JSON object. CRITICAL: All string values MUST be single-line strings. Do not use literal line breaks inside the JSON strings.

{{
  "ksas": [
    {{
      "prompt": "The specific KSA prompt",
      "narrative": "A detailed 1-2 paragraph response using the CCAR method."
    }}
  ]
}}
"""

@app.post("/api/generate")
async def generate_package(req: GenerationRequest, current_user: dict = Depends(get_current_user)):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required.")
    req.api_key = req.api_key.strip()
    if not req.master_resume or len(req.master_resume.strip()) < 50:
        raise HTTPException(status_code=400, detail="Master Resume is required and must contain valid text.")
    if not req.job_description or len(req.job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job Description is required and must contain valid text.")
    prompt_core = get_gemini_prompt(req.master_resume, req.job_description, req.linkedin_experience)
    prompt_letters = get_letters_prompt(req.master_resume, req.job_description, req.linkedin_experience)
    prompt_interview_p1 = get_interview_prep_prompt_part1(req.master_resume, req.job_description, req.possible_interview_questions, req.linkedin_experience)
    prompt_interview_p2 = get_interview_prep_prompt_part2(req.master_resume, req.job_description, req.linkedin_experience)
    
    max_retries = 3

    async def generate_json(prompt_text):
        for attempt in range(max_retries):
            try:
                text, finish_reason = await asyncio.to_thread(call_gemini_api_rest, prompt_text, req.api_key)
                
                try:
                    parsed_data = robust_json_loads(text)
                    if isinstance(parsed_data, dict):
                        if 'resume' in parsed_data and isinstance(parsed_data['resume'], dict):
                            for k, v in parsed_data['resume'].items(): parsed_data[k] = v
                        if 'ats_fit_analysis' in parsed_data and isinstance(parsed_data['ats_fit_analysis'], dict):
                            for k, v in parsed_data['ats_fit_analysis'].items(): parsed_data[k] = v
                    return parsed_data
                except json.JSONDecodeError as je:
                    raise ValueError(f"JSON Parse Error: {str(je)}. Finish Reason: {finish_reason}.")
            except Exception as e:
                err_str = sanitize_error(str(e), req.api_key)
                if any(code in err_str for code in ["429", "500", "502", "503", "504", "JSON Parse Error", "MAX_TOKENS"]) and attempt < max_retries - 1:
                    await asyncio.sleep(10 if "429" not in err_str else 60)
                    continue
                if "429" in err_str:
                    raise HTTPException(status_code=429, detail="Rate limit exceeded: Your Gemini API key has hit its daily or per-minute free-tier quota. Please get a new API key at https://aistudio.google.com/app/apikey or wait until tomorrow for the quota to reset.")
                raise HTTPException(status_code=500, detail=f"AI API Error: {err_str[:300]}")
        return None

    data = await generate_json(prompt_core)

    await asyncio.sleep(8)
    letters_data = await generate_json(prompt_letters)

    await asyncio.sleep(8)
    interview_data_p1 = await generate_json(prompt_interview_p1)

    await asyncio.sleep(8)
    interview_data_p2 = await generate_json(prompt_interview_p2)

    tailored_text = ""
    if data:
        tailored_text = f"""
NAME: {data.get('name', '')}
CONTACT: {data.get('contact', '')}
CLEARANCE: {data.get('clearance', '')}
SUMMARY: {data.get('summary', '')}
SKILLS: {json.dumps(data.get('skills', {}))}
EXPERIENCE:
"""
        for role in data.get('roles', []):
            tailored_text += f"\nROLE: {role.get('title', '')} at {role.get('company', '')} ({role.get('dates', '')})\n"
            for bullet in role.get('bullets', []):
                tailored_text += f"- {bullet}\n"
        tailored_text += f"\nEDUCATION:\n" + "\n".join(data.get('education', []))
        tailored_text += f"\nCERTIFICATIONS:\n" + "\n".join(data.get('certifications', []))
    else:
        tailored_text = req.master_resume

    prompt_ats = get_ats_analysis_prompt(tailored_text, req.job_description, req.linkedin_experience)
    await asyncio.sleep(8)
    ats_data = await generate_json(prompt_ats)

    if data is None or letters_data is None or interview_data_p1 is None or interview_data_p2 is None or ats_data is None:
        raise HTTPException(status_code=500, detail="Failed to generate document data after multiple attempts.")

    try:
        data.update(letters_data)
        data.update(ats_data)

        data["interview_prep"] = (interview_data_p1.get("interview_prep") or []) + (interview_data_p2.get("interview_prep") or [])

        if req.candidate_name:
            data['name'] = req.candidate_name
        if req.candidate_contact:
            data['contact'] = req.candidate_contact
        if req.target_company:
            data['company_name'] = req.target_company
        data['resume_template'] = req.resume_template or 'cyber_navy'
        data['is_federal'] = False

        workday_list = []
        for role in data.get("roles", []):
            desc = "\n".join(role.get("bullets", []))
            workday_list.append({
                "company": role.get("company", ""),
                "title": role.get("title", ""),
                "description": desc
            })
        data["workday_json"] = json.dumps(workday_list)

        output_dir = OUTPUT_DIR
        template_config = resolve_template_config(req.resume_template)
        resume_path = generate_resume(data, output_dir, template_config)
        cover_letter_path = generate_cover_letter(data, output_dir, template_config)
        prep_path = generate_interview_prep(data, output_dir, template_config)
        thank_you_path = generate_thank_you_note(data, output_dir, template_config)
        plan_path = generate_90_day_plan(data, output_dir, template_config)
        report_path = generate_ats_report(data, output_dir, template_config)
        
        resume_pdf_path = safe_convert_to_pdf(resume_path)
        cover_letter_pdf_path = safe_convert_to_pdf(cover_letter_path)
        report_pdf_path = safe_convert_to_pdf(report_path)
        
        urls = {
            "resume_url": f"/api/download/{os.path.basename(resume_pdf_path)}",
            "cover_letter_url": f"/api/download/{os.path.basename(cover_letter_pdf_path)}",
            "prep_url": f"/api/download/{os.path.basename(prep_path)}",
            "thank_you_url": f"/api/download/{os.path.basename(thank_you_path)}",
            "plan_url": f"/api/download/{os.path.basename(plan_path)}",
            "report_url": f"/api/download/{os.path.basename(report_pdf_path)}"
        }
        
        user_key = str(current_user["id"]) if current_user else req.user_id
        app_id = None
        if user_key:
            app_id = save_application(
                user_id=user_key,
                target_company=req.target_company or data.get("company_name", "Unknown"),
                job_title=data.get("job_title", "Position"),
                fit_score=data.get("fit_score", 0),
                urls=urls,
                full_json=data,
                job_description=req.job_description,
                resume_template=req.resume_template
            )
            if app_id:
                urls = {
                    "resume_url": f"/api/applications/{app_id}/download/resume",
                    "cover_letter_url": f"/api/applications/{app_id}/download/cover_letter",
                    "prep_url": f"/api/applications/{app_id}/download/prep",
                    "thank_you_url": f"/api/applications/{app_id}/download/thank_you",
                    "plan_url": f"/api/applications/{app_id}/download/plan",
                    "report_url": f"/api/applications/{app_id}/download/report"
                }
                data["urls"] = urls
            audit_user = current_user["username"] if current_user else f"Guest ({user_key[:8]})"
            log_audit(audit_user, "TAILOR_RESUME", f"Tailored resume for {req.target_company or 'Unknown'} (Fit: {data.get('fit_score', 0)}%)")

        # Save Master Resume & Last Tailored Resume directly into the user's profile database record
        if current_user:
            save_user_last_resume(
                user_id=current_user["id"],
                master_resume=req.master_resume,
                linkedin_experience=req.linkedin_experience,
                candidate_name=req.candidate_name or data.get("name"),
                candidate_contact=req.candidate_contact or data.get("contact"),
                preferred_template=req.resume_template,
                job_description=req.job_description,
                target_company=req.target_company or data.get("company_name", "Unknown"),
                job_title=data.get("job_title", "Position"),
                fit_score=data.get("fit_score", 0),
                tailored_data=data
            )
        
        return {
            "status": "success",
            "application_id": app_id,
            **urls,
            "fit_score": data.get("fit_score", 0),
            "top_strengths": data.get("top_strengths", []),
            "missing_keywords": data.get("missing_keywords", []),
            "outreach_message": data.get("outreach_message", ""),
            "linkedin_headline": data.get("linkedin_headline", ""),
            "linkedin_about": data.get("linkedin_about", ""),
            "workday_json": data.get("workday_json", ""),
            "tailored_data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate docx files: {str(e)}")

@app.post("/api/generate/federal")
async def generate_federal_package(req: FederalGenerationRequest, current_user: dict = Depends(get_current_user)):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required.")
    req.api_key = req.api_key.strip()
    if not req.master_resume or len(req.master_resume.strip()) < 50:
        raise HTTPException(status_code=400, detail="Master Resume is required and must contain valid text.")
    if not req.job_description or len(req.job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job Description is required and must contain valid text.")
    prompt_resume = get_federal_gemini_prompt(req.master_resume, req.job_description, req.federal_gs_grade, req.federal_series, req.linkedin_experience)
    max_retries = 3
    
    async def generate_json(prompt_text):
        for attempt in range(max_retries):
            try:
                text, finish_reason = await asyncio.to_thread(call_gemini_api_rest, prompt_text, req.api_key)
                
                try:
                    parsed_data = robust_json_loads(text)
                    if isinstance(parsed_data, dict):
                        if 'resume' in parsed_data and isinstance(parsed_data['resume'], dict):
                            for k, v in parsed_data['resume'].items(): parsed_data[k] = v
                        if 'ats_fit_analysis' in parsed_data and isinstance(parsed_data['ats_fit_analysis'], dict):
                            for k, v in parsed_data['ats_fit_analysis'].items(): parsed_data[k] = v
                    return parsed_data
                except json.JSONDecodeError as je:
                    raise ValueError(f"JSON Parse Error: {str(je)}. Finish Reason: {finish_reason}.")
            except Exception as e:
                err_str = str(e)
                if any(code in err_str for code in ["429", "500", "502", "503", "504", "JSON Parse Error", "MAX_TOKENS"]) and attempt < max_retries - 1:
                    await asyncio.sleep(15 if "429" not in err_str else 35)
                    continue
                raise HTTPException(status_code=500, detail=f"AI API Error: {str(e)}. Info: {text[:200] if 'text' in locals() else ''}")
        return None

    data = await generate_json(prompt_resume)
    
    tailored_text = ""
    if data:
        tailored_text = f"""
NAME: {data.get('name', '')}
CONTACT: {data.get('contact', '')}
CLEARANCE: {data.get('clearance', '')}
HEADLINE: {data.get('headline', '')}
SUMMARY: {data.get('summary', '')}
COMPETENCIES: {", ".join(data.get('core_competencies', []))}
SKILLS: {json.dumps(data.get('technical_skills', {}))}
EXPERIENCE:
"""
        for role in data.get('roles', []):
            tailored_text += f"\nROLE: {role.get('title', '')} at {role.get('company_and_location', '')} ({role.get('dates', '')})\n"
            for bullet in role.get('bullets', []):
                tailored_text += f"- {bullet}\n"
        tailored_text += f"\nEDUCATION:\n" + "\n".join(data.get('education', []))
        tailored_text += f"\nCERTIFICATIONS:\n" + "\n".join(data.get('certifications', []))
    else:
        tailored_text = req.master_resume

    prompt_ats = get_ats_analysis_prompt(tailored_text, req.job_description, req.linkedin_experience)
    await asyncio.sleep(2)
    ats_data = await generate_json(prompt_ats)
    
    if data is None or ats_data is None:
        raise HTTPException(status_code=500, detail="Failed to generate federal data after multiple attempts.")
        
    data.update(ats_data)
        
    if req.federal_ksa_prompts.strip():
        await asyncio.sleep(2)
        prompt_ksa = get_federal_ksa_prompt(req.master_resume, req.job_description, req.federal_ksa_prompts)
        ksa_data = await generate_json(prompt_ksa)
        if ksa_data:
            data["ksas"] = ksa_data.get("ksas", [])
    else:
        data["ksas"] = []

    try:
        if req.candidate_name:
            data['name'] = req.candidate_name
        if req.candidate_contact:
            data['contact'] = req.candidate_contact
        if req.target_company:
            data['company_name'] = req.target_company
        data['resume_template'] = req.resume_template or 'cyber_navy'
        data['is_federal'] = True
        data['federal_gs_grade'] = req.federal_gs_grade
        data['federal_series'] = req.federal_series

        output_dir = OUTPUT_DIR
        template_config = resolve_template_config(req.resume_template)
        resume_path = generate_federal_resume(data, output_dir, req.federal_gs_grade, req.federal_series, template_config)
        cover_letter_path = generate_cover_letter(data, output_dir, template_config)
        ksa_path = generate_ksa_narrative(data, output_dir) if data.get("ksas") else None
        report_path = generate_ats_report(data, output_dir, template_config)
        
        resume_pdf_path = safe_convert_to_pdf(resume_path)
        cover_letter_pdf_path = safe_convert_to_pdf(cover_letter_path)
        report_pdf_path = safe_convert_to_pdf(report_path)
        
        urls = {
            "resume_url": f"/api/download/{os.path.basename(resume_pdf_path)}",
            "cover_letter_url": f"/api/download/{os.path.basename(cover_letter_pdf_path)}",
            "report_url": f"/api/download/{os.path.basename(report_pdf_path)}"
        }
        if ksa_path:
            urls["ksa_url"] = f"/api/download/{os.path.basename(ksa_path)}"
        
        user_key = str(current_user["id"]) if current_user else req.user_id
        app_id = None
        if user_key:
            app_id = save_application(
                user_id=user_key,
                target_company=req.target_company or data.get("company_name", "Federal Agency"),
                job_title=f"Federal: {data.get('job_title', 'Position')}",
                fit_score=data.get("fit_score", 0),
                urls=urls,
                full_json=data,
                job_description=req.job_description,
                resume_template=req.resume_template
            )
            if app_id:
                urls = {
                    "resume_url": f"/api/applications/{app_id}/download/resume",
                    "cover_letter_url": f"/api/applications/{app_id}/download/cover_letter",
                    "report_url": f"/api/applications/{app_id}/download/report"
                }
                if ksa_path:
                    urls["ksa_url"] = f"/api/applications/{app_id}/download/ksa"
                data["urls"] = urls
            audit_user = current_user["username"] if current_user else f"Guest ({user_key[:8]})"
            log_audit(audit_user, "TAILOR_RESUME_FEDERAL", f"Tailored federal resume for {req.target_company or 'Federal Agency'} (Fit: {data.get('fit_score', 0)}%)")

        if current_user:
            save_user_last_resume(
                user_id=current_user["id"],
                master_resume=req.master_resume,
                linkedin_experience=req.linkedin_experience,
                candidate_name=req.candidate_name or data.get("name"),
                candidate_contact=req.candidate_contact or data.get("contact"),
                preferred_template=req.resume_template,
                job_description=req.job_description,
                target_company=req.target_company or data.get("company_name", "Federal Agency"),
                job_title=f"Federal: {data.get('job_title', 'Position')}",
                fit_score=data.get("fit_score", 0),
                tailored_data=data
            )
        
        return {
            "status": "success",
            "application_id": app_id,
            **urls,
            "fit_score": data.get("fit_score", 0),
            "top_strengths": data.get("top_strengths", []),
            "missing_keywords": data.get("missing_keywords", []),
            "tailored_data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate federal docx files: {str(e)}")

def _build_doc_from_payload(payload: dict, doc_type: str, template_key: str = None) -> str:
    tpl_key = template_key or payload.get("resume_template") or "cyber_navy"
    template_config = resolve_template_config(tpl_key)
    is_fed = bool(payload.get("is_federal"))
    if doc_type == "resume":
        if is_fed:
            return generate_federal_resume(
                payload,
                OUTPUT_DIR,
                payload.get("federal_gs_grade", ""),
                payload.get("federal_series", ""),
                template_config
            )
        return generate_resume(payload, OUTPUT_DIR, template_config)
    elif doc_type == "cover_letter":
        return generate_cover_letter(payload, OUTPUT_DIR, template_config)
    elif doc_type == "report":
        return generate_ats_report(payload, OUTPUT_DIR, template_config)
    elif doc_type == "prep":
        return generate_interview_prep(payload, OUTPUT_DIR, template_config)
    elif doc_type == "thank_you":
        return generate_thank_you_note(payload, OUTPUT_DIR, template_config)
    elif doc_type == "plan":
        return generate_90_day_plan(payload, OUTPUT_DIR, template_config)
    elif doc_type == "ksa":
        return generate_ksa_narrative(payload, OUTPUT_DIR)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported document type: {doc_type}")

@app.get("/api/applications/{app_id}/download/{doc_type}")
async def download_application_doc(app_id: int, doc_type: str):
    app_row = get_application_by_id(app_id)
    if not app_row or not app_row.get("parsed_payload"):
        raise HTTPException(status_code=404, detail="Saved application package not found in database.")
    payload = app_row["parsed_payload"]
    file_path = _build_doc_from_payload(payload, doc_type, app_row.get("resume_template"))
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    safe_company = "".join(c for c in (app_row.get("target_company") or "Company") if c.isalnum() or c in ("_", "-"))[:30]
    download_name = f"Expedite_{doc_type.title()}_{safe_company}.docx"
    return FileResponse(file_path, filename=download_name, media_type=media_type)

@app.get("/api/user/last-resume/download/{doc_type}")
async def download_user_last_resume_doc(
    doc_type: str,
    token: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    user = current_user
    if not user and token:
        user = get_user_from_session(token)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    payload = user.get("last_tailored_resume_data")
    if not payload:
        raise HTTPException(status_code=404, detail="No tailored resume saved on your profile yet.")
    file_path = _build_doc_from_payload(payload, doc_type, user.get("preferred_template"))
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    safe_company = "".join(c for c in (user.get("last_target_company") or "Target") if c.isalnum() or c in ("_", "-"))[:30]
    download_name = f"Expedite_Last_{doc_type.title()}_{safe_company}.docx"
    return FileResponse(file_path, filename=download_name, media_type=media_type)

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    
    media_type = "application/pdf" if filename.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(file_path, filename=filename, media_type=media_type)

class EmailRequest(BaseModel):
    email: str
    file_urls: list[str]

@app.post("/api/send_email")
async def send_email_route(req: EmailRequest):
    import smtplib
    from email.message import EmailMessage
    
    file_paths = []
    for url in req.file_urls:
        if "/api/applications/" in url and "/download/" in url:
            try:
                parts = url.split("/api/applications/")[1].split("/download/")
                app_id = int(parts[0])
                doc_type = parts[1].split("?")[0]
                app_row = get_application_by_id(app_id)
                if app_row and app_row.get("parsed_payload"):
                    file_paths.append(_build_doc_from_payload(app_row["parsed_payload"], doc_type, app_row.get("resume_template")))
            except Exception:
                pass
        else:
            filename = url.split('/')[-1].split('?')[0]
            file_paths.append(os.path.join(OUTPUT_DIR, filename))

    smtp_email = os.environ.get("SMTP_EMAIL")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 465))
    
    if not smtp_email or not smtp_password:
        print(f"[MOCK EMAIL] To: {req.email}")
        print(f"[MOCK EMAIL] Attached: {file_paths}")
        return {"status": "mock", "message": "SMTP credentials not set in .env file. Check the backend logs for mock email."}

    msg = EmailMessage()
    msg['Subject'] = 'Your Expedite CareerSuite Application Package'
    msg['From'] = smtp_email
    msg['To'] = req.email
    msg.set_content("Hello,\n\nPlease find your generated application package attached.\n\nBest,\nExpedite CareerSuite")

    for path in file_paths:
        if os.path.exists(path):
            with open(path, 'rb') as f:
                content = f.read()
            msg.add_attachment(content, maintype='application', subtype='octet-stream', filename=os.path.basename(path))

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as smtp:
                smtp.login(smtp_email, smtp_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.login(smtp_email, smtp_password)
                smtp.send_message(msg)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SMTP Error: {str(e)}")

# --- AUTHENTICATION & PASSWORD ROUTES ---
@app.post("/api/auth/register")
async def api_register(req: RegisterRequest):
    try:
        user_id = register_user(
            username=req.username,
            password=req.password,
            email=req.email,
            candidate_name=req.candidate_name,
            phone=req.phone,
            location=req.location,
            linkedin_url=req.linkedin_url,
            target_role=req.target_role,
            clearance=req.clearance,
            candidate_contact=req.candidate_contact,
            master_resume=req.master_resume,
            linkedin_experience=req.linkedin_experience,
            api_key=req.api_key,
            preferred_template=req.preferred_template
        )
        token = create_session(user_id)
        user_data = get_user_from_session(token)
        log_audit(req.username, "REGISTER", f"User registered. Name: {req.candidate_name or 'N/A'}, Email: {req.email or 'N/A'}, Role: {req.target_role or 'N/A'}")
        return {
            "status": "success",
            "token": token,
            "user": user_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.post("/api/auth/login")
async def api_login(req: LoginRequest):
    user_id = authenticate_user(req.username, req.password)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")
    token = create_session(user_id)
    user_data = get_user_from_session(token)
    log_audit(user_data["username"], "LOGIN", "User logged in successfully.")
    return {
        "status": "success",
        "token": token,
        "user": user_data
    }

@app.post("/api/auth/logout")
async def api_logout(authorization: str = Header(None)):
    if authorization:
        token = authorization
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        
        user_data = get_user_from_session(token)
        if user_data:
            log_audit(user_data["username"], "LOGOUT", "User logged out successfully.")
            
        delete_session(token)
    return {"status": "success"}

@app.post("/api/user/change-password")
async def api_change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    if req.confirm_password is not None and req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match.")
    try:
        change_user_password(current_user["id"], req.current_password, req.new_password)
        return {"status": "success", "message": "Password changed successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password change failed: {str(e)}")

@app.post("/api/auth/reset-password")
async def api_reset_password(req: ResetPasswordRequest):
    if req.confirm_password is not None and req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match.")
    try:
        reset_user_password_by_identity(req.username, req.email, req.new_password)
        return {"status": "success", "message": "Password reset successfully. You can now log in with your new password."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset error: {str(e)}")

@app.post("/api/auth/migrate")
async def api_migrate(req: MigrateRequest, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to migrate history.")
    migrate_guest_history(req.guest_id, current_user["id"])
    return {"status": "success"}

# --- PROFILE & LAST RESUME ROUTES ---
@app.get("/api/user/profile")
async def api_get_profile(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return {"status": "success", "user": current_user}

@app.post("/api/user/profile")
async def api_update_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    from resume_generator_app.database import build_contact_line
    computed_contact = req.candidate_contact
    if not computed_contact and any([req.email, req.phone, req.location, req.linkedin_url]):
        computed_contact = build_contact_line(
            req.email or current_user.get("email"),
            req.phone or current_user.get("phone"),
            req.location or current_user.get("location"),
            req.linkedin_url or current_user.get("linkedin_url")
        )
    update_user_profile(
        user_id=current_user["id"],
        api_key=req.api_key,
        master_resume=req.master_resume,
        linkedin_experience=req.linkedin_experience,
        candidate_name=req.candidate_name,
        candidate_contact=computed_contact,
        email=req.email,
        phone=req.phone,
        location=req.location,
        linkedin_url=req.linkedin_url,
        target_role=req.target_role,
        clearance=req.clearance,
        preferred_template=req.preferred_template
    )
    updated_user = get_user_by_id(current_user["id"])
    log_audit(current_user["username"], "UPDATE_PROFILE", "Updated user profile and resume settings.")
    return {"status": "success", "user": updated_user}

@app.get("/api/user/last-resume")
async def api_get_last_resume(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return {
        "status": "success",
        "master_resume": current_user.get("master_resume"),
        "linkedin_experience": current_user.get("linkedin_experience"),
        "last_tailored_resume": current_user.get("last_tailored_resume_data"),
        "last_job_description": current_user.get("last_job_description"),
        "last_target_company": current_user.get("last_target_company"),
        "last_job_title": current_user.get("last_job_title"),
        "last_fit_score": current_user.get("last_fit_score"),
        "last_tailored_at": current_user.get("last_tailored_at")
    }

# --- APPLICATION TRACKER ROUTES ---
@app.get("/api/applications")
async def api_get_applications(current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        return {"applications": []}
    apps = get_history(user_key)
    for app_item in apps:
        aid = app_item.get("id")
        if aid and app_item.get("parsed_payload"):
            app_item["resume_url"] = f"/api/applications/{aid}/download/resume"
            app_item["cover_letter_url"] = f"/api/applications/{aid}/download/cover_letter"
            app_item["report_url"] = f"/api/applications/{aid}/download/report"
            if app_item["parsed_payload"].get("interview_prep"):
                app_item["prep_url"] = f"/api/applications/{aid}/download/prep"
            if app_item["parsed_payload"].get("thank_you_note"):
                app_item["thank_you_url"] = f"/api/applications/{aid}/download/thank_you"
            if app_item["parsed_payload"].get("90_day_plan"):
                app_item["plan_url"] = f"/api/applications/{aid}/download/plan"
            if app_item["parsed_payload"].get("ksas"):
                app_item["ksa_url"] = f"/api/applications/{aid}/download/ksa"
    return {"applications": apps}

@app.post("/api/applications/manual")
async def api_add_manual_application(req: ManualApplicationRequest, current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        raise HTTPException(status_code=400, detail="User identifier (auth or guest ID) required.")
    
    app_id = save_manual_application(
        user_id=user_key,
        target_company=req.target_company,
        job_title=req.job_title,
        status=req.status,
        notes=req.notes,
        applied_date=req.applied_date
    )
    return {"status": "success", "application_id": app_id}

@app.put("/api/applications/{id}")
async def api_update_application(id: int, req: ApplicationUpdateRequest, current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        raise HTTPException(status_code=400, detail="User identifier (auth or guest ID) required.")
    
    update_application(
        app_id=id,
        user_id=user_key,
        status=req.status,
        notes=req.notes,
        applied_date=req.applied_date,
        interview_date=req.interview_date,
        follow_up_date=req.follow_up_date,
        target_company=req.target_company,
        job_title=req.job_title
    )
    return {"status": "success"}

@app.delete("/api/applications/{id}")
async def api_delete_application(id: int, current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        raise HTTPException(status_code=400, detail="User identifier (auth or guest ID) required.")
    
    delete_application(id, user_key)
    return {"status": "success"}

@app.delete("/api/applications")
async def api_clear_history(current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        raise HTTPException(status_code=400, detail="User identifier (auth or guest ID) required.")
    
    delete_history(user_key)
    return {"status": "success"}

# --- TIMELINE ROUTES ---
@app.get("/api/timeline")
async def api_get_timeline(current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        return {"events": []}
    events = get_timeline_events(user_key)
    return {"events": events}

@app.post("/api/timeline")
async def api_add_timeline_event(req: TimelineEventRequest, current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        raise HTTPException(status_code=400, detail="User identifier (auth or guest ID) required.")
    
    event_id = add_timeline_event(
        user_id=user_key,
        application_id=req.application_id,
        title=req.title,
        event_date=req.event_date,
        description=req.description
    )
    return {"status": "success", "event_id": event_id}

@app.delete("/api/timeline/{id}")
async def api_delete_timeline_event(id: int, current_user: dict = Depends(get_current_user), guest_id: Optional[str] = None):
    user_key = str(current_user["id"]) if current_user else guest_id
    if not user_key:
        raise HTTPException(status_code=400, detail="User identifier (auth or guest ID) required.")
    
    delete_timeline_event(id, user_key)
    return {"status": "success"}

# --- LEGACY SIDEBAR HISTORY ENDPOINTS ---
@app.get("/api/history/{user_id}")
async def get_user_history(user_id: str):
    history = get_history(user_id)
    return {"history": history}

@app.delete("/api/history/{user_id}")
async def clear_user_history(user_id: str):
    delete_history(user_id)
    return {"status": "success"}

# --- ADMIN WORKSPACE ROUTES ---
@app.get("/api/admin/logs")
async def api_admin_get_logs(current_user: dict = Depends(get_current_user)):
    if not current_user or not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Administrative access required.")
    
    from resume_generator_app.database import get_audit_logs
    logs = get_audit_logs()
    return {"logs": logs}

@app.get("/api/admin/users")
async def api_admin_get_users(current_user: dict = Depends(get_current_user)):
    if not current_user or not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Administrative access required.")
        
    from resume_generator_app.database import get_all_users_list
    users = get_all_users_list()
    return {"users": users}

@app.post("/api/admin/users/{user_id}/reset-password")
async def api_admin_reset_password(user_id: int, req: AdminResetPasswordRequest, current_user: dict = Depends(get_current_user)):
    if not current_user or not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Administrative access required.")
    try:
        admin_reset_user_password(user_id, req.new_password)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/admin/users/{user_id}")
async def api_admin_delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    if not current_user or not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Administrative access required.")
        
    from resume_generator_app.database import delete_user_data
    delete_user_data(user_id)
    return {"status": "success"}

# --- TEMPLATE SELECTION API ---
def resolve_template_config(template_key: str):
    from resume_generator_app.database import get_template_by_key
    config = get_template_by_key(template_key)
    if config:
        return config
    
    fallback = {
        "name": "Executive Classic",
        "key": "executive",
        "profession": "General",
        "font_name": "Calibri",
        "primary_color": "1A3A5C",
        "secondary_color": "2A6BA1",
        "layout_type": "executive",
        "has_border": 1,
        "has_bottom_line": 1,
        "description": "Fallback style."
    }
    if template_key == "modern":
        fallback.update({
            "name": "Modern Tech",
            "key": "modern",
            "font_name": "Arial",
            "primary_color": "10B981",
            "secondary_color": "059669",
            "layout_type": "modern",
            "has_border": 0,
            "has_bottom_line": 0
        })
    elif template_key == "classic":
        fallback.update({
            "name": "Classic",
            "key": "classic",
            "font_name": "Times New Roman",
            "primary_color": "1A1A1A",
            "secondary_color": "444444",
            "layout_type": "classic",
            "has_border": 0,
            "has_bottom_line": 1
        })
    return fallback

@app.get("/api/templates")
async def api_get_resume_templates():
    from resume_generator_app.database import get_templates
    templates_list = get_templates()
    
    grouped = {}
    for t in templates_list:
        prof = t['profession']
        if prof not in grouped:
            grouped[prof] = []
        grouped[prof].append(t)
    return {"templates": grouped}

# --- PROFILE OPTIMIZER TAB SUPPORT ---
class ProfileOptimizerRequest(BaseModel):
    master_resume: str
    api_key: str
    target_role: Optional[str] = ""

def get_profile_optimization_prompt(master_resume: str, target_role: str = "") -> str:
    role_context = f"\nTARGET ROLE/INDUSTRY: {target_role}\n" if target_role else ""
    return f"""
You are an expert technical recruiter, executive branding consultant, and ATS optimization specialist.
I will provide you with a MASTER RESUME and an optional target role/industry.
Your task is to generate fully optimized, high-impact profiles for LinkedIn, Indeed, and general employment platforms.

MASTER RESUME:
{master_resume}
{role_context}

You MUST return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting or anything outside the JSON object. All string values MUST be single-line strings. Do not use literal line breaks inside the JSON strings.

{{
  "linkedin": {{
    "location": "Laurel, Maryland, United States (recommend the location they should list based on resume or target role)",
    "education_display": "Towson University (or their highest university from resume)",
    "certifications_display": "CISM | CISA | CRISC | CEH (a formatted pipeline-separated list of their top certifications)",
    "headline_options": [
      "Option 1: Hard-hitting, keyword-focused (e.g. Role | Key Tech | Value Proposition)",
      "Option 2: Narrative-focused",
      "Option 3: Hybrid style"
    ],
    "about_me": "An engaging, ATS-friendly About/Summary section (2-3 paragraphs) structured to tell the candidate's story, highlight core competencies, and list top technical keywords.",
    "experience_formatting": [
      {{
        "company": "Company Name",
        "title": "Job Title",
        "formatted_description": "Clean summary of accomplishments in paragraph or list format optimized specifically for LinkedIn's readability."
      }}
    ],
    "skills_recommendation": ["Skill 1", "Skill 2", "Skill 3"]
  }},
  "indeed": {{
    "location": "Indeed location suggestion",
    "education_display": "Highest education",
    "headline": "Indeed specific headline/summary",
    "summary": "Indeed professional summary (short, technical, direct)",
    "experience_formatting": [
      {{
        "company": "Company Name",
        "title": "Job Title",
        "formatted_description": "Indeed-optimized experience layout."
      }}
    ],
    "skills": ["Skill 1", "Skill 2"]
  }},
  "guides": {{
    "linkedin": [
      "Step 1: Go to your profile...",
      "Step 2: Edit your headline..."
    ],
    "indeed": [
      "Step 1: Upload or create resume...",
      "Step 2: Add these skills..."
    ],
    "others": [
      "General tip 1 for ZipRecruiter/Monster...",
      "General tip 2..."
    ]
  }}
}}
"""

@app.post("/api/profile_optimizer")
async def api_profile_optimizer(req: ProfileOptimizerRequest, current_user: dict = Depends(get_current_user)):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required.")
    req.api_key = req.api_key.strip()
    if not req.master_resume or len(req.master_resume.strip()) < 50:
        raise HTTPException(status_code=400, detail="Master Resume is required and must contain valid text.")
        
    prompt_text = get_profile_optimization_prompt(req.master_resume, req.target_role)
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            text, finish_reason = await asyncio.to_thread(call_gemini_api_rest, prompt_text, req.api_key)
            try:
                parsed_data = robust_json_loads(text)
                
                from resume_generator_app.generator import generate_profile_optimization_doc
                doc_path = generate_profile_optimization_doc(parsed_data, OUTPUT_DIR)
                doc_filename = os.path.basename(doc_path)
                file_url = f"/api/download/{doc_filename}"
                
                if current_user:
                    update_user_profile(
                        user_id=current_user["id"],
                        master_resume=req.master_resume,
                        target_role=req.target_role or None
                    )
                
                audit_user = current_user["username"] if current_user else "Guest"
                log_audit(audit_user, "OPTIMIZE_PROFILE", f"Optimized profiles for target role: {req.target_role or 'N/A'}")
                
                return {
                    "status": "success",
                    "file_url": file_url,
                    "data": parsed_data
                }
            except json.JSONDecodeError as je:
                raise ValueError(f"JSON Parse Error: {str(je)}. Finish Reason: {finish_reason}.")
        except Exception as e:
            err_str = sanitize_error(str(e), req.api_key)
            if any(code in err_str for code in ["429", "500", "502", "503", "504", "JSON Parse Error"]) and attempt < max_retries - 1:
                await asyncio.sleep(5 if "429" not in err_str else 60)
                continue
            if "429" in err_str:
                raise HTTPException(status_code=429, detail="Rate limit exceeded: Your Gemini API key has hit its daily or per-minute free-tier quota. Please get a new API key at https://aistudio.google.com/app/apikey or wait.")
            raise HTTPException(status_code=500, detail=f"AI API Error: {err_str[:300]}")
    
    raise HTTPException(status_code=500, detail="Failed to generate profile optimization.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
