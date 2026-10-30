import { analyzeInterprocedural } from "../lib/interprocedural-engine";

type Case = {
  name: string;
  files: { path: string; content: string }[];
  expect: { cwe: string; cross?: boolean; feas?: string }[]; // exact set of flows expected
};

const cases: Case[] = [
  {
    name: "py direct SQLi f-string",
    files: [{ path: "a.py", content: `from flask import request
def view():
    user_id = request.args.get("user_id", "")
    cursor.execute(f"SELECT * FROM accounts WHERE user_id = '{user_id}'")
` }],
    expect: [{ cwe: "CWE-89", cross: false, feas: "FEASIBLE" }],
  },
  {
    name: "py parameterized query is safe",
    files: [{ path: "a.py", content: `def view():
    user_id = request.args.get("user_id", "")
    cursor.execute("SELECT * FROM accounts WHERE user_id = %s", (user_id,))
` }],
    expect: [],
  },
  {
    name: "py cross-function SQLi",
    files: [{ path: "a.py", content: `def run_query(uid):
    sql = "SELECT * FROM t WHERE id = '" + uid + "'"
    cursor.execute(sql)

def view():
    user_id = request.args.get("user_id")
    run_query(user_id)
` }],
    expect: [{ cwe: "CWE-89", cross: true, feas: "FEASIBLE" }],
  },
  {
    name: "py cross-file via return value",
    files: [
      { path: "inputs.py", content: `def get_host():
    return request.args.get("host")
` },
      { path: "views.py", content: `import os
def ping():
    h = get_host()
    os.system("ping -c 1 " + h)
` },
    ],
    expect: [{ cwe: "CWE-78", cross: true, feas: "FEASIBLE" }],
  },
  {
    name: "py sanitized by int()",
    files: [{ path: "a.py", content: `def view():
    uid = int(request.args.get("uid"))
    cursor.execute("SELECT * FROM t WHERE id = " + str(uid))
` }],
    expect: [],
  },
  {
    name: "py subprocess list shell=False safe",
    files: [{ path: "a.py", content: `import subprocess
def view():
    h = request.args.get("h")
    subprocess.run(["/usr/bin/ping", "-c", "1", h], shell=False, check=True)
` }],
    expect: [],
  },
  {
    name: "py subprocess shell=True fstring",
    files: [{ path: "a.py", content: `import subprocess
def view():
    cmd_arg = request.args.get("q")
    subprocess.Popen(f"nslookup {cmd_arg}", shell=True)
` }],
    expect: [{ cwe: "CWE-78", cross: false }],
  },
  {
    name: "py pickle.loads(request.data)",
    files: [{ path: "a.py", content: `import pickle
def load():
    obj = pickle.loads(request.data)
    return obj
` }],
    expect: [{ cwe: "CWE-502", cross: false }],
  },
  {
    name: "py constant-false branch infeasible",
    files: [{ path: "a.py", content: `def view():
    q = request.args.get("q")
    if False:
        cursor.execute("SELECT " + q)
` }],
    expect: [{ cwe: "CWE-89", feas: "INFEASIBLE" }],
  },
  {
    name: "py contradictory conditions infeasible",
    files: [{ path: "a.py", content: `def view():
    q = request.args.get("q")
    mode = "a"
    if mode == "a":
        if mode == "b":
            cursor.execute("SELECT " + q)
` }],
    expect: [{ cwe: "CWE-89", feas: "INFEASIBLE" }],
  },
  {
    name: "py validation guard dominates SSRF",
    files: [{ path: "a.py", content: `import requests
def hook():
    url = request.args.get("url")
    if not is_allowed_url(url):
        return "blocked"
    requests.get(url, timeout=3)
` }],
    expect: [{ cwe: "CWE-918", feas: "GUARDED" }],
  },
  {
    name: "js express anonymous handler SQLi",
    files: [{ path: "app.js", content: `app.get('/x', (req, res) => {
  const id = req.query.id;
  db.query(\`SELECT * FROM t WHERE id = \${id}\`);
});
` }],
    expect: [{ cwe: "CWE-89", cross: false }],
  },
  {
    name: "js cross-function eval",
    files: [{ path: "app.js", content: `function runIt(expr) {
  return eval(expr);
}
app.post('/calc', (req, res) => {
  const e = req.body.expr;
  res.send(String(runIt(e)));
});
` }],
    expect: [{ cwe: "CWE-94", cross: true }],
  },
  {
    name: "java annotated param concat SQLi",
    files: [{ path: "A.java", content: `public class A {
    public String injectableQuery(@RequestParam String account, Connection connection) throws Exception {
        String query = "SELECT * FROM user_data WHERE last_name = '" + account + "'";
        Statement statement = connection.createStatement();
        ResultSet results = statement.executeQuery(query);
        return results.toString();
    }
}
` }],
    expect: [{ cwe: "CWE-89", cross: false }],
  },
  {
    name: "java PreparedStatement safe",
    files: [{ path: "A.java", content: `public class A {
    public String q(@RequestParam String account, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM t WHERE n = ?");
        ps.setString(1, account);
        ResultSet rs = ps.executeQuery();
        return rs.toString();
    }
}
` }],
    expect: [],
  },
  {
    name: "java multiline BenchmarkJava servlet doPost SQLi + XSS",
    files: [{ path: "BenchmarkTest00001.java", content: `public class BenchmarkTest00001 extends HttpServlet {
    @Override
    public void doPost(
            HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String param = request.getParameter("BenchmarkTest00001");
        String sql = "SELECT * from USERS where USERNAME='foo' and PASSWORD='" + param + "'";
        Statement statement = DatabaseHelper.getSqlStatement();
        statement.execute(sql);
        response.getWriter().println("Result: " + param);
    }
}
` }],
    expect: [
      { cwe: "CWE-89", cross: false, feas: "FEASIBLE" },
      { cwe: "CWE-79", cross: false, feas: "FEASIBLE" },
    ],
  },
  {
    name: "java 3-file Controller -> Service -> Repository cross-module SQLi chain",
    files: [
      {
        path: "Controller.java",
        content: `public class Controller {
    public void controller(HttpServletRequest request, Service service) throws Exception {
        String input = request.getParameter("query");
        service.process(input);
    }
}
`,
      },
      {
        path: "Service.java",
        content: `public class Service {
    public void process(String input) throws Exception {
        repository.execute(input);
    }
}
`,
      },
      {
        path: "Repository.java",
        content: `public class Repository {
    public void execute(String input) throws Exception {
        statement.executeQuery("SELECT * FROM users WHERE name = '" + input + "'");
    }
}
`,
      },
    ],
    expect: [{ cwe: "CWE-89", cross: true, feas: "FEASIBLE" }],
  },
];

// ---- C# ----
cases.push(
  {
    name: "cs SqlCommand concatenation from Request.Query",
    files: [{ path: "Tests/Test00104.cs", content: `public class Test00104 : ControllerBase {
    public IActionResult Get() {
        var userFilter = Request.Query["filter"];
        var conn = new SqlConnection(cs);
        var cmd = new SqlCommand("SELECT * FROM Invoices WHERE Customer = '" + userFilter + "'", conn);
        return Ok(cmd.ExecuteReader());
    }
}
` }],
    expect: [{ cwe: "CWE-89", cross: false, feas: "FEASIBLE" }],
  },
  {
    name: "cs SqlCommand parameterized is safe",
    files: [{ path: "Tests/Test00105.cs", content: `public class Test00105 : ControllerBase {
    public IActionResult Get() {
        var userFilter = Request.Query["filter"];
        using var cmd = new SqlCommand("SELECT * FROM Invoices WHERE Customer = @c", conn);
        cmd.Parameters.AddWithValue("@c", userFilter);
        return Ok(cmd.ExecuteReader());
    }
}
` }],
    expect: [],
  },
  {
    name: "cs Process.Start with cmd.exe /c concatenation",
    files: [{ path: "Tests/Test00104.cs", content: `public class Test00104 : ControllerBase {
    public IActionResult Diag() {
        var diagArg = Request.Query["host"];
        Process.Start("cmd.exe", "/c ping " + diagArg);
        return Ok();
    }
}
` }],
    expect: [{ cwe: "CWE-78", cross: false }],
  },
  {
    name: "cs ProcessStartInfo.ArgumentList is safe",
    files: [{ path: "Tests/Test00106.cs", content: `public class Test00106 : ControllerBase {
    public IActionResult Diag([FromQuery] string host) {
        var psi = new ProcessStartInfo("ping") { UseShellExecute = false };
        psi.ArgumentList.Add("-n");
        psi.ArgumentList.Add(host);
        using var proc = Process.Start(psi);
        return Ok();
    }
}
` }],
    expect: [],
  },
  {
    name: "cs ProcessStartInfo.Arguments concatenation",
    files: [{ path: "Tests/Test00107.cs", content: `public class Test00107 : ControllerBase {
    public IActionResult Diag([FromQuery] string host) {
        var psi = new ProcessStartInfo("ping");
        psi.Arguments = "-n 1 " + host;
        Process.Start(psi);
        return Ok();
    }
}
` }],
    expect: [{ cwe: "CWE-78", cross: false }],
  },
  {
    name: "cs cross-method SQLi with async/await",
    files: [{ path: "Tests/Repo.cs", content: `public class Repo {
    private async Task<object> Find(string name) {
        var cmd = new SqlCommand($"SELECT * FROM Users WHERE Name = '{name}'", conn);
        return await cmd.ExecuteReaderAsync();
    }
    public async Task<IActionResult> Handle([FromQuery] string user) {
        var r = await Find(user);
        return Ok(r);
    }
}
` }],
    expect: [{ cwe: "CWE-89", cross: true }],
  }
);
let failed = 0;
for (const c of cases) {
  const res = analyzeInterprocedural(c.files);
  const got = res.flows.map((f) => ({ cwe: f.cwe, cross: f.crossesFunctions, feas: f.pathFeasibility.status }));
  let ok = got.length === c.expect.length;
  if (ok) {
    for (const e of c.expect) {
      const hit = got.find(
        (g) => g.cwe === e.cwe && (e.cross === undefined || g.cross === e.cross) && (e.feas === undefined || g.feas === e.feas)
      );
      if (!hit) ok = false;
    }
  }
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}  -> ${JSON.stringify(got)}  fns=${res.functions.length}`);
  if (!ok) {
    failed++;
    console.log("   expected", JSON.stringify(c.expect));
  }
}
console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
