function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Global Headers Helper
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

// Global cache of the logged-in user's profile & last tailored resume
let currentUserProfile = null;

function formatTailoredResumeText(data) {
    if (!data || typeof data !== 'object') return '';
    const lines = [];
    if (data.name) lines.push(data.name.toUpperCase());
    if (data.contact) lines.push(data.contact);
    if (data.clearance) lines.push(`Clearance: ${data.clearance}`);
    if (data.job_title || data.headline) lines.push(`Target Role: ${data.job_title || data.headline}`);
    lines.push('');

    if (data.summary) {
        lines.push('PROFESSIONAL SUMMARY');
        lines.push(data.summary);
        lines.push('');
    }

    const skillsObj = data.skills || data.technical_skills;
    if (skillsObj && typeof skillsObj === 'object') {
        lines.push('CORE TECHNICAL SKILLS');
        for (const [cat, val] of Object.entries(skillsObj)) {
            const valStr = Array.isArray(val) ? val.join(', ') : val;
            lines.push(`• ${cat}: ${valStr}`);
        }
        lines.push('');
    }

    if (Array.isArray(data.roles) && data.roles.length > 0) {
        lines.push('PROFESSIONAL EXPERIENCE');
        data.roles.forEach(role => {
            const company = role.company || role.company_and_location || '';
            const loc = role.location ? ` (${role.location})` : '';
            lines.push(`${role.title || 'Role'} | ${company}${loc} | ${role.dates || ''}`);
            (role.bullets || []).forEach(b => {
                lines.push(`  • ${b}`);
            });
            lines.push('');
        });
    }

    if (Array.isArray(data.education) && data.education.length > 0) {
        lines.push('EDUCATION');
        data.education.forEach(ed => {
            if (typeof ed === 'string') {
                lines.push(`• ${ed}`);
            } else if (ed && typeof ed === 'object') {
                lines.push(`• ${ed.degree || ''} - ${ed.institution || ''} (${ed.year || ed.dates || ''})`);
            }
        });
        lines.push('');
    }

    if (Array.isArray(data.certifications) && data.certifications.length > 0) {
        lines.push('CERTIFICATIONS');
        data.certifications.forEach(c => lines.push(`• ${c}`));
    }

    return lines.join('\n').trim();
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize User UUID for Guest Mode
    let guestId = localStorage.getItem('user_id');
    if (!guestId) {
        guestId = generateUUID();
        localStorage.setItem('user_id', guestId);
    }

    // 2. Load Saved Guest Inputs
    const fieldsToSave = ['api-key', 'candidate-name', 'candidate-contact', 'master-resume'];
    fieldsToSave.forEach(id => {
        let savedValue = localStorage.getItem(id);
        if (savedValue) {
            if (id === 'api-key') savedValue = savedValue.trim();
            const el = document.getElementById(id);
            if (el) el.value = savedValue;
        }
    });

    // 3. Attach Listeners to Save Guest Inputs
    fieldsToSave.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                if (!localStorage.getItem('auth_token')) {
                    localStorage.setItem(id, e.target.value);
                }
            });
        }
    });

    // 4. Initialize UI & Event Handlers
    initAuthentication();
    initNavigation();
    initJobTracker();
    initTimeline();
    initSettings();
    initProfileOptimizer();
    initAdminPanel();
    loadResumeTemplates();

    // 5. Fetch Sidebar History & User Profile
    refreshSidebarHistory();
    if (localStorage.getItem('auth_token')) {
        loadSettingsDetails();
    }

    // Quick Save Master Resume Button on Tailor Tab
    const quickSaveResumeBtn = document.getElementById('quick-save-resume-btn');
    if (quickSaveResumeBtn) {
        quickSaveResumeBtn.addEventListener('click', async () => {
            const masterResumeVal = document.getElementById('master-resume').value.trim();
            const nameVal = document.getElementById('candidate-name').value.trim();
            const contactVal = document.getElementById('candidate-contact').value.trim();
            const apiKeyVal = document.getElementById('api-key').value.trim();
            const linkedinVal = document.getElementById('linkedin-experience').value.trim();
            const templateVal = document.getElementById('resume-template').value;
            const statusSmall = document.getElementById('master-resume-save-status');

            if (!localStorage.getItem('auth_token')) {
                localStorage.setItem('master-resume', masterResumeVal);
                localStorage.setItem('candidate-name', nameVal);
                localStorage.setItem('candidate-contact', contactVal);
                if (apiKeyVal) localStorage.setItem('api-key', apiKeyVal);
                if (statusSmall) {
                    statusSmall.textContent = '✅ Saved locally! Register or log in to store in the backend database.';
                    statusSmall.style.display = 'block';
                    setTimeout(() => { statusSmall.style.display = 'none'; }, 4000);
                }
                return;
            }

            const origText = quickSaveResumeBtn.textContent;
            quickSaveResumeBtn.disabled = true;
            quickSaveResumeBtn.textContent = 'Saving...';

            try {
                const r = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        master_resume: masterResumeVal || null,
                        candidate_name: nameVal || null,
                        candidate_contact: contactVal || null,
                        api_key: apiKeyVal || null,
                        linkedin_experience: linkedinVal || null,
                        preferred_template: templateVal || null
                    })
                });
                if (!r.ok) throw new Error('Failed to save resume to profile.');
                if (statusSmall) {
                    statusSmall.textContent = '✅ Master Resume & contact details saved to your database profile!';
                    statusSmall.style.display = 'block';
                    setTimeout(() => { statusSmall.style.display = 'none'; }, 4000);
                }
                await loadSettingsDetails();
            } catch (err) {
                alert('Error saving resume: ' + err.message);
            } finally {
                quickSaveResumeBtn.disabled = false;
                quickSaveResumeBtn.textContent = origText;
            }
        });
    }

    // Last Tailored Resume Banner Actions
    const btnViewLastResume = document.getElementById('btn-view-last-resume');
    if (btnViewLastResume) {
        btnViewLastResume.addEventListener('click', () => {
            if (currentUserProfile && currentUserProfile.last_tailored_resume_data) {
                populateDashboardFromTailoredPayload(
                    currentUserProfile.last_tailored_resume_data,
                    currentUserProfile.last_fit_score
                );
            }
        });
    }

    const btnLoadLastJd = document.getElementById('btn-load-last-jd');
    if (btnLoadLastJd) {
        btnLoadLastJd.addEventListener('click', () => {
            if (currentUserProfile) {
                if (currentUserProfile.last_job_description) {
                    document.getElementById('job-description').value = currentUserProfile.last_job_description;
                }
                if (currentUserProfile.last_target_company) {
                    document.getElementById('target-company').value = currentUserProfile.last_target_company;
                }
                document.getElementById('job-description').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Tab switching for standard/federal resume tailoring
    const tabStandard = document.getElementById('tab-standard');
    const tabFederal = document.getElementById('tab-federal');
    const federalFields = document.getElementById('federal-fields');

    tabStandard.addEventListener('click', () => {
        tabStandard.classList.add('active');
        tabFederal.classList.remove('active');
        federalFields.classList.remove('active');
    });

    tabFederal.addEventListener('click', () => {
        tabFederal.classList.add('active');
        tabStandard.classList.remove('active');
        federalFields.classList.add('active');
    });

    // Clear Job Form Logic (keeps saved Master Resume & Candidate details if logged in)
    document.getElementById('clear-form-btn').addEventListener('click', () => {
        const isLogged = !!localStorage.getItem('auth_token');
        const fieldsToClear = isLogged
            ? ['target-company', 'job-description', 'possible-questions', 'federal-gs', 'federal-series', 'federal-ksa']
            : ['candidate-name', 'candidate-contact', 'target-company', 'master-resume', 'linkedin-experience', 'job-description', 'possible-questions', 'federal-gs', 'federal-series', 'federal-ksa'];
        fieldsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
            if (!isLogged) {
                localStorage.removeItem(id);
            }
        });
        document.getElementById('results').classList.add('hidden');
    });

    // Clear History Logic
    document.getElementById('clear-history-btn').addEventListener('click', async () => {
        if (confirm("Are you sure you want to clear your application history? This cannot be undone.")) {
            const token = localStorage.getItem('auth_token');
            const userKey = localStorage.getItem('user_id');
            const endpoint = token ? '/api/applications' : `/api/applications?guest_id=${userKey}`;
            
            try {
                const response = await fetch(endpoint, { 
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error("Failed to clear history from database.");
                
                refreshSidebarHistory();
                loadApplicationsList();
            } catch(e) {
                console.error("Failed to clear history", e);
                alert("Error clearing history: " + e.message);
            }
        }
    });
});

function populateDashboardFromTailoredPayload(payload, fallbackScore) {
    if (!payload) return;
    const resultsDiv = document.getElementById('results');
    const token = localStorage.getItem('auth_token') || '';

    document.getElementById('fit-score-value').textContent = payload.fit_score || fallbackScore || '0';

    const strengthsList = document.getElementById('top-strengths-list');
    strengthsList.innerHTML = '';
    (payload.top_strengths || []).forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
    });

    const missingList = document.getElementById('missing-keywords-list');
    missingList.innerHTML = '';
    (payload.missing_keywords || []).forEach(keyword => {
        const li = document.createElement('li');
        li.textContent = keyword;
        missingList.appendChild(li);
    });

    const previewEl = document.getElementById('tailored-resume-preview-text');
    if (previewEl) {
        previewEl.value = formatTailoredResumeText(payload);
    }

    document.getElementById('outreach-message').value = payload.outreach_message || 'No outreach message generated.';
    document.getElementById('linkedin-headline').value = payload.linkedin_headline || 'No headline generated.';
    document.getElementById('linkedin-about').value = payload.linkedin_about || 'No about section generated.';
    document.getElementById('workday-json').value = typeof payload.workday_json === 'string'
        ? payload.workday_json
        : JSON.stringify(payload.workday_json || {}, null, 2);

    const urls = payload.urls || {};
    const qToken = token ? `?token=${encodeURIComponent(token)}` : '';
    document.getElementById('download-resume').href = urls.resume_url || `/api/user/last-resume/download/resume${qToken}`;
    document.getElementById('download-cover').href = urls.cover_letter_url || `/api/user/last-resume/download/cover_letter${qToken}`;

    const displayOrHideLink = (elId, url) => {
        const el = document.getElementById(elId);
        if (!el) return;
        if (url) {
            el.href = url;
            el.style.display = 'inline-flex';
        } else {
            el.style.display = 'none';
        }
    };

    displayOrHideLink('download-report', urls.report_url || (token ? `/api/user/last-resume/download/report${qToken}` : null));
    displayOrHideLink('download-prep', urls.prep_url || (payload.interview_prep && token ? `/api/user/last-resume/download/prep${qToken}` : null));
    displayOrHideLink('download-thank-you', urls.thank_you_url || (payload.thank_you_note && token ? `/api/user/last-resume/download/thank_you${qToken}` : null));
    displayOrHideLink('download-plan', urls.plan_url || (payload['90_day_plan'] && token ? `/api/user/last-resume/download/plan${qToken}` : null));
    displayOrHideLink('download-ksa', urls.ksa_url || (payload.ksas && payload.ksas.length && token ? `/api/user/last-resume/download/ksa${qToken}` : null));

    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// --- AUTHENTICATION STATE & UI FLOW ---
function initAuthentication() {
    const authBtn = document.getElementById('auth-action-btn');
    const quickProfileBtn = document.getElementById('quick-profile-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth-btn');
    const authTabLogin = document.getElementById('auth-tab-login');
    const authTabRegister = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authError = document.getElementById('auth-error');

    // Update UI on load
    updateUserAuthUI();

    if (quickProfileBtn) {
        quickProfileBtn.addEventListener('click', () => {
            const navSettings = document.getElementById('nav-btn-settings');
            if (navSettings) navSettings.click();
        });
    }

    authBtn.addEventListener('click', () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            logoutUser();
        } else {
            authModal.classList.remove('hidden');
            authError.classList.add('hidden');
        }
    });

    closeAuthBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });

    authTabLogin.addEventListener('click', () => {
        authTabLogin.classList.add('active');
        authTabRegister.classList.remove('active');
        authTabLogin.style.color = 'white';
        authTabRegister.style.color = 'var(--text-secondary)';
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authError.classList.add('hidden');
    });

    authTabRegister.addEventListener('click', () => {
        authTabRegister.classList.add('active');
        authTabLogin.classList.remove('active');
        authTabRegister.style.color = 'white';
        authTabLogin.style.color = 'var(--text-secondary)';
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        authError.classList.add('hidden');
    });

    // Helper after successful login or registration
    async function completeAuthSession(data) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('is_admin', data.user.is_admin ? '1' : '0');

        const guestId = localStorage.getItem('user_id');
        if (guestId) {
            try {
                await fetch('/api/auth/migrate', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ guest_id: guestId })
                });
            } catch (e) {
                console.warn('Guest history migration warning:', e);
            }
        }

        updateUserAuthUI();
        await loadSettingsDetails();
        refreshSidebarHistory();

        // Always take user straight to Resume Tailor so they can tailor immediately
        const navBtnTailor = document.getElementById('nav-btn-tailor');
        if (navBtnTailor) navBtnTailor.click();
    }

    // Modal Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        
        const payload = {
            username: document.getElementById('login-username').value.trim(),
            password: document.getElementById('login-password').value
        };

        try {
            const r = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.detail || 'Login failed.');

            authModal.classList.add('hidden');
            loginForm.reset();
            await completeAuthSession(data);
        } catch(err) {
            authError.textContent = err.message;
            authError.classList.remove('hidden');
        }
    });

    // Modal Register Form Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        
        const candidate_name = (document.getElementById('register-name')?.value || '').trim();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = (document.getElementById('register-phone')?.value || '').trim();
        const location = (document.getElementById('register-location')?.value || '').trim();
        const target_role = (document.getElementById('register-role')?.value || '').trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const master_resume = (document.getElementById('register-resume')?.value || '').trim();

        if (password !== confirmPassword) {
            authError.textContent = "Passwords do not match.";
            authError.classList.remove('hidden');
            return;
        }

        const payload = {
            username,
            password,
            email: email || null,
            candidate_name: candidate_name || null,
            phone: phone || null,
            location: location || null,
            target_role: target_role || null,
            master_resume: master_resume || null
        };

        try {
            const r = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.detail || 'Registration failed.');

            authModal.classList.add('hidden');
            registerForm.reset();
            await completeAuthSession(data);
        } catch(err) {
            authError.textContent = err.message;
            authError.classList.remove('hidden');
        }
    });

    // --- LANDING PAGE SIGNIN / SIGNUP / RESET PASSWORD HANDLERS ---
    const landingTabLogin = document.getElementById('landing-tab-login');
    const landingTabRegister = document.getElementById('landing-tab-register');
    const landingTabReset = document.getElementById('landing-tab-reset');
    const landingLoginForm = document.getElementById('landing-login-form');
    const landingRegisterForm = document.getElementById('landing-register-form');
    const landingResetForm = document.getElementById('landing-reset-form');
    const landingLoginError = document.getElementById('landing-login-error');
    const landingRegError = document.getElementById('landing-reg-error');
    const landingResetError = document.getElementById('landing-reset-error');
    const landingResetSuccess = document.getElementById('landing-reset-success');

    function switchLandingTab(mode) {
        [landingTabLogin, landingTabRegister, landingTabReset].forEach(b => b && b.classList.remove('active'));
        [landingLoginForm, landingRegisterForm, landingResetForm].forEach(f => f && f.classList.add('hidden'));
        [landingLoginError, landingRegError, landingResetError, landingResetSuccess].forEach(el => el && el.classList.add('hidden'));

        if (mode === 'login') {
            if (landingTabLogin) landingTabLogin.classList.add('active');
            if (landingLoginForm) landingLoginForm.classList.remove('hidden');
        } else if (mode === 'register') {
            if (landingTabRegister) landingTabRegister.classList.add('active');
            if (landingRegisterForm) landingRegisterForm.classList.remove('hidden');
        } else if (mode === 'reset') {
            if (landingTabReset) landingTabReset.classList.add('active');
            if (landingResetForm) landingResetForm.classList.remove('hidden');
        }
    }

    if (landingTabLogin) landingTabLogin.addEventListener('click', () => switchLandingTab('login'));
    if (landingTabRegister) landingTabRegister.addEventListener('click', () => switchLandingTab('register'));
    if (landingTabReset) landingTabReset.addEventListener('click', () => switchLandingTab('reset'));

    const gotoReg = document.getElementById('landing-goto-register');
    if (gotoReg) gotoReg.addEventListener('click', (e) => { e.preventDefault(); switchLandingTab('register'); });

    const gotoReset = document.getElementById('landing-goto-reset');
    if (gotoReset) gotoReset.addEventListener('click', (e) => { e.preventDefault(); switchLandingTab('reset'); });

    if (landingLoginForm) {
        landingLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (landingLoginError) landingLoginError.classList.add('hidden');
            
            const usernameInput = document.getElementById('landing-username').value.trim();
            const passwordInput = document.getElementById('landing-password').value;
            
            try {
                const r = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, password: passwordInput })
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data.detail || 'Login failed.');
                
                landingLoginForm.reset();
                await completeAuthSession(data);
            } catch(err) {
                if (landingLoginError) {
                    landingLoginError.textContent = err.message;
                    landingLoginError.classList.remove('hidden');
                }
            }
        });
    }

    if (landingRegisterForm) {
        landingRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (landingRegError) landingRegError.classList.add('hidden');
            
            const candidate_name = (document.getElementById('landing-reg-name')?.value || '').trim();
            const username = document.getElementById('landing-reg-username').value.trim();
            const email = document.getElementById('landing-reg-email').value.trim();
            const phone = (document.getElementById('landing-reg-phone')?.value || '').trim();
            const location = (document.getElementById('landing-reg-location')?.value || '').trim();
            const target_role = (document.getElementById('landing-reg-role')?.value || '').trim();
            const linkedin_url = (document.getElementById('landing-reg-linkedin')?.value || '').trim();
            const clearance = (document.getElementById('landing-reg-clearance')?.value || '').trim();
            const password = document.getElementById('landing-reg-password').value;
            const confirmInput = document.getElementById('landing-reg-confirm').value;
            const master_resume = (document.getElementById('landing-reg-resume')?.value || '').trim();
            
            if (password !== confirmInput) {
                if (landingRegError) {
                    landingRegError.textContent = "Passwords do not match.";
                    landingRegError.classList.remove('hidden');
                }
                return;
            }
            
            try {
                const r = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password,
                        email: email || null,
                        candidate_name: candidate_name || null,
                        phone: phone || null,
                        location: location || null,
                        target_role: target_role || null,
                        linkedin_url: linkedin_url || null,
                        clearance: clearance || null,
                        master_resume: master_resume || null
                    })
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data.detail || 'Registration failed.');
                
                landingRegisterForm.reset();
                await completeAuthSession(data);
            } catch(err) {
                if (landingRegError) {
                    landingRegError.textContent = err.message;
                    landingRegError.classList.remove('hidden');
                }
            }
        });
    }

    if (landingResetForm) {
        landingResetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (landingResetError) landingResetError.classList.add('hidden');
            if (landingResetSuccess) landingResetSuccess.classList.add('hidden');

            const username = document.getElementById('landing-reset-username').value.trim();
            const email = document.getElementById('landing-reset-email').value.trim();
            const new_password = document.getElementById('landing-reset-new-password').value;
            const confirm_password = document.getElementById('landing-reset-confirm-password').value;

            if (new_password !== confirm_password) {
                if (landingResetError) {
                    landingResetError.textContent = "New passwords do not match.";
                    landingResetError.classList.remove('hidden');
                }
                return;
            }

            try {
                const r = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, new_password, confirm_password })
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data.detail || 'Password reset failed.');

                landingResetForm.reset();
                if (landingResetSuccess) {
                    landingResetSuccess.textContent = data.message || '✅ Password reset! You can now log in.';
                    landingResetSuccess.classList.remove('hidden');
                }
            } catch (err) {
                if (landingResetError) {
                    landingResetError.textContent = err.message;
                    landingResetError.classList.remove('hidden');
                }
            }
        });
    }
}

function updateUserAuthUI() {
    const welcomeSpan = document.getElementById('user-welcome');
    const roleBadge = document.getElementById('user-role-badge');
    const authBtn = document.getElementById('auth-action-btn');
    const quickProfileBtn = document.getElementById('quick-profile-btn');
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('is_admin') === '1';
    
    const landingContainer = document.getElementById('landing-container');
    const appLayout = document.querySelector('.app-layout');
    const navBtnAdmin = document.getElementById('nav-btn-admin');

    if (token && username) {
        welcomeSpan.textContent = `👋 Logged in as: ${username}`;
        authBtn.textContent = 'Log Out';
        authBtn.style.background = 'rgba(239, 68, 68, 0.1)';
        authBtn.style.color = '#ef4444';
        authBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        if (quickProfileBtn) quickProfileBtn.classList.remove('hidden');
        
        if (landingContainer) landingContainer.style.display = 'none';
        if (appLayout) appLayout.style.display = 'flex';

        if (navBtnAdmin) {
            if (isAdmin) {
                navBtnAdmin.classList.remove('hidden');
            } else {
                navBtnAdmin.classList.add('hidden');
            }
        }
    } else {
        welcomeSpan.textContent = '👋 Welcome, Guest';
        if (roleBadge) roleBadge.classList.add('hidden');
        if (quickProfileBtn) quickProfileBtn.classList.add('hidden');
        authBtn.textContent = 'Log In / Sign Up';
        authBtn.style.background = '';
        authBtn.style.color = '';
        authBtn.style.borderColor = '';
        
        if (landingContainer) landingContainer.style.display = 'flex';
        if (appLayout) appLayout.style.display = 'none';
        if (navBtnAdmin) navBtnAdmin.classList.add('hidden');
    }
}

async function logoutUser() {
    if (confirm("Are you sure you want to log out?")) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: getAuthHeaders()
            });
        } catch(e) {
            console.error("Logout request error", e);
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        localStorage.removeItem('is_admin');
        currentUserProfile = null;
        
        updateUserAuthUI();
        refreshSidebarHistory();
        
        const settingsForm = document.getElementById('profile-settings-form');
        if (settingsForm) settingsForm.reset();
        const banner = document.getElementById('last-resume-banner');
        if (banner) banner.classList.add('hidden');
    }
}

// --- DASHBOARD NAVIGATION ---
function initNavigation() {
    const navBtnTailor = document.getElementById('nav-btn-tailor');
    const navBtnOptimizer = document.getElementById('nav-btn-optimizer');
    const navBtnTracker = document.getElementById('nav-btn-tracker');
    const navBtnTimeline = document.getElementById('nav-btn-timeline');
    const navBtnSettings = document.getElementById('nav-btn-settings');
    const navBtnAdmin = document.getElementById('nav-btn-admin');

    const panelTailor = document.getElementById('panel-tailor');
    const panelOptimizer = document.getElementById('panel-optimizer');
    const panelTracker = document.getElementById('panel-tracker');
    const panelTimeline = document.getElementById('panel-timeline');
    const panelSettings = document.getElementById('panel-settings');
    const panelAdmin = document.getElementById('panel-admin');

    const navButtons = [navBtnTailor, navBtnOptimizer, navBtnTracker, navBtnTimeline, navBtnSettings, navBtnAdmin];
    const panels = [panelTailor, panelOptimizer, panelTracker, panelTimeline, panelSettings, panelAdmin];

    function activatePanel(activeBtn, activePanel) {
        navButtons.forEach(btn => btn ? btn.classList.remove('active') : null);
        panels.forEach(p => p ? p.classList.add('hidden') : null);

        if (activeBtn) activeBtn.classList.add('active');
        if (activePanel) activePanel.classList.remove('hidden');
    }

    if (navBtnTailor) {
        navBtnTailor.addEventListener('click', () => {
            activatePanel(navBtnTailor, panelTailor);
        });
    }
    
    if (navBtnOptimizer) {
        navBtnOptimizer.addEventListener('click', () => {
            activatePanel(navBtnOptimizer, panelOptimizer);
            
            if (!localStorage.getItem('auth_token')) {
                const optApiKey = document.getElementById('optimizer-api-key');
                const optResume = document.getElementById('optimizer-resume');
                if (optApiKey && localStorage.getItem('api-key')) optApiKey.value = localStorage.getItem('api-key');
                if (optResume && localStorage.getItem('master-resume')) optResume.value = localStorage.getItem('master-resume');
            } else {
                loadSettingsDetails();
            }
        });
    }
    
    if (navBtnTracker) {
        navBtnTracker.addEventListener('click', () => {
            activatePanel(navBtnTracker, panelTracker);
            loadApplicationsList();
        });
    }
    
    if (navBtnTimeline) {
        navBtnTimeline.addEventListener('click', () => {
            activatePanel(navBtnTimeline, panelTimeline);
            loadTimelineEvents();
        });
    }
    
    if (navBtnSettings) {
        navBtnSettings.addEventListener('click', () => {
            activatePanel(navBtnSettings, panelSettings);
            loadSettingsDetails();
        });
    }

    if (navBtnAdmin) {
        navBtnAdmin.addEventListener('click', () => {
            activatePanel(navBtnAdmin, panelAdmin);
            loadAdminData();
        });
    }
}

// --- HISTORY SIDEBAR RENDERING ---
async function refreshSidebarHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    historyList.innerHTML = '';
    
    try {
        const token = localStorage.getItem('auth_token');
        const userKey = token ? 'auth' : localStorage.getItem('user_id');
        if (!userKey) return;
        
        const endpoint = token ? '/api/applications' : `/api/applications?guest_id=${userKey}`;
        const response = await fetch(endpoint, { headers: getAuthHeaders() });
        const data = await response.json();
        const apps = data.applications || [];

        if (apps.length === 0) {
            historyList.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">No tailored applications yet.</div>';
            return;
        }

        apps.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            
            const date = new Date(item.timestamp).toLocaleDateString();
            const scoreLabel = item.fit_score > 0 ? `ATS Fit: ${item.fit_score}%` : 'Manual Added';
            
            el.innerHTML = `
                <div class="history-company">${escapeHtml(item.target_company)}</div>
                <div class="history-date">${escapeHtml(item.job_title)} | ${date}</div>
                <div class="history-score">${scoreLabel}</div>
            `;
            
            el.addEventListener('click', () => {
                document.getElementById('nav-btn-tailor').click();
                loadHistoryItemIntoDashboard(item);
            });
            
            historyList.appendChild(el);
        });
    } catch (e) {
        console.error("Failed to load sidebar history", e);
    }
}

function loadHistoryItemIntoDashboard(item) {
    if (item.parsed_payload) {
        item.parsed_payload.urls = {
            resume_url: item.resume_url,
            cover_letter_url: item.cover_letter_url,
            report_url: item.report_url,
            prep_url: item.prep_url,
            thank_you_url: item.thank_you_url,
            plan_url: item.plan_url,
            ksa_url: item.ksa_url
        };
        populateDashboardFromTailoredPayload(item.parsed_payload, item.fit_score);
        return;
    }

    const resultsDiv = document.getElementById('results');
    document.getElementById('fit-score-value').textContent = item.fit_score || '0';
    
    document.getElementById('download-resume').href = item.resume_url || '#';
    document.getElementById('download-cover').href = item.cover_letter_url || '#';
    
    const displayOrHide = (elId, url) => {
        const el = document.getElementById(elId);
        if (!el) return;
        if (url) {
            el.href = url;
            el.style.display = 'inline-flex';
        } else {
            el.style.display = 'none';
        }
    };

    displayOrHide('download-report', item.report_url);
    displayOrHide('download-prep', item.prep_url);
    displayOrHide('download-thank-you', item.thank_you_url);
    displayOrHide('download-plan', item.plan_url);
    displayOrHide('download-ksa', item.ksa_url);
    
    const strengthsList = document.getElementById('top-strengths-list');
    strengthsList.innerHTML = '<li>Click "Job Tracker" to view or update notes & schedule timeline dates.</li>';
    const missingList = document.getElementById('missing-keywords-list');
    missingList.innerHTML = '';
    
    document.getElementById('outreach-message').value = "Outreach template available in the Job Tracker notes for this application.";
    
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// --- GENERATION FORM SUBMIT HANDLER ---
document.getElementById('generator-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiKey = document.getElementById('api-key').value.trim();
    const isFederal = document.getElementById('tab-federal').classList.contains('active');
    
    let requestData = {
        api_key: apiKey,
        user_id: localStorage.getItem('user_id'),
        candidate_name: document.getElementById('candidate-name').value,
        candidate_contact: document.getElementById('candidate-contact').value,
        target_company: document.getElementById('target-company').value,
        master_resume: document.getElementById('master-resume').value,
        linkedin_experience: document.getElementById('linkedin-experience').value,
        job_description: document.getElementById('job-description').value,
        possible_interview_questions: document.getElementById('possible-questions').value,
        resume_template: document.getElementById('resume-template').value
    };

    if (isFederal) {
        requestData.federal_gs_grade = document.getElementById('federal-gs').value;
        requestData.federal_series = document.getElementById('federal-series').value;
        requestData.federal_ksa_prompts = document.getElementById('federal-ksa').value;
    }

    const btn = document.getElementById('submit-btn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = document.getElementById('loading-spinner');
    const statusDiv = document.getElementById('status-message');
    const resultsDiv = document.getElementById('results');

    // UI Loading State
    btn.disabled = true;
    btnText.textContent = 'Generating Package & Saving to Profile... (~35s)';
    spinner.classList.remove('hidden');
    statusDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');

    try {
        let endpoint = isFederal ? '/api/generate/federal' : '/api/generate';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            throw new Error("Server crashed: " + rawText.substring(0, 150) + "...");
        }

        if (!response.ok) {
            throw new Error(data.detail || 'An error occurred during generation.');
        }

        // Populate dashboard & preview
        const fullPayload = data.tailored_data || data;
        fullPayload.urls = {
            resume_url: data.resume_url,
            cover_letter_url: data.cover_letter_url,
            report_url: data.report_url,
            prep_url: data.prep_url,
            thank_you_url: data.thank_you_url,
            plan_url: data.plan_url,
            ksa_url: data.ksa_url
        };
        populateDashboardFromTailoredPayload(fullPayload, data.fit_score);

        // Refresh History sidebar, Job Tracker list, and Saved Last Resume Banner
        refreshSidebarHistory();
        loadApplicationsList();
        if (localStorage.getItem('auth_token')) {
            loadSettingsDetails();
        }
    } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.className = 'error';
        statusDiv.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Generate ATS Package & Save Resume';
        spinner.classList.add('hidden');
    }
});

// --- JOB TRACKER DASHBOARD LOGIC ---
let allApplications = [];

function initJobTracker() {
    const addBtn = document.getElementById('add-manual-app-btn');
    const modal = document.getElementById('manual-app-modal');
    const closeBtn = document.getElementById('close-manual-btn');
    const form = document.getElementById('manual-app-form');

    addBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const guestId = localStorage.getItem('user_id');
        const queryParams = localStorage.getItem('auth_token') ? '' : `?guest_id=${guestId}`;

        const payload = {
            target_company: document.getElementById('manual-company').value,
            job_title: document.getElementById('manual-title').value,
            status: document.getElementById('manual-status').value,
            applied_date: document.getElementById('manual-applied-date').value || null,
            notes: document.getElementById('manual-notes').value || null
        };

        try {
            const r = await fetch(`/api/applications/manual${queryParams}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (!r.ok) throw new Error("Failed to save manual application.");
            
            modal.classList.add('hidden');
            form.reset();
            loadApplicationsList();
            refreshSidebarHistory();
        } catch(err) {
            alert(err.message);
        }
    });

    const filterButtons = document.querySelectorAll('.tracker-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderApplications(btn.dataset.status);
        });
    });
}

async function loadApplicationsList() {
    const listDiv = document.getElementById('tracker-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="spinner" style="margin:20px auto;"></div>';

    try {
        const token = localStorage.getItem('auth_token');
        const guestId = localStorage.getItem('user_id');
        const endpoint = token ? '/api/applications' : `/api/applications?guest_id=${guestId}`;

        const response = await fetch(endpoint, { headers: getAuthHeaders() });
        const data = await response.json();
        allApplications = data.applications || [];
        
        const activeBtn = document.querySelector('.tracker-filters .filter-btn.active');
        const activeFilter = activeBtn ? activeBtn.dataset.status : 'all';
        renderApplications(activeFilter);
    } catch(e) {
        listDiv.innerHTML = `<div class="error" style="padding:15px;">Failed to load applications: ${e.message}</div>`;
    }
}

function renderApplications(filterStatus) {
    const listDiv = document.getElementById('tracker-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';

    const filtered = allApplications.filter(app => {
        if (filterStatus === 'all') return true;
        return app.status === filterStatus;
    });

    if (filtered.length === 0) {
        listDiv.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-secondary); font-size:1.1rem;">No applications found in status: ${filterStatus}</div>`;
        return;
    }

    filtered.forEach(app => {
        const card = document.createElement('div');
        card.className = 'tracker-card';
        card.dataset.id = app.id;

        const dateFormatted = app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'Not Set';
        const interviewFormatted = app.interview_date ? new Date(app.interview_date).toLocaleString() : 'None Scheduled';
        const followFormatted = app.follow_up_date ? new Date(app.follow_up_date).toLocaleDateString() : 'Not Set';
        
        const docLinks = [];
        if (app.resume_url) docLinks.push(`<a href="${app.resume_url}" download class="btn tracker-sub-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem;">📄 Resume</a>`);
        if (app.cover_letter_url) docLinks.push(`<a href="${app.cover_letter_url}" download class="btn tracker-sub-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem;">✉️ Cover Letter</a>`);
        if (app.report_url) docLinks.push(`<a href="${app.report_url}" download class="btn tracker-sub-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem;">📊 ATS Report</a>`);
        if (app.prep_url) docLinks.push(`<a href="${app.prep_url}" download class="btn tracker-sub-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem;">🎯 Interview Prep</a>`);
        if (app.plan_url) docLinks.push(`<a href="${app.plan_url}" download class="btn tracker-sub-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem;">📅 90-Day Plan</a>`);
        
        card.innerHTML = `
            <div class="tracker-card-header">
                <div class="job-title-info">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <h4>${escapeHtml(app.target_company)}</h4>
                        <span class="badge badge-${(app.status || 'draft').toLowerCase()}">${escapeHtml(app.status)}</span>
                    </div>
                    <p>${escapeHtml(app.job_title)}</p>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <select class="status-updater" style="padding:0.5rem; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:white; font-family:inherit;">
                        <option value="Generated" ${app.status === 'Generated' ? 'selected' : ''}>Generated</option>
                        <option value="Draft" ${app.status === 'Draft' ? 'selected' : ''}>Draft</option>
                        <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                        <option value="Interviewing" ${app.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
                        <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>Offer</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </div>
            </div>

            <div class="tracker-card-metadata">
                <div class="meta-item">📅 Applied Date: <strong>${dateFormatted}</strong></div>
                <div class="meta-item">🎤 Next Interview: <strong>${interviewFormatted}</strong></div>
                <div class="meta-item">🔔 Follow Up Date: <strong>${followFormatted}</strong></div>
                <div class="meta-item">📈 Match Score: <strong>${app.fit_score > 0 ? app.fit_score + '%' : 'Manual'}</strong></div>
            </div>

            <div class="tracker-card-actions">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${docLinks.join('')}
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn tracker-sub-btn toggle-details-btn">📝 Notes & Dates</button>
                    <button type="button" class="btn tracker-sub-btn add-card-event-btn" style="border-color:rgba(167,139,250,0.3); color:#a78bfa;">📅 Schedule Event</button>
                    <button type="button" class="btn tracker-sub-btn delete-app-btn" style="border-color:rgba(239,68,68,0.3); color:#ef4444;">🗑️ Delete</button>
                </div>
            </div>

            <div class="card-expandable-details hidden" style="margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05);">
                <div class="grid-2-col" style="gap:1.5rem; margin-bottom:15px;">
                    <div class="input-group" style="margin:0;">
                        <label style="font-size:0.85rem;">Update Tracker Dates</label>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.8rem; color:var(--text-secondary);">Applied Date:</span>
                                <input type="date" class="edit-applied-date" value="${app.applied_date || ''}" style="padding:0.4rem; font-size:0.85rem; width:150px; background:rgba(0,0,0,0.3);">
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.8rem; color:var(--text-secondary);">Interview Date:</span>
                                <input type="datetime-local" class="edit-interview-date" value="${app.interview_date || ''}" style="padding:0.4rem; font-size:0.85rem; width:170px; background:rgba(0,0,0,0.3);">
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.8rem; color:var(--text-secondary);">Follow-Up Date:</span>
                                <input type="date" class="edit-followup-date" value="${app.follow_up_date || ''}" style="padding:0.4rem; font-size:0.85rem; width:150px; background:rgba(0,0,0,0.3);">
                            </div>
                        </div>
                    </div>
                    <div class="input-group" style="margin:0;">
                        <label style="font-size:0.85rem;">Notes & Contact Details</label>
                        <textarea class="edit-notes" style="height:100px; padding:0.5rem; font-size:0.85rem; background:rgba(0,0,0,0.3); margin-top:5px;" placeholder="Salary details, interview rounds, contact name...">${escapeHtml(app.notes || '')}</textarea>
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <button type="button" class="btn primary-btn save-card-details-btn" style="width:auto; margin:0; padding:0.5rem 1.5rem; font-size:0.9rem;">Save Details</button>
                </div>
            </div>
        `;

        card.querySelector('.status-updater').addEventListener('change', async (e) => {
            const guestId = localStorage.getItem('user_id');
            const queryParams = localStorage.getItem('auth_token') ? '' : `?guest_id=${guestId}`;
            try {
                const r = await fetch(`/api/applications/${app.id}${queryParams}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ status: e.target.value })
                });
                if (!r.ok) throw new Error("Failed to update status.");
                loadApplicationsList();
                refreshSidebarHistory();
            } catch(err) {
                alert(err.message);
            }
        });

        card.querySelector('.toggle-details-btn').addEventListener('click', () => {
            const details = card.querySelector('.card-expandable-details');
            details.classList.toggle('hidden');
        });

        card.querySelector('.save-card-details-btn').addEventListener('click', async () => {
            const guestId = localStorage.getItem('user_id');
            const queryParams = localStorage.getItem('auth_token') ? '' : `?guest_id=${guestId}`;
            
            const payload = {
                applied_date: card.querySelector('.edit-applied-date').value || null,
                interview_date: card.querySelector('.edit-interview-date').value || null,
                follow_up_date: card.querySelector('.edit-followup-date').value || null,
                notes: card.querySelector('.edit-notes').value || null
            };

            try {
                const r = await fetch(`/api/applications/${app.id}${queryParams}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                if (!r.ok) throw new Error("Failed to update application details.");
                alert("Details saved successfully!");
                loadApplicationsList();
            } catch(err) {
                alert(err.message);
            }
        });

        card.querySelector('.add-card-event-btn').addEventListener('click', () => {
            openEventModal(app.id);
        });

        card.querySelector('.delete-app-btn').addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete the application for ${app.target_company}?`)) {
                const guestId = localStorage.getItem('user_id');
                const queryParams = localStorage.getItem('auth_token') ? '' : `?guest_id=${guestId}`;
                try {
                    const r = await fetch(`/api/applications/${app.id}${queryParams}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    if (!r.ok) throw new Error("Failed to delete application.");
                    loadApplicationsList();
                    refreshSidebarHistory();
                } catch(err) {
                    alert(err.message);
                }
            }
        });

        listDiv.appendChild(card);
    });
}

// --- TIMELINE EVENTS PANEL LOGIC ---
function initTimeline() {
    const generalAddBtn = document.getElementById('add-general-event-btn');
    const modal = document.getElementById('event-modal');
    const closeBtn = document.getElementById('close-event-btn');
    const form = document.getElementById('event-form');

    generalAddBtn.addEventListener('click', () => {
        openEventModal(null);
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const guestId = localStorage.getItem('user_id');
        const queryParams = localStorage.getItem('auth_token') ? '' : `?guest_id=${guestId}`;

        const appIdVal = document.getElementById('event-app-id').value;
        const payload = {
            application_id: appIdVal ? parseInt(appIdVal) : null,
            title: document.getElementById('event-title-input').value,
            event_date: document.getElementById('event-date-input').value,
            description: document.getElementById('event-description-input').value || null
        };

        const selectEl = document.getElementById('event-job-select');
        if (!appIdVal && selectEl && selectEl.value) {
            payload.application_id = parseInt(selectEl.value);
        }

        try {
            const r = await fetch(`/api/timeline${queryParams}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (!r.ok) throw new Error("Failed to save event.");
            
            modal.classList.add('hidden');
            form.reset();
            
            if (document.getElementById('nav-btn-timeline').classList.contains('active')) {
                loadTimelineEvents();
            } else {
                loadApplicationsList();
            }
        } catch(err) {
            alert(err.message);
        }
    });
}

async function openEventModal(appId) {
    const modal = document.getElementById('event-modal');
    const selectGroup = document.getElementById('event-job-select-group');
    const selectEl = document.getElementById('event-job-select');
    const appIdInput = document.getElementById('event-app-id');
    const modalTitle = document.getElementById('event-modal-title');

    modalTitle.textContent = appId ? "Schedule Interview / Milestone" : "Schedule Timeline Event";
    appIdInput.value = appId || '';

    if (appId) {
        selectGroup.style.display = 'none';
    } else {
        selectGroup.style.display = 'block';
        selectEl.innerHTML = '<option value="">-- No Association (General Reminder) --</option>';
        
        allApplications.forEach(app => {
            const opt = document.createElement('option');
            opt.value = app.id;
            opt.textContent = `${app.target_company} - ${app.job_title}`;
            selectEl.appendChild(opt);
        });
    }

    modal.classList.remove('hidden');
}

async function loadTimelineEvents() {
    const listDiv = document.getElementById('timeline-events-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="spinner" style="margin:20px auto;"></div>';

    try {
        const token = localStorage.getItem('auth_token');
        const guestId = localStorage.getItem('user_id');
        const endpoint = token ? '/api/timeline' : `/api/timeline?guest_id=${guestId}`;

        const response = await fetch(endpoint, { headers: getAuthHeaders() });
        const data = await response.json();
        const events = data.events || [];

        listDiv.innerHTML = '';

        if (events.length === 0) {
            listDiv.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-secondary); font-size:1.1rem; width:100%;">No events scheduled yet. Click "Schedule Event" or head to your "Job Tracker" notes to add interviews.</div>`;
            return;
        }

        events.forEach(evt => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const eventDate = new Date(evt.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
            const companyTag = evt.target_company ? `at ${evt.target_company} (${evt.job_title})` : 'General Reminder';
            
            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-item-content">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <div class="timeline-date-label">🔔 ${eventDate}</div>
                            <div class="timeline-item-title">${escapeHtml(evt.title)}</div>
                            <div class="timeline-item-company">${escapeHtml(companyTag)}</div>
                        </div>
                        <button type="button" class="btn delete-event-btn" data-id="${evt.id}" style="width:auto; margin:0; padding:0.4rem 0.8rem; font-size:0.8rem; background:none; border:1px solid rgba(239,68,68,0.2); color:#ef4444;">Delete</button>
                    </div>
                    ${evt.description ? `<div class="timeline-item-desc">${escapeHtml(evt.description)}</div>` : ''}
                </div>
            `;

            item.querySelector('.delete-event-btn').addEventListener('click', async () => {
                if (confirm("Delete this reminder?")) {
                    const guestId = localStorage.getItem('user_id');
                    const queryParams = localStorage.getItem('auth_token') ? '' : `?guest_id=${guestId}`;
                    try {
                        const r = await fetch(`/api/timeline/${evt.id}${queryParams}`, {
                            method: 'DELETE',
                            headers: getAuthHeaders()
                        });
                        if (!r.ok) throw new Error("Failed to delete event.");
                        loadTimelineEvents();
                    } catch(err) {
                        alert(err.message);
                    }
                }
            });

            listDiv.appendChild(item);
        });
    } catch(e) {
        listDiv.innerHTML = `<div class="error" style="padding:15px;">Failed to load events: ${e.message}</div>`;
    }
}

// --- PROFILE SETTINGS, REGISTRATION INFO & CHANGE PASSWORD PANEL LOGIC ---
function initSettings() {
    const form = document.getElementById('profile-settings-form');
    const cpForm = document.getElementById('change-password-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const statusDiv = document.getElementById('settings-status');
            statusDiv.className = 'hidden';

            const payload = {
                api_key: document.getElementById('settings-api-key').value.trim() || null,
                candidate_name: document.getElementById('settings-name').value.trim() || null,
                email: document.getElementById('settings-email').value.trim() || null,
                phone: document.getElementById('settings-phone').value.trim() || null,
                location: document.getElementById('settings-location').value.trim() || null,
                linkedin_url: document.getElementById('settings-linkedin-url').value.trim() || null,
                target_role: document.getElementById('settings-target-role').value.trim() || null,
                clearance: document.getElementById('settings-clearance').value || null,
                candidate_contact: document.getElementById('settings-contact').value.trim() || null,
                master_resume: document.getElementById('settings-resume').value || null,
                linkedin_experience: document.getElementById('settings-linkedin').value || null
            };

            try {
                const r = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data.detail || "Failed to update profile settings.");

                statusDiv.textContent = "✅ Profile, registration details, and Master Resume saved to database!";
                statusDiv.className = "success";
                statusDiv.style.display = "block";
                statusDiv.classList.remove('hidden');
                
                await loadSettingsDetails();
            } catch(err) {
                statusDiv.textContent = `❌ Error: ${err.message}`;
                statusDiv.className = "error";
                statusDiv.style.display = "block";
                statusDiv.classList.remove('hidden');
            }
        });
    }

    if (cpForm) {
        cpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cpStatus = document.getElementById('change-password-status');
            cpStatus.className = 'hidden';

            const current_password = document.getElementById('cp-current-password').value;
            const new_password = document.getElementById('cp-new-password').value;
            const confirm_password = document.getElementById('cp-confirm-password').value;

            if (new_password !== confirm_password) {
                cpStatus.textContent = "❌ New passwords do not match.";
                cpStatus.className = "error";
                cpStatus.style.display = "block";
                cpStatus.classList.remove('hidden');
                return;
            }

            try {
                const r = await fetch('/api/user/change-password', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ current_password, new_password, confirm_password })
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data.detail || 'Failed to update password.');

                cpForm.reset();
                cpStatus.textContent = "✅ Password changed successfully in database!";
                cpStatus.className = "success";
                cpStatus.style.display = "block";
                cpStatus.classList.remove('hidden');
            } catch (err) {
                cpStatus.textContent = `❌ Error: ${err.message}`;
                cpStatus.className = "error";
                cpStatus.style.display = "block";
                cpStatus.classList.remove('hidden');
            }
        });
    }
}

async function loadSettingsDetails() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        const response = await fetch('/api/user/profile', { headers: getAuthHeaders() });
        const data = await response.json();
        
        if (response.ok && data.user) {
            let u = data.user;
            currentUserProfile = u;
            
            // Check if DB settings are empty, but we have local guest settings to migrate
            const localResume = localStorage.getItem('master-resume');
            const localName = localStorage.getItem('candidate-name');
            const localContact = localStorage.getItem('candidate-contact');
            const localApiKey = localStorage.getItem('api-key');

            let needsMigration = false;
            if (!u.master_resume && localResume) { u.master_resume = localResume; needsMigration = true; }
            if (!u.candidate_name && localName) { u.candidate_name = localName; needsMigration = true; }
            if (!u.candidate_contact && localContact) { u.candidate_contact = localContact; needsMigration = true; }
            if (!u.api_key && localApiKey) { u.api_key = localApiKey; needsMigration = true; }
            
            if (needsMigration) {
                try {
                    await fetch('/api/user/profile', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            api_key: u.api_key || null,
                            candidate_name: u.candidate_name || null,
                            candidate_contact: u.candidate_contact || null,
                            master_resume: u.master_resume || null,
                            linkedin_experience: u.linkedin_experience || null
                        })
                    });
                    localStorage.removeItem('master-resume');
                    localStorage.removeItem('candidate-name');
                    localStorage.removeItem('candidate-contact');
                    localStorage.removeItem('api-key');
                } catch (e) {
                    console.error("Failed to migrate guest settings to profile database", e);
                }
            }

            // Update Top Header Bar with user's full name & role badge
            const welcomeSpan = document.getElementById('user-welcome');
            if (welcomeSpan) {
                const displayName = u.candidate_name ? `${u.candidate_name} (@${u.username})` : u.username;
                welcomeSpan.textContent = `👋 Logged in as: ${displayName}`;
            }
            const roleBadge = document.getElementById('user-role-badge');
            if (roleBadge) {
                const badgeParts = [u.target_role, u.clearance].filter(Boolean);
                if (badgeParts.length > 0) {
                    roleBadge.textContent = badgeParts.join(' • ');
                    roleBadge.classList.remove('hidden');
                } else {
                    roleBadge.classList.add('hidden');
                }
            }

            // Populate Account Summary Bar in Settings
            const unameDisp = document.getElementById('settings-username-display');
            if (unameDisp) unameDisp.textContent = u.username || '--';
            const createdDisp = document.getElementById('settings-created-display');
            if (createdDisp) createdDisp.textContent = u.created_at ? new Date(u.created_at).toLocaleDateString() : '--';
            const updatedDisp = document.getElementById('settings-updated-display');
            if (updatedDisp) updatedDisp.textContent = u.updated_at ? new Date(u.updated_at).toLocaleString() : (u.created_at ? new Date(u.created_at).toLocaleDateString() : '--');
            
            // Populate Profile & Registration Form fields
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };
            setVal('settings-api-key', u.api_key);
            setVal('settings-name', u.candidate_name);
            setVal('settings-email', u.email);
            setVal('settings-phone', u.phone);
            setVal('settings-location', u.location);
            setVal('settings-linkedin-url', u.linkedin_url);
            setVal('settings-target-role', u.target_role);
            setVal('settings-clearance', u.clearance);
            setVal('settings-contact', u.candidate_contact);
            setVal('settings-resume', u.master_resume);
            setVal('settings-linkedin', u.linkedin_experience);

            // Auto-fill Resume Tailor form fields so user can immediately tailor
            if (u.api_key) document.getElementById('api-key').value = u.api_key;
            if (u.candidate_name) document.getElementById('candidate-name').value = u.candidate_name;
            if (u.candidate_contact) document.getElementById('candidate-contact').value = u.candidate_contact;
            if (u.master_resume) document.getElementById('master-resume').value = u.master_resume;
            if (u.linkedin_experience) document.getElementById('linkedin-experience').value = u.linkedin_experience;

            // Auto-fill Profile Maximizer fields
            const optApiKey = document.getElementById('optimizer-api-key');
            const optRole = document.getElementById('optimizer-target-role');
            const optResume = document.getElementById('optimizer-resume');
            if (optApiKey && u.api_key) optApiKey.value = u.api_key;
            if (optRole && u.target_role && !optRole.value) optRole.value = u.target_role;
            if (optResume && u.master_resume) optResume.value = u.master_resume;

            // Populate Last Tailored Resume Banner (Tailor tab) & Database Card (Settings tab)
            const banner = document.getElementById('last-resume-banner');
            const emptyMsg = document.getElementById('settings-last-resume-empty');
            const contentBox = document.getElementById('settings-last-resume-content');
            const qToken = `?token=${encodeURIComponent(token)}`;

            if (u.last_tailored_resume_data) {
                const titleStr = `${u.last_job_title || 'Tailored Resume'} — ${u.last_target_company || 'Target Company'}`;
                const dateStr = u.last_tailored_at ? new Date(u.last_tailored_at).toLocaleString() : 'Recently';
                const metaStr = `ATS Fit Score: ${u.last_fit_score || 0}% • Saved on ${dateStr}`;

                if (banner) {
                    document.getElementById('last-resume-title-display').textContent = titleStr;
                    document.getElementById('last-resume-meta-display').textContent = metaStr;
                    const dlBannerBtn = document.getElementById('btn-dl-last-resume');
                    if (dlBannerBtn) dlBannerBtn.href = `/api/user/last-resume/download/resume${qToken}`;
                    banner.classList.remove('hidden');
                }

                if (emptyMsg) emptyMsg.classList.add('hidden');
                if (contentBox) {
                    document.getElementById('settings-last-resume-heading').textContent = titleStr;
                    document.getElementById('settings-last-resume-sub').textContent = metaStr;
                    document.getElementById('settings-dl-last-resume').href = `/api/user/last-resume/download/resume${qToken}`;
                    document.getElementById('settings-dl-last-cover').href = `/api/user/last-resume/download/cover_letter${qToken}`;
                    document.getElementById('settings-last-resume-preview').value = formatTailoredResumeText(u.last_tailored_resume_data);
                    contentBox.classList.remove('hidden');
                }
            } else {
                if (banner) banner.classList.add('hidden');
                if (emptyMsg) emptyMsg.classList.remove('hidden');
                if (contentBox) contentBox.classList.add('hidden');
            }
        }
    } catch(e) {
        console.error("Failed to load profile details", e);
    }
}

// --- PROFILE MAXIMIZER PANEL LOGIC ---
function initProfileOptimizer() {
    const form = document.getElementById('optimizer-form');
    const resultsDiv = document.getElementById('optimizer-results');
    const tabsContainer = document.getElementById('optimizer-tabs');

    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-opt-tab');
            document.getElementById('opt-panel-linkedin').classList.add('hidden');
            document.getElementById('opt-panel-indeed').classList.add('hidden');
            document.getElementById('opt-panel-guides').classList.add('hidden');
            
            document.getElementById(`opt-panel-${targetTab}`).classList.remove('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const apiKey = document.getElementById('optimizer-api-key').value.trim();
            const targetRole = document.getElementById('optimizer-target-role').value.trim();
            const masterResume = document.getElementById('optimizer-resume').value.trim();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⚡ Maximizing Profiles (please wait)...';

            resultsDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/profile_optimizer', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        api_key: apiKey,
                        target_role: targetRole,
                        master_resume: masterResume
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Optimization failed.');

                renderOptimizerResults(data.data);
                
                const dlBtn = document.getElementById('download-optimizer-doc');
                if (dlBtn && data.file_url) {
                    dlBtn.href = data.file_url;
                }
                
                resultsDiv.classList.remove('hidden');
            } catch (err) {
                alert("Error: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

function renderOptimizerResults(data) {
    const linkedinPanel = document.getElementById('opt-panel-linkedin');
    const indeedPanel = document.getElementById('opt-panel-indeed');
    const guidesPanel = document.getElementById('opt-panel-guides');

    const li = data.linkedin || {};
    const liHeadlineHtml = (li.headline_options || []).map((h, i) => `
        <div class="opt-headline-option">
            <span class="opt-headline-text" id="li-hl-${i}">${escapeHtml(h)}</span>
            <button type="button" class="copy-btn" onclick="copyTextDirectly('li-hl-${i}')" style="width:auto; margin:0; padding:0.4rem 0.8rem; font-size:0.8rem;">📋 Copy</button>
        </div>
    `).join('');

    const liExpHtml = (li.experience_formatting || []).map((exp, i) => `
        <div style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <strong style="color:var(--text-primary); font-size:0.95rem;">${escapeHtml(exp.title)} at ${escapeHtml(exp.company)}</strong>
                <button type="button" class="copy-btn" onclick="copyTextDirectly('li-exp-text-${i}')" style="width:auto; margin:0; padding:0.3rem 0.6rem; font-size:0.85rem;">📋 Copy Description</button>
            </div>
            <textarea id="li-exp-text-${i}" class="opt-textarea" style="height:120px;" readonly>${escapeHtml(exp.formatted_description)}</textarea>
        </div>
    `).join('');

    const liSkillsHtml = (li.skills_recommendation || []).map(s => `<span class="opt-badge">${escapeHtml(s)}</span>`).join('');

    const nameInput = document.getElementById('candidate-name').value || localStorage.getItem('candidate-name') || localStorage.getItem('username') || "Your Name";
    const initials = nameInput.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

    linkedinPanel.innerHTML = `
        <div class="li-preview-card">
            <div class="li-preview-banner"></div>
            <div class="li-preview-body">
                <div class="li-preview-avatar">${initials}</div>
                <div class="li-preview-content">
                    <div class="li-preview-left">
                        <div class="li-preview-name-row">
                            <span class="li-preview-name">${escapeHtml(nameInput)}</span>
                            <span class="li-preview-badge">✓</span>
                        </div>
                        <div class="li-preview-headline">${escapeHtml(li.headline_options ? li.headline_options[0] : '')}</div>
                        <div class="li-preview-meta">
                            <span>${escapeHtml(li.location || 'United States')}</span> • <span style="color:#60a5fa; cursor:pointer; font-weight:600;">Contact info</span>
                            <div style="margin-top:6px; color:#a78bfa; font-weight:600;">500+ connections</div>
                        </div>
                    </div>
                    <div class="li-preview-right">
                        <div class="li-preview-org-item">
                            <div class="li-preview-org-icon">🎓</div>
                            <span>${escapeHtml(li.education_display || 'Highest Education')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="opt-card">
            <h3>LinkedIn Headlines <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal;">Select and copy your favorite headline</span></h3>
            ${liHeadlineHtml}
        </div>
        <div class="opt-card">
            <h3>About Me / Summary <button type="button" class="copy-btn" onclick="copyTextDirectly('li-about-text')" style="width:auto; margin:0; padding:0.4rem 0.8rem; font-size:0.8rem;">📋 Copy About Section</button></h3>
            <textarea id="li-about-text" class="opt-textarea" style="height:150px;" readonly>${escapeHtml(li.about_me || '')}</textarea>
        </div>
        <div class="opt-card">
            <h3>Experience Optimization <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal;">Formatted to increase search engine appearance</span></h3>
            ${liExpHtml}
        </div>
        <div class="opt-card">
            <h3>Core Skills to Add <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal;">Manually add these to your Skills Section</span></h3>
            <div class="opt-badge-list">${liSkillsHtml}</div>
        </div>
    `;

    const ind = data.indeed || {};
    const indExpHtml = (ind.experience_formatting || []).map((exp, i) => `
        <div style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <strong style="color:var(--text-primary); font-size:0.95rem;">${escapeHtml(exp.title)} at ${escapeHtml(exp.company)}</strong>
                <button type="button" class="copy-btn" onclick="copyTextDirectly('ind-exp-text-${i}')" style="width:auto; margin:0; padding:0.3rem 0.6rem; font-size:0.85rem;">📋 Copy Description</button>
            </div>
            <textarea id="ind-exp-text-${i}" class="opt-textarea" style="height:120px;" readonly>${escapeHtml(exp.formatted_description)}</textarea>
        </div>
    `).join('');

    const indSkillsHtml = (ind.skills || []).map(s => `<span class="opt-badge">${escapeHtml(s)}</span>`).join('');

    indeedPanel.innerHTML = `
        <div class="opt-card">
            <h3>Indeed Profile Details</h3>
            <div style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6;">
                <div>📍 <strong>Recommended Location:</strong> ${escapeHtml(ind.location || 'N/A')}</div>
                <div style="margin-top:6px;">🎓 <strong>Highest Education to List:</strong> ${escapeHtml(ind.education_display || 'N/A')}</div>
            </div>
        </div>
        <div class="opt-card">
            <h3>Indeed Resume Headline <button type="button" class="copy-btn" onclick="copyTextDirectly('ind-hl-text')" style="width:auto; margin:0; padding:0.4rem 0.8rem; font-size:0.8rem;">📋 Copy</button></h3>
            <div class="opt-headline-option" style="border-left-color:#3b82f6;">
                <span class="opt-headline-text" id="ind-hl-text">${escapeHtml(ind.headline || '')}</span>
            </div>
        </div>
        <div class="opt-card">
            <h3>Indeed Professional Summary <button type="button" class="copy-btn" onclick="copyTextDirectly('ind-sum-text')" style="width:auto; margin:0; padding:0.4rem 0.8rem; font-size:0.8rem;">📋 Copy Summary</button></h3>
            <textarea id="ind-sum-text" class="opt-textarea" style="height:120px;" readonly>${escapeHtml(ind.summary || '')}</textarea>
        </div>
        <div class="opt-card">
            <h3>Indeed Work Experience formatting</h3>
            ${indExpHtml}
        </div>
        <div class="opt-card">
            <h3>Indeed Skills Checklist</h3>
            <div class="opt-badge-list">${indSkillsHtml}</div>
        </div>
    `;

    const gd = data.guides || {};
    const renderSteps = (steps) => (steps || []).map((step, i) => `
        <li class="guide-step-item">
            <input type="checkbox" class="guide-step-checkbox">
            <div class="guide-step-content">
                <div class="guide-step-title">Step ${i+1}</div>
                <div class="guide-step-desc">${escapeHtml(step)}</div>
            </div>
        </li>
    `).join('');

    guidesPanel.innerHTML = `
        <div class="opt-card">
            <h3 style="color:#a78bfa;">🔗 LinkedIn Profile Update Guide</h3>
            <ul class="guide-list">${renderSteps(gd.linkedin)}</ul>
        </div>
        <div class="opt-card">
            <h3 style="color:#a78bfa;">💼 Indeed Profile Update Guide</h3>
            <ul class="guide-list">${renderSteps(gd.indeed)}</ul>
        </div>
        <div class="opt-card">
            <h3 style="color:#a78bfa;">🚀 Other Employment Boards</h3>
            <ul class="guide-list">${renderSteps(gd.others)}</ul>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function copyTextDirectly(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        el.select();
        document.execCommand('copy');
    } else {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
    }
    
    alert('Copied to clipboard!');
}

window.copyTextDirectly = copyTextDirectly;

// --- ADMIN WORKSPACE LOGIC ---
let allAdminLogs = [];
let allAdminUsers = [];

function initAdminPanel() {
    const tabLogs = document.getElementById('admin-tab-logs');
    const tabUsers = document.getElementById('admin-tab-users');
    const panelLogs = document.getElementById('admin-panel-logs');
    const panelUsers = document.getElementById('admin-panel-users');

    const logSearch = document.getElementById('admin-log-search');
    const logFilter = document.getElementById('admin-log-filter-action');

    if (tabLogs && tabUsers) {
        tabLogs.addEventListener('click', () => {
            tabLogs.classList.add('active');
            tabUsers.classList.remove('active');
            panelLogs.classList.remove('hidden');
            panelUsers.classList.add('hidden');
            loadAdminLogs();
        });

        tabUsers.addEventListener('click', () => {
            tabUsers.classList.add('active');
            tabLogs.classList.remove('active');
            panelUsers.classList.remove('hidden');
            panelLogs.classList.add('hidden');
            loadAdminUsers();
        });
    }

    if (logSearch) {
        logSearch.addEventListener('input', filterAndRenderLogs);
    }
    if (logFilter) {
        logFilter.addEventListener('change', filterAndRenderLogs);
    }
}

async function loadAdminData() {
    const tabLogs = document.getElementById('admin-tab-logs');
    if (tabLogs && tabLogs.classList.contains('active')) {
        await loadAdminLogs();
    } else {
        await loadAdminUsers();
    }
}

async function loadAdminLogs() {
    const tbody = document.getElementById('admin-logs-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading logs...</td></tr>';

    try {
        const response = await fetch('/api/admin/logs', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error("Failed to fetch system logs.");
        const data = await response.json();
        allAdminLogs = data.logs || [];
        filterAndRenderLogs();
    } catch(err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#ef4444;">Error: ${err.message}</td></tr>`;
    }
}

function filterAndRenderLogs() {
    const tbody = document.getElementById('admin-logs-tbody');
    if (!tbody) return;

    const query = document.getElementById('admin-log-search').value.toLowerCase().trim();
    const actionFilter = document.getElementById('admin-log-filter-action').value;

    const filtered = allAdminLogs.filter(log => {
        const matchesSearch = !query || 
            (log.user_id && log.user_id.toLowerCase().includes(query)) ||
            (log.action && log.action.toLowerCase().includes(query)) ||
            (log.details && log.details.toLowerCase().includes(query));
        
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
        
        return matchesSearch && matchesAction;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">No logs found matching criteria.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(log => {
        const dateStr = new Date(log.timestamp).toLocaleString();
        return `
            <tr>
                <td style="white-space: nowrap; color: var(--text-secondary); font-size: 0.85rem;">${dateStr}</td>
                <td><strong>${escapeHtml(log.user_id)}</strong></td>
                <td><span class="badge" style="background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); font-weight:600;">${escapeHtml(log.action)}</span></td>
                <td style="font-family: inherit; font-size: 0.85rem; max-width: 400px; word-break: break-all;">${escapeHtml(log.details || '')}</td>
            </tr>
        `;
    }).join('');
}

async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading users...</td></tr>';

    try {
        const response = await fetch('/api/admin/users', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error("Failed to fetch user directory.");
        const data = await response.json();
        allAdminUsers = data.users || [];
        renderAdminUsers();
    } catch(err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444;">Error: ${err.message}</td></tr>`;
    }
}

function renderAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    if (allAdminUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-secondary);">No registered users found.</td></tr>';
        return;
    }

    tbody.innerHTML = allAdminUsers.map(user => {
        const regDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
        const roleBadge = user.is_admin ? 
            '<span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; border: 1px solid rgba(16,185,129,0.3);">Admin</span>' : 
            '<span class="badge" style="background:rgba(255,255,255,0.05); color:var(--text-secondary); border: 1px solid rgba(255,255,255,0.1);">User</span>';
        
        const activeUser = localStorage.getItem('username');
        const resetPwBtn = `<button type="button" class="btn-reset-pw" onclick="adminResetPassword(${user.id}, '${escapeHtml(user.username)}')">🔑 Reset PW</button>`;
        const deleteButton = user.username === activeUser ? 
            '<span style="color:var(--text-secondary); font-size:0.8rem; font-style:italic;">Active</span>' :
            `<button type="button" class="btn-delete" onclick="deleteUserAccount(${user.id}, '${escapeHtml(user.username)}')">🗑️ Delete</button>`;

        const masterTag = user.has_master_resume ? '<span style="color:#10b981;">✓ Master</span>' : '<span style="color:var(--text-muted);">No Master</span>';
        const lastInfo = user.last_target_company ? `<div style="font-size:0.78rem; color:#93c5fd;">Last: ${escapeHtml(user.last_target_company)} (${user.last_fit_score || 0}%)</div>` : '';

        return `
            <tr>
                <td>${user.id}</td>
                <td>
                    <strong>${escapeHtml(user.username)}</strong>
                    ${user.candidate_name ? `<div style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(user.candidate_name)}</div>` : ''}
                </td>
                <td style="color: var(--text-secondary);">
                    <div>${escapeHtml(user.email || 'N/A')}</div>
                    ${user.phone ? `<div style="font-size:0.78rem;">${escapeHtml(user.phone)}</div>` : ''}
                </td>
                <td>
                    ${roleBadge}
                    ${user.target_role ? `<div style="font-size:0.78rem; color:var(--text-secondary); margin-top:4px;">${escapeHtml(user.target_role)}</div>` : ''}
                    ${user.clearance ? `<div style="font-size:0.75rem; color:#fde047;">${escapeHtml(user.clearance)}</div>` : ''}
                </td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${regDate}</td>
                <td>
                    <div>${masterTag} • <strong style="color:#a78bfa;">${user.resume_count || 0} pkgs</strong></div>
                    ${lastInfo}
                </td>
                <td>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                        ${resetPwBtn}
                        ${deleteButton}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function adminResetPassword(userId, username) {
    const newPassword = prompt(`Enter a new password for user "${username}" (minimum 6 characters):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }
    try {
        const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ new_password: newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Password reset failed.");
        alert(`✅ Password for "${username}" has been updated.`);
        loadAdminLogs();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function deleteUserAccount(userId, username) {
    if (confirm(`CAUTION: Are you sure you want to delete user "${username}" and ALL their application history/milestones? This cannot be undone.`)) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error("Deletion request failed.");
            alert(`User "${username}" successfully deleted.`);
            loadAdminUsers();
        } catch(err) {
            alert("Error: " + err.message);
        }
    }
}

window.deleteUserAccount = deleteUserAccount;
window.adminResetPassword = adminResetPassword;

// --- DYNAMIC PROFESSION TEMPLATE LOADER ---
async function loadResumeTemplates() {
    const select = document.getElementById('resume-template');
    const gallery = document.getElementById('template-gallery');
    if (!select || !gallery) return;

    try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error("Failed to fetch templates.");
        const data = await response.json();
        
        const grouped = data.templates || {};
        let selectHtml = '';
        let galleryHtml = '';
        let allTemplates = [];
        
        for (const profession in grouped) {
            for (const t of grouped[profession]) {
                allTemplates.push(t);
                selectHtml += `<option value="${escapeHtml(t.key)}">${escapeHtml(t.name)}</option>`;
                
                const isExecutive = t.layout_type === 'executive';
                const isModern = t.layout_type === 'modern';
                
                let borderStyle = '';
                let cardClass = 'template-card';
                if (isExecutive) {
                    borderStyle = `border: 2px solid #${t.primary_color};`;
                    cardClass += ' executive-style';
                } else {
                    borderStyle = `border-top: 4px solid #${t.primary_color};`;
                }
                
                const headerAlign = isModern ? 'text-align: left;' : 'text-align: center;';
                const dividerHtml = isModern ? '' : `<div class="preview-divider-mock" style="background-color: #${t.primary_color};"></div>`;
                
                galleryHtml += `
                    <div class="${cardClass}" data-key="${escapeHtml(t.key)}" id="tpl-card-${escapeHtml(t.key)}">
                        <div class="template-card-preview" style="font-family: '${escapeHtml(t.font_name)}', sans-serif; ${borderStyle}">
                            <div class="preview-header-mock" style="${headerAlign}">
                                <div class="preview-name-mock" style="color: #${t.primary_color}; font-family: '${escapeHtml(t.font_name)}', sans-serif;">
                                    ${isModern ? 'SARAH AMELIA' : 'OLIVIA WILSON'}
                                </div>
                                <div class="preview-title-mock" style="font-family: '${escapeHtml(t.font_name)}', sans-serif;">
                                    ${escapeHtml(t.profession)} Expert
                                </div>
                                ${dividerHtml}
                            </div>
                            <div class="preview-body-mock">
                                <div class="preview-line-mock short"></div>
                                <div class="preview-line-mock long"></div>
                                <div class="preview-line-mock medium"></div>
                            </div>
                        </div>
                        <div class="template-card-info">
                            <span class="template-badge">${escapeHtml(t.profession)}</span>
                            <h4>${escapeHtml(t.name)}</h4>
                            <p>${escapeHtml(t.description)}</p>
                        </div>
                    </div>
                `;
            }
        }
        
        select.innerHTML = selectHtml;
        gallery.innerHTML = galleryHtml;
        
        allTemplates.forEach(t => {
            const cardEl = document.getElementById(`tpl-card-${t.key}`);
            if (cardEl) {
                cardEl.addEventListener('click', () => {
                    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
                    cardEl.classList.add('active');
                    select.value = t.key;
                    localStorage.setItem('selected_resume_template', t.key);
                });
            }
        });
        
        let defaultKey = localStorage.getItem('selected_resume_template') || 'cyber_navy';
        if (!document.getElementById(`tpl-card-${defaultKey}`) && allTemplates.length > 0) {
            defaultKey = allTemplates[0].key;
        }
        
        const defaultCard = document.getElementById(`tpl-card-${defaultKey}`);
        if (defaultCard) {
            defaultCard.classList.add('active');
            select.value = defaultKey;
        }
        
    } catch (err) {
        console.error("Error loading templates: ", err);
    }
}
