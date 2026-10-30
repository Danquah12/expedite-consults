import type { Severity } from "@/types/sast";

export type SASTPluginCategory =
  | "OWASP Top 10 & ASVS v4.0.3"
  | "OWASP API Security Top 10:2023"
  | "OWASP LLM & GenAI Top 10:2025"
  | "MITRE CWE Top 25 & SANS 25"
  | "NIST SP 800-53 Rev.5 & SSDF"
  | "XTRIKE XQL XTRIKE-XQL High-Risk Queries"
  | "XTRIKE DeepFlow Taint-Flow Rules"
  | "XTRIKE StructSCA 7 Kingdoms"
  | "Cryptographic & FIPS 140-3"
  | "Secrets & Credential Hygiene"
  | "Cloud, IaC, Docker & K8s (CISA/NSA)"
  | "CI/CD, Supply Chain & SCA (SLSA)"
  | "SEI CERT & Concurrency / Memory"
  | "PCI-DSS v4.0 & ISO 27001:2022";

export type SASTPluginDefinition = {
  pluginId: string; // PLG-001 .. PLG-400
  code: string;
  name: string;
  category: SASTPluginCategory;
  severity: Severity;
  cvss: number;
  epss: number;
  cwe: string;
  cweName: string;
  owasp: string;
  asvs: string;
  nist80053: string;
  nistSsdf: string;
  pciDss: string;
  iso27001: string;
  mitreAttack: string;
  checkmarxQuery: string;
  ibmRuleId: string;
  fortifyKingdom: string;
  fortifyAnalyzer: "Dataflow" | "Control Flow" | "Structural" | "Configuration" | "Semantic";
  languages: string[];
  fastTokens: string[]; // For O(1) bucket dispatch before regex evaluation
  pattern: string;
  sanitizerHint: string;
  remediationSummary: string;
  remediationCode?: string;
};

type DomainSeed = {
  category: SASTPluginCategory;
  cwe: string;
  cweName: string;
  owasp: string;
  asvs: string;
  nist80053: string;
  nistSsdf: string;
  pciDss: string;
  iso27001: string;
  mitreAttack: string;
  fortifyKingdom: string;
  fortifyAnalyzer: "Dataflow" | "Control Flow" | "Structural" | "Configuration" | "Semantic";
  severity: Severity;
  cvss: number;
  epss: number;
  sanitizerHint: string;
  remediationSummary: string;
  variants: {
    code: string;
    name: string;
    languages: string[];
    fastTokens: string[];
    pattern: string;
    cxQuery: string;
    ibmRule: string;
  }[];
};

const DOMAIN_SEEDS: DomainSeed[] = [
  // 1. SQL, HQL, JPQL & ORM Injection (20 Plugins)
  {
    category: "OWASP Top 10 & ASVS v4.0.3",
    cwe: "CWE-89",
    cweName: "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
    owasp: "A03:2021 · Injection",
    asvs: "ASVS V5.3.4",
    nist80053: "SI-10 · Information Input Validation",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1190",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Dataflow",
    severity: "Critical",
    cvss: 9.8,
    epss: 0.421,
    sanitizerHint: "PreparedStatement / Parameterized Query (?, $1, %s)",
    remediationSummary: "Use PreparedStatement or parameterized bind variables instead of string concatenation.",
    variants: [
      { code: "SQLI-JAVA-STMT", name: "Java JDBC Statement.executeQuery Concatenation", languages: ["Java"], fastTokens: ["executequery", "select"], pattern: "executeQuery\\s*\\(\\s*[\"']?(?:SELECT|INSERT|UPDATE|DELETE)", cxQuery: "Java_High_Risk/SQL_Injection", ibmRule: "IBM-SQLI-JDBC-001" },
      { code: "SQLI-JAVA-JDBCTEMPLATE", name: "Spring JdbcTemplate Unparameterized SQL String", languages: ["Java", "Kotlin"], fastTokens: ["jdbctemplate", "select"], pattern: "jdbcTemplate\\.(?:query|update|execute)\\s*\\(\\s*[\"']?(?:SELECT|UPDATE|DELETE).*\\+", cxQuery: "Java_Spring/JdbcTemplate_SQLi", ibmRule: "IBM-SQLI-SPRING-002" },
      { code: "SQLI-JAVA-HQL", name: "Hibernate createQuery HQL String Concatenation", languages: ["Java"], fastTokens: ["createquery", "from"], pattern: "createQuery\\s*\\(\\s*[\"']FROM\\s+\\w+.*\\+", cxQuery: "Java_Hibernate/HQL_Injection", ibmRule: "IBM-SQLI-HQL-003" },
      { code: "SQLI-JAVA-NATIVESQL", name: "JPA EntityManager.createNativeQuery Injection", languages: ["Java"], fastTokens: ["createnativequery"], pattern: "createNativeQuery\\s*\\([^)]*\\+", cxQuery: "Java_JPA/NativeQuery_SQLi", ibmRule: "IBM-SQLI-JPA-004" },
      { code: "SQLI-JAVA-MYBATIS", name: "MyBatis ${} Unescaped String Substitution", languages: ["Java"], fastTokens: ["select", "${"], pattern: "(?:SELECT|WHERE|ORDER\\s+BY).*\\$\\{[a-zA-Z0-9_.]+\\}", cxQuery: "Java_MyBatis/Dollar_Substitution_SQLi", ibmRule: "IBM-SQLI-MYBATIS-005" },
      { code: "SQLI-PY-CURSOR-FSTR", name: "Python DB-API cursor.execute f-string SQL Injection", languages: ["Python"], fastTokens: ["execute", "select"], pattern: "cursor\\.execute\\s*\\(\\s*f[\"'](?:SELECT|INSERT|UPDATE|DELETE)", cxQuery: "Python_High_Risk/SQL_Injection_FString", ibmRule: "IBM-SQLI-PY-006" },
      { code: "SQLI-PY-CURSOR-PCT", name: "Python DB-API cursor.execute % String Formatting", languages: ["Python"], fastTokens: ["execute", "%"], pattern: "cursor\\.execute\\s*\\(\\s*[\"'](?:SELECT|INSERT|UPDATE|DELETE).*[\"']\\s*%", cxQuery: "Python_High_Risk/SQL_Injection_Percent", ibmRule: "IBM-SQLI-PY-007" },
      { code: "SQLI-PY-DJANGO-RAW", name: "Django Manager.raw() / extra() Unparameterized SQL", languages: ["Python"], fastTokens: [".raw(", ".extra("], pattern: "\\.(?:raw|extra)\\s*\\(\\s*(?:f[\"']|[\"'].*\\+)", cxQuery: "Python_Django/Raw_SQL_Injection", ibmRule: "IBM-SQLI-DJANGO-008" },
      { code: "SQLI-PY-SQLALCHEMY-TEXT", name: "SQLAlchemy text() Dynamic Query Interpolation", languages: ["Python"], fastTokens: ["text(", "select"], pattern: "text\\s*\\(\\s*f[\"']SELECT", cxQuery: "Python_SQLAlchemy/Text_SQLi", ibmRule: "IBM-SQLI-SQLA-009" },
      { code: "SQLI-NODE-PG-TPL", name: "Node.js pg/mysql Template Literal SQL Injection", languages: ["Node.js", "TypeScript"], fastTokens: [".query(", "select"], pattern: "\\.query\\s*\\(\\s*`(?:SELECT|INSERT|UPDATE|DELETE).*\\$\\{", cxQuery: "JS_High_Risk/SQL_Injection_Template", ibmRule: "IBM-SQLI-NODE-010" },
      { code: "SQLI-NODE-SEQUELIZE", name: "Sequelize.query() Raw Template Literal Injection", languages: ["Node.js", "TypeScript"], fastTokens: ["sequelize.query"], pattern: "sequelize\\.query\\s*\\(\\s*`", cxQuery: "JS_Sequelize/Raw_Query_SQLi", ibmRule: "IBM-SQLI-SEQ-011" },
      { code: "SQLI-NODE-KNEX-RAW", name: "Knex.raw() Unbound String Interpolation", languages: ["Node.js", "TypeScript"], fastTokens: ["knex.raw"], pattern: "knex\\.raw\\s*\\(\\s*`.*\\$\\{", cxQuery: "JS_Knex/Raw_SQL_Injection", ibmRule: "IBM-SQLI-KNEX-012" },
      { code: "SQLI-NODE-PRISMA-RAW", name: "Prisma $queryRawUnsafe / $executeRawUnsafe Injection", languages: ["Node.js", "TypeScript"], fastTokens: ["rawunsafe"], pattern: "\\$(?:queryRawUnsafe|executeRawUnsafe)\\s*\\(", cxQuery: "TS_Prisma/Unsafe_Raw_Query", ibmRule: "IBM-SQLI-PRISMA-013" },
      { code: "SQLI-NODE-TYPEORM", name: "TypeORM QueryBuilder.where() String Concatenation", languages: ["TypeScript"], fastTokens: [".where("], pattern: "\\.where\\s*\\(\\s*`.*\\$\\{", cxQuery: "TS_TypeORM/Where_Clause_SQLi", ibmRule: "IBM-SQLI-TYPEORM-014" },
      { code: "SQLI-PHP-MYSQLI", name: "PHP mysqli_query() Direct $_GET/$_POST Interpolation", languages: ["PHP"], fastTokens: ["mysqli_query", "select"], pattern: "mysqli_query\\s*\\([^)]*\\$", cxQuery: "PHP_High_Risk/Mysqli_SQL_Injection", ibmRule: "IBM-SQLI-PHP-015" },
      { code: "SQLI-PHP-PDO-QUERY", name: "PHP PDO->query() / exec() Unprepared SQL String", languages: ["PHP"], fastTokens: ["->query(", "->exec("], pattern: "->(?:query|exec)\\s*\\(\\s*[\"'](?:SELECT|INSERT|UPDATE|DELETE).*\\$", cxQuery: "PHP_PDO/Direct_Query_SQLi", ibmRule: "IBM-SQLI-PDO-016" },
      { code: "SQLI-GO-DB-QUERY", name: "Go database/sql db.Query(fmt.Sprintf) SQL Injection", languages: ["Go"], fastTokens: ["db.query", "sprintf"], pattern: "db\\.(?:Query|Exec)\\s*\\(\\s*fmt\\.Sprintf", cxQuery: "Go_High_Risk/Format_SQL_Injection", ibmRule: "IBM-SQLI-GO-017" },
      { code: "SQLI-GO-GORM-RAW", name: "Go GORM db.Raw / db.Where Concatenated SQL", languages: ["Go"], fastTokens: [".raw(", ".where("], pattern: "db\\.(?:Raw|Where)\\s*\\([^)]*\\+", cxQuery: "Go_GORM/Raw_SQL_Injection", ibmRule: "IBM-SQLI-GORM-018" },
      { code: "SQLI-CS-SQLCOMMAND", name: "C# ADO.NET SqlCommand Concatenated CommandText", languages: ["C#"], fastTokens: ["sqlcommand", "select"], pattern: "new\\s+SqlCommand\\s*\\(\\s*[\"']SELECT.*\\+", cxQuery: "CSharp_High_Risk/SqlCommand_Injection", ibmRule: "IBM-SQLI-CS-019" },
      { code: "SQLI-RUBY-ACTIVERECORD", name: "Ruby ActiveRecord .where() String Interpolation", languages: ["Ruby"], fastTokens: [".where("], pattern: "\\.where\\s*\\(\\s*\"[^\"]*#\\{", cxQuery: "Ruby_Rails/ActiveRecord_SQLi", ibmRule: "IBM-SQLI-RUBY-020" },
    ],
  },

  // 2. OS Command & Shell Injection (20 Plugins)
  {
    category: "MITRE CWE Top 25 & SANS 25",
    cwe: "CWE-78",
    cweName: "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
    owasp: "A03:2021 · Injection",
    asvs: "ASVS V5.3.8",
    nist80053: "SI-10 · Information Input Validation",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1059",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Dataflow",
    severity: "Critical",
    cvss: 9.8,
    epss: 0.512,
    sanitizerHint: "execFile / subprocess.run([...], shell=False) + strict allowlist",
    remediationSummary: "Invoke OS binaries with argument arrays and shell=False; never concatenate user input into shell strings.",
    variants: [
      { code: "CMDI-JAVA-RUNTIME", name: "Java Runtime.getRuntime().exec() Command Injection", languages: ["Java"], fastTokens: ["runtime", ".exec("], pattern: "Runtime\\.getRuntime\\(\\)\\.exec\\s*\\(", cxQuery: "Java_High_Risk/Command_Injection_Runtime", ibmRule: "IBM-CMDI-JAVA-021" },
      { code: "CMDI-JAVA-PROCESSBUILDER", name: "Java ProcessBuilder(sh -c / cmd /c) Shell Injection", languages: ["Java"], fastTokens: ["processbuilder"], pattern: "new\\s+ProcessBuilder\\s*\\(", cxQuery: "Java_High_Risk/ProcessBuilder_Injection", ibmRule: "IBM-CMDI-JAVA-022" },
      { code: "CMDI-PY-OSSYSTEM", name: "Python os.system() Direct Shell Command Execution", languages: ["Python"], fastTokens: ["os.system"], pattern: "os\\.system\\s*\\(", cxQuery: "Python_High_Risk/OS_System_Injection", ibmRule: "IBM-CMDI-PY-023" },
      { code: "CMDI-PY-OSPOPEN", name: "Python os.popen() Unsanitized Shell Stream", languages: ["Python"], fastTokens: ["os.popen"], pattern: "os\\.popen\\s*\\(", cxQuery: "Python_High_Risk/OS_Popen_Injection", ibmRule: "IBM-CMDI-PY-024" },
      { code: "CMDI-PY-SUBPROCESS-SHELL", name: "Python subprocess.Popen/run/call with shell=True", languages: ["Python"], fastTokens: ["subprocess", "shell"], pattern: "subprocess\\.(?:Popen|call|run|check_output)\\s*\\([^)]*shell\\s*=\\s*True", cxQuery: "Python_High_Risk/Subprocess_Shell_True", ibmRule: "IBM-CMDI-PY-025" },
      { code: "CMDI-PY-ASYNCIO-SHELL", name: "Python asyncio.create_subprocess_shell() Execution", languages: ["Python"], fastTokens: ["create_subprocess_shell"], pattern: "create_subprocess_shell\\s*\\(", cxQuery: "Python_Asyncio/Subprocess_Shell_Injection", ibmRule: "IBM-CMDI-PY-026" },
      { code: "CMDI-NODE-CHILD-EXEC", name: "Node.js child_process.exec() Shell Command Sink", languages: ["Node.js", "TypeScript"], fastTokens: ["exec("], pattern: "(?:child_process\\.)?exec\\s*\\(\\s*(?:`.*\\$\\{|[^\"')]+\\+)", cxQuery: "JS_High_Risk/Child_Process_Exec", ibmRule: "IBM-CMDI-NODE-027" },
      { code: "CMDI-NODE-EXECSYNC", name: "Node.js child_process.execSync() Synchronous Shell Sink", languages: ["Node.js", "TypeScript"], fastTokens: ["execsync"], pattern: "execSync\\s*\\(", cxQuery: "JS_High_Risk/Child_Process_ExecSync", ibmRule: "IBM-CMDI-NODE-028" },
      { code: "CMDI-NODE-SPAWN-SHELL", name: "Node.js child_process.spawn() with { shell: true }", languages: ["Node.js", "TypeScript"], fastTokens: ["spawn(", "shell"], pattern: "spawn\\s*\\([^)]*shell\\s*:\\s*true", cxQuery: "JS_High_Risk/Spawn_Shell_True", ibmRule: "IBM-CMDI-NODE-029" },
      { code: "CMDI-PHP-SHELLEXEC", name: "PHP shell_exec() Unsanitized Command Execution", languages: ["PHP"], fastTokens: ["shell_exec"], pattern: "shell_exec\\s*\\(", cxQuery: "PHP_High_Risk/Shell_Exec_Injection", ibmRule: "IBM-CMDI-PHP-030" },
      { code: "CMDI-PHP-SYSTEM", name: "PHP system() / passthru() Command Execution", languages: ["PHP"], fastTokens: ["system(", "passthru("], pattern: "\\b(?:system|passthru)\\s*\\(\\s*\\$", cxQuery: "PHP_High_Risk/System_Command_Injection", ibmRule: "IBM-CMDI-PHP-031" },
      { code: "CMDI-PHP-PROCOPEN", name: "PHP proc_open() / popen() Command Stream", languages: ["PHP"], fastTokens: ["proc_open", "popen("], pattern: "\\b(?:proc_open|popen)\\s*\\(\\s*\\$", cxQuery: "PHP_High_Risk/Proc_Open_Injection", ibmRule: "IBM-CMDI-PHP-032" },
      { code: "CMDI-GO-EXECCOMMAND", name: "Go exec.Command('sh', '-c', ...) Shell Invocation", languages: ["Go"], fastTokens: ["exec.command"], pattern: "exec\\.Command\\s*\\(\\s*[\"'](?:sh|bash|/bin/sh|cmd)[\"']", cxQuery: "Go_High_Risk/Exec_Command_Shell", ibmRule: "IBM-CMDI-GO-033" },
      { code: "CMDI-CS-PROCESS-START", name: "C# Process.Start(cmd.exe /c) Command Injection", languages: ["C#"], fastTokens: ["process.start"], pattern: "Process\\.Start\\s*\\(", cxQuery: "CSharp_High_Risk/Process_Start_Injection", ibmRule: "IBM-CMDI-CS-034" },
      { code: "CMDI-RUBY-KERNEL-SYSTEM", name: "Ruby Kernel.system() / Open3 Shell Interpolation", languages: ["Ruby"], fastTokens: ["system(", "open3"], pattern: "(?:Kernel\\.system|Open3\\.capture3)\\s*\\(\\s*\"[^\"]*#\\{", cxQuery: "Ruby_High_Risk/Command_Injection", ibmRule: "IBM-CMDI-RUBY-035" },
      { code: "CMDI-SSH-PARAMIKO", name: "Python Paramiko SSHClient.exec_command() Remote Injection", languages: ["Python"], fastTokens: ["exec_command"], pattern: "exec_command\\s*\\(\\s*(?:f[\"']|.*\\+)", cxQuery: "Python_SSH/Paramiko_Exec_Command", ibmRule: "IBM-CMDI-SSH-036" },
      { code: "CMDI-FAB-RUN", name: "Python Fabric / Invoke conn.run() Remote Shell Sink", languages: ["Python"], fastTokens: [".run("], pattern: "conn\\.run\\s*\\(\\s*f[\"']", cxQuery: "Python_Fabric/Remote_Run_Injection", ibmRule: "IBM-CMDI-FAB-037" },
      { code: "CMDI-PERL-OPEN", name: "Perl Pipe open() Command Execution", languages: ["PHP", "Python"], fastTokens: ["open("], pattern: "open\\s*\\([^,]+,\\s*[\"']\\|", cxQuery: "Legacy_Script/Pipe_Open_Injection", ibmRule: "IBM-CMDI-PIPE-038" },
      { code: "CMDI-ANSIBLE-SHELL", name: "Ansible Playbook shell: Module Unquoted Jinja Variable", languages: ["Python"], fastTokens: ["shell:"], pattern: "shell:\\s*.*\\{\\{(?!.*quote)", cxQuery: "IaC_Ansible/Unquoted_Shell_Var", ibmRule: "IBM-CMDI-ANS-039" },
      { code: "CMDI-GHACTIONS-RUN", name: "GitHub Actions Workflow run: ${{ github.event.* }} Injection", languages: ["Node.js"], fastTokens: ["github.event."], pattern: "run:.*\\$\\{\\{\\s*github\\.event\\.(?:issue|pull_request|comment|head_ref)", cxQuery: "CICD_GitHubActions/Run_Script_Injection", ibmRule: "IBM-CMDI-GHA-040" },
    ],
  },

  // 3. Dynamic Code Injection, Eval, Dynamic Compilation, SSTI & Expression Language (20 Plugins)
  {
    category: "XTRIKE XQL XTRIKE-XQL High-Risk Queries",
    cwe: "CWE-94",
    cweName: "Improper Control of Generation of Code ('Code Injection')",
    owasp: "A03:2021 · Injection",
    asvs: "OWASP ASVS v4.0.3 §5.2.4 (Dynamic Code & Compilation Controls — Verify Input Provenance)",
    nist80053: "SI-10 · Information Input Validation",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4 (Requires verified untrusted source-to-sink path)",
    iso27001: "ISO/IEC 27001:2022 A.8.28 (Requires input provenance & isolation evidence)",
    mitreAttack: "T1059.007",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Semantic",
    severity: "High",
    cvss: 7.5,
    epss: 0.0,
    sanitizerHint: "Treat input as data with a strict schema parser (Jackson DTO / json.loads / JSON.parse + schema validation)",
    remediationSummary: "Treat untrusted input as structured data validated against a strict schema; if user code must be compiled, isolate compilation in an external sandbox with annotation processors disabled (-proc:none).",
    variants: [
      { code: "CODEI-JS-EVAL", name: "JavaScript / TypeScript eval() Dynamic Execution", languages: ["Node.js", "TypeScript"], fastTokens: ["eval("], pattern: "\\beval\\s*\\(\\s*[^\"')\\s]", cxQuery: "JS_High_Risk/Code_Injection_Eval", ibmRule: "IBM-CODEI-JS-041" },
      { code: "CODEI-JS-NEW-FUNCTION", name: "JavaScript new Function() Dynamic Code Constructor", languages: ["Node.js", "TypeScript"], fastTokens: ["new function"], pattern: "new\\s+Function\\s*\\(", cxQuery: "JS_High_Risk/New_Function_Injection", ibmRule: "IBM-CODEI-JS-042" },
      { code: "CODEI-NODE-VM-RUN", name: "Node.js vm.runInNewContext / runInThisContext Escape", languages: ["Node.js", "TypeScript"], fastTokens: ["vm.run"], pattern: "vm\\.(?:runInNewContext|runInThisContext|runInContext|compileFunction)\\s*\\(", cxQuery: "JS_Node/VM_Sandbox_Code_Injection", ibmRule: "IBM-CODEI-VM-043" },
      { code: "CODEI-JS-SETTIMEOUT-STR", name: "JavaScript setTimeout / setInterval String Eval Sink", languages: ["Node.js", "TypeScript"], fastTokens: ["settimeout", "setinterval"], pattern: "(?:setTimeout|setInterval)\\s*\\(\\s*(?:req\\.|`.*\\$\\{|[\"'][^\"']*\\+)", cxQuery: "JS_High_Risk/Timer_String_Eval", ibmRule: "IBM-CODEI-TIMER-044" },
      { code: "CODEI-PY-EVAL", name: "Python Built-in eval() Untrusted Expression Sink", languages: ["Python"], fastTokens: ["eval("], pattern: "\\beval\\s*\\(\\s*[^\"')\\s]", cxQuery: "Python_High_Risk/Eval_Code_Injection", ibmRule: "IBM-CODEI-PY-045" },
      { code: "CODEI-PY-EXEC", name: "Python Built-in exec() / 3-Arg compile() Dynamic Execution", languages: ["Python"], fastTokens: ["exec(", "compile("], pattern: "\\b(?:exec\\s*\\(\\s*[^\"')\\s]|compile\\s*\\([^,]+,[^,]+,\\s*[\"'](?:exec|eval|single)[\"'])", cxQuery: "Python_High_Risk/Exec_Code_Injection", ibmRule: "IBM-CODEI-PY-046" },
      { code: "CODEI-PY-JINJA2-SSTI", name: "Flask / Jinja2 render_template_string() SSTI Sink", languages: ["Python"], fastTokens: ["render_template_string", "from_string"], pattern: "(?:render_template_string|Template\\s*\\(|from_string)\\s*\\(", cxQuery: "Python_Flask/Jinja2_SSTI", ibmRule: "IBM-SSTI-PY-047" },
      { code: "CODEI-PY-MAKO-SSTI", name: "Python Mako / Tornado Template Dynamic Compilation", languages: ["Python"], fastTokens: ["mako.template"], pattern: "mako\\.template\\.Template\\s*\\(", cxQuery: "Python_Mako/Template_Injection", ibmRule: "IBM-SSTI-MAKO-048" },
      { code: "CODEI-JAVA-SPEL", name: "Spring SpelExpressionParser.parseExpression() Injection", languages: ["Java"], fastTokens: ["parseexpression", "spel"], pattern: "parseExpression\\s*\\(", cxQuery: "Java_Spring/SpEL_Expression_Injection", ibmRule: "IBM-CODEI-SPEL-049" },
      { code: "CODEI-JAVA-OGNL", name: "Apache Struts / OGNL Ognl.getValue() Expression Injection", languages: ["Java"], fastTokens: ["ognl.getvalue"], pattern: "Ognl\\.getValue\\s*\\(", cxQuery: "Java_High_Risk/OGNL_Injection", ibmRule: "IBM-CODEI-OGNL-050" },
      { code: "CODEI-JAVA-EL", name: "Jakarta / JSF ExpressionFactory.createValueExpression EL Injection", languages: ["Java"], fastTokens: ["createvalueexpression", "buildconstraintviolationwithtemplate"], pattern: "(?:createValueExpression|buildConstraintViolationWithTemplate)\\s*\\(", cxQuery: "Java_EE/EL_Expression_Injection", ibmRule: "IBM-CODEI-EL-051" },
      { code: "CODEI-JAVA-SCRIPTENGINE", name: "Java javax.script.ScriptEngine.eval() Nashorn/Graal Sink", languages: ["Java"], fastTokens: ["scriptengine", ".eval("], pattern: "ScriptEngine.*\\.eval\\s*\\(", cxQuery: "Java_High_Risk/ScriptEngine_Eval", ibmRule: "IBM-CODEI-JSE-052" },
      { code: "CODEI-JAVA-GROOVY", name: "GroovyShell.evaluate() Dynamic Script Execution", languages: ["Java"], fastTokens: ["groovyshell", ".evaluate("], pattern: "GroovyShell.*\\.evaluate\\s*\\(", cxQuery: "Java_Groovy/GroovyShell_Evaluate", ibmRule: "IBM-CODEI-GROOVY-053" },
      { code: "CODEI-JAVA-COMPILER", name: "Java javax.tools.JavaCompiler.getTask() Dynamic Compilation API", languages: ["Java"], fastTokens: ["javacompiler", "compiler.gettask", "getsystemjavacompiler"], pattern: "(?:JavaCompiler|compiler\\.getTask\\s*\\(|ToolProvider\\.getSystemJavaCompiler\\s*\\()", cxQuery: "Java_Dynamic_Compilation/JavaCompiler_GetTask_Audit", ibmRule: "IBM-CODEI-JAVAC-054" },
      { code: "CODEI-PHP-EVAL", name: "PHP eval() / assert() Dynamic Code Execution", languages: ["PHP"], fastTokens: ["eval(", "assert("], pattern: "\\b(?:eval|assert)\\s*\\(\\s*\\$", cxQuery: "PHP_High_Risk/Eval_Injection", ibmRule: "IBM-CODEI-PHP-055" },
      { code: "CODEI-PHP-PREG-E", name: "PHP preg_replace() with /e Eval Modifier", languages: ["PHP"], fastTokens: ["preg_replace"], pattern: "preg_replace\\s*\\(\\s*[\"']/[^/]+/[a-z]*e", cxQuery: "PHP_High_Risk/Preg_Replace_Eval", ibmRule: "IBM-CODEI-PREG-056" },
      { code: "CODEI-PHP-CREATEFUNC", name: "PHP create_function() Dynamic Lambda Injection", languages: ["PHP"], fastTokens: ["create_function"], pattern: "create_function\\s*\\(", cxQuery: "PHP_High_Risk/Create_Function_Injection", ibmRule: "IBM-CODEI-PHP-057" },
      { code: "CODEI-RUBY-INSTANCE-EVAL", name: "Ruby instance_eval / class_eval / Kernel.eval Sink", languages: ["Ruby"], fastTokens: ["instance_eval", "class_eval"], pattern: "\\b(?:instance_eval|class_eval|Kernel\\.eval)\\s*\\(", cxQuery: "Ruby_High_Risk/Eval_Injection", ibmRule: "IBM-CODEI-RUBY-058" },
      { code: "CODEI-NODE-PUG-EJS", name: "Node.js EJS / Pug / Handlebars Dynamic Template Compile", languages: ["Node.js", "TypeScript"], fastTokens: ["ejs.render", "pug.render", "handlebars.compile"], pattern: "(?:ejs\\.render|pug\\.render|Handlebars\\.compile)\\s*\\(\\s*req\\.", cxQuery: "JS_Template/Server_Side_Template_Injection", ibmRule: "IBM-SSTI-NODE-059" },
      { code: "CODEI-CS-CSHARPCOMPILER", name: "C# CSharpCodeProvider / Roslyn CSharpScript.EvaluateAsync", languages: ["C#"], fastTokens: ["csharpscript.evaluateasync", "compileassemblyfromsource"], pattern: "(?:CSharpScript\\.EvaluateAsync|CompileAssemblyFromSource)\\s*\\(", cxQuery: "CSharp_High_Risk/Dynamic_Compilation_Injection", ibmRule: "IBM-CODEI-CS-060" },
    ],
  },

  // 4. Cross-Site Scripting (XSS) — DOM, Reflected & Stored (20 Plugins)
  {
    category: "XTRIKE DeepFlow Taint-Flow Rules",
    cwe: "CWE-79",
    cweName: "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
    owasp: "A03:2021 · Injection",
    asvs: "ASVS V5.3.3",
    nist80053: "SI-10 · Information Input Validation",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1189",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Dataflow",
    severity: "High",
    cvss: 7.6,
    epss: 0.165,
    sanitizerHint: "DOMPurify.sanitize() / Contextual HTML Encoding / CSP",
    remediationSummary: "Encode untrusted output according to the HTML/JS/Attribute context or sanitize with DOMPurify.",
    variants: [
      { code: "XSS-REACT-DANGEROUSHTML", name: "React dangerouslySetInnerHTML Unsanitized Markup", languages: ["TypeScript", "Node.js"], fastTokens: ["dangerouslysetinnerhtml"], pattern: "dangerouslySetInnerHTML\\s*=\\s*\\{\\s*\\{\\s*__html\\s*:", cxQuery: "React_XSS/DangerouslySetInnerHTML", ibmRule: "IBM-XSS-REACT-061" },
      { code: "XSS-DOM-INNERHTML", name: "DOM element.innerHTML / outerHTML Direct Assignment", languages: ["TypeScript", "Node.js"], fastTokens: [".innerhtml", ".outerhtml"], pattern: "\\.(?:innerHTML|outerHTML)\\s*=\\s*[^\"'\\s]", cxQuery: "JS_DOM_XSS/InnerHTML_Sink", ibmRule: "IBM-XSS-DOM-062" },
      { code: "XSS-DOM-DOCWRITE", name: "DOM document.write() / document.writeln() Sink", languages: ["TypeScript", "Node.js"], fastTokens: ["document.write"], pattern: "document\\.write(?:ln)?\\s*\\(", cxQuery: "JS_DOM_XSS/Document_Write", ibmRule: "IBM-XSS-DOM-063" },
      { code: "XSS-DOM-ADJACENTHTML", name: "DOM insertAdjacentHTML() Unencoded Sink", languages: ["TypeScript", "Node.js"], fastTokens: ["insertadjacenthtml"], pattern: "insertAdjacentHTML\\s*\\(", cxQuery: "JS_DOM_XSS/InsertAdjacentHTML", ibmRule: "IBM-XSS-DOM-064" },
      { code: "XSS-VUE-VHTML", name: "Vue.js v-html Directive Unsanitized Binding", languages: ["TypeScript", "Node.js"], fastTokens: ["v-html"], pattern: "v-html\\s*=\\s*[\"']", cxQuery: "Vue_XSS/V_Html_Directive", ibmRule: "IBM-XSS-VUE-065" },
      { code: "XSS-ANGULAR-BYPASS", name: "Angular DomSanitizer.bypassSecurityTrustHtml() Misuse", languages: ["TypeScript"], fastTokens: ["bypasssecuritytrust"], pattern: "bypassSecurityTrust(?:Html|Script|ResourceUrl|Url)\\s*\\(", cxQuery: "Angular_XSS/BypassSecurityTrust", ibmRule: "IBM-XSS-NG-066" },
      { code: "XSS-SVELTE-HTML", name: "Svelte {@html ...} Raw Markup Tag", languages: ["TypeScript", "Node.js"], fastTokens: ["{@html"], pattern: "\\{@html\\s+", cxQuery: "Svelte_XSS/Raw_Html_Tag", ibmRule: "IBM-XSS-SVELTE-067" },
      { code: "XSS-EXPRESS-RESSEND", name: "Express res.send() / res.write() Reflected HTML", languages: ["Node.js", "TypeScript"], fastTokens: ["res.send(", "res.write("], pattern: "res\\.(?:send|write)\\s*\\(\\s*(?:`[^`]*\\$\\{|[\"'][^\"']*<\\w+.*\\+)", cxQuery: "Node_Express/Reflected_XSS_Res_Send", ibmRule: "IBM-XSS-EXP-068" },
      { code: "XSS-JQUERY-HTML", name: "jQuery $(selector).html() / .append() Tainted Sink", languages: ["Node.js", "TypeScript"], fastTokens: [".html(", ".append("], pattern: "\\$\\([^)]+\\)\\.(?:html|append)\\s*\\(\\s*[^\"')\\s]", cxQuery: "JS_jQuery/Html_Append_XSS", ibmRule: "IBM-XSS-JQ-069" },
      { code: "XSS-JAVA-SERVLET-WRITER", name: "Java HttpServletResponse.getWriter().print() Reflected XSS", languages: ["Java"], fastTokens: ["getwriter()", ".print"], pattern: "getWriter\\(\\)\\.(?:print|println|write)\\s*\\(", cxQuery: "Java_High_Risk/Reflected_XSS_Servlet", ibmRule: "IBM-XSS-JAVA-070" },
      { code: "XSS-JAVA-JSP-RAW", name: "JSP <%= request.getParameter() %> Unescaped Expression", languages: ["Java"], fastTokens: ["<%=", "getparameter"], pattern: "<%=.*request\\.getParameter", cxQuery: "Java_JSP/Unescaped_Parameter_XSS", ibmRule: "IBM-XSS-JSP-071" },
      { code: "XSS-PY-FLASK-MARKUP", name: "Python Flask Markup() / |safe Filter Disabling Auto-Escape", languages: ["Python"], fastTokens: ["markup(", "|safe"], pattern: "(?:Markup\\s*\\(\\s*f[\"']|\\|\\s*safe\\b)", cxQuery: "Python_Flask/Markup_Safe_XSS", ibmRule: "IBM-XSS-FLASK-072" },
      { code: "XSS-PY-DJANGO-MARKSAFE", name: "Django mark_safe() / format_html() Unsanitized String", languages: ["Python"], fastTokens: ["mark_safe"], pattern: "mark_safe\\s*\\(", cxQuery: "Python_Django/Mark_Safe_XSS", ibmRule: "IBM-XSS-DJANGO-073" },
      { code: "XSS-PHP-ECHO-GET", name: "PHP echo / print Direct $_GET / $_POST / $_REQUEST Output", languages: ["PHP"], fastTokens: ["echo", "$_"], pattern: "\\b(?:echo|print)\\s+.*\\$_(?:GET|POST|REQUEST)", cxQuery: "PHP_High_Risk/Reflected_XSS_Echo", ibmRule: "IBM-XSS-PHP-074" },
      { code: "XSS-GO-HTMLTEMPLATE", name: "Go template.HTML() Type Conversion Bypassing Auto-Escaping", languages: ["Go"], fastTokens: ["template.html("], pattern: "template\\.(?:HTML|JS|URL)\\s*\\(", cxQuery: "Go_Web/Template_HTML_Unescaped", ibmRule: "IBM-XSS-GO-075" },
      { code: "XSS-GO-FMT-FPRINTF", name: "Go fmt.Fprintf(w, ...) Direct ResponseWriter HTML Sink", languages: ["Go"], fastTokens: ["fmt.fprintf(w"], pattern: "fmt\\.Fprintf\\s*\\(\\s*w\\s*,.*r\\.(?:URL|Form)", cxQuery: "Go_Web/ResponseWriter_Reflected_XSS", ibmRule: "IBM-XSS-GO-076" },
      { code: "XSS-CS-HTMLRAW", name: "ASP.NET Razor @Html.Raw() Unencoded Output", languages: ["C#"], fastTokens: ["html.raw"], pattern: "Html\\.Raw\\s*\\(", cxQuery: "CSharp_ASPNET/Html_Raw_XSS", ibmRule: "IBM-XSS-CS-077" },
      { code: "XSS-RUBY-RAILS-RAW", name: "Ruby on Rails .html_safe / raw() Helper XSS", languages: ["Ruby"], fastTokens: [".html_safe", "raw("], pattern: "(?:\\.html_safe\\b|\\braw\\s*\\()", cxQuery: "Ruby_Rails/Html_Safe_XSS", ibmRule: "IBM-XSS-RUBY-078" },
      { code: "XSS-DOM-LOCATION-HREF", name: "DOM javascript: URI Assignment to location.href", languages: ["TypeScript", "Node.js"], fastTokens: ["location.href"], pattern: "location\\.href\\s*=\\s*(?:req\\.|params\\.|query\\.|userUrl)", cxQuery: "JS_DOM_XSS/Location_Href_Sink", ibmRule: "IBM-XSS-LOC-079" },
      { code: "XSS-POSTMESSAGE-LISTENER", name: "DOM window.addEventListener('message') Without Origin Check", languages: ["TypeScript", "Node.js"], fastTokens: ["addeventlistener", "message"], pattern: "addEventListener\\s*\\(\\s*[\"']message[\"']", cxQuery: "JS_DOM_XSS/PostMessage_Origin_Missing", ibmRule: "IBM-XSS-PM-080" },
    ],
  },

  // 5. Path Traversal, Arbitrary File Read/Write & ZipSlip (20 Plugins)
  {
    category: "XTRIKE StructSCA 7 Kingdoms",
    cwe: "CWE-22",
    cweName: "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
    owasp: "A01:2021 · Broken Access Control",
    asvs: "ASVS V12.3.1",
    nist80053: "AC-3 · Access Enforcement",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1083",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Dataflow",
    severity: "High",
    cvss: 8.2,
    epss: 0.214,
    sanitizerHint: "Path.resolve() + startsWith(TRUSTED_ROOT) canonical check",
    remediationSummary: "Canonicalize paths with realpath/resolve and enforce that the target starts with the trusted root directory.",
    variants: [
      { code: "PATH-JAVA-NEWFILE", name: "Java new File() / Paths.get() Uncanonicalized User Path", languages: ["Java"], fastTokens: ["new file(", "paths.get("], pattern: "(?:new\\s+File|Paths\\.get)\\s*\\([^)]*(?:getParameter|request|\\+)", cxQuery: "Java_High_Risk/Path_Traversal_File", ibmRule: "IBM-PATH-JAVA-081" },
      { code: "PATH-JAVA-FILEINPUTSTREAM", name: "Java FileInputStream / FileOutputStream Path Traversal", languages: ["Java"], fastTokens: ["fileinputstream", "fileoutputstream"], pattern: "new\\s+File(?:Input|Output)Stream\\s*\\([^)]*\\+", cxQuery: "Java_High_Risk/FileStream_Path_Traversal", ibmRule: "IBM-PATH-JAVA-082" },
      { code: "PATH-JAVA-ZIPSLIP", name: "Java ZipEntry.getName() Arbitrary File Overwrite (ZipSlip)", languages: ["Java"], fastTokens: ["zipentry", "getname()"], pattern: "new\\s+File\\s*\\([^,]+,\\s*\\w+\\.getName\\(\\)\\)", cxQuery: "Java_Archive/ZipSlip_Traversal", ibmRule: "IBM-PATH-ZIP-083" },
      { code: "PATH-NODE-FS-READ", name: "Node.js fs.readFile / readFileSync Path Traversal", languages: ["Node.js", "TypeScript"], fastTokens: ["readfile", "readfilesync"], pattern: "fs\\.(?:readFile|readFileSync|createReadStream)\\s*\\(\\s*(?:path\\.(?:join|resolve)\\s*\\([^)]*req\\.|req\\.)", cxQuery: "JS_High_Risk/Path_Traversal_FS_Read", ibmRule: "IBM-PATH-NODE-084" },
      { code: "PATH-NODE-FS-WRITE", name: "Node.js fs.writeFile / unlinkSync Arbitrary File Write/Delete", languages: ["Node.js", "TypeScript"], fastTokens: ["writefile", "unlinksync"], pattern: "fs\\.(?:writeFile|writeFileSync|unlink|unlinkSync)\\s*\\(\\s*(?:path\\.join\\s*\\([^)]*req\\.|req\\.)", cxQuery: "JS_High_Risk/Path_Traversal_FS_Write", ibmRule: "IBM-PATH-NODE-085" },
      { code: "PATH-EXPRESS-SENDFILE", name: "Express res.sendFile() / res.download() Unvalidated Path", languages: ["Node.js", "TypeScript"], fastTokens: ["res.sendfile", "res.download"], pattern: "res\\.(?:sendFile|download)\\s*\\([^)]*req\\.", cxQuery: "Node_Express/SendFile_Path_Traversal", ibmRule: "IBM-PATH-EXP-086" },
      { code: "PATH-PY-OPEN", name: "Python open() Built-in File Read/Write Path Traversal", languages: ["Python"], fastTokens: ["open("], pattern: "\\bopen\\s*\\(\\s*(?:os\\.path\\.join\\s*\\([^)]*request|f[\"'].*\\{|[^)]*\\+)", cxQuery: "Python_High_Risk/Open_Path_Traversal", ibmRule: "IBM-PATH-PY-087" },
      { code: "PATH-PY-FLASK-SENDFILE", name: "Flask send_file() Direct Request Path Traversal", languages: ["Python"], fastTokens: ["send_file("], pattern: "send_file\\s*\\(\\s*(?:os\\.path\\.join\\s*\\([^)]*request|request\\.)", cxQuery: "Python_Flask/Send_File_Traversal", ibmRule: "IBM-PATH-FLASK-088" },
      { code: "PATH-PY-TARFILE-EXTRACTALL", name: "Python tarfile.extractall() / zipfile.extractall() ZipSlip", languages: ["Python"], fastTokens: [".extractall("], pattern: "\\.extractall\\s*\\(", cxQuery: "Python_Archive/ExtractAll_ZipSlip", ibmRule: "IBM-PATH-TAR-089" },
      { code: "PATH-PHP-INCLUDE-LFI", name: "PHP include() / require() Local/Remote File Inclusion (LFI/RFI)", languages: ["PHP"], fastTokens: ["include(", "require("], pattern: "\\b(?:include|include_once|require|require_once)\\s*\\(?\\s*\\$", cxQuery: "PHP_High_Risk/File_Inclusion_LFI", ibmRule: "IBM-PATH-PHP-090" },
      { code: "PATH-PHP-FILEGETCONTENTS", name: "PHP file_get_contents() / readfile() Arbitrary File Read", languages: ["PHP"], fastTokens: ["file_get_contents", "readfile("], pattern: "\\b(?:file_get_contents|readfile|fopen)\\s*\\(\\s*\\$_(?:GET|POST|REQUEST)", cxQuery: "PHP_High_Risk/File_Get_Contents_Traversal", ibmRule: "IBM-PATH-PHP-091" },
      { code: "PATH-GO-HTTPSERVEFILE", name: "Go http.ServeFile() / os.Open() Uncleaned Query Path", languages: ["Go"], fastTokens: ["http.servefile", "os.open("], pattern: "(?:http\\.ServeFile|os\\.Open|os\\.ReadFile)\\s*\\([^)]*r\\.URL\\.Query", cxQuery: "Go_High_Risk/ServeFile_Path_Traversal", ibmRule: "IBM-PATH-GO-092" },
      { code: "PATH-CS-FILE-READALL", name: "C# System.IO.File.ReadAllText /ReadAllBytes Path Traversal", languages: ["C#"], fastTokens: ["file.readall", "path.combine"], pattern: "File\\.(?:ReadAllText|ReadAllBytes|OpenRead)\\s*\\(\\s*Path\\.Combine", cxQuery: "CSharp_High_Risk/Path_Combine_Traversal", ibmRule: "IBM-PATH-CS-093" },
      { code: "PATH-RUBY-SENDFILE", name: "Ruby on Rails send_file(params[...]) Arbitrary File Read", languages: ["Ruby"], fastTokens: ["send_file"], pattern: "send_file\\s*\\(?\\s*params\\[", cxQuery: "Ruby_Rails/Send_File_Traversal", ibmRule: "IBM-PATH-RUBY-094" },
      { code: "PATH-MULTER-ORIGINALNAME", name: "Node.js Multer file.originalname Unsanitized Upload Path", languages: ["Node.js", "TypeScript"], fastTokens: ["originalname"], pattern: "originalname", cxQuery: "JS_Upload/Multer_Originalname_Traversal", ibmRule: "IBM-PATH-MULTER-095" },
      { code: "PATH-PY-WERKZEUG-SAVE", name: "Python Flask file.save() Without secure_filename()", languages: ["Python"], fastTokens: [".save(", "filename"], pattern: "\\.save\\s*\\(\\s*os\\.path\\.join\\s*\\([^,]+,\\s*\\w+\\.filename\\)", cxQuery: "Python_Flask/Unsecured_Upload_Filename", ibmRule: "IBM-PATH-UPLOAD-096" },
      { code: "PATH-JAVA-MULTIPART-FILENAME", name: "Spring MultipartFile.getOriginalFilename() Traversal", languages: ["Java"], fastTokens: ["getoriginalfilename"], pattern: "getOriginalFilename\\s*\\(\\)", cxQuery: "Java_Spring/Multipart_OriginalFilename", ibmRule: "IBM-PATH-SPRING-097" },
      { code: "PATH-SYMLINK-FOLLOW", name: "Filesystem Operation Following Untrusted Symbolic Links (CWE-59)", languages: ["Python", "Node.js", "Go"], fastTokens: ["symlink", "realpath"], pattern: "follow_symlinks\\s*=\\s*True", cxQuery: "POSIX_FS/Symlink_Following", ibmRule: "IBM-PATH-SYM-098" },
      { code: "PATH-ANDROID-CONTENTPROVIDER", name: "Android ContentProvider.openFile() Path Traversal", languages: ["Java", "Kotlin"], fastTokens: ["parcelFileDescriptor", "openfile"], pattern: "ParcelFileDescriptor\\.open\\s*\\(\\s*new\\s+File\\s*\\([^)]*uri\\.getLastPathSegment", cxQuery: "Android_Mobile/ContentProvider_Traversal", ibmRule: "IBM-PATH-AND-099" },
      { code: "PATH-NGINX-ALIAS-TRAVERSAL", name: "Nginx Configuration Off-By-Slash Alias Path Traversal", languages: ["Node.js", "Python"], fastTokens: ["location /", "alias /"], pattern: "alias\\s+/[^;]+(?<!/);", cxQuery: "Infra_Nginx/Alias_Path_Traversal", ibmRule: "IBM-PATH-NGINX-100" },
    ],
  },

  // 6. Insecure Deserialization, XXE & Object Injection (25 Plugins)
  {
    category: "OWASP Top 10 & ASVS v4.0.3",
    cwe: "CWE-502",
    cweName: "Deserialization of Untrusted Data & XML External Entities (CWE-611)",
    owasp: "A08:2021 · Software and Data Integrity Failures",
    asvs: "ASVS V5.5.3",
    nist80053: "SI-10 · Information Input Validation",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1059",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Structural",
    severity: "Critical",
    cvss: 9.1,
    epss: 0.275,
    sanitizerHint: "yaml.safe_load() / ObjectInputFilter / disallow-doctype-decl",
    remediationSummary: "Avoid native binary deserializers on untrusted streams; enforce strict class allowlists and disable XML external DTDs.",
    variants: [
      { code: "DESER-JAVA-OBJECTINPUTSTREAM", name: "Java ObjectInputStream.readObject() Gadget Chain RCE", languages: ["Java"], fastTokens: ["objectinputstream", "readobject"], pattern: "(?:new\\s+ObjectInputStream|\\.readObject\\s*\\(\\))", cxQuery: "Java_High_Risk/Untrusted_Deserialization", ibmRule: "IBM-DESER-JAVA-101" },
      { code: "DESER-JAVA-XMLDECODER", name: "Java java.beans.XMLDecoder.readObject() RCE", languages: ["Java"], fastTokens: ["xmldecoder"], pattern: "new\\s+XMLDecoder\\s*\\(", cxQuery: "Java_High_Risk/XMLDecoder_Deserialization", ibmRule: "IBM-DESER-XMLD-102" },
      { code: "DESER-JAVA-XSTREAM", name: "Java XStream.fromXML() Without Security Framework Allowlist", languages: ["Java"], fastTokens: ["xstream", "fromxml"], pattern: "xstream\\.fromXML\\s*\\(", cxQuery: "Java_High_Risk/XStream_Deserialization", ibmRule: "IBM-DESER-XSTR-103" },
      { code: "DESER-JAVA-JACKSON-TYPING", name: "Jackson ObjectMapper.enableDefaultTyping() Polymorphic RCE", languages: ["Java"], fastTokens: ["enabledefaulttyping", "activateDefaultTyping"], pattern: "(?:enableDefaultTyping|activateDefaultTyping)\\s*\\(", cxQuery: "Java_Jackson/Polymorphic_Deserialization", ibmRule: "IBM-DESER-JACK-104" },
      { code: "DESER-JAVA-FASTJSON", name: "Alibaba Fastjson JSON.parseObject() AutoType Deserialization", languages: ["Java"], fastTokens: ["json.parseobject", "autotype"], pattern: "JSON\\.parse(?:Object)?\\s*\\(", cxQuery: "Java_Fastjson/AutoType_Deserialization", ibmRule: "IBM-DESER-FAST-105" },
      { code: "DESER-JAVA- SNAKEYAML", name: "Java SnakeYAML new Yaml().load() Without SafeConstructor", languages: ["Java"], fastTokens: ["new yaml()", "yaml.load("], pattern: "new\\s+Yaml\\s*\\(\\s*\\)", cxQuery: "Java_SnakeYAML/Unsafe_Load", ibmRule: "IBM-DESER-SNAKE-106" },
      { code: "DESER-PY-PICKLE", name: "Python pickle.loads() / cPickle.loads() Arbitrary Code Execution", languages: ["Python"], fastTokens: ["pickle.load", "cpickle.load"], pattern: "c?pickle\\.loads?\\s*\\(", cxQuery: "Python_High_Risk/Pickle_Deserialization", ibmRule: "IBM-DESER-PY-107" },
      { code: "DESER-PY-PYYAML", name: "Python PyYAML yaml.load() / yaml.unsafe_load() Without SafeLoader", languages: ["Python"], fastTokens: ["yaml.load(", "yaml.unsafe_load"], pattern: "yaml\\.(?:load\\s*\\([^,)]*\\)|unsafe_load\\s*\\()", cxQuery: "Python_High_Risk/PyYAML_Unsafe_Load", ibmRule: "IBM-DESER-YAML-108" },
      { code: "DESER-PY-JSONPICKLE", name: "Python jsonpickle.decode() Untrusted Object Reconstruction", languages: ["Python"], fastTokens: ["jsonpickle.decode"], pattern: "jsonpickle\\.decode\\s*\\(", cxQuery: "Python_High_Risk/Jsonpickle_Decode", ibmRule: "IBM-DESER-JP-109" },
      { code: "DESER-PY-MARSHAL-SHELVE", name: "Python marshal.loads() / dill.loads() Stream Deserialization", languages: ["Python"], fastTokens: ["marshal.loads", "dill.loads"], pattern: "(?:marshal|dill)\\.loads?\\s*\\(", cxQuery: "Python_High_Risk/Marshal_Dill_Deserialization", ibmRule: "IBM-DESER-MAR-110" },
      { code: "DESER-NODE-NODESERIALIZE", name: "Node.js node-serialize unserialize() IIFE RCE", languages: ["Node.js", "TypeScript"], fastTokens: ["unserialize("], pattern: "\\.unserialize\\s*\\(", cxQuery: "JS_High_Risk/Node_Serialize_RCE", ibmRule: "IBM-DESER-NODE-111" },
      { code: "DESER-NODE-JSYAML", name: "Node.js js-yaml DEFAULT_FULL_SCHEMA Unsafe Function Tag", languages: ["Node.js", "TypeScript"], fastTokens: ["default_full_schema"], pattern: "DEFAULT_FULL_SCHEMA", cxQuery: "JS_YAML/Full_Schema_Deserialization", ibmRule: "IBM-DESER-JSYAML-112" },
      { code: "DESER-PHP-UNSERIALIZE", name: "PHP unserialize() POP Gadget Chain Object Injection", languages: ["PHP"], fastTokens: ["unserialize("], pattern: "\\bunserialize\\s*\\(\\s*\\$", cxQuery: "PHP_High_Risk/Object_Injection_Unserialize", ibmRule: "IBM-DESER-PHP-113" },
      { code: "DESER-PHP-PHAR", name: "PHP phar:// Stream Wrapper Metadata Deserialization", languages: ["PHP"], fastTokens: ["phar://"], pattern: "phar://", cxQuery: "PHP_High_Risk/Phar_Stream_Deserialization", ibmRule: "IBM-DESER-PHAR-114" },
      { code: "DESER-CS-BINARYFORMATTER", name: "C# BinaryFormatter / LosFormatter / NetDataContractSerializer.Deserialize", languages: ["C#"], fastTokens: ["binaryformatter", "netdatacontractserializer"], pattern: "(?:BinaryFormatter|LosFormatter|NetDataContractSerializer).*\\.Deserialize\\s*\\(", cxQuery: "CSharp_High_Risk/BinaryFormatter_Deserialize", ibmRule: "IBM-DESER-CS-115" },
      { code: "DESER-CS-JSONNET-TYPENAME", name: "C# Newtonsoft.Json TypeNameHandling.All / Auto RCE", languages: ["C#"], fastTokens: ["typenamehandling"], pattern: "TypeNameHandling\\.(?:All|Auto|Objects|Arrays)", cxQuery: "CSharp_JsonNet/TypeNameHandling_RCE", ibmRule: "IBM-DESER-JSONNET-116" },
      { code: "DESER-RUBY-MARSHAL-YAML", name: "Ruby Marshal.load() / YAML.load() Psych RCE", languages: ["Ruby"], fastTokens: ["marshal.load", "yaml.load"], pattern: "(?:Marshal|YAML)\\.load\\s*\\(", cxQuery: "Ruby_High_Risk/Marshal_YAML_Load", ibmRule: "IBM-DESER-RUBY-117" },
      { code: "XXE-JAVA-DOCBUILDER", name: "Java DocumentBuilderFactory External Entity (XXE) Enabled", languages: ["Java"], fastTokens: ["documentbuilderfactory"], pattern: "DocumentBuilderFactory\\.newInstance\\s*\\(", cxQuery: "Java_High_Risk/XXE_DocumentBuilderFactory", ibmRule: "IBM-XXE-JAVA-118" },
      { code: "XXE-JAVA-SAXPARSER", name: "Java SAXParserFactory / XMLReader External DTD Enabled", languages: ["Java"], fastTokens: ["saxparserfactory", "xmlreader"], pattern: "SAXParserFactory\\.newInstance\\s*\\(", cxQuery: "Java_High_Risk/XXE_SAXParser", ibmRule: "IBM-XXE-SAX-119" },
      { code: "XXE-JAVA-XMLINPUT", name: "Java XMLInputFactory (StAX) IS_SUPPORTING_EXTERNAL_ENTITIES", languages: ["Java"], fastTokens: ["xmlinputfactory"], pattern: "XMLInputFactory\\.newInstance\\s*\\(", cxQuery: "Java_High_Risk/XXE_StAX_XMLInputFactory", ibmRule: "IBM-XXE-STAX-120" },
      { code: "XXE-PY-LXML", name: "Python lxml.etree.fromstring / XMLParser(resolve_entities=True)", languages: ["Python"], fastTokens: ["lxml", "fromstring", "resolve_entities"], pattern: "(?:etree\\.fromstring|XMLParser\\s*\\([^)]*resolve_entities\\s*=\\s*True)", cxQuery: "Python_High_Risk/XXE_Lxml_Parser", ibmRule: "IBM-XXE-PY-121" },
      { code: "XXE-PHP-LIBXML", name: "PHP simplexml_load_string() with LIBXML_NOENT Enabled", languages: ["PHP"], fastTokens: ["simplexml_load_string", "libxml_noent"], pattern: "(?:simplexml_load_string|loadXML)\\s*\\([^)]*LIBXML_NOENT", cxQuery: "PHP_High_Risk/XXE_Libxml_Noent", ibmRule: "IBM-XXE-PHP-122" },
      { code: "XXE-NODE-LIBXMLJS", name: "Node.js libxmljs.parseXml({ noent: true }) XXE", languages: ["Node.js", "TypeScript"], fastTokens: ["parsexml", "noent"], pattern: "parseXml\\s*\\([^)]*noent\\s*:\\s*true", cxQuery: "JS_High_Risk/Libxmljs_XXE", ibmRule: "IBM-XXE-NODE-123" },
      { code: "XXE-CS-XMLREADER", name: "C# XmlDocument / XmlTextReader DtdProcessing.Parse Enabled", languages: ["C#"], fastTokens: ["dtdprocessing.parse", "xmlresolver"], pattern: "(?:DtdProcessing\\.Parse|XmlResolver\\s*=\\s*new\\s+XmlUrlResolver)", cxQuery: "CSharp_High_Risk/XXE_XmlReader", ibmRule: "IBM-XXE-CS-124" },
      { code: "PROTO-NODE-MERGE", name: "JavaScript Recursive Object Merge Prototype Pollution (__proto__)", languages: ["Node.js", "TypeScript"], fastTokens: ["__proto__", "lodash.merge", "deepmerge"], pattern: "(?:__proto__|prototype\\[|lodash\\.merge\\s*\\([^,]+,\\s*req\\.)", cxQuery: "JS_High_Risk/Prototype_Pollution", ibmRule: "IBM-PROTO-NODE-125" },
    ],
  },

  // 7. Server-Side Request Forgery (SSRF), Open Redirect & Network Boundaries (20 Plugins)
  {
    category: "OWASP API Security Top 10:2023",
    cwe: "CWE-918",
    cweName: "Server-Side Request Forgery (SSRF) & Open Redirect (CWE-601)",
    owasp: "A10:2021 · API7:2023 SSRF",
    asvs: "ASVS V12.6.1",
    nist80053: "SC-7 · Boundary Protection",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1190",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Dataflow",
    severity: "High",
    cvss: 8.6,
    epss: 0.245,
    sanitizerHint: "Strict HTTPS domain allowlist + RFC1918 / 169.254.169.254 IP block",
    remediationSummary: "Enforce an explicit outbound hostname allowlist and block private/loopback/link-local IP addresses after DNS resolution.",
    variants: [
      { code: "SSRF-NODE-FETCH", name: "Node.js / Web fetch() with Unvalidated User URL", languages: ["Node.js", "TypeScript"], fastTokens: ["fetch("], pattern: "fetch\\s*\\(\\s*(?:req\\.|params\\.|query\\.|userUrl|webhookUrl|targetUrl|imageUrl)", cxQuery: "JS_High_Risk/SSRF_Fetch", ibmRule: "IBM-SSRF-NODE-126" },
      { code: "SSRF-NODE-AXIOS", name: "Node.js axios.get/post/request() Unvalidated Target URL", languages: ["Node.js", "TypeScript"], fastTokens: ["axios."], pattern: "axios\\.(?:get|post|put|request)\\s*\\(\\s*(?:req\\.|userUrl|webhookUrl|target)", cxQuery: "JS_High_Risk/SSRF_Axios", ibmRule: "IBM-SSRF-AXIOS-127" },
      { code: "SSRF-NODE-HTTPGET", name: "Node.js http.get / https.request Unvalidated Host/URL", languages: ["Node.js", "TypeScript"], fastTokens: ["http.get(", "https.get("], pattern: "https?\\.(?:get|request)\\s*\\(\\s*req\\.", cxQuery: "JS_High_Risk/SSRF_Http_Get", ibmRule: "IBM-SSRF-HTTP-128" },
      { code: "SSRF-PY-REQUESTS", name: "Python requests.get/post() Unvalidated URL Parameter", languages: ["Python"], fastTokens: ["requests.get", "requests.post"], pattern: "requests\\.(?:get|post|put|request)\\s*\\(\\s*(?:req|user|url|target|webhook)", cxQuery: "Python_High_Risk/SSRF_Requests", ibmRule: "IBM-SSRF-PY-129" },
      { code: "SSRF-PY-URLLIB", name: "Python urllib.request.urlopen() Unvalidated URL", languages: ["Python"], fastTokens: ["urlopen("], pattern: "urlopen\\s*\\(\\s*(?:req|user|url|target)", cxQuery: "Python_High_Risk/SSRF_Urllib", ibmRule: "IBM-SSRF-URL-130" },
      { code: "SSRF-PY-HTTPX-AIOHTTP", name: "Python XTRIKE-HTTP / aiohttp ClientSession.get() SSRF", languages: ["Python"], fastTokens: ["XTRIKE-HTTP.get", "session.get("], pattern: "(?:XTRIKE-HTTP|session)\\.(?:get|post)\\s*\\(\\s*(?:req|user|url|target)", cxQuery: "Python_Async/SSRF_Httpx_Aiohttp", ibmRule: "IBM-SSRF-HTTPX-131" },
      { code: "SSRF-JAVA-URL-OPENCONN", name: "Java new URL(userInput).openConnection() / openStream() SSRF", languages: ["Java"], fastTokens: ["openconnection", "openstream"], pattern: "new\\s+URL\\s*\\([^)]+\\)\\.(?:openConnection|openStream)\\s*\\(", cxQuery: "Java_High_Risk/SSRF_URL_OpenConnection", ibmRule: "IBM-SSRF-JAVA-132" },
      { code: "SSRF-JAVA-RESTTEMPLATE", name: "Spring RestTemplate / WebClient Unvalidated URI Fetch", languages: ["Java", "Kotlin"], fastTokens: ["resttemplate", "getforobject", "getforentity"], pattern: "restTemplate\\.(?:getForObject|getForEntity|postForObject|exchange)\\s*\\(", cxQuery: "Java_Spring/SSRF_RestTemplate", ibmRule: "IBM-SSRF-SPRING-133" },
      { code: "SSRF-JAVA-HTTPCLIENT", name: "Java HttpClient / OkHttpClient Request.Builder().url() SSRF", languages: ["Java"], fastTokens: ["uri.create(", ".url("], pattern: "(?:URI\\.create|Builder\\(\\)\\.url)\\s*\\(\\s*(?:req|user|target|url)", cxQuery: "Java_HttpClient/SSRF_URI", ibmRule: "IBM-SSRF-OKHTTP-134" },
      { code: "SSRF-GO-HTTPGET", name: "Go http.Get() / http.NewRequest() Unvalidated Query URL", languages: ["Go"], fastTokens: ["http.get(", "http.newrequest"], pattern: "http\\.(?:Get|Post|NewRequest)\\s*\\([^)]*(?:r\\.URL|req|target|url)", cxQuery: "Go_High_Risk/SSRF_Http_Get", ibmRule: "IBM-SSRF-GO-135" },
      { code: "SSRF-PHP-CURL", name: "PHP curl_setopt(CURLOPT_URL, $_GET) SSRF", languages: ["PHP"], fastTokens: ["curl_setopt", "curlopt_url"], pattern: "curl_setopt\\s*\\([^,]+,\\s*CURLOPT_URL\\s*,\\s*\\$", cxQuery: "PHP_High_Risk/SSRF_Curl", ibmRule: "IBM-SSRF-PHP-136" },
      { code: "SSRF-CS-HTTPCLIENT", name: "C# HttpClient.GetAsync() / WebClient.DownloadString() SSRF", languages: ["C#"], fastTokens: ["getasync(", "downloadstring("], pattern: "(?:GetAsync|GetStringAsync|DownloadString)\\s*\\(\\s*(?:req|user|url|target)", cxQuery: "CSharp_High_Risk/SSRF_HttpClient", ibmRule: "IBM-SSRF-CS-137" },
      { code: "SSRF-HEADLESS-PUPPETEER", name: "Puppeteer / XTRIKE-DOM page.goto(userUrl) Headless Browser SSRF", languages: ["Node.js", "TypeScript"], fastTokens: ["page.goto("], pattern: "page\\.goto\\s*\\(\\s*(?:req\\.|userUrl|targetUrl)", cxQuery: "JS_Headless/Puppeteer_Goto_SSRF", ibmRule: "IBM-SSRF-PUP-138" },
      { code: "SSRF-WKHTMLTOPDF", name: "Server-Side PDF Generator (wkhtmltopdf / WeasyPrint) SSRF", languages: ["Python", "Node.js", "PHP"], fastTokens: ["wkhtmltopdf", "weasyprint"], pattern: "(?:wkhtmltopdf|HTML\\s*\\(\\s*url\\s*=)", cxQuery: "AppSec_PDF/Generator_SSRF", ibmRule: "IBM-SSRF-PDF-139" },
      { code: "SSRF-CLOUD-METADATA", name: "Direct Cloud Instance Metadata IP (169.254.169.254) Reference", languages: ["Python", "Node.js", "Java", "Go"], fastTokens: ["169.254.169.254"], pattern: "169\\.254\\.169\\.254", cxQuery: "Cloud_Security/IMDS_Endpoint_Reference", ibmRule: "IBM-SSRF-IMDS-140" },
      { code: "REDIR-EXPRESS-REDIRECT", name: "Express res.redirect(req.query.next) Open Redirect (CWE-601)", languages: ["Node.js", "TypeScript"], fastTokens: ["res.redirect("], pattern: "res\\.redirect\\s*\\(\\s*req\\.(?:query|body|params)", cxQuery: "JS_Medium_Threat/Open_Redirect", ibmRule: "IBM-REDIR-EXP-141" },
      { code: "REDIR-JAVA-SENDREDIRECT", name: "Java HttpServletResponse.sendRedirect() Unvalidated Target", languages: ["Java"], fastTokens: ["sendredirect("], pattern: "sendRedirect\\s*\\(\\s*request\\.getParameter", cxQuery: "Java_Medium_Threat/Open_Redirect", ibmRule: "IBM-REDIR-JAVA-142" },
      { code: "REDIR-PY-FLASK-DJANGO", name: "Flask / Django redirect(request.args.get('next')) Open Redirect", languages: ["Python"], fastTokens: ["redirect("], pattern: "redirect\\s*\\(\\s*request\\.(?:args|GET|POST)", cxQuery: "Python_Medium_Threat/Open_Redirect", ibmRule: "IBM-REDIR-PY-143" },
      { code: "REDIR-PHP-HEADER-LOCATION", name: "PHP header('Location: ' . $_GET['url']) Open Redirect", languages: ["PHP"], fastTokens: ["location:"], pattern: "header\\s*\\(\\s*[\"']Location:.*\\$_(?:GET|POST|REQUEST)", cxQuery: "PHP_Medium_Threat/Header_Open_Redirect", ibmRule: "IBM-REDIR-PHP-144" },
      { code: "REDIR-GO-HTTPREDIRECT", name: "Go http.Redirect(w, r, r.URL.Query().Get('next')) Open Redirect", languages: ["Go"], fastTokens: ["http.redirect("], pattern: "http\\.Redirect\\s*\\([^)]*r\\.URL\\.Query", cxQuery: "Go_Medium_Threat/Http_Open_Redirect", ibmRule: "IBM-REDIR-GO-145" },
    ],
  },

  // 8. Secrets, API Keys, Private Keys & Hardcoded Credentials (30 Plugins)
  {
    category: "Secrets & Credential Hygiene",
    cwe: "CWE-798",
    cweName: "Use of Hard-coded Credentials & Cryptographic Keys (CWE-321)",
    owasp: "A07:2021 · Identification and Authentication Failures",
    asvs: "ASVS V2.10.4",
    nist80053: "IA-5 · Authenticator Management",
    nistSsdf: "PW.4.1 · Secret Hygiene",
    pciDss: "PCI-DSS v4.0 Req 8.6.2",
    iso27001: "ISO 27001 A.8.24",
    mitreAttack: "T1552.001",
    fortifyKingdom: "Security Features",
    fortifyAnalyzer: "Configuration",
    severity: "Critical",
    cvss: 9.0,
    epss: 0.195,
    sanitizerHint: "process.env / os.environ / HashiCorp Vault / AWS Secrets Manager",
    remediationSummary: "Revoke the hardcoded secret immediately and inject credentials at runtime from a secret manager or environment variable.",
    variants: [
      { code: "SEC-AWS-ACCESS-KEY", name: "AWS IAM Access Key ID (AKIA / ASIA) Committed in Code", languages: ["Java", "Python", "Node.js", "TypeScript", "Go", "PHP", "C#"], fastTokens: ["akia", "asia"], pattern: "\\b(?:AKIA|ASIA)[0-9A-Z]{16}\\b", cxQuery: "Secrets/AWS_Access_Key_ID", ibmRule: "IBM-SEC-AWS-146" },
      { code: "SEC-AWS-SECRET-KEY", name: "AWS Secret Access Key Literal Assignment", languages: ["Java", "Python", "Node.js", "TypeScript", "Go"], fastTokens: ["aws_secret"], pattern: "aws_secret(?:_access)?_key\\s*[:=]\\s*[\"'][A-Za-z0-9/+=]{20,}[\"']", cxQuery: "Secrets/AWS_Secret_Access_Key", ibmRule: "IBM-SEC-AWS-147" },
      { code: "SEC-GCP-API-KEY", name: "Google Cloud Platform (GCP) API Key (AIzaSy...)", languages: ["Java", "Python", "Node.js", "TypeScript", "Go"], fastTokens: ["aizasy"], pattern: "AIzaSy[0-9A-Za-z_\\-]{33}", cxQuery: "Secrets/GCP_API_Key", ibmRule: "IBM-SEC-GCP-148" },
      { code: "SEC-GCP-SERVICE-ACCOUNT", name: "GCP Service Account Private Key JSON Embedded", languages: ["Node.js", "Python"], fastTokens: ["private_key_id", "service_account"], pattern: "\"type\"\\s*:\\s*\"service_account\"", cxQuery: "Secrets/GCP_Service_Account_JSON", ibmRule: "IBM-SEC-GCPSA-149" },
      { code: "SEC-AZURE-CONN-STR", name: "Azure Storage Account Key / Connection String", languages: ["C#", "Node.js", "Python"], fastTokens: ["accountkey="], pattern: "DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{20,}", cxQuery: "Secrets/Azure_Storage_Connection_String", ibmRule: "IBM-SEC-AZ-150" },
      { code: "SEC-GITHUB-PAT", name: "GitHub Personal Access Token (ghp_ / github_pat_)", languages: ["Node.js", "Python", "Go", "Java"], fastTokens: ["ghp_", "github_pat_"], pattern: "\\b(?:ghp_[0-9a-zA-Z]{20,}|github_pat_[0-9a-zA-Z_]{20,})\\b", cxQuery: "Secrets/GitHub_PAT_Token", ibmRule: "IBM-SEC-GH-151" },
      { code: "SEC-GITLAB-PAT", name: "GitLab Personal / Runner Token (glpat-...)", languages: ["Node.js", "Python", "Go"], fastTokens: ["glpat-"], pattern: "\\bglpat-[0-9a-zA-Z_\\-]{20}\\b", cxQuery: "Secrets/GitLab_PAT_Token", ibmRule: "IBM-SEC-GL-152" },
      { code: "SEC-SLACK-TOKEN", name: "Slack Bot / User OAuth Token (xoxb- / xoxp-)", languages: ["Node.js", "Python", "Go"], fastTokens: ["xoxb-", "xoxp-"], pattern: "\\bxox[baprs]-[0-9a-zA-Z\\-]{16,}\\b", cxQuery: "Secrets/Slack_OAuth_Token", ibmRule: "IBM-SEC-SLACK-153" },
      { code: "SEC-SLACK-WEBHOOK", name: "Slack Incoming Webhook URL Committed in Source", languages: ["Node.js", "Python"], fastTokens: ["hooks.slack.com"], pattern: "https://hooks\\.slack\\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]+", cxQuery: "Secrets/Slack_Webhook_URL", ibmRule: "IBM-SEC-SLKW-154" },
      { code: "SEC-STRIPE-LIVE-KEY", name: "Stripe Live Secret API Key (sk_live_ / rk_live_)", languages: ["Node.js", "TypeScript", "Python", "PHP"], fastTokens: ["sk_live_", "rk_live_"], pattern: "\\b(?:sk|rk)_live_[0-9a-zA-Z]{16,}\\b", cxQuery: "Secrets/Stripe_Live_Secret_Key", ibmRule: "IBM-SEC-STRIPE-155" },
      { code: "SEC-OPENAI-KEY", name: "OpenAI / Anthropic API Key (sk-proj- / sk-ant-)", languages: ["Python", "Node.js", "TypeScript"], fastTokens: ["sk-proj-", "sk-ant-", "openai_api_key"], pattern: "\\bsk-(?:proj-|ant-)?[A-Za-z0-9_\\-]{20,}\\b", cxQuery: "Secrets/LLM_Provider_API_Key", ibmRule: "IBM-SEC-OPENAI-156" },
      { code: "SEC-TWILIO-KEY", name: "Twilio Account Auth Token / API Key (SK[0-9a-f]{32})", languages: ["Node.js", "Python", "Java"], fastTokens: ["twilio"], pattern: "twilio.*[:=]\\s*[\"'][0-9a-fA-F]{32}[\"']", cxQuery: "Secrets/Twilio_Auth_Token", ibmRule: "IBM-SEC-TWILIO-157" },
      { code: "SEC-SENDGRID-KEY", name: "SendGrid API Key (SG.xxx.yyy)", languages: ["Node.js", "Python"], fastTokens: ["sg."], pattern: "\\bSG\\.[A-Za-z0-9_\\-]{16,}\\.[A-Za-z0-9_\\-]{16,}\\b", cxQuery: "Secrets/SendGrid_API_Key", ibmRule: "IBM-SEC-SG-158" },
      { code: "SEC-RSA-PRIVATE-KEY", name: "PEM RSA / EC / OpenSSH Private Key Block", languages: ["Java", "Python", "Node.js", "Go"], fastTokens: ["private key-----"], pattern: "-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----", cxQuery: "Secrets/PEM_Private_Key", ibmRule: "IBM-SEC-PEM-159" },
      { code: "SEC-JWT-HARDCODED-SECRET", name: "Hardcoded JWT Signing Secret (jwt_secret / JWT_SECRET)", languages: ["Node.js", "TypeScript", "Python", "Java", "Go"], fastTokens: ["jwt_secret", "jwtsecret"], pattern: "(?:jwt[_-]?secret|JWT_SECRET)\\s*[:=]\\s*[\"'][A-Za-z0-9_\\-!@#$%^&*]{8,}[\"']", cxQuery: "Secrets/Hardcoded_JWT_Secret", ibmRule: "IBM-SEC-JWT-160" },
      { code: "SEC-GENERIC-API-KEY", name: "Hardcoded Generic API_KEY / SECRET_KEY Constant", languages: ["Java", "Python", "Node.js", "TypeScript", "Go", "PHP", "C#"], fastTokens: ["api_key", "apikey", "secret_key"], pattern: "(?:api[_-]?key|secret[_-]?key|client[_-]?secret)\\s*[:=]\\s*[\"'][A-Za-z0-9_\\-./+=]{10,}[\"']", cxQuery: "Secrets/Hardcoded_API_Key", ibmRule: "IBM-SEC-API-161" },
      { code: "SEC-GENERIC-PASSWORD", name: "Hardcoded Password / DB_PASS Variable in Code", languages: ["Java", "Python", "Node.js", "TypeScript", "Go", "PHP", "C#"], fastTokens: ["password", "passwd", "db_pass"], pattern: "(?:password|passwd|db_pass|db_password)\\s*[:=]\\s*[\"'][^\"'\\s$]{6,}[\"']", cxQuery: "Secrets/Hardcoded_Password", ibmRule: "IBM-SEC-PWD-162" },
      { code: "SEC-POSTGRES-URI", name: "PostgreSQL / MySQL Connection URI with Embedded Password", languages: ["Node.js", "Python", "Go", "Java"], fastTokens: ["postgres://", "postgresql://", "mysql://"], pattern: "(?:postgres(?:ql)?|mysql)://[^:\\s]+:[^@\\s]+@[^/\\s]+", cxQuery: "Secrets/Database_URI_Credentials", ibmRule: "IBM-SEC-DBURI-163" },
      { code: "SEC-MONGODB-URI", name: "MongoDB Atlas Connection URI (mongodb+srv://user:pass@...)", languages: ["Node.js", "Python", "Go"], fastTokens: ["mongodb://", "mongodb+srv://"], pattern: "mongodb(?:\\+srv)?://[^:\\s]+:[^@\\s]+@", cxQuery: "Secrets/MongoDB_URI_Credentials", ibmRule: "IBM-SEC-MONGO-164" },
      { code: "SEC-REDIS-URI", name: "Redis Connection URI with Plaintext Password (redis://:pass@)", languages: ["Node.js", "Python", "Go"], fastTokens: ["redis://"], pattern: "rediss?://:[^@\\s]+@", cxQuery: "Secrets/Redis_URI_Password", ibmRule: "IBM-SEC-REDIS-165" },
      { code: "SEC-JAVA-DRIVEMANAGER", name: "Java DriverManager.getConnection() Hardcoded DB Password", languages: ["Java"], fastTokens: ["drivermanager.getconnection"], pattern: "DriverManager\\.getConnection\\s*\\([^,]+,[^,]+,\\s*[\"'][^\"']+[\"']\\)", cxQuery: "Java_High_Risk/Hardcoded_JDBC_Password", ibmRule: "IBM-SEC-JDBC-166" },
      { code: "SEC-SPRING-DATASOURCE", name: "Spring application.properties Plaintext datasource.password", languages: ["Java"], fastTokens: ["datasource.password"], pattern: "spring\\.datasource\\.password\\s*=\\s*(?!\\$\\{)\\S+", cxQuery: "Java_Spring/Plaintext_Datasource_Password", ibmRule: "IBM-SEC-SPRING-167" },
      { code: "SEC-NPMRC-TOKEN", name: "NPM Registry _authToken Committed in .npmrc / Config", languages: ["Node.js"], fastTokens: ["_authtoken="], pattern: "_authToken\\s*=\\s*(?!\\$\\{)[A-Za-z0-9_\\-.]+", cxQuery: "Secrets/NPM_Auth_Token", ibmRule: "IBM-SEC-NPM-168" },
      { code: "SEC-PYPI-TOKEN", name: "PyPI Upload Token (pypi-AgEIcHlwaS5vcmc...)", languages: ["Python"], fastTokens: ["pypi-"], pattern: "\\bpypi-[A-Za-z0-9_\\-]{30,}\\b", cxQuery: "Secrets/PyPI_Upload_Token", ibmRule: "IBM-SEC-PYPI-169" },
      { code: "SEC-DOCKER-AUTH", name: "Docker config.json Base64 Registry Auth Credential", languages: ["Node.js", "Python"], fastTokens: ["\"auths\""], pattern: "\"auth\"\\s*:\\s*\"[A-Za-z0-9+/=]{16,}\"", cxQuery: "Secrets/Docker_Registry_Auth", ibmRule: "IBM-SEC-DOCK-170" },
      { code: "SEC-HASHICORP-VAULT", name: "HashiCorp Vault Root/Service Token (hvs. / s.)", languages: ["Go", "Python", "Node.js"], fastTokens: ["hvs."], pattern: "\\bhvs\\.[A-Za-z0-9_\\-]{20,}\\b", cxQuery: "Secrets/Vault_Service_Token", ibmRule: "IBM-SEC-VAULT-171" },
      { code: "SEC-DATADOG-KEY", name: "Datadog API / Application Key Hardcoded", languages: ["Python", "Node.js", "Go"], fastTokens: ["dd_api_key", "datadog_api_key"], pattern: "(?:dd_api_key|datadog_api_key)\\s*[:=]\\s*[\"'][0-9a-f]{32}[\"']", cxQuery: "Secrets/Datadog_API_Key", ibmRule: "IBM-SEC-DD-172" },
      { code: "SEC-FIREBASE-SERVER-KEY", name: "Firebase Cloud Messaging Server Key (AAAA...)", languages: ["Java", "Kotlin", "Node.js"], fastTokens: ["aaaa"], pattern: "AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}", cxQuery: "Secrets/Firebase_Server_Key", ibmRule: "IBM-SEC-FCM-173" },
      { code: "SEC-SUPABASE-SERVICE-ROLE", name: "Supabase Service Role JWT Key Exposed in Client Bundle", languages: ["TypeScript", "Node.js"], fastTokens: ["supabase_service_role"], pattern: "SUPABASE_SERVICE_ROLE_KEY\\s*[:=]\\s*[\"']eyJ", cxQuery: "Secrets/Supabase_Service_Role_Key", ibmRule: "IBM-SEC-SUPA-174" },
      { code: "SEC-BEARER-HARDCODED", name: "Hardcoded Authorization: Bearer Token in HTTP Header", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["bearer "], pattern: "[\"']Bearer\\s+[A-Za-z0-9_\\-.]{20,}[\"']", cxQuery: "Secrets/Hardcoded_Bearer_Token", ibmRule: "IBM-SEC-BEARER-175" },
    ],
  },

  // 9. Cryptographic Failures, NIST FIPS 140-3 & Entropy (25 Plugins)
  {
    category: "Cryptographic & FIPS 140-3",
    cwe: "CWE-327",
    cweName: "Use of a Broken or Risky Cryptographic Algorithm & Weak PRNG (CWE-330)",
    owasp: "A02:2021 · Cryptographic Failures",
    asvs: "ASVS V6.2.2",
    nist80053: "SC-13 · Cryptographic Protection (FIPS 140-3)",
    nistSsdf: "PW.4.4 · Approved Cryptography",
    pciDss: "PCI-DSS v4.0 Req 4.2.1",
    iso27001: "ISO 27001 A.8.24",
    mitreAttack: "T1600",
    fortifyKingdom: "Security Features",
    fortifyAnalyzer: "Semantic",
    severity: "Medium",
    cvss: 6.8,
    epss: 0.062,
    sanitizerHint: "AES-256-GCM / SHA-256+ / Argon2id / CSPRNG (SecureRandom / crypto.randomBytes)",
    remediationSummary: "Upgrade to FIPS 140-3 approved primitives: AES-256-GCM, SHA-256/SHA-3, Argon2id/bcrypt, and OS CSPRNG.",
    variants: [
      { code: "CRYP-JAVA-MD5", name: "Java MessageDigest.getInstance('MD5') Broken Hash", languages: ["Java"], fastTokens: ["messagedigest", "md5"], pattern: "MessageDigest\\.getInstance\\s*\\(\\s*[\"']MD5[\"']\\)", cxQuery: "Java_Crypto/Weak_Hash_MD5", ibmRule: "IBM-CRYP-JAVA-176" },
      { code: "CRYP-JAVA-SHA1", name: "Java MessageDigest.getInstance('SHA-1') Deprecated Hash", languages: ["Java"], fastTokens: ["messagedigest", "sha-1", "sha1"], pattern: "MessageDigest\\.getInstance\\s*\\(\\s*[\"']SHA-?1[\"']\\)", cxQuery: "Java_Crypto/Weak_Hash_SHA1", ibmRule: "IBM-CRYP-JAVA-177" },
      { code: "CRYP-JAVA-DES-3DES", name: "Java Cipher.getInstance('DES' / 'DESede' / 'RC4')", languages: ["Java"], fastTokens: ["cipher.getinstance"], pattern: "Cipher\\.getInstance\\s*\\(\\s*[\"'](?:DES|DESede|RC2|RC4|ARCFOUR)", cxQuery: "Java_Crypto/Broken_Symmetric_Cipher", ibmRule: "IBM-CRYP-DES-178" },
      { code: "CRYP-JAVA-AES-ECB", name: "Java Cipher.getInstance('AES/ECB/...') Deterministic Block Mode", languages: ["Java"], fastTokens: ["aes/ecb", "cipher.getinstance(\"aes\")"], pattern: "Cipher\\.getInstance\\s*\\(\\s*[\"']AES(?:/ECB|/[^\"']*)?[\"']\\)", cxQuery: "Java_Crypto/AES_ECB_Mode", ibmRule: "IBM-CRYP-ECB-179" },
      { code: "CRYP-JAVA-RSA-NOPAD", name: "Java RSA Cipher Without OAEP Padding (PKCS1v1.5 / NoPadding)", languages: ["Java"], fastTokens: ["rsa/ecb/pkcs1padding", "rsa/ecb/nopadding"], pattern: "Cipher\\.getInstance\\s*\\(\\s*[\"']RSA/ECB/(?:PKCS1Padding|NoPadding)", cxQuery: "Java_Crypto/RSA_Weak_Padding", ibmRule: "IBM-CRYP-RSA-180" },
      { code: "CRYP-JAVA-WEAK-KEYSIZE", name: "Java KeyPairGenerator RSA Key Size < 2048 Bits", languages: ["Java"], fastTokens: [".initialize("], pattern: "\\.initialize\\s*\\(\\s*(?:512|1024)\\b", cxQuery: "Java_Crypto/Insufficient_Key_Size", ibmRule: "IBM-CRYP-KEY-181" },
      { code: "CRYP-JAVA-UTIL-RANDOM", name: "Java java.util.Random Used Instead of SecureRandom (CWE-330)", languages: ["Java"], fastTokens: ["new random("], pattern: "new\\s+Random\\s*\\(\\)", cxQuery: "Java_Crypto/Insecure_PRNG_Random", ibmRule: "IBM-CRYP-RAND-182" },
      { code: "CRYP-PY-HASHLIB-MD5", name: "Python hashlib.md5() Collision-Prone Digest", languages: ["Python"], fastTokens: ["hashlib.md5"], pattern: "hashlib\\.md5\\s*\\(", cxQuery: "Python_Crypto/Hashlib_MD5", ibmRule: "IBM-CRYP-PY-183" },
      { code: "CRYP-PY-HASHLIB-SHA1", name: "Python hashlib.sha1() Collision-Prone Digest", languages: ["Python"], fastTokens: ["hashlib.sha1"], pattern: "hashlib\\.sha1\\s*\\(", cxQuery: "Python_Crypto/Hashlib_SHA1", ibmRule: "IBM-CRYP-PY-184" },
      { code: "CRYP-PY-PYCRYPTODOME-ECB", name: "Python PyCryptodome AES.new(..., AES.MODE_ECB)", languages: ["Python"], fastTokens: ["mode_ecb"], pattern: "MODE_ECB", cxQuery: "Python_Crypto/AES_MODE_ECB", ibmRule: "IBM-CRYP-PYECB-185" },
      { code: "CRYP-PY-RANDOM-MODULE", name: "Python random.randint / random.choice Used for Security Tokens", languages: ["Python"], fastTokens: ["random.randint", "random.choice", "random.random"], pattern: "random\\.(?:randint|choice|random|randrange)\\s*\\(", cxQuery: "Python_Crypto/Standard_Random_PRNG", ibmRule: "IBM-CRYP-PYRAND-186" },
      { code: "CRYP-NODE-CREATEHASH-MD5", name: "Node.js crypto.createHash('md5' / 'sha1') Weak Digest", languages: ["Node.js", "TypeScript"], fastTokens: ["createhash("], pattern: "createHash\\s*\\(\\s*[\"'](?:md4|md5|sha1|ripemd160)[\"']\\)", cxQuery: "JS_Crypto/Weak_CreateHash", ibmRule: "IBM-CRYP-NODE-187" },
      { code: "CRYP-NODE-CREATECIPHER", name: "Node.js Deprecated crypto.createCipher() Without IV", languages: ["Node.js", "TypeScript"], fastTokens: ["createcipher("], pattern: "crypto\\.createCipher\\s*\\(", cxQuery: "JS_Crypto/Deprecated_CreateCipher", ibmRule: "IBM-CRYP-CIPH-188" },
      { code: "CRYP-JS-MATH-RANDOM", name: "JavaScript Math.random() Used for Token / Nonce / ID Generation", languages: ["Node.js", "TypeScript"], fastTokens: ["math.random()"], pattern: "Math\\.random\\s*\\(\\)", cxQuery: "JS_Crypto/Math_Random_PRNG", ibmRule: "IBM-CRYP-JSRAND-189" },
      { code: "CRYP-PHP-MD5-SHA1", name: "PHP md5() / sha1() Used for Password or Token Hashing", languages: ["PHP"], fastTokens: ["md5(", "sha1("], pattern: "\\b(?:md5|sha1)\\s*\\(\\s*\\$", cxQuery: "PHP_Crypto/Weak_MD5_SHA1_Hash", ibmRule: "IBM-CRYP-PHP-190" },
      { code: "CRYP-PHP-RAND-MTRAND", name: "PHP rand() / mt_rand() Non-Cryptographic PRNG", languages: ["PHP"], fastTokens: ["mt_rand(", "rand("], pattern: "\\b(?:mt_rand|rand|uniqid)\\s*\\(", cxQuery: "PHP_Crypto/Weak_PRNG_MtRand", ibmRule: "IBM-CRYP-PHPRAND-191" },
      { code: "CRYP-GO-MD5-SHA1", name: "Go crypto/md5 or crypto/sha1 Package Usage", languages: ["Go"], fastTokens: ["md5.new", "md5.sum", "sha1.new", "sha1.sum"], pattern: "(?:md5|sha1)\\.(?:New|Sum)\\s*\\(", cxQuery: "Go_Crypto/Weak_MD5_SHA1", ibmRule: "IBM-CRYP-GO-192" },
      { code: "CRYP-GO-MATH-RAND", name: "Go math/rand Used Instead of crypto/rand", languages: ["Go"], fastTokens: ["rand.intn", "rand.read"], pattern: "rand\\.(?:Intn|Int63|Seed)\\s*\\(", cxQuery: "Go_Crypto/Math_Rand_PRNG", ibmRule: "IBM-CRYP-GORAND-193" },
      { code: "CRYP-CS-MD5-SHA1", name: "C# MD5.Create() / SHA1.Create() / DESCryptoServiceProvider", languages: ["C#"], fastTokens: ["md5.create", "sha1.create", "descryptoserviceprovider"], pattern: "(?:MD5\\.Create|SHA1\\.Create|DESCryptoServiceProvider|TripleDESCryptoServiceProvider)\\s*\\(", cxQuery: "CSharp_Crypto/Weak_Algorithm", ibmRule: "IBM-CRYP-CS-194" },
      { code: "CRYP-STATIC-IV", name: "Hardcoded Static Initialization Vector (IV) in Symmetric Cipher (CWE-329)", languages: ["Java", "Python", "Node.js", "C#"], fastTokens: ["ivparameterspec"], pattern: "new\\s+IvParameterSpec\\s*\\(\\s*[\"'][^\"']+[\"']\\.getBytes", cxQuery: "Crypto_General/Static_IV_Reuse", ibmRule: "IBM-CRYP-IV-195" },
      { code: "CRYP-PBKDF2-LOW-ITER", name: "PBKDF2 Key Derivation with Low Iteration Count (< 10,000)", languages: ["Java", "Python", "Node.js"], fastTokens: ["pbkdf2"], pattern: "pbkdf2.*?,\\s*(?:100|500|1000|2000|4096)\\b", cxQuery: "Crypto_General/PBKDF2_Low_Iterations", ibmRule: "IBM-CRYP-PBK-196" },
      { code: "CRYP-TLS-REJECT-UNAUTH", name: "Node.js TLS Certificate Verification Disabled (rejectUnauthorized: false)", languages: ["Node.js", "TypeScript"], fastTokens: ["rejectunauthorized"], pattern: "rejectUnauthorized\\s*:\\s*false", cxQuery: "JS_TLS/RejectUnauthorized_False", ibmRule: "IBM-CRYP-TLS-197" },
      { code: "CRYP-NODE-TLS-ENV", name: "NODE_TLS_REJECT_UNAUTHORIZED = '0' Globally Disables TLS Validation", languages: ["Node.js", "TypeScript"], fastTokens: ["node_tls_reject_unauthorized"], pattern: "NODE_TLS_REJECT_UNAUTHORIZED\\s*=\\s*[\"']?0", cxQuery: "JS_TLS/Global_TLS_Disabled", ibmRule: "IBM-CRYP-TLSENV-198" },
      { code: "CRYP-PY-VERIFY-FALSE", name: "Python requests(verify=False) SSL Certificate Verification Disabled", languages: ["Python"], fastTokens: ["verify=false", "verify = false"], pattern: "verify\\s*=\\s*False", cxQuery: "Python_TLS/Requests_Verify_False", ibmRule: "IBM-CRYP-PYTLS-199" },
      { code: "CRYP-GO-INSECURESKIPVERIFY", name: "Go tls.Config{ InsecureSkipVerify: true } Disables X.509 Check", languages: ["Go"], fastTokens: ["insecureskipverify"], pattern: "InsecureSkipVerify\\s*:\\s*true", cxQuery: "Go_TLS/InsecureSkipVerify_True", ibmRule: "IBM-CRYP-GOTLS-200" },
    ],
  },

  // 10. Authentication, JWT, OAuth, Session & Access Control (30 Plugins)
  {
    category: "OWASP API Security Top 10:2023",
    cwe: "CWE-862",
    cweName: "Missing Authorization, Broken Object Level Authorization (BOLA) & Improper JWT Verification (CWE-347)",
    owasp: "A01:2021 · API1:2023 BOLA / API2:2023 Broken Auth",
    asvs: "ASVS V4.1.3 & V3.5.3",
    nist80053: "AC-3 · Access Enforcement & IA-2",
    nistSsdf: "PW.1.1 · Access Control Design",
    pciDss: "PCI-DSS v4.0 Req 7.2.1",
    iso27001: "ISO 27001 A.8.3",
    mitreAttack: "T1078",
    fortifyKingdom: "Security Features",
    fortifyAnalyzer: "Control Flow",
    severity: "High",
    cvss: 8.5,
    epss: 0.148,
    sanitizerHint: "Enforce compound ownership predicate (findByIdAndTenantId / findByIdAndUserId / verifyOwnership / WHERE id = :id AND tenant_id = :tenantId)",
    remediationSummary: "Enforce server-side object ownership predicates (findByIdAndTenantId / findByIdAndUserId) and verify cross-user isolation (User A vs User B returns HTTP 403/404).",
    variants: [
      { code: "AUTH-JWT-DECODE-NOVERIFY", name: "JWT jwt.decode() Used Without Signature Verification (CWE-347)", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["jwt.decode("], pattern: "jwt\\.decode\\s*\\([^)]*(?:verify_signature[\"']?\\s*:\\s*False|\\))", cxQuery: "Auth_JWT/Unverified_JWT_Decode", ibmRule: "IBM-AUTH-JWT-201" },
      { code: "AUTH-JWT-ALG-NONE", name: "JWT Algorithm 'none' Explicitly Allowed in Verification", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["algorithms", "none"], pattern: "algorithms\\s*[:=].*[\"']none[\"']", cxQuery: "Auth_JWT/Algorithm_None_Allowed", ibmRule: "IBM-AUTH-JWT-202" },
      { code: "AUTH-JAVA-JJWT-PARSE", name: "Java JJWT Jwts.parser().parse() Unsigned Token Acceptance", languages: ["Java"], fastTokens: ["jwts.parser", ".parse("], pattern: "Jwts\\.parser\\(\\)\\.(?:setSigningKey\\([^)]+\\)\\.)?parse\\s*\\(", cxQuery: "Java_JWT/Unsigned_Token_Parse", ibmRule: "IBM-AUTH-JJWT-203" },
      { code: "AUTH-COOKIE-NO-HTTPONLY", name: "Session Cookie Configured with httpOnly: false (CWE-1004)", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["httponly"], pattern: "httpOnly\\s*[:=]\\s*(?:false|False)", cxQuery: "Session_Security/Cookie_HttpOnly_False", ibmRule: "IBM-AUTH-COOK-204" },
      { code: "AUTH-COOKIE-NO-SECURE", name: "Session Cookie Configured with secure: false (CWE-614)", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["secure:"], pattern: "secure\\s*:\\s*false", cxQuery: "Session_Security/Cookie_Secure_False", ibmRule: "IBM-AUTH-COOK-205" },
      { code: "AUTH-COOKIE-SAMESITE-NONE", name: "Session Cookie Configured with sameSite: 'none'", languages: ["Node.js", "TypeScript"], fastTokens: ["samesite"], pattern: "sameSite\\s*:\\s*[\"']none[\"']", cxQuery: "Session_Security/Cookie_SameSite_None", ibmRule: "IBM-AUTH-SAME-206" },
      { code: "AUTH-CORS-WILDCARD", name: "CORS Header Access-Control-Allow-Origin: * (CWE-942)", languages: ["Node.js", "TypeScript", "Java", "Python", "Go"], fastTokens: ["access-control-allow-origin", "origin:"], pattern: "(?:Access-Control-Allow-Origin[\"']\\s*,\\s*[\"']\\*[\"']|origin\\s*:\\s*[\"']\\*[\"'])", cxQuery: "API_Security/Overly_Permissive_CORS", ibmRule: "IBM-AUTH-CORS-207" },
      { code: "AUTH-SPRING-CROSSORIGIN", name: "Spring @CrossOrigin('*') Unrestricted Cross-Origin Controller", languages: ["Java", "Kotlin"], fastTokens: ["@crossorigin"], pattern: "@CrossOrigin\\s*\\(\\s*(?:origins\\s*=\\s*)?[\"']\\*[\"']", cxQuery: "Java_Spring/CrossOrigin_Wildcard", ibmRule: "IBM-AUTH-SPCORS-208" },
      { code: "AUTH-SPRING-CSRF-DISABLE", name: "Spring Security .csrf().disable() on Stateful App (CWE-352)", languages: ["Java", "Kotlin"], fastTokens: ["csrf", "disable()"], pattern: "csrf\\s*\\([^)]*\\)\\.disable\\s*\\(\\)", cxQuery: "Java_Spring/CSRF_Protection_Disabled", ibmRule: "IBM-AUTH-CSRF-209" },
      { code: "AUTH-DJANGO-CSRF-EXEMPT", name: "Django @csrf_exempt Decorator on State-Changing View", languages: ["Python"], fastTokens: ["@csrf_exempt"], pattern: "@csrf_exempt", cxQuery: "Python_Django/CSRF_Exempt_View", ibmRule: "IBM-AUTH-DJCSRF-210" },
      { code: "AUTH-MASS-ASSIGNMENT-NODE", name: "API6:2023 Mass Assignment via Object.assign(user, req.body) (CWE-915)", languages: ["Node.js", "TypeScript"], fastTokens: ["object.assign(", ".create(req.body", ".update(req.body"], pattern: "(?:Object\\.assign\\s*\\([^,]+,\\s*req\\.body|\\.(?:create|update|findByIdAndUpdate)\\s*\\([^)]*req\\.body\\))", cxQuery: "API_Security/Mass_Assignment_Body", ibmRule: "IBM-API-MASS-211" },
      { code: "AUTH-RAILS-PERMIT-ALL", name: "Ruby on Rails params.permit! Mass Assignment Bypass", languages: ["Ruby"], fastTokens: [".permit!"], pattern: "params\\.permit!", cxQuery: "Ruby_Rails/Params_Permit_All", ibmRule: "IBM-API-RAILS-212" },
      { code: "AUTH-TIMING-ATTACK-CMP", name: "Non-Constant-Time Secret/HMAC Comparison (=== Instead of timingSafeEqual)", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["signature ===", "hmac ===", "token ==="], pattern: "(?:signature|hmac|digest|apiKey)\\s*===?\\s*req\\.", cxQuery: "Crypto_Auth/Timing_Side_Channel_Comparison", ibmRule: "IBM-AUTH-TIME-213" },
      { code: "AUTH-BCRYPT-LOW-ROUNDS", name: "bcrypt Password Hash with Cost Factor < 10 Rounds", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["bcrypt.hash", "gensalt("], pattern: "(?:bcrypt\\.hash|genSalt)\\s*\\([^,]+,\\s*[1-8]\\)", cxQuery: "Auth_Password/Bcrypt_Low_Cost_Factor", ibmRule: "IBM-AUTH-BCRYPT-214" },
      { code: "AUTH-SPRING-PERMITALL", name: "Spring Security .anyRequest().permitAll() Disables Route Auth", languages: ["Java"], fastTokens: ["anyrequest().permitall()"], pattern: "anyRequest\\(\\)\\.permitAll\\(\\)", cxQuery: "Java_Spring/AnyRequest_PermitAll", ibmRule: "IBM-AUTH-SPPERM-215" },
      { code: "AUTH-GRAPHQL-INTROSPECTION", name: "API8:2023 GraphQL Introspection Enabled in Production", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["introspection:"], pattern: "introspection\\s*:\\s*true", cxQuery: "API_GraphQL/Introspection_Enabled", ibmRule: "IBM-API-GQL-216" },
      { code: "AUTH-OATUH-STATE-MISSING", name: "OAuth 2.0 Authorization Redirect Missing CSRF state Parameter", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["response_type=code"], pattern: "response_type=code(?![^\"']*state=)", cxQuery: "Auth_OAuth/Missing_State_Parameter", ibmRule: "IBM-AUTH-OAUTH-217" },
      { code: "AUTH-LDAP-INJECTION", name: "LDAP Search Filter String Concatenation Injection (CWE-90)", languages: ["Java", "Python", "C#"], fastTokens: ["(uid=", "(&(objectclass="], pattern: "\\(&?\\([a-zA-Z]+\\s*=\\s*[\"']?\\s*\\+", cxQuery: "High_Risk/LDAP_Injection", ibmRule: "IBM-AUTH-LDAP-218" },
      { code: "AUTH-NOSQL-MONGO-OP", name: "MongoDB NoSQL Operator Injection ($ne / $gt / $where) (CWE-943)", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["$where", ".find({"], pattern: "(?:\\$where\\s*:|\\.find(?:One)?\\s*\\(\\s*\\{\\s*\\w+\\s*:\\s*req\\.(?:body|query)\\.)", cxQuery: "NoSQL_Security/MongoDB_Operator_Injection", ibmRule: "IBM-NOSQL-MONGO-219" },
      { code: "AUTH-XPATH-INJECTION", name: "XPath Query String Concatenation Injection (CWE-643)", languages: ["Java", "Python", "C#"], fastTokens: ["xpath.compile", "xpath.evaluate"], pattern: "xpath\\.(?:compile|evaluate)\\s*\\([^)]*\\+", cxQuery: "High_Risk/XPath_Injection", ibmRule: "IBM-AUTH-XPATH-220" },
      { code: "AUTH-HELMET-DISABLED", name: "Express X-Frame-Options / Content-Security-Policy Disabled", languages: ["Node.js", "TypeScript"], fastTokens: ["contentsecuritypolicy: false", "frameguard: false"], pattern: "(?:contentSecurityPolicy|frameguard)\\s*:\\s*false", cxQuery: "Web_Headers/Helmet_Protection_Disabled", ibmRule: "IBM-WEB-HELM-221" },
      { code: "AUTH-JAVA-TRUSTMANAGER-ALL", name: "Java X509TrustManager checkServerTrusted Empty Override (CWE-295)", languages: ["Java"], fastTokens: ["checkservertrusted"], pattern: "void\\s+checkServerTrusted\\s*\\([^)]*\\)\\s*\\{\\s*\\}", cxQuery: "Java_TLS/TrustAll_X509TrustManager", ibmRule: "IBM-TLS-TRUST-222" },
      { code: "AUTH-JAVA-HOSTNAMEVERIFIER-ALL", name: "Java HostnameVerifier Always Returning true (ALLOW_ALL)", languages: ["Java"], fastTokens: ["allow_all_hostname_verifier", "noopHostnameVerifier"], pattern: "(?:ALLOW_ALL_HOSTNAME_VERIFIER|NoopHostnameVerifier\\.INSTANCE)", cxQuery: "Java_TLS/AllowAll_HostnameVerifier", ibmRule: "IBM-TLS-HOST-223" },
      { code: "AUTH-BOLA-DIRECT-ID", name: "API1:2023 BOLA — Direct Database Lookup by req.params.id Without Tenant Scope", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["findbyid(req.params", "get(id=request"], pattern: "(?:findById|findByPk)\\s*\\(\\s*req\\.params\\.id\\s*\\)", cxQuery: "API_Security/BOLA_IDOR_Direct_Lookup", ibmRule: "IBM-API-BOLA-224" },
      { code: "AUTH-ADMIN-HARDCODED-ROLE", name: "Client-Controlled isAdmin / role Field Read from Request Body", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["req.body.isadmin", "req.body.role"], pattern: "req\\.body\\.(?:isAdmin|is_admin|role)\\b", cxQuery: "API_Security/Broken_Function_Level_Auth", ibmRule: "IBM-API-BFLA-225" },
      { code: "AUTH-BASIC-HTTP-CLEARTEXT", name: "HTTP Basic Auth Transmitted Over Unencrypted http:// Endpoint", languages: ["Python", "Node.js", "Java"], fastTokens: ["http://", "basic "], pattern: "http://[^/\"']+.*Authorization.*Basic", cxQuery: "Transport_Security/Cleartext_Basic_Auth", ibmRule: "IBM-AUTH-BASIC-226" },
      { code: "AUTH-SESSION-FIXATION", name: "Login Handler Does Not Regenerate Session ID After Authentication (CWE-384)", languages: ["Node.js", "PHP", "Java"], fastTokens: ["req.session.user ="], pattern: "req\\.session\\.user\\s*=\\s*(?!.*regenerate)", cxQuery: "Session_Security/Session_Fixation", ibmRule: "IBM-AUTH-SESS-227" },
      { code: "AUTH-PAM-PASSWORD-LOG", name: "Plaintext Password Written to Application Logger (CWE-532)", languages: ["Java", "Python", "Node.js", "Go"], fastTokens: ["logger.info", "console.log", "password"], pattern: "(?:logger\\.(?:info|debug|error)|console\\.log)\\s*\\([^)]*password", cxQuery: "Privacy_Leak/Password_In_Log", ibmRule: "IBM-LOG-PASS-228" },
      { code: "AUTH-LOG-FORGING", name: "CRLF Log Injection via Unsanitized User Input in Logger (CWE-117)", languages: ["Java", "Python", "Node.js"], fastTokens: ["logger.info(", "logger.warn(", "logger.error("], pattern: "logger\\.(?:info|warn|error)\\s*\\([^)]*(?:request\\.getParameter|req\\.query|req\\.body)", cxQuery: "Medium_Threat/Log_Forging_CRLF", ibmRule: "IBM-LOG-CRLF-229" },
      { code: "AUTH-DEBUG-TRUE", name: "Production Framework Debug Mode Enabled (DEBUG = True / app.run(debug=True))", languages: ["Python", "Node.js", "PHP"], fastTokens: ["debug=true", "debug = true"], pattern: "\\b(?:debug\\s*=\\s*True|DEBUG\\s*=\\s*True)\\b", cxQuery: "Config_Security/Debug_Mode_Enabled", ibmRule: "IBM-CFG-DBG-230" },
    ],
  },

  // 11. OWASP LLM & GenAI Top 10:2025 Security Plugins (25 Plugins)
  {
    category: "OWASP LLM & GenAI Top 10:2025",
    cwe: "CWE-77",
    cweName: "LLM01:2025 Prompt Injection, LLM02 Sensitive Info Disclosure & LLM05 Improper Output Handling",
    owasp: "OWASP LLM Top 10:2025 (LLM01–LLM10)",
    asvs: "ASVS V5.1 + GenAI Guardrails",
    nist80053: "SI-10 & SA-11 (NIST AI RMF 1.0)",
    nistSsdf: "PW.8.2 · AI Output Verification",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO/IEC 42001 & 27001 A.8.28",
    mitreAttack: "AML.T0051 (ATLAS Prompt Injection)",
    fortifyKingdom: "Input Validation and Representation",
    fortifyAnalyzer: "Dataflow",
    severity: "High",
    cvss: 8.4,
    epss: 0.132,
    sanitizerHint: "Structured system/user message separation + strict output schema validation",
    remediationSummary: "Isolate untrusted user input into dedicated user role messages, enforce JSON schema validation on LLM outputs, and never pass raw LLM output to SQL/shell/HTML sinks.",
    variants: [
      { code: "LLM01-SYSTEM-PROMPT-CONCAT", name: "LLM01: Direct User Input Concatenated into System Prompt", languages: ["Python", "TypeScript", "Node.js"], fastTokens: ["role", "system"], pattern: "role[\"']?\\s*:\\s*[\"']system[\"']\\s*,\\s*[\"']?content[\"']?\\s*:\\s*(?:f[\"']|`.*\\$\\{)", cxQuery: "GenAI_Security/System_Prompt_Injection", ibmRule: "IBM-LLM-PROMPT-231" },
      { code: "LLM05-OUTPUT-TO-EVAL", name: "LLM05: LLM Completion Output Passed Directly to eval() / exec()", languages: ["Python", "TypeScript", "Node.js"], fastTokens: ["choices[0]", "eval(", "exec("], pattern: "(?:eval|exec)\\s*\\([^)]*choices\\[0\\]", cxQuery: "GenAI_Security/LLM_Output_Eval_RCE", ibmRule: "IBM-LLM-EVAL-232" },
      { code: "LLM05-OUTPUT-TO-SQL", name: "LLM05: Unvalidated Text-to-SQL LLM Output Executed Against Database", languages: ["Python", "TypeScript", "Node.js"], fastTokens: ["execute(", "llm_sql", "generated_sql"], pattern: "(?:execute|query)\\s*\\(\\s*(?:llm_sql|generated_sql|sql_response)", cxQuery: "GenAI_Security/Text_To_SQL_Unvalidated_Execution", ibmRule: "IBM-LLM-SQL-233" },
      { code: "LLM05-OUTPUT-TO-SHELL", name: "LLM05: Agent Tool Executes Shell Command from Raw LLM Output", languages: ["Python", "TypeScript"], fastTokens: ["subprocess", "llm_command"], pattern: "subprocess\\.(?:run|Popen)\\s*\\(\\s*llm_", cxQuery: "GenAI_Security/Agent_Shell_Tool_Unrestricted", ibmRule: "IBM-LLM-SHELL-234" },
      { code: "LLM06-EXCESSIVE-AGENCY", name: "LLM06: LangChain allow_dangerous_code=True Enabled on Agent", languages: ["Python"], fastTokens: ["allow_dangerous_code", "palchain", "create_pandas_dataframe_agent"], pattern: "allow_dangerous_code\\s*=\\s*True", cxQuery: "GenAI_Security/LangChain_Allow_Dangerous_Code", ibmRule: "IBM-LLM-AGENT-235" },
      { code: "LLM06-PYTHON-REPL-TOOL", name: "LLM06: Unrestricted PythonREPLTool Attached to Autonomous Agent", languages: ["Python"], fastTokens: ["pythonrepltool"], pattern: "PythonREPLTool\\s*\\(\\)", cxQuery: "GenAI_Security/Unrestricted_PythonREPLTool", ibmRule: "IBM-LLM-REPL-236" },
      { code: "LLM06-BASH-TOOL", name: "LLM06: Unrestricted ShellTool / BashProcess Exposed to LLM Agent", languages: ["Python", "TypeScript"], fastTokens: ["shelltool("], pattern: "ShellTool\\s*\\(\\)", cxQuery: "GenAI_Security/Unrestricted_ShellTool", ibmRule: "IBM-LLM-BASH-237" },
      { code: "LLM04-MODEL-TRUST-REMOTE", name: "LLM04: HuggingFace from_pretrained(trust_remote_code=True) RCE Risk", languages: ["Python"], fastTokens: ["trust_remote_code"], pattern: "trust_remote_code\\s*=\\s*True", cxQuery: "GenAI_SupplyChain/HuggingFace_Trust_Remote_Code", ibmRule: "IBM-LLM-HF-238" },
      { code: "LLM04-TORCH-LOAD-UNSAFE", name: "LLM04: PyTorch torch.load() Without weights_only=True Pickle RCE", languages: ["Python"], fastTokens: ["torch.load("], pattern: "torch\\.load\\s*\\([^)]*(?!weights_only\\s*=\\s*True)\\)", cxQuery: "GenAI_SupplyChain/PyTorch_Unsafe_Load", ibmRule: "IBM-LLM-TORCH-239" },
      { code: "LLM10-UNBOUNDED-TOKENS", name: "LLM10: LLM Completion Request Without max_tokens / Timeout Cap", languages: ["Python", "TypeScript"], fastTokens: ["chat.completions.create"], pattern: "chat\\.completions\\.create\\s*\\(\\s*\\{(?![^}]*max_tokens)", cxQuery: "GenAI_Availability/Missing_Max_Tokens_Limit", ibmRule: "IBM-LLM-DOS-240" },
      { code: "LLM02-PII-IN-PROMPT", name: "LLM02: Unredacted SSN / Credit Card / Password Sent to External LLM API", languages: ["Python", "TypeScript"], fastTokens: ["ssn", "credit_card", "completions.create"], pattern: "completions\\.create\\s*\\([^)]*(?:ssn|credit_card|password)", cxQuery: "GenAI_Privacy/PII_Sent_To_External_LLM", ibmRule: "IBM-LLM-PII-241" },
      { code: "LLM08-VECTOR-NO-TENANT", name: "LLM08: Vector DB Similarity Search Missing Tenant/User Metadata Filter", languages: ["Python", "TypeScript"], fastTokens: ["similarity_search("], pattern: "similarity_search\\s*\\(\\s*query\\s*\\)", cxQuery: "GenAI_RAG/Vector_Search_Missing_Tenant_Filter", ibmRule: "IBM-LLM-RAG-242" },
      { code: "LLM07-SYSTEM-PROMPT-LEAK", name: "LLM07: API Secrets Embedded Directly Inside LLM System Prompt", languages: ["Python", "TypeScript"], fastTokens: ["system_prompt"], pattern: "system_prompt\\s*=\\s*[\"'][^\"']*(?:sk-|AKIA|password)", cxQuery: "GenAI_Security/Secret_In_System_Prompt", ibmRule: "IBM-LLM-SYSLEAK-243" },
      { code: "LLM05-MARKDOWN-XSS", name: "LLM05: Raw LLM Markdown Rendered with rehypeRaw / dangerouslySetInnerHTML", languages: ["TypeScript", "Node.js"], fastTokens: ["rehyperaw"], pattern: "rehypePlugins=\\{\\[.*rehypeRaw", cxQuery: "GenAI_Security/LLM_Markdown_XSS", ibmRule: "IBM-LLM-MDXSS-244" },
      { code: "LLM03-PICKLE-MODEL-FILE", name: "LLM03: Loading Untrusted joblib.load() / keras Lambda Layer Model", languages: ["Python"], fastTokens: ["joblib.load("], pattern: "joblib\\.load\\s*\\(", cxQuery: "GenAI_SupplyChain/Joblib_Unsafe_Model_Load", ibmRule: "IBM-LLM-JOBLIB-245" },
      { code: "LLM06-MCP-UNVALIDATED-TOOL", name: "LLM06: MCP Tool Handler Executing File/DB Action Without Schema Validation", languages: ["TypeScript", "Python"], fastTokens: ["calltoolrequestschema"], pattern: "CallToolRequestSchema.*(?<!parse\\()", cxQuery: "GenAI_MCP/Unvalidated_Tool_Arguments", ibmRule: "IBM-LLM-MCP-246" },
      { code: "LLM01-INDIRECT-RAG-HTML", name: "LLM01: Indirect Prompt Injection via Unstripped Web Page HTML in RAG Context", languages: ["Python", "TypeScript"], fastTokens: ["beautifulsoup", "rag_context"], pattern: "rag_context\\s*\\+=\\s*response\\.text", cxQuery: "GenAI_RAG/Indirect_Prompt_Injection_Raw_HTML", ibmRule: "IBM-LLM-INDIR-247" },
      { code: "LLM09-NO-GROUNDING-CHECK", name: "LLM09: High-Risk Automated Action Triggered by LLM Without Human-in-the-Loop", languages: ["Python", "TypeScript"], fastTokens: ["auto_approve=true"], pattern: "auto_approve\\s*=\\s*True", cxQuery: "GenAI_Governance/Missing_Human_In_The_Loop", ibmRule: "IBM-LLM-HITL-248" },
      { code: "LLM02-TRAINING-LOG-SENSITIVE", name: "LLM02: Fine-Tuning Dataset Export Includes Unmasked Customer Credentials", languages: ["Python"], fastTokens: ["jsonl", "fine_tuning"], pattern: "fine_tuning\\.jobs\\.create", cxQuery: "GenAI_Privacy/Unmasked_FineTuning_Dataset", ibmRule: "IBM-LLM-FT-249" },
      { code: "LLM10-RECURSIVE-AGENT-LOOP", name: "LLM10: Autonomous Agent Loop Without max_iterations Guard", languages: ["Python", "TypeScript"], fastTokens: ["agentexecutor("], pattern: "AgentExecutor\\s*\\((?![^)]*max_iterations)", cxQuery: "GenAI_Availability/Unbounded_Agent_Iterations", ibmRule: "IBM-LLM-LOOP-250" },
      { code: "LLM05-SSRF-TOOL-FETCH", name: "LLM06: LLM Web-Browsing Tool Allows Requests to Internal RFC1918 IPs", languages: ["Python", "TypeScript"], fastTokens: ["requestsgettool"], pattern: "RequestsGetTool\\s*\\(\\s*\\)", cxQuery: "GenAI_Security/RequestsGetTool_SSRF", ibmRule: "IBM-LLM-SSRF-251" },
      { code: "LLM04-ONNX-EXTERNAL-DATA", name: "LLM04: ONNX Model External Data Path Traversal", languages: ["Python"], fastTokens: ["onnx.load("], pattern: "onnx\\.load\\s*\\([^)]*load_external_data\\s*=\\s*True", cxQuery: "GenAI_SupplyChain/ONNX_External_Data_Traversal", ibmRule: "IBM-LLM-ONNX-252" },
      { code: "LLM01-JAILBREAK-ROLE-OVERRIDE", name: "LLM01: Chat History Accepts Client-Supplied 'system' Role Messages", languages: ["TypeScript", "Python"], fastTokens: ["messages: req.body.messages"], pattern: "messages\\s*:\\s*req\\.body\\.messages", cxQuery: "GenAI_Security/Client_Controlled_System_Role", ibmRule: "IBM-LLM-ROLE-253" },
      { code: "LLM05-SVG-SCRIPT-OUTPUT", name: "LLM05: LLM-Generated SVG Rendered Inline Without Script Stripping", languages: ["TypeScript", "Node.js"], fastTokens: ["<svg", "llm"], pattern: "dangerouslySetInnerHTML.*svg", cxQuery: "GenAI_Security/LLM_SVG_XSS", ibmRule: "IBM-LLM-SVG-254" },
      { code: "LLM02-EMBEDDING-CACHE-SHARED", name: "LLM02: Semantic Cache Shared Across Tenants Without Namespace Isolation", languages: ["Python", "TypeScript"], fastTokens: ["gptcache", "redissemanticcache"], pattern: "RedisSemanticCache\\s*\\(", cxQuery: "GenAI_Privacy/Cross_Tenant_Semantic_Cache", ibmRule: "IBM-LLM-CACHE-255" },
    ],
  },

  // 12. Cloud, IaC, Docker, Kubernetes & Terraform Hardening (CISA / NSA / CIS) (30 Plugins)
  {
    category: "Cloud, IaC, Docker & K8s (CISA/NSA)",
    cwe: "CWE-250",
    cweName: "Execution with Unnecessary Privileges & Cloud Infrastructure Misconfiguration (CWE-16)",
    owasp: "A05:2021 · Security Misconfiguration",
    asvs: "ASVS V14.1.1",
    nist80053: "CM-6 · Configuration Settings & AC-6 Least Privilege",
    nistSsdf: "PW.1.3 · Hardened Defaults",
    pciDss: "PCI-DSS v4.0 Req 2.2.1",
    iso27001: "ISO 27001 A.8.9",
    mitreAttack: "T1611 (Escape to Host)",
    fortifyKingdom: "Environment",
    fortifyAnalyzer: "Configuration",
    severity: "High",
    cvss: 7.9,
    epss: 0.112,
    sanitizerHint: "runAsNonRoot: true / readOnlyRootFilesystem: true / least-privilege IAM",
    remediationSummary: "Enforce non-root container execution, drop Linux capabilities, restrict security group ingress, and encrypt cloud storage.",
    variants: [
      { code: "IAC-K8S-PRIVILEGED", name: "Kubernetes Pod securityContext privileged: true Container Escape Risk", languages: ["Go", "Python", "Node.js"], fastTokens: ["privileged:"], pattern: "privileged\\s*:\\s*true", cxQuery: "K8s_Security/Privileged_Container", ibmRule: "IBM-K8S-PRIV-256" },
      { code: "IAC-K8S-ALLOW-PRIV-ESC", name: "Kubernetes allowPrivilegeEscalation: true Enabled", languages: ["Go", "Python"], fastTokens: ["allowprivilegeescalation"], pattern: "allowPrivilegeEscalation\\s*:\\s*true", cxQuery: "K8s_Security/AllowPrivilegeEscalation_True", ibmRule: "IBM-K8S-ESC-257" },
      { code: "IAC-K8S-RUNASROOT", name: "Kubernetes Container Running as Root UID 0 (runAsUser: 0)", languages: ["Go", "Python"], fastTokens: ["runasuser:"], pattern: "runAsUser\\s*:\\s*0\\b", cxQuery: "K8s_Security/RunAsUser_Root", ibmRule: "IBM-K8S-ROOT-258" },
      { code: "IAC-K8S-HOSTNETWORK", name: "Kubernetes Pod Sharing Host Network / PID / IPC Namespace", languages: ["Go", "Python"], fastTokens: ["hostnetwork:", "hostpid:", "hostipc:"], pattern: "(?:hostNetwork|hostPID|hostIPC)\\s*:\\s*true", cxQuery: "K8s_Security/Host_Namespace_Sharing", ibmRule: "IBM-K8S-HOST-259" },
      { code: "IAC-K8S-DOCKER-SOCK", name: "Kubernetes HostPath Mounts /var/run/docker.sock", languages: ["Go", "Python"], fastTokens: ["docker.sock"], pattern: "/var/run/docker\\.sock", cxQuery: "K8s_Security/Docker_Socket_Mount", ibmRule: "IBM-K8S-SOCK-260" },
      { code: "IAC-K8S-CAP-SYS-ADMIN", name: "Kubernetes Container Grants CAP_SYS_ADMIN / ALL Linux Capability", languages: ["Go", "Python"], fastTokens: ["sys_admin"], pattern: "-\\s*[\"']?(?:SYS_ADMIN|NET_ADMIN|ALL)[\"']?", cxQuery: "K8s_Security/Dangerous_Linux_Capabilities", ibmRule: "IBM-K8S-CAP-261" },
      { code: "IAC-K8S-RBAC-WILDCARD", name: "Kubernetes ClusterRole Grants Wildcard '*' Verbs or Resources", languages: ["Go", "Python"], fastTokens: ["verbs:", "resources:"], pattern: "(?:verbs|resources)\\s*:\\s*\\[\\s*[\"']\\*[\"']\\s*\\]", cxQuery: "K8s_RBAC/ClusterRole_Wildcard", ibmRule: "IBM-K8S-RBAC-262" },
      { code: "IAC-DOCKER-USER-ROOT", name: "Dockerfile Explicitly Sets USER root or Uses :latest Tag", languages: ["Python", "Node.js", "Go"], fastTokens: ["user root", "from "], pattern: "(?:^USER\\s+root\\b|^FROM\\s+\\S+:latest\\b)", cxQuery: "Dockerfile_Security/User_Root_Or_Latest", ibmRule: "IBM-DOCK-ROOT-263" },
      { code: "IAC-DOCKER-CURL-BASH", name: "Dockerfile Pipes Remote Script Directly to Shell (curl | sh)", languages: ["Python", "Node.js"], fastTokens: ["curl", "| sh", "| bash"], pattern: "(?:curl|wget)\\s+[^|]+\\|\\s*(?:sh|bash)", cxQuery: "Dockerfile_Security/Curl_Pipe_Bash", ibmRule: "IBM-DOCK-CURL-264" },
      { code: "IAC-DOCKER-ENV-SECRET", name: "Dockerfile Bake-in Secret in ENV / ARG Instruction", languages: ["Python", "Node.js"], fastTokens: ["env ", "arg "], pattern: "^(?:ENV|ARG)\\s+\\w*(?:SECRET|PASSWORD|API_KEY|TOKEN)\\s*=", cxQuery: "Dockerfile_Security/Secret_In_ENV_ARG", ibmRule: "IBM-DOCK-ENV-265" },
      { code: "IAC-TF-S3-PUBLIC-ACL", name: "Terraform AWS S3 Bucket ACL Set to public-read / public-read-write", languages: ["Go", "Python"], fastTokens: ["public-read"], pattern: "acl\\s*=\\s*[\"']public-read(?:-write)?[\"']", cxQuery: "Terraform_AWS/S3_Public_ACL", ibmRule: "IBM-TF-S3-266" },
      { code: "IAC-TF-SG-OPEN-INGRESS", name: "Terraform Security Group Allows 0.0.0.0/0 Ingress on SSH/RDP (22/3389)", languages: ["Go", "Python"], fastTokens: ["0.0.0.0/0"], pattern: "cidr_blocks\\s*=\\s*\\[\\s*[\"']0\\.0\\.0\\.0/0[\"']\\s*\\]", cxQuery: "Terraform_AWS/Open_Security_Group_Ingress", ibmRule: "IBM-TF-SG-267" },
      { code: "IAC-TF-RDS-PUBLIC", name: "Terraform AWS RDS Database Instance publicly_accessible = true", languages: ["Go", "Python"], fastTokens: ["publicly_accessible"], pattern: "publicly_accessible\\s*=\\s*true", cxQuery: "Terraform_AWS/RDS_Publicly_Accessible", ibmRule: "IBM-TF-RDS-268" },
      { code: "IAC-TF-EBS-UNENCRYPTED", name: "Terraform AWS EBS / RDS Storage encrypted = false", languages: ["Go", "Python"], fastTokens: ["encrypted"], pattern: "(?:encrypted|storage_encrypted)\\s*=\\s*false", cxQuery: "Terraform_AWS/Storage_Unencrypted", ibmRule: "IBM-TF-ENC-269" },
      { code: "IAC-TF-IAM-WILDCARD", name: "Terraform IAM Policy Grants Action: '*' and Resource: '*'", languages: ["Go", "Python"], fastTokens: ["\"action\"", "\"*\""], pattern: "\"Action\"\\s*:\\s*\"\\*\"", cxQuery: "Terraform_AWS/IAM_Star_Action", ibmRule: "IBM-TF-IAM-270" },
      { code: "IAC-TF-KMS-ROTATION", name: "Terraform AWS KMS Key enable_key_rotation = false", languages: ["Go", "Python"], fastTokens: ["enable_key_rotation"], pattern: "enable_key_rotation\\s*=\\s*false", cxQuery: "Terraform_AWS/KMS_Rotation_Disabled", ibmRule: "IBM-TF-KMS-271" },
      { code: "IAC-TF-CLOUDTRAIL-OFF", name: "Terraform AWS CloudTrail enable_logging = false", languages: ["Go", "Python"], fastTokens: ["enable_logging"], pattern: "enable_logging\\s*=\\s*false", cxQuery: "Terraform_AWS/CloudTrail_Disabled", ibmRule: "IBM-TF-TRAIL-272" },
      { code: "IAC-TF-IMDSV1", name: "Terraform AWS EC2 http_tokens = 'optional' Allows IMDSv1 SSRF", languages: ["Go", "Python"], fastTokens: ["http_tokens"], pattern: "http_tokens\\s*=\\s*[\"']optional[\"']", cxQuery: "Terraform_AWS/EC2_IMDSv1_Allowed", ibmRule: "IBM-TF-IMDS-273" },
      { code: "IAC-GCP-PUBLIC-BUCKET", name: "GCP Storage IAM Binding Grants allUsers / allAuthenticatedUsers", languages: ["Go", "Python"], fastTokens: ["allusers", "allauthenticatedusers"], pattern: "[\"'](?:allUsers|allAuthenticatedUsers)[\"']", cxQuery: "Terraform_GCP/GCS_Public_Bucket", ibmRule: "IBM-TF-GCP-274" },
      { code: "IAC-AZURE-HTTP-TRAFFIC", name: "Azure Storage Account enable_https_traffic_only = false", languages: ["Go", "C#"], fastTokens: ["enable_https_traffic_only"], pattern: "enable_https_traffic_only\\s*=\\s*false", cxQuery: "Terraform_Azure/Storage_HTTPS_Disabled", ibmRule: "IBM-TF-AZ-275" },
      { code: "IAC-SPRING-ACTUATOR-ALL", name: "Spring Boot Actuator management.endpoints.web.exposure.include=*", languages: ["Java"], fastTokens: ["exposure.include"], pattern: "management\\.endpoints\\.web\\.exposure\\.include\\s*=\\s*\\*", cxQuery: "Java_Spring/Actuator_Wildcard_Exposure", ibmRule: "IBM-CFG-ACT-276" },
      { code: "IAC-EXPRESS-TRUST-PROXY", name: "Express app.set('trust proxy', true) IP Spoofing Risk", languages: ["Node.js", "TypeScript"], fastTokens: ["trust proxy"], pattern: "set\\s*\\(\\s*[\"']trust proxy[\"']\\s*,\\s*true\\s*\\)", cxQuery: "Node_Express/Trust_Proxy_True", ibmRule: "IBM-CFG-PROXY-277" },
      { code: "IAC-DJANGO-ALLOWED-HOSTS", name: "Django ALLOWED_HOSTS = ['*'] Host Header Poisoning Risk", languages: ["Python"], fastTokens: ["allowed_hosts"], pattern: "ALLOWED_HOSTS\\s*=\\s*\\[\\s*[\"']\\*[\"']\\s*\\]", cxQuery: "Python_Django/Allowed_Hosts_Wildcard", ibmRule: "IBM-CFG-DJHOST-278" },
      { code: "IAC-PHP-DISPLAY-ERRORS", name: "PHP ini_set('display_errors', 1) Stack Trace Disclosure (CWE-209)", languages: ["PHP"], fastTokens: ["display_errors"], pattern: "ini_set\\s*\\(\\s*[\"']display_errors[\"']\\s*,\\s*[\"']?(?:1|On|true)", cxQuery: "PHP_Config/Display_Errors_Enabled", ibmRule: "IBM-CFG-PHPERR-279" },
      { code: "IAC-GRAPHQL-DEPTH-LIMIT", name: "GraphQL Server Instantiated Without Query Depth Limit (DoS)", languages: ["Node.js", "TypeScript"], fastTokens: ["apolloserver("], pattern: "new\\s+ApolloServer\\s*\\(\\s*\\{(?![^}]*validationRules)", cxQuery: "API_GraphQL/Missing_Depth_Limit", ibmRule: "IBM-CFG-GQLDOS-280" },
      { code: "IAC-GHA-PULL-REQUEST-TARGET", name: "GitHub Actions pull_request_target Checkout of Untrusted PR Head", languages: ["Node.js", "Python"], fastTokens: ["pull_request_target"], pattern: "pull_request_target", cxQuery: "CICD_GitHubActions/Pull_Request_Target_Risk", ibmRule: "IBM-CICD-PRT-281" },
      { code: "IAC-GHA-PERMISSIONS-WRITEALL", name: "GitHub Actions Workflow permissions: write-all Over-Privileged Token", languages: ["Node.js", "Python"], fastTokens: ["write-all"], pattern: "permissions\\s*:\\s*write-all", cxQuery: "CICD_GitHubActions/Permissions_Write_All", ibmRule: "IBM-CICD-PERM-282" },
      { code: "IAC-NPM-IGNORE-SCRIPTS", name: "CI Pipeline npm install Without --ignore-scripts Supply Chain Risk", languages: ["Node.js"], fastTokens: ["npm install"], pattern: "npm\\s+install(?!.*--ignore-scripts)\\s+--unsafe-perm", cxQuery: "CICD_SupplyChain/NPM_Unsafe_Perm", ibmRule: "IBM-CICD-NPM-283" },
      { code: "IAC-PIP-TRUSTED-HOST", name: "Python pip install --trusted-host Bypassing TLS Package Verification", languages: ["Python"], fastTokens: ["--trusted-host"], pattern: "pip\\s+install.*--trusted-host", cxQuery: "CICD_SupplyChain/Pip_Trusted_Host_Bypass", ibmRule: "IBM-CICD-PIP-284" },
      { code: "IAC-CURL-INSECURE-K", name: "Shell Script Invokes curl -k / --insecure Disabling TLS Verification", languages: ["Python", "Node.js", "Go"], fastTokens: ["curl -k", "curl --insecure"], pattern: "\\bcurl\\s+(?:-k\\b|--insecure\\b)", cxQuery: "Infra_Script/Curl_Insecure_Flag", ibmRule: "IBM-CICD-CURL-285" },
    ],
  },

  // 13. SEI CERT, Memory Safety, Concurrency, ReDoS & Resource Management (35 Plugins)
  {
    category: "SEI CERT & Concurrency / Memory",
    cwe: "CWE-400",
    cweName: "Uncontrolled Resource Consumption, ReDoS (CWE-1333), Race Conditions (CWE-362) & Memory Safety (CWE-120)",
    owasp: "A04:2021 · Insecure Design / API4:2023 Resource Consumption",
    asvs: "ASVS V11.1.4 & V5.1.3",
    nist80053: "SC-5 · Denial-of-Service Protection & SI-16 Memory Protection",
    nistSsdf: "PW.8.1 · Secure Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1499 (Endpoint Denial of Service)",
    fortifyKingdom: "Time and State",
    fortifyAnalyzer: "Control Flow",
    severity: "Medium",
    cvss: 6.5,
    epss: 0.058,
    sanitizerHint: "RE2 Linear-Time Regex / Bounded Buffers / Atomic Locks / Request Timeouts",
    remediationSummary: "Prevent dynamic regex construction on user input, bound all network/file reads, and use memory-safe APIs.",
    variants: [
      { code: "CERT-REDOS-DYNAMIC-REGEX", name: "Dynamic RegExp(userInput) Construction Enabling ReDoS (CWE-1333)", languages: ["Node.js", "TypeScript", "Java", "Python"], fastTokens: ["new regexp(", "re.compile("], pattern: "(?:new\\s+RegExp|re\\.compile|Pattern\\.compile)\\s*\\(\\s*(?:req\\.|request\\.|params|query)", cxQuery: "Resource_DoS/Dynamic_RegExp_ReDoS", ibmRule: "IBM-CERT-REDOS-286" },
      { code: "CERT-REDOS-EVIL-NESTED", name: "Catastrophic Backtracking Nested Quantifier Regex ((a+)+)", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["+)+", "*)*"], pattern: "\\([^)]*[+*]\\)[+*]", cxQuery: "Resource_DoS/Evil_Regex_Backtracking", ibmRule: "IBM-CERT-REDOS-287" },
      { code: "CERT-TOCTOU-FILE-ACCESS", name: "Time-of-Check Time-of-Use (TOCTOU) fs.existsSync Followed by fs.open (CWE-367)", languages: ["Node.js", "Python"], fastTokens: ["existssync(", "os.path.exists("], pattern: "(?:fs\\.existsSync|os\\.path\\.exists)\\s*\\(", cxQuery: "Concurrency/TOCTOU_File_Race", ibmRule: "IBM-CERT-TOCTOU-288" },
      { code: "CERT-JAVA-THREAD-STOP", name: "SEI CERT THI05-J: Deprecated Thread.stop() / Thread.suspend() Unlocks Monitors", languages: ["Java"], fastTokens: [".stop()", ".suspend()"], pattern: "Thread.*\\.(?:stop|suspend)\\s*\\(\\)", cxQuery: "Java_CERT/Thread_Stop_Suspend", ibmRule: "IBM-CERT-THR-289" },
      { code: "CERT-JAVA-NULLCIPHER", name: "SEI CERT MSC61-J: javax.crypto.NullCipher Provides Zero Encryption", languages: ["Java"], fastTokens: ["nullcipher"], pattern: "new\\s+NullCipher\\s*\\(\\)", cxQuery: "Java_CERT/NullCipher_Usage", ibmRule: "IBM-CERT-NULLC-290" },
      { code: "CERT-JAVA-SYSTEM-EXIT", name: "Servlet / Controller Invokes System.exit() Terminating JVM Process (CWE-382)", languages: ["Java"], fastTokens: ["system.exit("], pattern: "System\\.exit\\s*\\(", cxQuery: "Java_CERT/System_Exit_In_WebApp", ibmRule: "IBM-CERT-EXIT-291" },
      { code: "CERT-JAVA-FINALIZE", name: "SEI CERT MET12-J: Relying on Object.finalize() for Security Cleanup", languages: ["Java"], fastTokens: ["protected void finalize("], pattern: "protected\\s+void\\s+finalize\\s*\\(\\s*\\)", cxQuery: "Java_CERT/Object_Finalize_Override", ibmRule: "IBM-CERT-FIN-292" },
      { code: "CERT-JAVA-REFLECTION-FORNAME", name: "Unsafe Reflection Class.forName(userInput) Arbitrary Class Instantiation (CWE-470)", languages: ["Java"], fastTokens: ["class.forname("], pattern: "Class\\.forName\\s*\\(\\s*(?:request|req|param|className)", cxQuery: "Java_High_Risk/Unsafe_Reflection", ibmRule: "IBM-CERT-REFL-293" },
      { code: "CERT-JAVA-JNI-LOADLIBRARY", name: "Untrusted Native Library Load via System.load() / loadLibrary()", languages: ["Java"], fastTokens: ["system.load(", "system.loadlibrary("], pattern: "System\\.load(?:Library)?\\s*\\(\\s*[^\"')\\s]", cxQuery: "Java_CERT/Untrusted_JNI_Load", ibmRule: "IBM-CERT-JNI-294" },
      { code: "CERT-PY-ASSERT-AUTH", name: "Python assert Used for Security Check (Stripped Under python -O)", languages: ["Python"], fastTokens: ["assert "], pattern: "^\\s*assert\\s+(?:user|request|auth|is_admin|permission)", cxQuery: "Python_CERT/Assert_Used_For_Auth", ibmRule: "IBM-CERT-PYASS-295" },
      { code: "CERT-PY-TEMPFILE-MKTEMP", name: "Python tempfile.mktemp() Insecure Temporary File Race Condition (CWE-377)", languages: ["Python"], fastTokens: ["tempfile.mktemp"], pattern: "tempfile\\.mktemp\\s*\\(", cxQuery: "Python_CERT/Insecure_Tempfile_Mktemp", ibmRule: "IBM-CERT-TMP-296" },
      { code: "CERT-PY-XML-BOMB", name: "Python xml.etree.ElementTree Used Without defusedxml (Billion Laughs CWE-776)", languages: ["Python"], fastTokens: ["xml.etree.elementtree"], pattern: "import\\s+xml\\.etree\\.ElementTree", cxQuery: "Python_XML/Non_Defused_ElementTree", ibmRule: "IBM-CERT-XMLB-297" },
      { code: "CERT-NODE-BUFFER-ALLOCUNSAFE", name: "Node.js Buffer.allocUnsafe() / new Buffer() Uninitialized Memory Leak (CWE-908)", languages: ["Node.js", "TypeScript"], fastTokens: ["buffer.allocunsafe", "new buffer("], pattern: "(?:Buffer\\.allocUnsafe|new\\s+Buffer)\\s*\\(", cxQuery: "JS_Memory/Buffer_AllocUnsafe", ibmRule: "IBM-CERT-BUF-298" },
      { code: "CERT-NODE-PROCESS-EXIT", name: "Express Route Handler Calls process.exit() Causing Denial of Service", languages: ["Node.js", "TypeScript"], fastTokens: ["process.exit("], pattern: "process\\.exit\\s*\\(", cxQuery: "JS_Availability/Process_Exit_In_Handler", ibmRule: "IBM-CERT-NEXIT-299" },
      { code: "CERT-GO-UNSAFE-POINTER", name: "Go unsafe.Pointer() Bypassing Type and Memory Safety", languages: ["Go"], fastTokens: ["unsafe.pointer"], pattern: "unsafe\\.Pointer\\s*\\(", cxQuery: "Go_Memory/Unsafe_Pointer_Cast", ibmRule: "IBM-CERT-GOPTR-300" },
      { code: "CERT-GO-HTTP-NO-TIMEOUT", name: "Go http.ListenAndServe() Default Server Without ReadHeaderTimeout (Slowloris)", languages: ["Go"], fastTokens: ["http.listenandserve("], pattern: "http\\.ListenAndServe\\s*\\(", cxQuery: "Go_Availability/ListenAndServe_No_Timeout", ibmRule: "IBM-CERT-GOSRV-301" },
      { code: "CERT-GO-GOROUTINE-LEAK", name: "Go io.ReadAll(r.Body) Without http.MaxBytesReader Memory Exhaustion", languages: ["Go"], fastTokens: ["io.readall(r.body)", "ioutil.readall(r.body)"], pattern: "(?:io|ioutil)\\.ReadAll\\s*\\(\\s*r\\.Body\\s*\\)", cxQuery: "Go_Availability/Unbounded_Body_ReadAll", ibmRule: "IBM-CERT-GOREAD-302" },
      { code: "CERT-CS-UNSAFE-FIXED", name: "C# unsafe / fixed Pointer Block Disabling CLR Memory Safety", languages: ["C#"], fastTokens: ["unsafe {", "fixed ("], pattern: "\\b(?:unsafe\\s*\\{|fixed\\s*\\(\\s*\\w+\\*)", cxQuery: "CSharp_Memory/Unsafe_Pointer_Block", ibmRule: "IBM-CERT-CSMEM-303" },
      { code: "CERT-C-STRCPY-SPRINTF", name: "C/C++ Native Addon strcpy() / gets() / sprintf() Classic Buffer Overflow (CWE-120)", languages: ["Java", "Python", "Node.js"], fastTokens: ["strcpy(", "sprintf(", "gets("], pattern: "\\b(?:strcpy|strcat|sprintf|gets)\\s*\\(", cxQuery: "CPP_Memory/Classic_Buffer_Overflow", ibmRule: "IBM-CERT-BOF-304" },
      { code: "CERT-FORMAT-STRING", name: "Uncontrolled Format String Passed as First Argument to printf / syslog (CWE-134)", languages: ["Python", "Go", "Java"], fastTokens: ["printf(", "fmt.printf("], pattern: "fmt\\.Printf\\s*\\(\\s*(?:req|user|input)", cxQuery: "Format_String/Uncontrolled_Format_Spec", ibmRule: "IBM-CERT-FMT-305" },
      { code: "CERT-INTEGER-OVERFLOW-ALLOC", name: "Unchecked Integer Multiplication in Buffer Allocation Size (CWE-190)", languages: ["Java", "C#", "Go"], fastTokens: ["new byte["], pattern: "new\\s+byte\\s*\\[\\s*\\w+\\s*\\*\\s*\\w+\\s*\\]", cxQuery: "Memory_Safety/Integer_Overflow_Allocation", ibmRule: "IBM-CERT-INTOV-306" },
      { code: "CERT-DIVIDE-BY-ZERO", name: "Unchecked User Parameter Used as Divisor (CWE-369)", languages: ["Java", "Python", "Node.js", "Go"], fastTokens: ["/ req.", "/ request."], pattern: "/\\s*(?:req\\.|request\\.)", cxQuery: "Reliability/Divide_By_Zero_User_Input", ibmRule: "IBM-CERT-DIV0-307" },
      { code: "CERT-EMPTY-CATCH-BLOCK", name: "Empty catch {} Exception Block Swallowing Security Failures (CWE-390)", languages: ["Java", "TypeScript", "Node.js", "C#"], fastTokens: ["catch (", "catch("], pattern: "catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}", cxQuery: "Code_Quality/Empty_Catch_Block", ibmRule: "IBM-CERT-CATCH-308" },
      { code: "CERT-PY-BARE-EXCEPT", name: "Python Bare except: pass Swallowing System & Auth Exceptions", languages: ["Python"], fastTokens: ["except:"], pattern: "except\\s*:\\s*pass", cxQuery: "Python_Quality/Bare_Except_Pass", ibmRule: "IBM-CERT-PYEXC-309" },
      { code: "CERT-ZIP-BOMB-UNBOUNDED", name: "Decompression Stream (zlib / GZIPInputStream) Without Output Byte Limit (CWE-409)", languages: ["Java", "Node.js", "Python"], fastTokens: ["gzipinputstream", "zlib.unzip"], pattern: "(?:new\\s+GZIPInputStream|zlib\\.(?:unzip|gunzipSync))\\s*\\(", cxQuery: "Resource_DoS/ZipBomb_Decompression", ibmRule: "IBM-CERT-ZBOMB-310" },
      { code: "CERT-UNBOUNDED-PAGINATION", name: "API4:2023 Database Query Uses Uncapped req.query.limit (DoS)", languages: ["Node.js", "TypeScript", "Python"], fastTokens: [".limit(req.query", ".limit(Number(req"], pattern: "\\.limit\\s*\\(\\s*(?:Number\\s*\\()?req\\.query\\.limit", cxQuery: "API_Security/Unbounded_Pagination_Limit", ibmRule: "IBM-API-LIMIT-311" },
      { code: "CERT-MASS-EMAIL-SMS", name: "API4:2023 Email/SMS Trigger Route Without Rate-Limiting Guard", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["sendemail(", "sendsms("], pattern: "(?:sendEmail|sendSms|transporter\\.sendMail)\\s*\\(\\s*\\{\\s*to\\s*:\\s*req\\.body", cxQuery: "API_Security/Unthrottled_Notification_Trigger", ibmRule: "IBM-API-SPAM-312" },
      { code: "CERT-WEBSOCKET-NO-ORIGIN", name: "WebSocket Server Accepts Upgrade Without Checking Origin Header (CSWSH)", languages: ["Node.js", "TypeScript", "Go"], fastTokens: ["websocketserver", "upgrader{"], pattern: "(?:new\\s+WebSocketServer|CheckOrigin\\s*:\\s*func.*return\\s+true)", cxQuery: "WebSocket_Security/Missing_Origin_Check", ibmRule: "IBM-WS-CSWSH-313" },
      { code: "CERT-MULTER-NO-LIMITS", name: "Express Multer Upload Middleware Initialized Without File Size Limits", languages: ["Node.js", "TypeScript"], fastTokens: ["multer({"], pattern: "multer\\s*\\(\\s*\\{(?![^}]*limits)", cxQuery: "API_Security/Upload_Missing_File_Size_Limit", ibmRule: "IBM-API-UPLIM-314" },
      { code: "CERT-REQUEST-NO-TIMEOUT", name: "Python requests.get/post Invoked Without timeout= Parameter (CWE-400)", languages: ["Python"], fastTokens: ["requests.get(", "requests.post("], pattern: "requests\\.(?:get|post)\\s*\\((?![^)]*timeout\\s*=)[^)]+\\)", cxQuery: "Python_Reliability/Requests_Missing_Timeout", ibmRule: "IBM-CERT-PYTMO-315" },
      { code: "CERT-JAVA-SOCKET-NOTIMEOUT", name: "Java new Socket() Without setSoTimeout() Thread Exhaustion Risk", languages: ["Java"], fastTokens: ["new socket("], pattern: "new\\s+Socket\\s*\\(", cxQuery: "Java_Reliability/Socket_Missing_Timeout", ibmRule: "IBM-CERT-JSOCK-316" },
      { code: "CERT-FLOAT-CURRENCY", name: "IEEE 754 Floating-Point (float/double) Used for Monetary Calculation (CWE-682)", languages: ["Java", "C#"], fastTokens: ["double price", "float amount", "double balance"], pattern: "\\b(?:double|float)\\s+(?:price|amount|balance|totalCost)\\b", cxQuery: "Business_Logic/Floating_Point_Currency", ibmRule: "IBM-CERT-FLOAT-317" },
      { code: "CERT-JAVA-STRING-EQ-CLASS", name: "SEI CERT OBJ09-J: Comparing Class Names by String Instead of Class Object", languages: ["Java"], fastTokens: ["getclass().getname().equals"], pattern: "getClass\\(\\)\\.getName\\(\\)\\.equals", cxQuery: "Java_CERT/Class_Name_String_Comparison", ibmRule: "IBM-CERT-OBJ09-318" },
      { code: "CERT-NODE-EVENTEMITTER-LEAK", name: "EventEmitter.setMaxListeners(0) Unlimited Listener Memory Exhaustion", languages: ["Node.js", "TypeScript"], fastTokens: ["setmaxlisteners(0)"], pattern: "setMaxListeners\\s*\\(\\s*0\\s*\\)", cxQuery: "JS_Memory/Unlimited_Event_Listeners", ibmRule: "IBM-CERT-EMIT-319" },
      { code: "CERT-GO-DEFER-IN-LOOP", name: "Go defer file.Close() Inside for Loop Exhausting File Descriptors", languages: ["Go"], fastTokens: ["defer "], pattern: "defer\\s+\\w+\\.Close\\(\\)", cxQuery: "Go_Resource/Defer_Close_Check", ibmRule: "IBM-CERT-GODEF-320" },
    ],
  },

  // 14. PCI-DSS v4.0, ISO 27001:2022, HIPAA, GDPR & Enterprise Governance (40 Plugins)
  {
    category: "PCI-DSS v4.0 & ISO 27001:2022",
    cwe: "CWE-312",
    cweName: "Cleartext Storage/Transmission of Sensitive Payment, PII & Healthcare Data (CWE-319 / CWE-359)",
    owasp: "A02:2021 & A04:2021 · Privacy & Data Protection",
    asvs: "ASVS V8.3.4 & V9.1.1",
    nist80053: "SC-28 · Protection of Information at Rest & AU-9 Audit Protection",
    nistSsdf: "PW.1.2 · Sensitive Data Protection",
    pciDss: "PCI-DSS v4.0 Req 3.3.1 & Req 3.5.1",
    iso27001: "ISO 27001 A.8.11 & A.8.12",
    mitreAttack: "T1005 (Data from Local System)",
    fortifyKingdom: "Security Features",
    fortifyAnalyzer: "Configuration",
    severity: "High",
    cvss: 7.8,
    epss: 0.088,
    sanitizerHint: "Field-level encryption / Tokenization / PCI PAN Masking / TLS 1.3",
    remediationSummary: "Never store CVV/CVC or unmasked PANs in logs, localStorage, or cleartext columns; enforce TLS 1.2+ and audit log integrity.",
    variants: [
      { code: "PCI-CVV-STORAGE", name: "PCI-DSS Req 3.3.1: Sensitive Card Verification Value (CVV/CVC) Persisted or Logged", languages: ["Java", "Python", "Node.js", "TypeScript", "PHP", "C#"], fastTokens: ["cvv", "cvc", "cardsecuritycode"], pattern: "(?:cvv|cvc|cardSecurityCode)\\s*[:=]", cxQuery: "PCI_DSS_v4/CVV_Storage_Or_Logging", ibmRule: "IBM-PCI-CVV-321" },
      { code: "PCI-PAN-LOGGING", name: "PCI-DSS Req 3.4: Unmasked Primary Account Number (cardNumber / pan) in Logs", languages: ["Java", "Python", "Node.js", "TypeScript"], fastTokens: ["cardnumber", "creditcard"], pattern: "(?:logger|console)\\.\\w+\\s*\\([^)]*(?:cardNumber|creditCard|pan\\b)", cxQuery: "PCI_DSS_v4/Unmasked_PAN_In_Logs", ibmRule: "IBM-PCI-PAN-322" },
      { code: "PCI-MAGSTRIPE-TRACK", name: "PCI-DSS Req 3.3.1: Magnetic Stripe Track Data (track1 / track2) Stored", languages: ["Java", "C#", "Python"], fastTokens: ["track1data", "track2data"], pattern: "\\btrack[12]Data\\b", cxQuery: "PCI_DSS_v4/Magnetic_Track_Data_Storage", ibmRule: "IBM-PCI-TRK-323" },
      { code: "PCI-TLS-10-11", name: "PCI-DSS Req 4.2.1: Deprecated SSLv3 / TLSv1.0 / TLSv1.1 Protocol Enabled", languages: ["Java", "Node.js", "Python", "Go", "C#"], fastTokens: ["tlsv1.1", "tlsv1", "sslv3"], pattern: "[\"'](?:SSLv3|TLSv1|TLSv1\\.0|TLSv1\\.1)[\"']", cxQuery: "PCI_DSS_v4/Deprecated_TLS_Version", ibmRule: "IBM-PCI-TLS-324" },
      { code: "PRIV-LOCALSTORAGE-TOKEN", name: "Sensitive JWT / Auth Token Stored in Browser localStorage (XSS Accessible)", languages: ["TypeScript", "Node.js"], fastTokens: ["localstorage.setitem", "sessionstorage.setitem"], pattern: "(?:localStorage|sessionStorage)\\.setItem\\s*\\(\\s*[\"'](?:token|jwt|access_token|id_token|secret)", cxQuery: "Client_Privacy/Token_In_LocalStorage", ibmRule: "IBM-PRIV-LS-325" },
      { code: "PRIV-SSN-CLEARTEXT", name: "PII Social Security Number (ssn / taxId) Logged or Returned Unmasked", languages: ["Java", "Python", "Node.js", "TypeScript"], fastTokens: ["ssn", "socialsecurity"], pattern: "(?:logger|console)\\.\\w+\\s*\\([^)]*\\bssn\\b", cxQuery: "GDPR_CCPA/SSN_In_Logs", ibmRule: "IBM-PRIV-SSN-326" },
      { code: "PRIV-URL-QUERY-SECRET", name: "Sensitive API Key / Password Passed in URL Query String (Logged in Proxies) (CWE-598)", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["?api_key=", "&api_key=", "?password="], pattern: "[?&](?:api_key|apikey|password|access_token|secret)=", cxQuery: "Privacy_Leak/Sensitive_Data_In_Query_String", ibmRule: "IBM-PRIV-URL-327" },
      { code: "PRIV-STACKTRACE-RESPONSE", name: "Raw Exception Stack Trace (err.stack / traceback.format_exc) Sent to Client (CWE-209)", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["err.stack", "format_exc()", "printstacktrace"], pattern: "(?:res\\.(?:json|send)\\s*\\([^)]*err\\.stack|traceback\\.format_exc\\(\\))", cxQuery: "Info_Disclosure/Stack_Trace_Exposure", ibmRule: "IBM-INFO-STK-328" },
      { code: "PRIV-AUTOCOMPLETE-PASSWORD", name: "HTML Password / Credit Card Input With autoComplete='on'", languages: ["TypeScript", "Node.js"], fastTokens: ["type=\"password\"", "autocomplete=\"on\""], pattern: "type=[\"']password[\"'][^>]*autoComplete=[\"']on[\"']", cxQuery: "Web_Privacy/Password_Autocomplete_On", ibmRule: "IBM-PRIV-AUTO-329" },
      { code: "ANDROID-WEBVIEW-JS", name: "OWASP Mobile M8: Android WebView setJavaScriptEnabled(true) + addJavascriptInterface", languages: ["Java", "Kotlin"], fastTokens: ["addjavascriptinterface", "setallowuniversalaccessfromfileurls"], pattern: "(?:addJavascriptInterface|setAllowUniversalAccessFromFileURLs\\s*\\(\\s*true)", cxQuery: "Mobile_Android/WebView_JS_Bridge_RCE", ibmRule: "IBM-MOB-WV-330" },
      { code: "ANDROID-WORLD-READABLE", name: "OWASP Mobile M9: Android MODE_WORLD_READABLE / MODE_WORLD_WRITABLE SharedPrefs", languages: ["Java", "Kotlin"], fastTokens: ["mode_world_readable", "mode_world_writable"], pattern: "MODE_WORLD_(?:READABLE|WRITABLE)", cxQuery: "Mobile_Android/World_Readable_Storage", ibmRule: "IBM-MOB-PREF-331" },
      { code: "ANDROID-EXPORTED-COMPONENT", name: "OWASP Mobile M1: Android Activity/Receiver android:exported='true' Without Permission", languages: ["Java", "Kotlin"], fastTokens: ["android:exported=\"true\""], pattern: "android:exported=[\"']true[\"']", cxQuery: "Mobile_Android/Exported_Component", ibmRule: "IBM-MOB-EXP-332" },
      { code: "IOS-NSUSERDEFAULTS-SECRET", name: "OWASP Mobile M9: iOS UserDefaults.standard.set() Used Instead of Keychain for Secrets", languages: ["Swift"], fastTokens: ["userdefaults.standard.set"], pattern: "UserDefaults\\.standard\\.set\\s*\\([^,]+,\\s*forKey:\\s*[\"'](?:token|password|secret|apiKey)", cxQuery: "Mobile_iOS/Secret_In_UserDefaults", ibmRule: "IBM-MOB-IOS-333" },
      { code: "IOS-ATS-ALLOWS-ARBITRARY", name: "OWASP Mobile M5: iOS NSAllowsArbitraryLoads = true Disables App Transport Security", languages: ["Swift"], fastTokens: ["nsallowsarbitraryloads"], pattern: "NSAllowsArbitraryLoads", cxQuery: "Mobile_iOS/ATS_Disabled", ibmRule: "IBM-MOB-ATS-334" },
      { code: "API3-EXCESSIVE-DATA-USER", name: "API3:2023 Broken Object Property Level Auth — Returning Full ORM User Model Including passwordHash", languages: ["Node.js", "TypeScript", "Python", "Java"], fastTokens: ["res.json(user)"], pattern: "res\\.json\\s*\\(\\s*user\\s*\\)", cxQuery: "API_Security/Excessive_Data_Exposure_User", ibmRule: "IBM-API-BOPLA-335" },
      { code: "API9-DEPRECATED-V1-ROUTE", name: "API9:2023 Improper Inventory Management — Unauthenticated Legacy /api/v1/debug or /api/internal Route", languages: ["Node.js", "TypeScript", "Python", "Java", "Go"], fastTokens: ["/api/v1/debug", "/api/internal", "/debug/pprof"], pattern: "[\"'](?:/api/v1/debug|/api/internal|/debug/pprof)[\"']", cxQuery: "API_Security/Shadow_Or_Debug_Endpoint", ibmRule: "IBM-API-SHADOW-336" },
      { code: "API10-UNSAFE-WEBHOOK-CONSUME", name: "API10:2023 Unsafe Consumption of Third-Party Webhook Without HMAC Signature Check", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["/webhook", "stripe-signature"], pattern: "post\\s*\\(\\s*[\"']/webhook[\"'](?![\\s\\S]{0,200}constructEvent)", cxQuery: "API_Security/Unverified_Webhook_Payload", ibmRule: "IBM-API-WH-337" },
      { code: "AUDIT-MISSING-SECURITY-EVENT", name: "OWASP A09:2021 Security Logging Failure — Failed Login Catch Block Without Audit Log", languages: ["Java", "Node.js", "Python"], fastTokens: ["authenticationexception", "invalid credentials"], pattern: "Invalid credentials", cxQuery: "Audit_Logging/Missing_Auth_Failure_Event", ibmRule: "IBM-AUD-AUTH-338" },
      { code: "HIPAA-PHI-UNENCRYPTED-S3", name: "HIPAA §164.312(a)(2)(iv): ePHI Upload Without ServerSideEncryption Header", languages: ["Node.js", "TypeScript", "Python"], fastTokens: ["putobjectcommand("], pattern: "new\\s+PutObjectCommand\\s*\\(\\s*\\{(?![^}]*ServerSideEncryption)", cxQuery: "Compliance_HIPAA/S3_PutObject_Missing_SSE", ibmRule: "IBM-HIPAA-S3-339" },
      { code: "SOC2-HARDCODED-ADMIN-BYPASS", name: "SOC 2 CC6.1: Backdoor / Bypass Conditional (if (token === 'dev-bypass'))", languages: ["Java", "Python", "Node.js", "TypeScript", "Go"], fastTokens: ["dev-bypass", "master-key", "backdoor"], pattern: "[\"'](?:dev-bypass|master-key|admin-backdoor|test-bypass)[\"']", cxQuery: "Governance_SOC2/Hardcoded_Auth_Bypass", ibmRule: "IBM-SOC2-BYP-340" },
      { code: "GOV-HTTP-CLEAR-ENDPOINT", name: "NIST SC-8: Production Service URL Configured Over Unencrypted http://", languages: ["Java", "Python", "Node.js", "TypeScript", "Go"], fastTokens: ["http://api.", "http://prod"], pattern: "[\"']http://(?:api\\.|prod\\.|auth\\.|payments\\.)[^\"']+[\"']", cxQuery: "Transport_Security/Cleartext_HTTP_Endpoint", ibmRule: "IBM-GOV-HTTP-341" },
      { code: "GOV-POSTMESSAGE-STAR", name: "Browser window.postMessage(sensitiveData, '*') Broadcasts to Any Origin", languages: ["TypeScript", "Node.js"], fastTokens: ["postmessage("], pattern: "postMessage\\s*\\([^,]+,\\s*[\"']\\*[\"']\\s*\\)", cxQuery: "Client_Security/PostMessage_Wildcard_Origin", ibmRule: "IBM-GOV-PM-342" },
      { code: "GOV-IFRAME-NO-SANDBOX", name: "Untrusted External <iframe src={...}> Rendered Without sandbox Attribute", languages: ["TypeScript", "Node.js"], fastTokens: ["<iframe"], pattern: "<iframe(?![^>]*sandbox)[^>]*src=\\{", cxQuery: "Web_Security/Iframe_Missing_Sandbox", ibmRule: "IBM-GOV-IFR-343" },
      { code: "GOV-TARGET-BLANK-NOOPENER", name: "External Link target='_blank' Missing rel='noopener noreferrer' (Tabnabbing)", languages: ["TypeScript", "Node.js"], fastTokens: ["target=\"_blank\""], pattern: "target=[\"']_blank[\"'](?![^>]*noopener)", cxQuery: "Web_Security/Tabnabbing_Missing_Noopener", ibmRule: "IBM-GOV-TAB-344" },
      { code: "GOV-JSONP-CALLBACK", name: "Unvalidated JSONP ?callback= Parameter Reflected as Script Execution", languages: ["Node.js", "PHP", "Java"], fastTokens: ["req.query.callback", "$_get['callback']"], pattern: "(?:req\\.query\\.callback|\\$_GET\\[['\"]callback['\"]\\])\\s*\\+\\s*[\"']\\(", cxQuery: "Web_Security/JSONP_Callback_Injection", ibmRule: "IBM-GOV-JSONP-345" },
      { code: "GOV-HEADER-X-POWERED-BY", name: "Express Default X-Powered-By Header Exposes Server Fingerprinting", languages: ["Node.js", "TypeScript"], fastTokens: ["express()"], pattern: "const\\s+app\\s*=\\s*express\\(\\)(?![\\s\\S]{0,300}disable\\([\"']x-powered-by[\"']\\))", cxQuery: "Web_Hardening/X_Powered_By_Exposed", ibmRule: "IBM-GOV-XPOW-346" },
      { code: "GOV-COOKIE-DOMAIN-BROAD", name: "Session Cookie Scoped to Overly Broad Top-Level Domain", languages: ["Node.js", "Java", "Python"], fastTokens: ["domain:"], pattern: "domain\\s*:\\s*[\"']\\.[a-z]+\\.[a-z]+[\"']", cxQuery: "Session_Security/Overly_Broad_Cookie_Domain", ibmRule: "IBM-GOV-CDOM-347" },
      { code: "GOV-SQL-GRANT-ALL", name: "Database Migration Grants GRANT ALL PRIVILEGES TO Application User", languages: ["Python", "Java", "Node.js"], fastTokens: ["grant all privileges"], pattern: "GRANT\\s+ALL\\s+PRIVILEGES", cxQuery: "DB_Governance/Grant_All_Privileges", ibmRule: "IBM-GOV-GRANT-348" },
      { code: "GOV-CHMOD-777", name: "Filesystem Permission Set to World-Writable 0777 / 777 (CWE-732)", languages: ["Python", "Node.js", "Go", "Java"], fastTokens: ["chmod", "0o777", "0777", "777"], pattern: "chmod.*(?:0o?777|\\b777\\b)", cxQuery: "OS_Hardening/Chmod_777_World_Writable", ibmRule: "IBM-GOV-777-349" },
      { code: "GOV-TEMP-DIR-HARDCODED", name: "Hardcoded Shared /tmp/... File Path Vulnerable to Symlink/Race Abuse", languages: ["Python", "Node.js", "Go", "Java"], fastTokens: ["\"/tmp/", "'/tmp/"], pattern: "[\"'`]/tmp/[a-zA-Z0-9_\\-.]+[\"'`]", cxQuery: "OS_Hardening/Hardcoded_Tmp_Path", ibmRule: "IBM-GOV-TMP-350" },
      { code: "GOV-SMTP-HEADER-INJECTION", name: "Email Subject / To Header Concatenated Without CRLF Stripping (CWE-93)", languages: ["Node.js", "Python", "PHP", "Java"], fastTokens: ["subject:", "sendmail("], pattern: "subject\\s*:\\s*req\\.body\\.subject", cxQuery: "Mail_Security/SMTP_Header_Injection", ibmRule: "IBM-GOV-SMTP-351" },
      { code: "GOV-HOST-HEADER-RESET-LINK", name: "Password Reset URL Built Using Unvalidated HTTP Host / X-Forwarded-Host Header (CWE-640)", languages: ["Node.js", "Python", "PHP", "Java"], fastTokens: ["req.headers.host", "x-forwarded-host"], pattern: "(?:req\\.headers\\[['\"]x-forwarded-host['\"]\\]|req\\.headers\\.host).*reset", cxQuery: "Auth_Security/Host_Header_Password_Reset_Poisoning", ibmRule: "IBM-GOV-HOST-352" },
      { code: "GOV-MASS-DELETE-NO-WHERE", name: "SQL DELETE / UPDATE Executed Without WHERE Clause Guard", languages: ["Java", "Python", "Node.js"], fastTokens: ["delete from ", "update "], pattern: "[\"']DELETE\\s+FROM\\s+\\w+\\s*;?[\"']", cxQuery: "Data_Integrity/Unscoped_Delete_Statement", ibmRule: "IBM-GOV-DEL-353" },
      { code: "GOV-UNENCRYPTED-GRPC", name: "gRPC Client/Server Initialized with insecure.NewCredentials() / createInsecure()", languages: ["Go", "Node.js", "Python"], fastTokens: ["createinsecure()", "insecure.newcredentials()", "insecure_channel("], pattern: "(?:credentials\\.createInsecure\\(\\)|insecure\\.NewCredentials\\(\\)|grpc\\.insecure_channel\\()", cxQuery: "Microservices/gRPC_Insecure_Channel", ibmRule: "IBM-GOV-GRPC-354" },
      { code: "GOV-REDIS-FLUSHALL", name: "Application Code Invokes Redis FLUSHALL / FLUSHDB Command", languages: ["Node.js", "Python", "Go"], fastTokens: [".flushall(", ".flushdb("], pattern: "\\.(?:flushall|flushdb|flushAll|flushDb)\\s*\\(", cxQuery: "Data_Integrity/Redis_FlushAll_In_App", ibmRule: "IBM-GOV-REDIS-355" },
      { code: "GOV-KAFKA-PLAINTEXT", name: "Kafka Producer/Consumer Configured with security.protocol=PLAINTEXT", languages: ["Java", "Python", "Node.js"], fastTokens: ["security.protocol", "plaintext"], pattern: "security\\.protocol.*PLAINTEXT", cxQuery: "Messaging_Security/Kafka_Plaintext_Protocol", ibmRule: "IBM-GOV-KAFKA-356" },
      { code: "GOV-GRAPHQL-BATCH-DOS", name: "GraphQL Batching Enabled Without Maximum Batch Size Limit", languages: ["Node.js", "TypeScript"], fastTokens: ["allowbatchedhttpesquests"], pattern: "allowBatchedHttpRequests\\s*:\\s*true", cxQuery: "API_GraphQL/Unbounded_Query_Batching", ibmRule: "IBM-GOV-GQLB-357" },
      { code: "GOV-DANGEROUS-DANGEROUSLY-SET", name: "React Script Tag Injection via Dynamic createElement('script')", languages: ["TypeScript", "Node.js"], fastTokens: ["createelement('script')", "createelement(\"script\")"], pattern: "createElement\\s*\\(\\s*[\"']script[\"']\\s*\\)", cxQuery: "Client_Security/Dynamic_Script_Element", ibmRule: "IBM-GOV-SCR-358" },
      { code: "GOV-WEBWORKER-BLOB-URL", name: "Web Worker Created from Untrusted Blob URL Code String", languages: ["TypeScript", "Node.js"], fastTokens: ["new worker(", "createobjecturl"], pattern: "new\\s+Worker\\s*\\(\\s*URL\\.createObjectURL", cxQuery: "Client_Security/Worker_Blob_Injection", ibmRule: "IBM-GOV-WRK-359" },
      { code: "GOV-POSTGREST-ANON-WRITE", name: "Row-Level Security (RLS) Policy USING (true) Allows Anonymous Table Mutation", languages: ["Python", "Node.js"], fastTokens: ["using (true)", "with check (true)"], pattern: "FOR\\s+(?:ALL|INSERT|UPDATE|DELETE).*USING\\s*\\(\\s*true\\s*\\)", cxQuery: "DB_RLS/Permissive_RLS_Policy", ibmRule: "IBM-GOV-RLS-360" },
    ],
  },

  // 15. Supply Chain, SLSA, Dependency Reachability & CI/CD Security (40 Plugins -> Total = 400 Plugins!)
  {
    category: "CI/CD, Supply Chain & SCA (SLSA)",
    cwe: "CWE-1395",
    cweName: "Dependency on Vulnerable Third-Party Component & Supply Chain Integrity (CWE-829 / CWE-494)",
    owasp: "A06:2021 · Vulnerable and Outdated Components & A08:2021",
    asvs: "ASVS V14.2.1 & V10.2.1",
    nist80053: "SR-3 · Supply Chain Controls & SA-12",
    nistSsdf: "PW.4.1 & RV.1.2 · Dependency & Vulnerability Management",
    pciDss: "PCI-DSS v4.0 Req 6.3.1",
    iso27001: "ISO 27001 A.8.28 & A.5.21",
    mitreAttack: "T1195.001 (Compromise Software Dependencies)",
    fortifyKingdom: "Encapsulation",
    fortifyAnalyzer: "Configuration",
    severity: "High",
    cvss: 8.1,
    epss: 0.174,
    sanitizerHint: "Pinned SHA-256 Digest / Lockfile Verification / OSV.dev & NVD Clean Version",
    remediationSummary: "Pin third-party dependencies and CI actions to immutable commit SHAs, verify cryptographic checksums, and upgrade vulnerable packages flagged by OSV/NVD.",
    variants: [
      { code: "SCA-LOG4SHELL-JNDI", name: "CVE-2021-44228 (Log4Shell): Vulnerable log4j-core 2.0–2.14.1 Dependency", languages: ["Java"], fastTokens: ["log4j-core"], pattern: "log4j-core[\"']?\\s*[:=]?\\s*[\"']?2\\.(?:[0-9]|1[0-4])\\.", cxQuery: "CxSCA/CVE_2021_44228_Log4Shell", ibmRule: "IBM-SCA-LOG4J-361" },
      { code: "SCA-SPRING4SHELL", name: "CVE-2022-22965 (Spring4Shell): Vulnerable spring-beans / spring-webmvc < 5.3.18", languages: ["Java"], fastTokens: ["spring-webmvc", "spring-beans"], pattern: "spring-(?:webmvc|beans).*5\\.(?:[0-2]\\.|3\\.(?:[0-9]|1[0-7])\\b)", cxQuery: "CxSCA/CVE_2022_22965_Spring4Shell", ibmRule: "IBM-SCA-SPR4S-362" },
      { code: "SCA-COMMONS-TEXT", name: "CVE-2022-42889 (Text4Shell): Apache commons-text < 1.10.0 StringSubstitutor RCE", languages: ["Java"], fastTokens: ["commons-text", "stringsubstitutor"], pattern: "(?:commons-text.*1\\.[0-9]\\.|StringSubstitutor\\.createInterpolator)", cxQuery: "CxSCA/CVE_2022_42889_Text4Shell", ibmRule: "IBM-SCA-TEXT4S-363" },
      { code: "SCA-POSTGRES-JDBC-CVE", name: "CVE-2024-1597: PostgreSQL JDBC Driver (pgjdbc) PreferQueryMode=SIMPLE SQLi", languages: ["Java"], fastTokens: ["postgresql", "preferquerymode"], pattern: "preferQueryMode=simple", cxQuery: "CxSCA/CVE_2024_1597_PgJDBC", ibmRule: "IBM-SCA-PGJDBC-364" },
      { code: "SCA-JACKSON-DATABIND", name: "Vulnerable jackson-databind 2.9.x Known Polymorphic Deserialization Gadgets", languages: ["Java"], fastTokens: ["jackson-databind"], pattern: "jackson-databind.*2\\.[0-9]\\.", cxQuery: "CxSCA/Jackson_Databind_Gadgets", ibmRule: "IBM-SCA-JACK-365" },
      { code: "SCA-STRUTS2-OGNL", name: "Apache Struts2 struts2-core 2.3.x / 2.5.x Known OGNL RCE Version", languages: ["Java"], fastTokens: ["struts2-core"], pattern: "struts2-core.*2\\.[0-5]\\.", cxQuery: "CxSCA/Apache_Struts2_RCE", ibmRule: "IBM-SCA-STRUTS-366" },
      { code: "SCA-LODASH-PROTOTYPE", name: "CVE-2021-23337 / CVE-2020-8203: Lodash < 4.17.21 Command Injection & Prototype Pollution", languages: ["Node.js", "TypeScript"], fastTokens: ["\"lodash\""], pattern: "\"lodash\"\\s*:\\s*\"[\\^~]?4\\.17\\.(?:[0-9]|1[0-9]|20)\"", cxQuery: "CxSCA/Lodash_Vulnerable_Version", ibmRule: "IBM-SCA-LODASH-367" },
      { code: "SCA-AXIOS-SSRF-CSRF", name: "CVE-2023-45857 / CVE-2024-39338: Vulnerable axios < 1.7.4 Dependency", languages: ["Node.js", "TypeScript"], fastTokens: ["\"axios\""], pattern: "\"axios\"\\s*:\\s*\"[\\^~]?0\\.", cxQuery: "CxSCA/Axios_Vulnerable_0x", ibmRule: "IBM-SCA-AXIOS-368" },
      { code: "SCA-JSONWEBTOKEN-CVE", name: "CVE-2022-23529: jsonwebtoken < 9.0.0 Key Retrieval RCE", languages: ["Node.js", "TypeScript"], fastTokens: ["\"jsonwebtoken\""], pattern: "\"jsonwebtoken\"\\s*:\\s*\"[\\^~]?[0-8]\\.", cxQuery: "CxSCA/JsonWebToken_Below_9", ibmRule: "IBM-SCA-JWT-369" },
      { code: "SCA-EXPRESS-OLD", name: "Vulnerable Express.js < 4.19.2 Open Redirect & Prototype Pollution", languages: ["Node.js", "TypeScript"], fastTokens: ["\"express\""], pattern: "\"express\"\\s*:\\s*\"[\\^~]?4\\.(?:[0-9]|1[0-8])\\.", cxQuery: "CxSCA/Express_Outdated_Version", ibmRule: "IBM-SCA-EXP-370" },
      { code: "SCA-MINIMIST-PROTO", name: "CVE-2021-44906: minimist < 1.2.6 Prototype Pollution", languages: ["Node.js", "TypeScript"], fastTokens: ["\"minimist\""], pattern: "\"minimist\"\\s*:\\s*\"[\\^~]?1\\.2\\.[0-5]\"", cxQuery: "CxSCA/Minimist_Prototype_Pollution", ibmRule: "IBM-SCA-MINI-371" },
      { code: "SCA-VM2-SANDBOX-ESCAPE", name: "CVE-2023-37466: Deprecated vm2 Package Critical Sandbox Escape RCE", languages: ["Node.js", "TypeScript"], fastTokens: ["\"vm2\"", "require('vm2')"], pattern: "[\"']vm2[\"']", cxQuery: "CxSCA/VM2_Critical_Sandbox_Escape", ibmRule: "IBM-SCA-VM2-372" },
      { code: "SCA-PYYAML-OLD", name: "CVE-2020-14343: PyYAML < 5.4 Arbitrary Code Execution", languages: ["Python"], fastTokens: ["pyyaml"], pattern: "PyYAML\\s*(?:==|<=|~=)\\s*[0-5]\\.[0-3]", cxQuery: "CxSCA/PyYAML_CVE_2020_14343", ibmRule: "IBM-SCA-PYYAML-373" },
      { code: "SCA-URLLIB3-CVE", name: "Vulnerable urllib3 < 2.0.7 Cookie/Auth Header Leak on Redirect", languages: ["Python"], fastTokens: ["urllib3"], pattern: "urllib3\\s*==\\s*1\\.", cxQuery: "CxSCA/Urllib3_1x_Auth_Leak", ibmRule: "IBM-SCA-URL3-374" },
      { code: "SCA-JINJA2-XSS-CVE", name: "CVE-2024-22195 / CVE-2024-34064: Jinja2 < 3.1.4 xmlattr XSS", languages: ["Python"], fastTokens: ["jinja2"], pattern: "Jinja2\\s*==\\s*(?:2\\.|3\\.0\\.|3\\.1\\.[0-3])", cxQuery: "CxSCA/Jinja2_Xmlattr_XSS", ibmRule: "IBM-SCA-JINJA-375" },
      { code: "SCA-PILLOW-RCE-CVE", name: "CVE-2023-50447 / CVE-2023-4863: Pillow < 10.2.0 ImageMath Eval & WebP Overflow", languages: ["Python"], fastTokens: ["pillow"], pattern: "Pillow\\s*==\\s*(?:[0-9]\\.|10\\.[0-1]\\.)", cxQuery: "CxSCA/Pillow_Vulnerable_Version", ibmRule: "IBM-SCA-PIL-376" },
      { code: "SCA-CRYPTOGRAPHY-OLD", name: "Vulnerable Python cryptography < 42.0.0 OpenSSL Memory Corruption", languages: ["Python"], fastTokens: ["cryptography=="], pattern: "cryptography\\s*==\\s*(?:[0-3][0-9]|4[0-1])\\.", cxQuery: "CxSCA/Python_Cryptography_Outdated", ibmRule: "IBM-SCA-PYCRYP-377" },
      { code: "SCA-DJANGO-OLD", name: "Outdated Django < 4.2 LTS Missing Security Patches", languages: ["Python"], fastTokens: ["django=="], pattern: "Django\\s*==\\s*[1-3]\\.", cxQuery: "CxSCA/Django_End_Of_Life", ibmRule: "IBM-SCA-DJ-378" },
      { code: "SCA-FLASK-OLD", name: "Outdated Flask < 2.3 Session Cookie & Security Advisories", languages: ["Python"], fastTokens: ["flask=="], pattern: "Flask\\s*==\\s*(?:0\\.|1\\.|2\\.[0-2]\\.)", cxQuery: "CxSCA/Flask_Outdated", ibmRule: "IBM-SCA-FLK-379" },
      { code: "SCA-GO-X-CRYPTO-SSH", name: "CVE-2023-48795 (Terrapin): golang.org/x/crypto < v0.17.0 SSH Prefix Truncation", languages: ["Go"], fastTokens: ["golang.org/x/crypto"], pattern: "golang\\.org/x/crypto\\s+v0\\.(?:[0-9]|1[0-6])\\.", cxQuery: "CxSCA/Go_X_Crypto_Terrapin", ibmRule: "IBM-SCA-GOCRYP-380" },
      { code: "SCA-GO-X-NET-HTTP2", name: "CVE-2023-44487 (HTTP/2 Rapid Reset): golang.org/x/net < v0.17.0", languages: ["Go"], fastTokens: ["golang.org/x/net"], pattern: "golang\\.org/x/net\\s+v0\\.(?:[0-9]|1[0-6])\\.", cxQuery: "CxSCA/Go_X_Net_Rapid_Reset", ibmRule: "IBM-SCA-GONET-381" },
      { code: "SCA-CDN-MISSING-SRI", name: "External <script src='https://cdn...'> Tag Missing Subresource Integrity (integrity='sha384-...') (CWE-494)", languages: ["TypeScript", "Node.js"], fastTokens: ["<script", "https://"], pattern: "<script[^>]+src=[\"']https://(?![^>]*integrity=)", cxQuery: "SupplyChain_Web/External_Script_Missing_SRI", ibmRule: "IBM-SC-SRI-382" },
      { code: "SCA-GHA-UNPINNED-ACTION", name: "SLSA Supply Chain: GitHub Action Uses Mutable Branch/Tag (@v3 / @main) Instead of 40-char Commit SHA", languages: ["Node.js", "Python"], fastTokens: ["uses:"], pattern: "uses:\\s*[a-zA-Z0-9_\\-]+/[a-zA-Z0-9_\\-]+@(?:main|master|v[0-9]+)\\b", cxQuery: "SLSA_CICD/Unpinned_GitHub_Action", ibmRule: "IBM-SC-GHA-383" },
      { code: "SCA-NPM-STAR-VERSION", name: "package.json Uses Wildcard '*' or 'latest' Dependency Version Range", languages: ["Node.js", "TypeScript"], fastTokens: ["\"*\"", "\"latest\""], pattern: "\"[^\"]+\"\\s*:\\s*\"(?:\\*|latest)\"", cxQuery: "SupplyChain_NPM/Wildcard_Dependency_Version", ibmRule: "IBM-SC-NPMS-384" },
      { code: "SCA-NPM-GIT-HTTP-DEP", name: "package.json Pulls Dependency Over Unencrypted git+http:// or git:// Protocol", languages: ["Node.js", "TypeScript"], fastTokens: ["git://", "git+http://"], pattern: "\"(?:git://|git\\+http://)", cxQuery: "SupplyChain_NPM/Insecure_Git_Dependency", ibmRule: "IBM-SC-NPMG-385" },
      { code: "SCA-NPM-POSTINSTALL-HOOK", name: "package.json Defines Suspicious preinstall / postinstall Shell Execution Hook", languages: ["Node.js"], fastTokens: ["\"postinstall\"", "\"preinstall\""], pattern: "\"(?:preinstall|postinstall)\"\\s*:\\s*\"[^\"]*(?:curl|wget|nc|bash|node -e)", cxQuery: "SupplyChain_NPM/Suspicious_Install_Hook", ibmRule: "IBM-SC-HOOK-386" },
      { code: "SCA-MAVEN-HTTP-REPO", name: "Maven pom.xml / Gradle build.gradle Uses Cleartext http:// Artifact Repository", languages: ["Java", "Kotlin"], fastTokens: ["<url>http://", "maven { url 'http://"], pattern: "(?:<url>http://|url\\s*[:=]?\\s*[\"']http://repo)", cxQuery: "SupplyChain_Maven/HTTP_Repository_Mirror", ibmRule: "IBM-SC-MVN-387" },
      { code: "SCA-PIP-EXTRA-INDEX", name: "Dependency Confusion Risk: pip --extra-index-url Internal Package Namespace Leak", languages: ["Python"], fastTokens: ["--extra-index-url"], pattern: "--extra-index-url\\s+https?://", cxQuery: "SupplyChain_PyPI/Extra_Index_Dependency_Confusion", ibmRule: "IBM-SC-PIPX-388" },
      { code: "SCA-DOCKER-ADD-REMOTE", name: "Dockerfile Uses ADD https://... Without Checksum Verification Instead of curl + sha256sum", languages: ["Python", "Node.js", "Go"], fastTokens: ["add http"], pattern: "^ADD\\s+https?://", cxQuery: "SupplyChain_Docker/ADD_Remote_URL_Unverified", ibmRule: "IBM-SC-DADD-389" },
      { code: "SCA-TERRAFORM-UNPINNED-MOD", name: "Terraform Module Source Git URL Missing ?ref= Immutable Commit Tag", languages: ["Go", "Python"], fastTokens: ["source =", "git::"], pattern: "source\\s*=\\s*[\"']git::https://[^\"'?]+[\"']", cxQuery: "SupplyChain_Terraform/Unpinned_Git_Module", ibmRule: "IBM-SC-TFMOD-390" },
      { code: "SCA-HELM-LATEST-CHART", name: "Helm Chart Dependency Missing Locked Semantic Version Constraint", languages: ["Go", "Python"], fastTokens: ["repository:", "version: \"*\""], pattern: "version\\s*:\\s*[\"']?\\*[\"']?", cxQuery: "SupplyChain_Helm/Wildcard_Chart_Version", ibmRule: "IBM-SC-HELM-391" },
      { code: "SCA-CODECOV-BASH-UPLOADER", name: "CI Pipeline Fetches Remote Codecov Bash Uploader Script Without Integrity Verification", languages: ["Node.js", "Python"], fastTokens: ["codecov.io/bash"], pattern: "codecov\\.io/bash", cxQuery: "SLSA_CICD/Remote_CI_Uploader_Script", ibmRule: "IBM-SC-CCOV-392" },
      { code: "SCA-GHA-ARTIFACT-POISON", name: "GitHub Actions actions/download-artifact Extracting Untrusted Build Artifact to Workspace", languages: ["Node.js", "Python"], fastTokens: ["actions/download-artifact"], pattern: "actions/download-artifact", cxQuery: "SLSA_CICD/Artifact_Extraction_Review", ibmRule: "IBM-SC-ART-393" },
      { code: "SCA-GO-INSECURE-GOPROXY", name: "Go Module Configuration Sets GONOSUMDB=* Disabling Checksum Database Verification", languages: ["Go"], fastTokens: ["gonosumdb"], pattern: "GONOSUMDB\\s*=\\s*\\*", cxQuery: "SupplyChain_Go/GONOSUMDB_Wildcard", ibmRule: "IBM-SC-GOSUM-394" },
      { code: "SCA-COMPOSER-SECURE-HTTP", name: "PHP composer.json Sets config.secure-http: false Allowing MitM Package Tampering", languages: ["PHP"], fastTokens: ["secure-http"], pattern: "\"secure-http\"\\s*:\\s*false", cxQuery: "SupplyChain_Composer/Secure_Http_False", ibmRule: "IBM-SC-COMP-395" },
      { code: "SCA-NUGET-HTTP-SOURCE", name: "C# NuGet.Config Package Source Configured Over Unencrypted http://", languages: ["C#"], fastTokens: ["protocolversion", "http://"], pattern: "<add\\s+key=[^>]+value=[\"']http://", cxQuery: "SupplyChain_NuGet/HTTP_Package_Source", ibmRule: "IBM-SC-NUGET-396" },
      { code: "SCA-RUBYGEMS-HTTP-SOURCE", name: "Ruby Gemfile Uses Unencrypted source 'http://rubygems.org'", languages: ["Ruby"], fastTokens: ["source 'http://", "source \"http://"], pattern: "source\\s+[\"']http://", cxQuery: "SupplyChain_RubyGems/HTTP_Gem_Source", ibmRule: "IBM-SC-GEM-397" },
      { code: "SCA-WEB3-ETHERS-PRIVATEKEY", name: "Web3 / Ethers.js new ethers.Wallet('0x...') Hardcoded Hex Private Key", languages: ["TypeScript", "Node.js"], fastTokens: ["new ethers.wallet(", "0x"], pattern: "new\\s+(?:ethers\\.)?Wallet\\s*\\(\\s*[\"']0x[0-9a-fA-F]{64}[\"']", cxQuery: "Blockchain_Security/Hardcoded_EVM_Private_Key", ibmRule: "IBM-SC-WEB3-398" },
      { code: "SCA-SOLIDITY-TX-ORIGIN", name: "Smart Contract Uses tx.origin for Authorization (Phishing Vulnerability SWC-115)", languages: ["TypeScript", "Node.js"], fastTokens: ["tx.origin"], pattern: "require\\s*\\(\\s*tx\\.origin\\s*==", cxQuery: "SmartContract_Solidity/Tx_Origin_Auth", ibmRule: "IBM-SC-SOL-399" },
      { code: "SCA-SBOM-ATTESTATION-CHECK", name: "SLSA Level 3 Build Provenance: Release Artifact Missing CycloneDX / SPDX SBOM Attestation", languages: ["Node.js", "Python", "Go", "Java"], fastTokens: ["sbom_attestation_disabled"], pattern: "sbom_attestation\\s*[:=]\\s*false", cxQuery: "SLSA_Provenance/Missing_SBOM_Attestation", ibmRule: "IBM-SC-SBOM-400" },
    ],
  },
];

const VARIANT_SPECIFIC_OVERRIDES: Record<string, Partial<SASTPluginDefinition>> = {
  "GOV-TARGET-BLANK-NOOPENER": {
    cwe: "CWE-1022",
    cweName: "Use of Web Link to Untrusted Target with window.opener Access ('Tabnabbing')",
    severity: "Medium",
    cvss: 5.4,
    epss: 0.012,
    owasp: "A05:2021 · Security Misconfiguration",
    asvs: "ASVS V14.4.6 · Browser Origin & Opener Isolation",
    nist80053: "SC-18 · Mobile Code & Browser Context Isolation",
    nistSsdf: "PW.8.1 · Secure Web Client Coding",
    pciDss: "PCI-DSS v4.0 Req 6.2.4",
    iso27001: "ISO 27001 A.8.28",
    mitreAttack: "T1189 (Reverse Tabnabbing via window.opener)",
    fortifyKingdom: "Encapsulation",
    fortifyAnalyzer: "Structural",
    sanitizerHint: "Add rel=\"noopener noreferrer\" to all external target=\"_blank\" links or clear newWindow.opener = null",
    remediationSummary:
      "Include rel=\"noopener noreferrer\" on external anchor tags using target=\"_blank\" so the opened document cannot access or redirect the parent window via window.opener.",
    remediationCode: `// ❌ VULNERABLE: External target="_blank" link without rel="noopener noreferrer" exposes window.opener\n<a href="https://external-site.example.com" target="_blank">External Resource</a>\n\n// ✅ REMEDIATED (HTML / JSX / Angular Template): Isolate browsing context with rel="noopener noreferrer"\n<a\n  href="https://external-site.example.com"\n  target="_blank"\n  rel="noopener noreferrer"\n>\n  External Resource\n</a>\n\n// ✅ REMEDIATED (Programmatic window.open in TypeScript / JavaScript):\nconst newWin = window.open(externalUrl, "_blank", "noopener,noreferrer");\nif (newWin) { newWin.opener = null; }`,
  },
  "PRIV-LOCALSTORAGE-TOKEN": {
    cwe: "CWE-922",
    cweName: "Insecure Storage of Sensitive Information (JWT/Auth Token in Browser Web Storage)",
    severity: "Medium",
    cvss: 6.5,
    owasp: "A04:2021 · Insecure Design",
    sanitizerHint: "Issue session/refresh tokens in HttpOnly, Secure, SameSite=Strict cookies instead of localStorage",
    remediationSummary:
      "Store session and refresh tokens in HttpOnly, Secure, SameSite=Strict cookies rather than localStorage/sessionStorage so DOM XSS cannot exfiltrate credentials.",
    remediationCode: `// ❌ VULNERABLE: Storing bearer/JWT token in XSS-accessible localStorage\nlocalStorage.setItem("token", authResponse.jwt);\n\n// ✅ REMEDIATED: Issue token via server-set HttpOnly, Secure, SameSite=Strict cookie\nres.cookie("session_token", signedJwt, {\n  httpOnly: true,\n  secure: true,\n  sameSite: "strict",\n  path: "/api",\n  maxAge: 900_000,\n});`,
  },
  "PRIV-SSN-CLEARTEXT": {
    cwe: "CWE-532",
    cweName: "Insertion of Sensitive Information into Log File (Unmasked PII / SSN)",
    severity: "High",
    cvss: 7.5,
    owasp: "A09:2021 · Security Logging and Monitoring Failures",
    sanitizerHint: "Redact PII fields (SSN, taxId) via structured log redaction middleware before emission",
    remediationSummary: "Redact or mask SSN/taxId attributes in structured logger serializers and never write raw PII to application logs.",
  },
  "PRIV-URL-QUERY-SECRET": {
    cwe: "CWE-598",
    cweName: "Use of GET Request Method With Sensitive Query Strings",
    severity: "Medium",
    cvss: 6.5,
    owasp: "A04:2021 · Insecure Design",
    sanitizerHint: "Transmit API keys, tokens, and passwords in Authorization headers or POST request bodies over TLS",
    remediationSummary: "Never pass API keys, tokens, or passwords in URL query parameters where they are recorded in proxy, CDN, and browser history logs.",
  },
  "PRIV-STACKTRACE-RESPONSE": {
    cwe: "CWE-209",
    cweName: "Generation of Error Message Containing Sensitive Information (Stack Trace Exposure)",
    severity: "Medium",
    cvss: 5.3,
    owasp: "A05:2021 · Security Misconfiguration",
    sanitizerHint: "Return a generic error envelope with a correlation ID and log stack traces server-side only",
    remediationSummary: "Do not serialize err.stack or raw exception tracebacks in HTTP responses; log full diagnostics internally with a correlation ID.",
    remediationCode: `// ❌ VULNERABLE: Returning raw exception stack trace to HTTP client\nres.status(500).json({ error: err.message, stack: err.stack });\n\n// ✅ REMEDIATED: Log stack trace internally and return opaque correlation ID\nlogger.error({ correlationId: req.id, err }, "Unhandled request exception");\nres.status(500).json({ error: "Internal Server Error", correlationId: req.id });`,
  },
  "PRIV-AUTOCOMPLETE-PASSWORD": {
    cwe: "CWE-525",
    cweName: "Use of Web Browser Cache Containing Sensitive Information",
    severity: "Low",
    cvss: 3.7,
    owasp: "A05:2021 · Security Misconfiguration",
    sanitizerHint: "Set autoComplete=\"new-password\" or autoComplete=\"off\" on sensitive credential inputs",
    remediationSummary: "Configure sensitive password and payment inputs with explicit autocomplete controls appropriate for the authentication flow.",
  },
  "GOV-POSTMESSAGE-STAR": {
    cwe: "CWE-346",
    cweName: "Origin Validation Error (window.postMessage Wildcard Target Origin)",
    severity: "Medium",
    cvss: 6.1,
    owasp: "A05:2021 · Security Misconfiguration",
    sanitizerHint: "Specify an explicit trusted targetOrigin (e.g. 'https://app.example.com') in postMessage() and verify event.origin",
    remediationSummary: "Replace wildcard '*' targetOrigin in window.postMessage() with an explicit trusted origin URI and validate event.origin in message listeners.",
  },
  "GOV-IFRAME-NO-SANDBOX": {
    cwe: "CWE-1021",
    cweName: "Improper Restriction of Rendered UI Layers or Frames (Missing iframe sandbox)",
    severity: "Medium",
    cvss: 5.4,
    owasp: "A05:2021 · Security Misconfiguration",
    sanitizerHint: "Add a restrictive sandbox=\"allow-scripts\" attribute to external <iframe> elements",
    remediationSummary: "Apply a least-privilege sandbox attribute to external <iframe> tags and disallow top-navigation or same-origin escalation.",
  },
  "GOV-HEADER-X-POWERED-BY": {
    cwe: "CWE-200",
    cweName: "Exposure of Sensitive Information to an Unauthorized Actor (X-Powered-By Server Banner)",
    severity: "Low",
    cvss: 3.7,
    owasp: "A05:2021 · Security Misconfiguration",
    sanitizerHint: "Call app.disable('x-powered-by') or enable helmet() middleware on Express applications",
    remediationSummary: "Disable the Express X-Powered-By response header via app.disable('x-powered-by') or Helmet middleware to prevent framework fingerprinting.",
    remediationCode: `// ❌ VULNERABLE: Default Express instance exposes X-Powered-By: Express\nconst app = express();\n\n// ✅ REMEDIATED: Disable X-Powered-By header or register Helmet middleware\nconst app = express();\napp.disable("x-powered-by");\napp.use(helmet());`,
  },
  "GOV-CHMOD-777": {
    cwe: "CWE-732",
    cweName: "Incorrect Permission Assignment for Critical Resource (World-Writable 0777 Mode)",
    severity: "High",
    cvss: 7.3,
    owasp: "A05:2021 · Security Misconfiguration",
    sanitizerHint: "Restrict file permissions to owner-only (0o600 for files, 0o700 for directories)",
    remediationSummary: "Enforce least-privilege POSIX permissions (0600 or 0640 for files, 0700 or 0750 for directories) instead of world-writable 0777.",
  },
  "GOV-SMTP-HEADER-INJECTION": {
    cwe: "CWE-93",
    cweName: "Improper Neutralization of CRLF Sequences ('CRLF / SMTP Header Injection')",
    severity: "High",
    cvss: 7.5,
    owasp: "A03:2021 · Injection",
    sanitizerHint: "Strip CR/LF characters (\\r, \\n) from all user-supplied email headers before passing to mail transport",
    remediationSummary: "Reject or strip carriage-return and line-feed (\\r\\n) sequences from user-controlled Subject, To, and Reply-To email headers.",
  },
  "GOV-HOST-HEADER-RESET-LINK": {
    cwe: "CWE-640",
    cweName: "Weak Password Recovery Mechanism for Forgotten Password (Host Header Poisoning)",
    severity: "High",
    cvss: 8.1,
    owasp: "A07:2021 · Identification and Authentication Failures",
    sanitizerHint: "Construct password-reset URLs from an immutable server-side CANONICAL_BASE_URL environment variable",
    remediationSummary: "Never build password reset links using req.headers.host or X-Forwarded-Host; use an immutable server-configured base URL.",
  },
  "SCA-CDN-MISSING-SRI": {
    cwe: "CWE-494",
    cweName: "Download of Code Without Integrity Check (Missing Subresource Integrity on External Script)",
    severity: "Medium",
    cvss: 5.9,
    owasp: "A08:2021 · Software and Data Integrity Failures",
    sanitizerHint: "Add integrity=\"sha384-...\" and crossorigin=\"anonymous\" attributes to third-party CDN <script> tags",
    remediationSummary: "Include cryptographic Subresource Integrity (integrity=\"sha384-...\") and crossorigin=\"anonymous\" on all external CDN scripts.",
  },
  "CRYP-JAVA-UTIL-RANDOM": {
    cwe: "CWE-330",
    cweName: "Use of Insufficiently Random Values (java.util.Random in Security Context)",
    severity: "Medium",
    cvss: 5.3,
  },
  "CRYP-PY-RANDOM-MODULE": {
    cwe: "CWE-330",
    cweName: "Use of Insufficiently Random Values (Python random Module in Security Context)",
    severity: "Medium",
    cvss: 5.3,
  },
  "CRYP-JS-MATH-RANDOM": {
    cwe: "CWE-330",
    cweName: "Use of Insufficiently Random Values (Math.random() in Verified Security Context)",
    severity: "Medium",
    cvss: 5.3,
    sanitizerHint: "Replace Math.random() with crypto.randomBytes(32).toString('hex') or crypto.randomUUID() when generating tokens, OTPs, or secrets",
    remediationSummary:
      "Replace Math.random() with OS-backed CSPRNG (crypto.randomBytes / crypto.randomInt) whenever the output protects a token, OTP, password reset link, session ID, or secret.",
    remediationCode: `// ❌ VULNERABLE: Non-cryptographic Math.random() used for security token / OTP\nconst resetToken = Math.random().toString(36).substring(2);\n\n// ✅ REMEDIATED (Node.js / TypeScript): OS-backed CSPRNG with 256-bit entropy\nimport * as crypto from "crypto";\nconst resetToken = crypto.randomBytes(32).toString("hex");`,
  },
  "CRYP-PHP-RAND-MTRAND": {
    cwe: "CWE-330",
    cweName: "Use of Insufficiently Random Values (PHP rand / mt_rand in Security Context)",
    severity: "Medium",
    cvss: 5.3,
  },
  "CRYP-GO-MATH-RAND": {
    cwe: "CWE-330",
    cweName: "Use of Insufficiently Random Values (Go math/rand in Security Context)",
    severity: "Medium",
    cvss: 5.3,
  },
  "AUTH-BOLA-DIRECT-ID": {
    cwe: "CWE-639",
    cweName: "Authorization Bypass Through User-Controlled Key (BOLA / IDOR)",
    severity: "High",
    cvss: 8.1,
    sanitizerHint: "Enforce compound ownership query predicate (findByIdAndUserId / findByIdAndTenantId / WHERE id = :id AND user_id = :authenticatedUserId)",
    remediationSummary:
      "Scope every object lookup by both the requested resource ID and the authenticated principal's userId/tenantId (findByIdAndUserId / findByIdAndTenantId), returning 403/404 when User A requests User B's resource.",
    remediationCode: `// ❌ VULNERABLE: Unscoped primary-key lookup allows User A to read/modify User B's record\nconst record = await repo.findById(req.params.id);\n\n// ✅ REMEDIATED (Compound Ownership Predicate — Verified with User A vs User B 403/404 Test):\nconst record = await repo.findByIdAndUserId(req.params.id, req.user.id);\n// SQL equivalent: SELECT * FROM records WHERE id = :id AND user_id = :authenticatedUserId AND tenant_id = :tenantId\nif (!record) {\n  return res.status(404).json({ error: "Resource not found in caller ownership scope" });\n}`,
  },
  "AUTH-JWT-DECODE-NOVERIFY": {
    cwe: "CWE-347",
    cweName: "Improper Verification of Cryptographic Signature (Unverified JWT Decode)",
    severity: "Critical",
    cvss: 9.1,
  },
  "AUTH-JWT-ALG-NONE": {
    cwe: "CWE-347",
    cweName: "Improper Verification of Cryptographic Signature (JWT Algorithm 'none' Allowed)",
    severity: "Critical",
    cvss: 9.1,
  },
  "AUTH-JAVA-JJWT-PARSE": {
    cwe: "CWE-347",
    cweName: "Improper Verification of Cryptographic Signature (JJWT Unsigned Token Parse)",
    severity: "Critical",
    cvss: 9.1,
  },
  "AUTH-MASS-ASSIGNMENT-NODE": {
    cwe: "CWE-915",
    cweName: "Improperly Controlled Modification of Dynamically-Determined Object Attributes (Mass Assignment)",
    severity: "High",
    cvss: 7.1,
  },
  "AUTH-CORS-WILDCARD": {
    cwe: "CWE-942",
    cweName: "Permissive Cross-domain Policy with Untrusted Domains (CORS Wildcard)",
    severity: "Medium",
    cvss: 5.4,
  },
  "AUTH-SPRING-CROSSORIGIN": {
    cwe: "CWE-942",
    cweName: "Permissive Cross-domain Policy with Untrusted Domains (@CrossOrigin Wildcard)",
    severity: "Medium",
    cvss: 5.4,
  },
  "AUTH-SPRING-CSRF-DISABLE": {
    cwe: "CWE-352",
    cweName: "Cross-Site Request Forgery (CSRF Protection Disabled)",
    severity: "Medium",
    cvss: 6.5,
  },
  "AUTH-DJANGO-CSRF-EXEMPT": {
    cwe: "CWE-352",
    cweName: "Cross-Site Request Forgery (@csrf_exempt on State-Changing Endpoint)",
    severity: "Medium",
    cvss: 6.5,
  },
  "AUTH-PAM-PASSWORD-LOG": {
    cwe: "CWE-532",
    cweName: "Insertion of Sensitive Information into Log File (Plaintext Password Logged)",
    severity: "High",
    cvss: 7.5,
  },
  "SCA-JSONWEBTOKEN-CVE": {
    cwe: "CWE-1395",
    cweName: "Dependency on Vulnerable Third-Party Component (CVE-2022-23529: jsonwebtoken < 9.0.0)",
    severity: "High",
    cvss: 7.6,
    owasp: "A06:2021 · API8:2023 Vulnerable & Outdated Components",
    asvs: "ASVS V14.2.1 (Dependency Version & Reachability)",
    sanitizerHint: "Upgrade jsonwebtoken to >= 9.0.2 in package.json/lockfile and pass only verified string/Buffer/KeyObject secrets with explicit algorithms allowlist to jwt.verify()",
    remediationSummary:
      "CVE-2022-23529 affects jsonwebtoken < 9.0.0 ONLY if an untrusted object with a malicious toString() method is passed as secretOrPublicKey to jwt.verify(). Upgrade jsonwebtoken to >= 9.0.2 in package.json and lockfile, and verify call-graph reachability of jwt.verify() secretOrPublicKey arguments.",
    remediationCode: `// ❌ VULNERABLE MANIFEST ENTRY (package.json — Declared version < 9.0.0)\n"dependencies": {\n  "jsonwebtoken": "0.4.0"\n}\n\n// ✅ REMEDIATED (1. Upgrade package.json + lockfile to jsonwebtoken >= 9.0.2)\n"dependencies": {\n  "jsonwebtoken": "^9.0.2"\n}\n\n// ✅ REMEDIATED (2. Pin RS256/HS256 algorithm and pass a verified KeyObject/string secret to jwt.verify):\nimport jwt from "jsonwebtoken";\nexport function verifyAccessToken(token: string, rsaPublicKeyPem: string) {\n  return jwt.verify(token, rsaPublicKeyPem, {\n    algorithms: ["RS256"],\n    issuer: "urn:xtrike:auth",\n  });\n}`,
  },
  "CERT-MULTER-NO-LIMITS": {
    cwe: "CWE-770",
    cweName: "Allocation of Resources Without Limits or Throttling (Multer Upload Missing limits.fileSize)",
    severity: "Medium",
    cvss: 5.3,
    owasp: "A04:2021 · API4:2023 Unrestricted Resource Consumption",
    asvs: "ASVS V12.1.1 (File Upload Size & Count Quotas)",
    sanitizerHint: "Configure multer({ storage, limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10 }, fileFilter })",
    remediationSummary:
      "Enforce explicit limits.fileSize, limits.files, limits.fields, and strict MIME/extension allowlist in Express Multer middleware to prevent memory and disk exhaustion on multipart uploads.",
    remediationCode: `// ❌ VULNERABLE: Express Multer initialized without limits.fileSize or file count quota\nconst upload = multer({ storage });\n\n// ✅ REMEDIATED (TypeScript / Express): Enforce explicit 5 MB fileSize limit, single-file cap, and MIME allowlist\nconst ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "application/pdf"]);\nexport const uploadBounded = multer({\n  storage: multer.memoryStorage(),\n  limits: {\n    fileSize: 5 * 1024 * 1024, // 5 MB hard ceiling\n    files: 1,\n    fields: 10,\n  },\n  fileFilter: (_req, file, cb) => {\n    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {\n      return cb(new Error("Unsupported upload MIME type"));\n    }\n    cb(null, true);\n  },\n});\n\n// ✅ REGRESSION TEST (Jest / Supertest — TC-UPLOAD-770-001):\n// Expects HTTP 413 Payload Too Large (LIMIT_FILE_SIZE) when uploading a >5 MB buffer.`,
  },
  "CERT-UNCAUGHT-EXIT": {
    cwe: "CWE-382",
    cweName: "J2EE / Server Bad Practices: Direct Use of System Exit (process.exit in Server Handler)",
    severity: "Medium",
    cvss: 5.3,
    owasp: "A05:2021 Security Misconfiguration",
    asvs: "ASVS V7.4.1 (Structured Error Handling & Graceful Shutdown)",
    sanitizerHint: "Replace direct process.exit() inside request/event handlers with structured error propagation (next(err)) and graceful server.close() drain on fatal bootstrap errors",
    remediationSummary:
      "Avoid calling process.exit() directly inside HTTP route callbacks or recoverable event handlers, which terminates all in-flight requests abruptly. Propagate request errors via next(err) and use graceful server.close() with a drain timeout on fatal startup failures.",
    remediationCode: `// ❌ VULNERABLE: Abrupt process.exit(1) inside server runtime callback terminates all active requests\nprocess.exit(1);\n\n// ✅ REMEDIATED (TypeScript / Node.js): Graceful HTTP server drain + structured error middleware\nexport function initiateGracefulShutdown(server: import("http").Server, reason: Error): void {\n  console.error("[FATAL] Initiating graceful server drain:", reason.message);\n  server.close(() => {\n    process.exitCode = 1;\n  });\n  setTimeout(() => process.exit(1), 10_000).unref();\n}`,
  },
  "CERT-REDOS-DYNAMIC-REGEX": {
    cwe: "CWE-1333",
    cweName: "Inefficient Regular Expression Complexity (Dynamic RegExp from Request Input)",
    severity: "Medium",
    cvss: 5.3,
    sanitizerHint: "Escape regex metacharacters (str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')) or use literal string methods (.includes / .startsWith)",
    remediationSummary:
      "Never construct new RegExp(untrustedInput) directly from user-supplied strings, which enables Regular Expression Denial of Service (ReDoS). Use literal string comparison or escape all regex metacharacters and bound input length.",
    remediationCode: `// ❌ VULNERABLE: User input passed directly into new RegExp() enables catastrophic backtracking\nconst pattern = new RegExp(req.query.filter);\n\n// ✅ REMEDIATED (TypeScript): Bound input length and escape all regular expression metacharacters\nfunction escapeRegExpLiteral(raw: string): string {\n  return raw.slice(0, 128).replace(/[.*+?^$\${}()|[\\]\\\\]/g, "\\\\$&");\n}\nconst safePattern = new RegExp(escapeRegExpLiteral(String(req.query.filter ?? "")), "i");`,
  },
};

// Materialize the complete 400-Plugin Catalog deterministically
export const SAST_400_PLUGINS: SASTPluginDefinition[] = (() => {
  const list: SASTPluginDefinition[] = [];
  let counter = 1;
  for (const seed of DOMAIN_SEEDS) {
    for (const v of seed.variants) {
      const pluginId = `PLG-${String(counter).padStart(3, "0")}`;
      const override = VARIANT_SPECIFIC_OVERRIDES[v.code];
      let mitreAttack = override?.mitreAttack || seed.mitreAttack;
      let sanitizerHint = override?.sanitizerHint || seed.sanitizerHint;
      let severity = override?.severity || seed.severity;
      let cvss = override?.cvss ?? seed.cvss;

      if (seed.cwe === "CWE-94") {
        if (v.languages.includes("Python")) {
          mitreAttack = "T1059.006 (Python Execution — Conditional on Runtime Reachability)";
          sanitizerHint = "Parse data with json.loads() or ast.literal_eval() and validate against a strict Pydantic/JSON schema.";
        } else if (v.languages.includes("Java")) {
          mitreAttack =
            v.code === "CODEI-JAVA-COMPILER"
              ? "N/A — Java Dynamic Compilation API (Compilation alone does not establish T1059 execution)"
              : "N/A — Java Expression/Script API (Requires Source-to-Sink & Execution Path Verification)";
          sanitizerHint =
            "Parse structured input as data via Jackson ObjectMapper with strict DTO schema validation; if compiling user code, isolate in an external sandbox with -proc:none.";
          if (v.code === "CODEI-JAVA-COMPILER") {
            severity = "Medium";
            cvss = 5.3;
          }
        } else if (v.languages.includes("Node.js") || v.languages.includes("TypeScript")) {
          mitreAttack = "T1059.007 (JavaScript Execution — Conditional on Runtime Reachability)";
          sanitizerHint = "Parse structured data with JSON.parse() and validate against a strict Zod/JSON schema; never invoke eval() or new Function().";
        }
      }

      list.push({
        pluginId,
        code: v.code,
        name: v.name,
        category: override?.category || seed.category,
        severity,
        cvss,
        epss: override?.epss ?? seed.epss,
        cwe: override?.cwe || seed.cwe,
        cweName: override?.cweName || seed.cweName,
        owasp: override?.owasp || seed.owasp,
        asvs: override?.asvs || seed.asvs,
        nist80053: override?.nist80053 || seed.nist80053,
        nistSsdf: override?.nistSsdf || seed.nistSsdf,
        pciDss: override?.pciDss || seed.pciDss,
        iso27001: override?.iso27001 || seed.iso27001,
        mitreAttack,
        checkmarxQuery: v.cxQuery,
        ibmRuleId: v.ibmRule,
        fortifyKingdom: override?.fortifyKingdom || seed.fortifyKingdom,
        fortifyAnalyzer: override?.fortifyAnalyzer || seed.fortifyAnalyzer,
        languages: v.languages,
        fastTokens: v.fastTokens.map((t) => t.toLowerCase()),
        pattern: v.pattern,
        sanitizerHint,
        remediationSummary: override?.remediationSummary || seed.remediationSummary,
        remediationCode: override?.remediationCode,
      });
      counter++;
    }
  }
  return list;
})();

export const SAST_400_CATEGORIES: {
  category: SASTPluginCategory;
  count: number;
  standards: string[];
}[] = (() => {
  const map = new Map<SASTPluginCategory, { count: number; standards: Set<string> }>();
  for (const p of SAST_400_PLUGINS) {
    const existing = map.get(p.category) || { count: 0, standards: new Set<string>() };
    existing.count += 1;
    existing.standards.add(p.owasp);
    existing.standards.add(p.nist80053);
    existing.standards.add(p.pciDss);
    map.set(p.category, existing);
  }
  return Array.from(map.entries()).map(([category, val]) => ({
    category,
    count: val.count,
    standards: Array.from(val.standards),
  }));
})();
