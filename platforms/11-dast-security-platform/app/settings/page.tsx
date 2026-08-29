"use client";
import { useState } from "react";
import { Settings, Bell, Plug, Terminal, Key, Save, Copy, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react";

type SettingsTab = "General" | "Notifications" | "Integrations" | "CI/CD" | "API Keys";

const GITHUB_ACTIONS_YAML = `name: AXIOM DAST Security Scan

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  dast-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Run AXIOM DAST Scan
        uses: axiom-security/axiom-action@v1
        with:
          target: \${{ vars.STAGING_URL }}
          api-key: \${{ secrets.AXIOM_API_KEY }}
          profile: safe
          fail-on: Critical,High
          output: sarif

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: axiom-results.sarif`;

const GITLAB_YAML = `axiom-dast:
  stage: test
  image: axiom-security/axiom-cli:latest
  variables:
    AXIOM_TARGET: \$STAGING_URL
    AXIOM_PROFILE: safe
  script:
    - axiom scan
        --target \$AXIOM_TARGET
        --api-key \$AXIOM_API_KEY
        --profile \$AXIOM_PROFILE
        --fail-on Critical,High
        --output sarif
        --out axiom-results.sarif
  artifacts:
    reports:
      sast: axiom-results.sarif`;

const JENKINS_GROOVY = `pipeline {
  agent any
  environment {
    AXIOM_API_KEY = credentials('axiom-api-key')
    TARGET_URL    = "\${params.TARGET_URL}"
  }
  stages {
    stage('AXIOM DAST') {
      steps {
        sh """
          axiom scan \\
            --target \${TARGET_URL} \\
            --api-key \${AXIOM_API_KEY} \\
            --profile standard \\
            --fail-on Critical \\
            --output html \\
            --out axiom-report.html
        """
      }
      post {
        always {
          publishHTML([
            reportDir: '.', reportFiles: 'axiom-report.html',
            reportName: 'AXIOM DAST Report'
          ])
        }
      }
    }
  }
}`;

interface ApiKey {
  id: string; name: string; key: string; created: string; lastUsed: string; permissions: string;
}

const MOCK_KEYS: ApiKey[] = [
  { id:"k1", name:"GitHub Actions — Production",  key:"axm_k1_a8f3b2c9d4e7f1a0b5c2d9e6", created:"Aug 15, 2026", lastUsed:"Today",          permissions:"scan:read, scan:write, report:read" },
  { id:"k2", name:"GitLab CI — Staging",          key:"axm_k2_f9e1d3c7b5a2f4e8d6c1b9a3", created:"Aug 10, 2026", lastUsed:"Aug 20, 2026",    permissions:"scan:write, report:read" },
  { id:"k3", name:"Jira Integration",             key:"axm_k3_b2c4d6e8f1a3c5d7e9b1f3a5", created:"Aug 1, 2026",  lastUsed:"Aug 18, 2026",    permissions:"report:read" },
];

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ position:"relative", borderRadius:6, border:"1px solid var(--border)", overflow:"hidden", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 10px", background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
        <span style={{ fontSize:10, color:"var(--muted)", fontFamily:"monospace" }}>{lang}</span>
        <button onClick={copy} style={{ background:"none", border:"none", color:copied?"var(--green)":"var(--muted)", cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", gap:4 }}>
          {copied ? <><CheckCircle size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
        </button>
      </div>
      <pre style={{ padding:"12px 14px", margin:0, fontSize:10.5, fontFamily:"'Cascadia Code','Fira Code',monospace", color:"#8d96a0", lineHeight:1.7, overflowX:"auto", background:"var(--bg)" }}>{code}</pre>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v:boolean)=>void }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:36, height:20, borderRadius:10, background:value?"var(--primary)":"var(--border)", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:2, left:value?18:2, width:16, height:16, borderRadius:8, background:"#fff", transition:"left 0.2s" }} />
    </div>
  );
}

function FormField({ label, placeholder, type="text", defaultValue="" }: { label:string; placeholder:string; type?:string; defaultValue?:string }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:10.5, color:"var(--muted)", marginBottom:4 }}>{label}</div>
      <input className="tool-input" type={type} defaultValue={defaultValue} placeholder={placeholder} style={{ width:"100%" }} />
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("General");
  const [slack, setSlack]   = useState(true);
  const [email, setEmail]   = useState(false);
  const [teams, setTeams]   = useState(false);
  const [critAlert, setCrit] = useState(true);
  const [highAlert, setHigh] = useState(true);
  const [jira,   setJira]   = useState(false);
  const [github, setGithub] = useState(true);
  const [saved,  setSaved]  = useState(false);
  const [showKey, setShowKey] = useState<Record<string,boolean>>({});
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [newKeyName, setNewKeyName] = useState("");

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const genKey = () => {
    if (!newKeyName.trim()) return;
    const k: ApiKey = { id:`k${Date.now()}`, name:newKeyName, key:`axm_k${Date.now().toString(36)}_${Math.random().toString(36).slice(2,26)}`, created:"Today", lastUsed:"Never", permissions:"scan:read, report:read" };
    setKeys(ks=>[...ks,k]); setNewKeyName("");
  };

  const tabs: { id:SettingsTab; icon:React.ReactNode }[] = [
    { id:"General",       icon:<Settings size={12}/> },
    { id:"Notifications", icon:<Bell size={12}/> },
    { id:"Integrations",  icon:<Plug size={12}/> },
    { id:"CI/CD",         icon:<Terminal size={12}/> },
    { id:"API Keys",      icon:<Key size={12}/> },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <Settings size={13} color="var(--primary)" />
        <span style={{ fontSize:12, fontWeight:600, color:"var(--fg)" }}>Settings &amp; Integrations</span>
        <button onClick={save} className="btn-primary" style={{ marginLeft:"auto", fontSize:11, display:"flex", alignItems:"center", gap:4, color:saved?"var(--green)":undefined, background:saved?"rgba(61,220,132,0.15)":undefined }}>
          {saved ? <><CheckCircle size={11}/> Saved!</> : <><Save size={11}/> Save Changes</>}
        </button>
      </div>

      <div className="split-h" style={{ flex:1 }}>
        {/* Tabs */}
        <div style={{ width:160, flexShrink:0, borderRight:"1px solid var(--border)", padding:"8px 0" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:tab===t.id?"rgba(232,145,45,0.08)":"transparent", border:"none", borderLeft:tab===t.id?"2px solid var(--primary)":"2px solid transparent", color:tab===t.id?"var(--fg)":"var(--muted)", cursor:"pointer", fontSize:12, fontWeight:tab===t.id?600:400, textAlign:"left" }}>
              <span style={{ color:tab===t.id?"var(--primary)":"var(--muted)" }}>{t.icon}</span>
              {t.id}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>

          {/* ── GENERAL ── */}
          {tab === "General" && (
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--fg)", marginBottom:14 }}>General Settings</div>
              <FormField label="Platform Name"        placeholder="AXIOM Security Intelligence" defaultValue="AXIOM Security Intelligence" />
              <FormField label="Organization Name"    placeholder="Your Company" />
              <FormField label="OOB Server Domain"    placeholder="ax1m9f3k.axiom-oob.io" defaultValue="ax1m9f3k.axiom-oob.io" />
              <FormField label="Default Scan Profile" placeholder="Standard" defaultValue="Standard" />
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:10.5, color:"var(--muted)", marginBottom:4 }}>Default Rate Limit</div>
                <select className="tool-select" style={{ width:"100%" }}>
                  <option>5 req/s — Safe</option>
                  <option selected>15 req/s — Standard</option>
                  <option>30 req/s — Aggressive</option>
                  <option>Custom</option>
                </select>
              </div>
              {[
                { label:"Auto-verify all findings before reporting", on:true },
                { label:"Deduplicate findings across scans",          on:true },
                { label:"Enable AI auto-triage",                     on:true },
                { label:"Collect anonymous usage analytics",         on:false },
              ].map(s=>(
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ flex:1, fontSize:12, color:"var(--muted)" }}>{s.label}</span>
                  <Toggle value={s.on} onChange={()=>{}} />
                </div>
              ))}
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "Notifications" && (
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--fg)", marginBottom:14 }}>Notification Channels</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)", marginBottom:10 }}>
                <span style={{ flex:1, fontSize:13, fontWeight:600, color:"var(--fg)" }}>🟢 Slack</span>
                <Toggle value={slack} onChange={setSlack} />
              </div>
              {slack && <>
                <FormField label="Webhook URL" placeholder="https://hooks.slack.com/services/..." />
                <FormField label="Channel"     placeholder="#security-alerts" defaultValue="#security-alerts" />
              </>}
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)", marginBottom:10, marginTop:6 }}>
                <span style={{ flex:1, fontSize:13, fontWeight:600, color:"var(--fg)" }}>📧 Email</span>
                <Toggle value={email} onChange={setEmail} />
              </div>
              {email && <FormField label="Recipients (comma-separated)" placeholder="security@company.com, cto@company.com" />}
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)", marginBottom:10, marginTop:6 }}>
                <span style={{ flex:1, fontSize:13, fontWeight:600, color:"var(--fg)" }}>💬 Microsoft Teams</span>
                <Toggle value={teams} onChange={setTeams} />
              </div>
              {teams && <FormField label="Webhook URL" placeholder="https://outlook.office.com/webhook/..." />}
              <div style={{ marginTop:16, fontSize:13, fontWeight:600, color:"var(--fg)", marginBottom:10 }}>Alert Triggers</div>
              {[
                { label:"Critical severity finding",  val:critAlert, set:setCrit },
                { label:"High severity finding",      val:highAlert, set:setHigh },
                { label:"Scan complete",              val:true,  set:()=>{} },
                { label:"Scan failed / error",        val:true,  set:()=>{} },
                { label:"New finding (any severity)", val:false, set:()=>{} },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ flex:1, fontSize:12, color:"var(--muted)" }}>{s.label}</span>
                  <Toggle value={s.val} onChange={s.set} />
                </div>
              ))}
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {tab === "Integrations" && (
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--fg)", marginBottom:14 }}>Third-Party Integrations</div>

              {/* Jira */}
              <div style={{ marginBottom:16, padding:14, background:"var(--surface)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--fg)" }}>🟦 Jira</span>
                  <Toggle value={jira} onChange={setJira} />
                  {jira && <span style={{ fontSize:10, color:"var(--green)" }}>Connected</span>}
                </div>
                {jira && <>
                  <FormField label="Jira Server URL"  placeholder="https://yourcompany.atlassian.net" />
                  <FormField label="Project Key"      placeholder="SEC" defaultValue="SEC" />
                  <FormField label="API Token"        placeholder="atl_..." type="password" />
                  <FormField label="Issue Type"       placeholder="Bug" defaultValue="Bug" />
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0" }}>
                    <span style={{ flex:1, fontSize:12, color:"var(--muted)" }}>Auto-create ticket on Critical finding</span>
                    <Toggle value={true} onChange={()=>{}} />
                  </div>
                </>}
              </div>

              {/* GitHub Issues */}
              <div style={{ marginBottom:16, padding:14, background:"var(--surface)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--fg)" }}>⚫ GitHub Issues</span>
                  <Toggle value={github} onChange={setGithub} />
                  {github && <span style={{ fontSize:10, color:"var(--green)" }}>Connected</span>}
                </div>
                {github && <>
                  <FormField label="Repository"       placeholder="org/repo" defaultValue="company/security-issues" />
                  <FormField label="Personal Access Token" placeholder="ghp_..." type="password" />
                  <FormField label="Label"            placeholder="security,dast" defaultValue="security,axiom-dast" />
                </>}
              </div>

              {/* Linear */}
              <div style={{ padding:14, background:"var(--surface)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--fg)" }}>🟣 Linear</span>
                  <Toggle value={false} onChange={()=>{}} />
                </div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>Enable to auto-create Linear issues from AXIOM findings.</div>
              </div>
            </div>
          )}

          {/* ── CI/CD ── */}
          {tab === "CI/CD" && (
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--fg)", marginBottom:6 }}>CI/CD Pipeline Integration</div>
              <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16, lineHeight:1.7 }}>
                Run AXIOM as a gate in your CI/CD pipeline. The scanner returns <code>exit 1</code> when Critical or High findings are detected — blocking the deployment.
              </p>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--fg)", marginBottom:8 }}>GitHub Actions</div>
              <CodeBlock code={GITHUB_ACTIONS_YAML} lang="github-actions.yml" />
              <div style={{ fontSize:12, fontWeight:600, color:"var(--fg)", marginBottom:8 }}>GitLab CI</div>
              <CodeBlock code={GITLAB_YAML} lang=".gitlab-ci.yml" />
              <div style={{ fontSize:12, fontWeight:600, color:"var(--fg)", marginBottom:8 }}>Jenkins Pipeline</div>
              <CodeBlock code={JENKINS_GROOVY} lang="Jenkinsfile (Groovy)" />
              <div style={{ padding:12, background:"rgba(61,220,132,0.06)", borderRadius:6, border:"1px solid rgba(61,220,132,0.15)", fontSize:11, color:"var(--muted)" }}>
                💡 <strong style={{ color:"var(--green)" }}>Pro tip:</strong> Use <code>--profile safe</code> in CI pipelines to avoid disrupting staging environments. Use <code>--fail-on Critical</code> to only block on the most severe issues.
              </div>
            </div>
          )}

          {/* ── API KEYS ── */}
          {tab === "API Keys" && (
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--fg)", marginBottom:14 }}>API Key Management</div>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                <input className="tool-input" value={newKeyName} onChange={e=>setNewKeyName(e.target.value)} placeholder="Key name (e.g. GitHub Actions — Production)" style={{ flex:1 }} />
                <button className="btn-primary" onClick={genKey} style={{ fontSize:12, whiteSpace:"nowrap" }}><Key size={11}/> Generate Key</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Name</th><th>API Key</th><th>Created</th><th>Last Used</th><th>Permissions</th><th></th></tr></thead>
                <tbody>
                  {keys.map(k => (
                    <tr key={k.id}>
                      <td style={{ fontWeight:500, color:"var(--fg)" }}>{k.name}</td>
                      <td style={{ fontFamily:"monospace", fontSize:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <code style={{ background:"var(--bg)", padding:"2px 6px", borderRadius:4 }}>
                            {showKey[k.id] ? k.key : `${k.key.slice(0,12)}${"·".repeat(16)}`}
                          </code>
                          <button onClick={()=>setShowKey(s=>({...s,[k.id]:!s[k.id]}))} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer" }}>
                            {showKey[k.id] ? <EyeOff size={10}/> : <Eye size={10}/>}
                          </button>
                          <button onClick={()=>navigator.clipboard.writeText(k.key)} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer" }}><Copy size={10}/></button>
                        </div>
                      </td>
                      <td style={{ fontSize:11, color:"var(--muted)" }}>{k.created}</td>
                      <td style={{ fontSize:11, color:"var(--muted)" }}>{k.lastUsed}</td>
                      <td style={{ fontSize:10, color:"var(--muted)", fontFamily:"monospace" }}>{k.permissions}</td>
                      <td>
                        <button onClick={()=>setKeys(ks=>ks.filter(x=>x.id!==k.id))} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:10 }}>Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
