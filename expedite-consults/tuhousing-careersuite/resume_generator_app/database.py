import sqlite3
import os
import json
import hashlib
from datetime import datetime, timedelta

IS_VERCEL = "VERCEL" in os.environ
DB_PATH = "/tmp/careersuite.db" if IS_VERCEL else "careersuite.db"
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

def get_db_connection():
    if DATABASE_URL:
        import psycopg2
        return psycopg2.connect(DATABASE_URL)
    else:
        return sqlite3.connect(DB_PATH)

def query_db(query: str, params: tuple = (), is_write: bool = False, fetch_all: bool = False, fetch_one: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Translate parameter placeholders if using PostgreSQL
    if DATABASE_URL:
        query = query.replace('?', '%s')
        
    try:
        cursor.execute(query, params)
        if is_write:
            conn.commit()
            last_id = None
            if DATABASE_URL:
                try:
                    cursor.execute("SELECT LASTVAL()")
                    last_id = cursor.fetchone()[0]
                except Exception:
                    pass
            else:
                last_id = cursor.lastrowid
            conn.close()
            return last_id
        else:
            if fetch_all or fetch_one:
                columns = [col[0] for col in cursor.description]
                if fetch_all:
                    rows = cursor.fetchall()
                    results = [dict(zip(columns, row)) for row in rows]
                    conn.close()
                    return results
                elif fetch_one:
                    row = cursor.fetchone()
                    result = dict(zip(columns, row)) if row else None
                    conn.close()
                    return result
            conn.close()
            return None
    except Exception as e:
        conn.close()
        raise e

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16).hex()
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    db_hash = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000).hex()
    return db_hash, salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    h, _ = hash_password(password, salt)
    return h == password_hash

def build_contact_line(email: str = None, phone: str = None, location: str = None, linkedin_url: str = None, existing_contact: str = None) -> str:
    if existing_contact and existing_contact.strip():
        return existing_contact.strip()
    effective_profile_url = (linkedin_url or "").strip() or "https://www.connectln.app/connectin"
    parts = [p.strip() for p in [email, phone, location, effective_profile_url] if p and p.strip()]
    return " | ".join(parts)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # SQLite vs PostgreSQL identity type mappings
    id_type = "SERIAL PRIMARY KEY" if DATABASE_URL else "INTEGER PRIMARY KEY AUTOINCREMENT"
    
    # 1. Applications table
    try:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS applications (
                id {id_type},
                user_id TEXT NOT NULL,
                target_company TEXT NOT NULL,
                job_title TEXT NOT NULL,
                fit_score INTEGER,
                timestamp TEXT NOT NULL,
                resume_url TEXT,
                cover_letter_url TEXT,
                prep_url TEXT,
                thank_you_url TEXT,
                plan_url TEXT,
                ksa_url TEXT,
                report_url TEXT,
                full_json_payload TEXT
            )
        ''')
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
    
    # Safe auto-migrations for applications table
    app_columns_to_add = [
        ("status", "TEXT DEFAULT 'Generated'"),
        ("notes", "TEXT"),
        ("applied_date", "TEXT"),
        ("interview_date", "TEXT"),
        ("follow_up_date", "TEXT"),
        ("report_url", "TEXT"),
        ("job_description", "TEXT"),
        ("resume_template", "TEXT DEFAULT 'cyber_navy'")
    ]
    for col_name, col_type in app_columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type}")
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            
    # 2. Users table (Stores User Profiles, Registration Info, Password Credentials, Master Resume & Last Tailored Resume)
    try:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS users (
                id {id_type},
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                email TEXT,
                api_key TEXT,
                master_resume TEXT,
                linkedin_experience TEXT,
                candidate_name TEXT,
                candidate_contact TEXT,
                phone TEXT,
                location TEXT,
                linkedin_url TEXT,
                target_role TEXT,
                clearance TEXT,
                preferred_template TEXT DEFAULT 'cyber_navy',
                last_tailored_resume TEXT,
                last_job_description TEXT,
                last_target_company TEXT,
                last_job_title TEXT,
                last_fit_score INTEGER DEFAULT 0,
                last_tailored_at TEXT,
                is_admin INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT
            )
        ''')
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
            
    # Safe user table migrations for existing database deployments
    user_columns_to_add = [
        ("is_admin", "INTEGER DEFAULT 0"),
        ("phone", "TEXT"),
        ("location", "TEXT"),
        ("linkedin_url", "TEXT"),
        ("target_role", "TEXT"),
        ("clearance", "TEXT"),
        ("preferred_template", "TEXT DEFAULT 'cyber_navy'"),
        ("last_tailored_resume", "TEXT"),
        ("last_job_description", "TEXT"),
        ("last_target_company", "TEXT"),
        ("last_job_title", "TEXT"),
        ("last_fit_score", "INTEGER DEFAULT 0"),
        ("last_tailored_at", "TEXT"),
        ("updated_at", "TEXT")
    ]
    for col_name, col_type in user_columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
    
    # 3. Sessions table
    try:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
    
    # 4. Timeline Events table
    try:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS timeline_events (
                id {id_type},
                user_id TEXT NOT NULL,
                application_id INTEGER,
                title TEXT NOT NULL,
                event_date TEXT NOT NULL,
                description TEXT,
                created_at TEXT NOT NULL
            )
        ''')
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass

    # 5. Audit Logs table
    try:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id {id_type},
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL
            )
        ''')
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass

    # 6. Resume Templates table
    try:
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS resume_templates (
                id {id_type},
                name TEXT NOT NULL,
                key TEXT NOT NULL UNIQUE,
                profession TEXT NOT NULL,
                font_name TEXT NOT NULL,
                primary_color TEXT NOT NULL,
                secondary_color TEXT NOT NULL,
                layout_type TEXT NOT NULL,
                has_border INTEGER DEFAULT 0,
                has_bottom_line INTEGER DEFAULT 0,
                description TEXT
            )
        ''')
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass

    # Seed templates
    templates = [
        ("Certified Public Accountant", "cpa_beige", "Finance & Accounting", "Times New Roman", "8C6D58", "A68B75", "classic", 0, 1, "Clean minimalist layout with warm beige highlights, perfect for accountants, auditors, and financial managers."),
        ("Financial Controller", "controller_slate", "Finance & Accounting", "Georgia", "475569", "64748B", "classic", 0, 1, "Professional slate grey layout, ideal for controllers, analysts, and finance executives."),
        ("PR & Brand Manager", "pr_amethyst", "Marketing & Creative", "Arial", "7C3AED", "8B5CF6", "modern", 0, 0, "Vibrant violet colors with clean sans-serif typography, tailored for PR managers, content creators, and marketers."),
        ("Virtual Assistant", "assistant_lavender", "Marketing & Creative", "Calibri", "8B5CF6", "A78BFA", "modern", 0, 0, "Friendly lavender headers, designed for virtual assistants, coordinators, and administrators."),
        ("Modern Tech Engineer", "tech_emerald", "Cybersecurity & Tech", "Arial", "10B981", "059669", "modern", 0, 0, "Clean emerald green header highlights, designed for software engineers, developers, and tech leads."),
        ("Executive Cyber Director", "cyber_navy", "Cybersecurity & Tech", "Calibri", "1A3A5C", "2A6BA1", "executive", 1, 1, "Traditional navy blue design featuring a distinct page border, matching live profiles for cybersecurity directors and compliance officers."),
        ("Pediatrician & Medical", "medical_teal", "Healthcare & Dental", "Calibri", "0D9488", "14B8A6", "modern", 0, 1, "Clean clinical teal design, perfect for doctors, dentists, pediatricians, and nurses."),
        ("Film & Video Director", "film_charcoal", "Film & Video Portfolio", "Arial", "1F2937", "4B5563", "classic", 0, 0, "Bold dark charcoal headers, built for directors, videographers, editors, and film crew.")
    ]

    for name, key, prof, font, p_col, s_col, lay, border, line, desc in templates:
        try:
            q = "SELECT id FROM resume_templates WHERE key = ?"
            if DATABASE_URL:
                q = q.replace('?', '%s')
            cursor.execute(q, (key,))
            if not cursor.fetchone():
                q_ins = '''
                    INSERT INTO resume_templates (name, key, profession, font_name, primary_color, secondary_color, layout_type, has_border, has_bottom_line, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                '''
                if DATABASE_URL:
                    q_ins = q_ins.replace('?', '%s')
                cursor.execute(q_ins, (name, key, prof, font, p_col, s_col, lay, border, line, desc))
                conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass

    conn.close()

# Session Management
def create_session(user_id: int) -> str:
    token = os.urandom(24).hex()
    created_at = datetime.now().isoformat()
    expires_at = (datetime.now() + timedelta(days=30)).isoformat()
    
    query_db(
        'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
        (token, user_id, created_at, expires_at),
        is_write=True
    )
    return token

def _format_user_row(row: dict) -> dict:
    if not row:
        return None
    parsed_last_resume = None
    raw_last = row.get("last_tailored_resume")
    if raw_last:
        try:
            parsed_last_resume = json.loads(raw_last) if isinstance(raw_last, str) else raw_last
        except Exception:
            parsed_last_resume = None
    row["last_tailored_resume_data"] = parsed_last_resume
    # Avoid sending raw JSON string twice if parsed
    if "last_tailored_resume" in row:
        del row["last_tailored_resume"]
    return row

def get_user_from_session(token: str):
    row = query_db('''
        SELECT u.id, u.username, u.email, u.api_key, u.master_resume, 
               u.linkedin_experience, u.candidate_name, u.candidate_contact,
               u.phone, u.location, u.linkedin_url, u.target_role, u.clearance,
               u.preferred_template, u.last_tailored_resume, u.last_job_description,
               u.last_target_company, u.last_job_title, u.last_fit_score, u.last_tailored_at,
               u.is_admin, u.created_at, u.updated_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > ?
    ''', (token, datetime.now().isoformat()), fetch_one=True)
    return _format_user_row(row)

def get_user_by_id(user_id: int):
    row = query_db('''
        SELECT id, username, email, api_key, master_resume, 
               linkedin_experience, candidate_name, candidate_contact,
               phone, location, linkedin_url, target_role, clearance,
               preferred_template, last_tailored_resume, last_job_description,
               last_target_company, last_job_title, last_fit_score, last_tailored_at,
               is_admin, created_at, updated_at
        FROM users
        WHERE id = ?
    ''', (user_id,), fetch_one=True)
    return _format_user_row(row)

def delete_session(token: str):
    query_db('DELETE FROM sessions WHERE token = ?', (token,), is_write=True)

# User Account CRUD & Password Management
def register_user(
    username: str,
    password: str,
    email: str = None,
    candidate_name: str = None,
    phone: str = None,
    location: str = None,
    linkedin_url: str = None,
    target_role: str = None,
    clearance: str = None,
    candidate_contact: str = None,
    master_resume: str = None,
    linkedin_experience: str = None,
    api_key: str = None,
    preferred_template: str = "cyber_navy"
) -> int:
    username = (username or "").strip()
    if not username:
        raise ValueError("Username is required.")
    if not password or len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")

    password_hash, salt = hash_password(password)
    now_iso = datetime.now().isoformat()
    is_admin = 1 if username.lower() == "admin" else 0
    contact_str = build_contact_line(email, phone, location, linkedin_url, candidate_contact)

    try:
        user_id = query_db('''
            INSERT INTO users (
                username, password_hash, salt, email, candidate_name,
                phone, location, linkedin_url, target_role, clearance,
                candidate_contact, master_resume, linkedin_experience, api_key,
                preferred_template, created_at, updated_at, is_admin
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            username, password_hash, salt, email, candidate_name,
            phone, location, linkedin_url, target_role, clearance,
            contact_str, master_resume, linkedin_experience, api_key,
            preferred_template or "cyber_navy", now_iso, now_iso, is_admin
        ), is_write=True)
        return user_id
    except Exception as e:
        err_str = str(e).lower()
        if "unique" in err_str or "duplicate" in err_str:
            raise ValueError("Username already exists. Please choose another username or log in.")
        raise e

def authenticate_user(username_or_email: str, password: str):
    identifier = (username_or_email or "").strip()
    row = query_db(
        'SELECT id, password_hash, salt FROM users WHERE LOWER(username) = LOWER(?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?))',
        (identifier, identifier),
        fetch_one=True
    )
    if row and verify_password(password, row['password_hash'], row['salt']):
        return row['id']
    return None

def change_user_password(user_id: int, current_password: str, new_password: str) -> bool:
    if not new_password or len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters long.")
    row = query_db('SELECT password_hash, salt, username FROM users WHERE id = ?', (user_id,), fetch_one=True)
    if not row:
        raise ValueError("User account not found.")
    if not verify_password(current_password, row['password_hash'], row['salt']):
        raise ValueError("Current password is incorrect.")
    new_hash, new_salt = hash_password(new_password)
    now_iso = datetime.now().isoformat()
    query_db(
        'UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?',
        (new_hash, new_salt, now_iso, user_id),
        is_write=True
    )
    log_audit(row['username'], "CHANGE_PASSWORD", "User changed their account password.")
    return True

def reset_user_password_by_identity(username: str, email: str, new_password: str) -> bool:
    username_clean = (username or "").strip()
    email_clean = (email or "").strip()
    if not username_clean or not email_clean:
        raise ValueError("Both username and registered email address are required.")
    if not new_password or len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters long.")
    row = query_db(
        'SELECT id, username, email FROM users WHERE LOWER(username) = LOWER(?) AND LOWER(email) = LOWER(?)',
        (username_clean, email_clean),
        fetch_one=True
    )
    if not row:
        raise ValueError("No matching user account found with that username and email address.")
    new_hash, new_salt = hash_password(new_password)
    now_iso = datetime.now().isoformat()
    query_db(
        'UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?',
        (new_hash, new_salt, now_iso, row['id']),
        is_write=True
    )
    log_audit(row['username'], "RESET_PASSWORD", "User reset their password via identity verification.")
    return True

def admin_reset_user_password(user_id: int, new_password: str) -> bool:
    if not new_password or len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters long.")
    row = query_db('SELECT username FROM users WHERE id = ?', (user_id,), fetch_one=True)
    if not row:
        raise ValueError("User not found.")
    new_hash, new_salt = hash_password(new_password)
    now_iso = datetime.now().isoformat()
    query_db(
        'UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?',
        (new_hash, new_salt, now_iso, user_id),
        is_write=True
    )
    log_audit("ADMIN", "ADMIN_RESET_PASSWORD", f"Admin reset password for user {row['username']} (ID: {user_id}).")
    return True

def update_user_profile(
    user_id: int,
    api_key: str = None,
    master_resume: str = None,
    linkedin_experience: str = None,
    candidate_name: str = None,
    candidate_contact: str = None,
    email: str = None,
    phone: str = None,
    location: str = None,
    linkedin_url: str = None,
    target_role: str = None,
    clearance: str = None,
    preferred_template: str = None
):
    now_iso = datetime.now().isoformat()
    query_db('''
        UPDATE users 
        SET api_key = COALESCE(?, api_key),
            master_resume = COALESCE(?, master_resume),
            linkedin_experience = COALESCE(?, linkedin_experience),
            candidate_name = COALESCE(?, candidate_name),
            candidate_contact = COALESCE(?, candidate_contact),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            location = COALESCE(?, location),
            linkedin_url = COALESCE(?, linkedin_url),
            target_role = COALESCE(?, target_role),
            clearance = COALESCE(?, clearance),
            preferred_template = COALESCE(?, preferred_template),
            updated_at = ?
        WHERE id = ?
    ''', (
        api_key, master_resume, linkedin_experience, candidate_name, candidate_contact,
        email, phone, location, linkedin_url, target_role, clearance, preferred_template,
        now_iso, user_id
    ), is_write=True)

def save_user_last_resume(
    user_id: int,
    master_resume: str = None,
    linkedin_experience: str = None,
    candidate_name: str = None,
    candidate_contact: str = None,
    preferred_template: str = None,
    job_description: str = None,
    target_company: str = None,
    job_title: str = None,
    fit_score: int = 0,
    tailored_data: dict = None
):
    now_iso = datetime.now().isoformat()
    tailored_json = json.dumps(tailored_data) if tailored_data is not None else None
    query_db('''
        UPDATE users
        SET master_resume = COALESCE(?, master_resume),
            linkedin_experience = COALESCE(?, linkedin_experience),
            candidate_name = COALESCE(?, candidate_name),
            candidate_contact = COALESCE(?, candidate_contact),
            preferred_template = COALESCE(?, preferred_template),
            last_tailored_resume = COALESCE(?, last_tailored_resume),
            last_job_description = COALESCE(?, last_job_description),
            last_target_company = COALESCE(?, last_target_company),
            last_job_title = COALESCE(?, last_job_title),
            last_fit_score = COALESCE(?, last_fit_score),
            last_tailored_at = ?,
            updated_at = ?
        WHERE id = ?
    ''', (
        master_resume,
        linkedin_experience,
        candidate_name,
        candidate_contact,
        preferred_template,
        tailored_json,
        job_description,
        target_company,
        job_title,
        fit_score,
        now_iso,
        now_iso,
        user_id
    ), is_write=True)

# Application History Tracking
def save_application(user_id, target_company, job_title, fit_score, urls, full_json, job_description: str = None, resume_template: str = "cyber_navy"):
    timestamp = datetime.now().isoformat()
    return query_db('''
        INSERT INTO applications (
            user_id, target_company, job_title, fit_score, timestamp, 
            resume_url, cover_letter_url, prep_url, thank_you_url, plan_url, ksa_url, report_url,
            full_json_payload, status, job_description, resume_template
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Generated', ?, ?)
    ''', (
        user_id, 
        target_company, 
        job_title, 
        fit_score, 
        timestamp,
        urls.get("resume_url", ""),
        urls.get("cover_letter_url", ""),
        urls.get("prep_url", ""),
        urls.get("thank_you_url", ""),
        urls.get("plan_url", ""),
        urls.get("ksa_url", ""),
        urls.get("report_url", ""),
        json.dumps(full_json),
        job_description,
        resume_template or "cyber_navy"
    ), is_write=True)

def save_manual_application(user_id: str, target_company: str, job_title: str, status: str, notes: str = None, applied_date: str = None):
    timestamp = datetime.now().isoformat()
    if not applied_date:
        applied_date = datetime.now().strftime('%Y-%m-%d')
    return query_db('''
        INSERT INTO applications (
            user_id, target_company, job_title, status, notes, applied_date, timestamp, fit_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    ''', (user_id, target_company, job_title, status, notes, applied_date, timestamp), is_write=True)

def update_application(app_id: int, user_id: str, status: str = None, notes: str = None,
                       applied_date: str = None, interview_date: str = None, follow_up_date: str = None,
                       target_company: str = None, job_title: str = None):
    query_db('''
        UPDATE applications
        SET status = COALESCE(?, status),
            notes = COALESCE(?, notes),
            applied_date = COALESCE(?, applied_date),
            interview_date = COALESCE(?, interview_date),
            follow_up_date = COALESCE(?, follow_up_date),
            target_company = COALESCE(?, target_company),
            job_title = COALESCE(?, job_title)
        WHERE id = ? AND user_id = ?
    ''', (status, notes, applied_date, interview_date, follow_up_date, target_company, job_title, app_id, user_id), is_write=True)

def delete_application(app_id: int, user_id: str):
    query_db('DELETE FROM applications WHERE id = ? AND user_id = ?', (app_id, user_id), is_write=True)
    query_db('DELETE FROM timeline_events WHERE application_id = ? AND user_id = ?', (app_id, user_id), is_write=True)

def get_history(user_id):
    rows = query_db('''
        SELECT id, target_company, job_title, fit_score, timestamp, 
               resume_url, cover_letter_url, prep_url, thank_you_url, plan_url, ksa_url, report_url,
               status, notes, applied_date, interview_date, follow_up_date,
               job_description, resume_template, full_json_payload
        FROM applications 
        WHERE user_id = ? 
        ORDER BY timestamp DESC
    ''', (user_id,), fetch_all=True)
    if not rows:
        return []
    for r in rows:
        raw_payload = r.get("full_json_payload")
        if raw_payload:
            try:
                r["parsed_payload"] = json.loads(raw_payload) if isinstance(raw_payload, str) else raw_payload
            except Exception:
                r["parsed_payload"] = None
        else:
            r["parsed_payload"] = None
        if "full_json_payload" in r:
            del r["full_json_payload"]
    return rows

def get_application_by_id(app_id: int, user_id: str = None):
    if user_id:
        row = query_db('''
            SELECT id, user_id, target_company, job_title, fit_score, timestamp,
                   resume_url, cover_letter_url, prep_url, thank_you_url, plan_url, ksa_url, report_url,
                   status, notes, applied_date, interview_date, follow_up_date,
                   job_description, resume_template, full_json_payload
            FROM applications
            WHERE id = ? AND user_id = ?
        ''', (app_id, str(user_id)), fetch_one=True)
    else:
        row = query_db('''
            SELECT id, user_id, target_company, job_title, fit_score, timestamp,
                   resume_url, cover_letter_url, prep_url, thank_you_url, plan_url, ksa_url, report_url,
                   status, notes, applied_date, interview_date, follow_up_date,
                   job_description, resume_template, full_json_payload
            FROM applications
            WHERE id = ?
        ''', (app_id,), fetch_one=True)
    if row and row.get("full_json_payload"):
        try:
            row["parsed_payload"] = json.loads(row["full_json_payload"])
        except Exception:
            row["parsed_payload"] = None
    return row

def delete_history(user_id):
    query_db('DELETE FROM applications WHERE user_id = ?', (user_id,), is_write=True)
    query_db('DELETE FROM timeline_events WHERE user_id = ?', (user_id,), is_write=True)

def migrate_guest_history(guest_id: str, new_user_id: int):
    query_db('UPDATE applications SET user_id = ? WHERE user_id = ?', (str(new_user_id), guest_id), is_write=True)
    query_db('UPDATE timeline_events SET user_id = ? WHERE user_id = ?', (str(new_user_id), guest_id), is_write=True)

# Timeline Events Management
def add_timeline_event(user_id: str, application_id: int, title: str, event_date: str, description: str = None):
    created_at = datetime.now().isoformat()
    return query_db('''
        INSERT INTO timeline_events (user_id, application_id, title, event_date, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, application_id, title, event_date, description, created_at), is_write=True)

def get_timeline_events(user_id: str):
    return query_db('''
        SELECT t.id, t.application_id, t.title, t.event_date, t.description, t.created_at,
               a.target_company, a.job_title
        FROM timeline_events t
        LEFT JOIN applications a ON t.application_id = a.id
        WHERE t.user_id = ?
        ORDER BY t.event_date ASC, t.created_at DESC
    ''', (user_id,), fetch_all=True)

def delete_timeline_event(event_id: int, user_id: str):
    query_db('DELETE FROM timeline_events WHERE id = ? AND user_id = ?', (event_id, user_id), is_write=True)

# Admin Auditing & User Management
def log_audit(user_id: str, action: str, details: str = None):
    timestamp = datetime.now().isoformat()
    return query_db('''
        INSERT INTO audit_logs (user_id, action, details, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (user_id, action, details, timestamp), is_write=True)

def get_audit_logs():
    return query_db('''
        SELECT id, user_id, action, details, timestamp
        FROM audit_logs
        ORDER BY timestamp DESC
    ''', (), fetch_all=True)

def get_all_users_list():
    return query_db('''
        SELECT u.id, u.username, u.email, u.candidate_name, u.phone, u.location,
               u.target_role, u.clearance, u.last_target_company, u.last_job_title,
               u.last_fit_score, u.last_tailored_at, u.is_admin, u.created_at, u.updated_at,
               CASE WHEN u.master_resume IS NOT NULL AND LENGTH(u.master_resume) > 10 THEN 1 ELSE 0 END as has_master_resume,
               (SELECT COUNT(*) FROM applications a WHERE a.user_id = CAST(u.id AS TEXT) OR a.user_id = u.username) as resume_count
        FROM users u
        ORDER BY u.created_at DESC
    ''', (), fetch_all=True)

def delete_user_data(user_id: int):
    user = query_db('SELECT username FROM users WHERE id = ?', (user_id,), fetch_one=True)
    if user:
        username = user['username']
        query_db('DELETE FROM users WHERE id = ?', (user_id,), is_write=True)
        query_db('DELETE FROM applications WHERE user_id = ? OR user_id = ?', (str(user_id), username), is_write=True)
        query_db('DELETE FROM timeline_events WHERE user_id = ? OR user_id = ?', (str(user_id), username), is_write=True)
        log_audit("SYSTEM", "DELETE_USER", f"Deleted user {username} (ID: {user_id}) and all associated data.")

# Templates Retrievals
def get_templates():
    return query_db('''
        SELECT id, name, key, profession, font_name, primary_color, secondary_color, layout_type, has_border, has_bottom_line, description
        FROM resume_templates
        ORDER BY profession ASC, name ASC
    ''', (), fetch_all=True)

def get_template_by_key(key: str):
    return query_db('''
        SELECT id, name, key, profession, font_name, primary_color, secondary_color, layout_type, has_border, has_bottom_line, description
        FROM resume_templates
        WHERE key = ?
    ''', (key,), fetch_one=True)
