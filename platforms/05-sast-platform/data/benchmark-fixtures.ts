/**
 * Labeled benchmark fixtures. Each fixture is a small program with a ground-truth label for ONE weakness class.
 *
 * Split policy:
 *  - "development": used while building / tuning the engines.
 *  - "held_out":    written afterwards and executed against the engines WITHOUT tuning on its results.
 *
 * Disclosure: the same team wrote the engines and every fixture, so even the held-out split is not an
 * independent third-party evaluation. It measures regressions and generalization to unseen cases, not
 * accuracy on real-world repositories.
 */
export type BenchmarkSplit = "development" | "held_out";

export interface BenchmarkFixture {
  id: string;
  split: BenchmarkSplit;
  category: string;
  /** CWE class under test */
  cwe: string;
  vulnerable: boolean;
  /** true when a correct detection requires following data across functions or files */
  interprocedural?: boolean;
  language: "Python" | "JavaScript" | "Java" | "C#";
  description: string;
  files: { path: string; content: string }[];
}

export const BENCHMARK_FIXTURES: BenchmarkFixture[] = [
  /* ============================ DEVELOPMENT ============================ */
  {
    id: "DEV-SQLI-01",
    split: "development",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: true,
    language: "Python",
    description: "f-string SQL built from request arg",
    files: [{ path: "app/views.py", content: `from flask import request
def account():
    user_id = request.args.get("user_id", "")
    cursor.execute(f"SELECT * FROM accounts WHERE user_id = '{user_id}'")
    return "ok"
` }],
  },
  {
    id: "DEV-SQLI-02",
    split: "development",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "Python",
    description: "driver-parameterized query",
    files: [{ path: "app/views.py", content: `from flask import request
def account():
    user_id = request.args.get("user_id", "")
    cursor.execute("SELECT * FROM accounts WHERE user_id = %s", (user_id,))
    return "ok"
` }],
  },
  {
    id: "DEV-SQLI-03",
    split: "development",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: true,
    language: "JavaScript",
    description: "template-literal SQL in Express handler",
    files: [{ path: "routes/search.js", content: `app.get('/search', (req, res) => {
  const q = req.query.q;
  db.query(\`SELECT * FROM products WHERE name LIKE '%\${q}%'\`);
  res.send('ok');
});
` }],
  },
  {
    id: "DEV-SQLI-04",
    split: "development",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: true,
    language: "Java",
    description: "concatenated SQL from @RequestParam",
    files: [{ path: "src/main/java/app/Lesson.java", content: `public class Lesson {
    public String injectableQuery(@RequestParam String account, Connection connection) throws Exception {
        String query = "SELECT * FROM user_data WHERE last_name = '" + account + "'";
        Statement statement = connection.createStatement();
        ResultSet results = statement.executeQuery(query);
        return results.toString();
    }
}
` }],
  },
  {
    id: "DEV-SQLI-05",
    split: "development",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "Java",
    description: "PreparedStatement with bound parameter",
    files: [{ path: "src/main/java/app/Lesson.java", content: `public class Lesson {
    public String safeQuery(@RequestParam String account, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM user_data WHERE last_name = ?");
        ps.setString(1, account);
        ResultSet results = ps.executeQuery();
        return results.toString();
    }
}
` }],
  },
  {
    id: "DEV-CMD-01",
    split: "development",
    category: "OS command injection",
    cwe: "CWE-78",
    vulnerable: true,
    language: "Python",
    description: "shell=True with f-string",
    files: [{ path: "app/net.py", content: `import subprocess
from flask import request
def lookup():
    cmd_arg = request.args.get("host")
    subprocess.Popen(f"nslookup {cmd_arg}", shell=True)
` }],
  },
  {
    id: "DEV-CMD-02",
    split: "development",
    category: "OS command injection",
    cwe: "CWE-78",
    vulnerable: false,
    language: "Python",
    description: "argv list, shell disabled",
    files: [{ path: "app/net.py", content: `import subprocess
from flask import request
def lookup():
    host = request.args.get("host")
    subprocess.run(["/usr/bin/nslookup", host], shell=False, check=True, timeout=5)
` }],
  },
  {
    id: "DEV-DESER-01",
    split: "development",
    category: "Unsafe deserialization",
    cwe: "CWE-502",
    vulnerable: true,
    language: "Python",
    description: "pickle.loads on request body",
    files: [{ path: "app/api.py", content: `import pickle
from flask import request
def load():
    obj = pickle.loads(request.data)
    return str(obj)
` }],
  },
  {
    id: "DEV-DESER-02",
    split: "development",
    category: "Unsafe deserialization",
    cwe: "CWE-502",
    vulnerable: false,
    language: "Python",
    description: "yaml.safe_load",
    files: [{ path: "app/api.py", content: `import yaml
from flask import request
def load():
    cfg = yaml.safe_load(request.data)
    return str(cfg)
` }],
  },
  {
    id: "DEV-DESER-03",
    split: "development",
    category: "Unsafe deserialization",
    cwe: "CWE-502",
    vulnerable: true,
    language: "Java",
    description: "readObject on Base64 cookie (found an engine bug: receiver-stream sinks; moved here from the held-out split after debugging)",
    files: [{ path: "src/main/java/app/Sessions.java", content: `public class Sessions {
    public Object restore(HttpServletRequest request) throws Exception {
        Cookie c = request.getCookies()[0];
        byte[] data = Base64.getDecoder().decode(c.getValue());
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
        return ois.readObject();
    }
}
` }],
  },
  {
    id: "DEV-CODE-01",
    split: "development",
    category: "Code injection",
    cwe: "CWE-94",
    vulnerable: true,
    language: "JavaScript",
    description: "eval of request body",
    files: [{ path: "routes/calc.js", content: `app.post('/calc', (req, res) => {
  const total = eval(req.body.expr);
  res.send(String(total));
});
` }],
  },
  {
    id: "DEV-SSRF-01",
    split: "development",
    category: "SSRF",
    cwe: "CWE-918",
    vulnerable: true,
    language: "Python",
    description: "requests.get on user URL",
    files: [{ path: "app/hooks.py", content: `import requests
from flask import request
def hook():
    webhook = request.args.get("webhook")
    r = requests.get(webhook, timeout=3)
    return r.text
` }],
  },
  {
    id: "DEV-SSRF-02",
    split: "development",
    category: "SSRF",
    cwe: "CWE-918",
    vulnerable: true,
    language: "JavaScript",
    description: "fetch on user URL",
    files: [{ path: "routes/proxy.js", content: `app.post('/proxy', async (req, res) => {
  const response = await fetch(req.body.imageUrl);
  res.send(await response.text());
});
` }],
  },
  {
    id: "DEV-XMOD-01",
    split: "development",
    category: "Inter-procedural",
    cwe: "CWE-89",
    vulnerable: true,
    interprocedural: true,
    language: "Python",
    description: "tainted arg flows into helper that builds SQL",
    files: [{ path: "app/db.py", content: `def run_query(uid):
    sql = "SELECT * FROM t WHERE id = '" + uid + "'"
    cursor.execute(sql)

def view():
    user_id = request.args.get("user_id")
    run_query(user_id)
` }],
  },
  {
    id: "DEV-XMOD-02",
    split: "development",
    category: "Inter-procedural",
    cwe: "CWE-78",
    vulnerable: true,
    interprocedural: true,
    language: "Python",
    description: "source in one file, sink in another, via return value",
    files: [
      { path: "app/inputs.py", content: `def get_host():
    return request.args.get("host")
` },
      { path: "app/views.py", content: `import os
def ping():
    h = get_host()
    os.system("ping -c 1 " + h)
` },
    ],
  },

  /* ============================== HELD OUT ============================== */
  {
    id: "HO-SQLI-01",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: true,
    language: "Python",
    description: "str.format-built SQL",
    files: [{ path: "service/orders.py", content: `from flask import request
def find_order():
    oid = request.form["order_id"]
    query = "SELECT * FROM orders WHERE id = '{}'".format(oid)
    cursor.execute(query)
` }],
  },
  {
    id: "HO-SQLI-02",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: true,
    language: "Python",
    description: "percent-formatted SQL",
    files: [{ path: "service/orders.py", content: `from flask import request
def find_order():
    name = request.args.get("name")
    cursor.execute("SELECT * FROM customers WHERE name = '%s'" % name)
` }],
  },
  {
    id: "HO-SQLI-03",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "Python",
    description: "int() cast before use",
    files: [{ path: "service/orders.py", content: `from flask import request
def find_order():
    oid = int(request.args.get("order_id"))
    cursor.execute("SELECT * FROM orders WHERE id = " + str(oid))
` }],
  },
  {
    id: "HO-SQLI-04",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "Python",
    description: "constant SQL only",
    files: [{ path: "service/report.py", content: `def nightly():
    table = "audit_logs"
    cursor.execute("SELECT count(*) FROM " + table)
` }],
  },
  {
    id: "HO-SQLI-05",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "JavaScript",
    description: "pg positional parameter",
    files: [{ path: "routes/users.js", content: `app.get('/user', async (req, res) => {
  const id = req.query.id;
  const rows = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  res.json(rows);
});
` }],
  },
  {
    id: "HO-SQLI-06",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "Python",
    description: "tainted SQL only inside a constant-false branch",
    files: [{ path: "service/legacy.py", content: `from flask import request
def legacy():
    q = request.args.get("q")
    if False:
        cursor.execute("SELECT * FROM t WHERE n = '" + q + "'")
` }],
  },
  {
    id: "HO-CMD-01",
    split: "held_out",
    category: "OS command injection",
    cwe: "CWE-78",
    vulnerable: true,
    language: "Python",
    description: "os.system with concatenation",
    files: [{ path: "tools/ping.py", content: `import os
from flask import request
def ping():
    host = request.args.get("host")
    os.system("ping -c 1 " + host)
` }],
  },
  {
    id: "HO-CMD-02",
    split: "held_out",
    category: "OS command injection",
    cwe: "CWE-78",
    vulnerable: false,
    language: "Python",
    description: "shlex.quote applied",
    files: [{ path: "tools/ping.py", content: `import os, shlex
from flask import request
def ping():
    host = shlex.quote(request.args.get("host"))
    os.system("ping -c 1 " + host)
` }],
  },
  {
    id: "HO-CMD-03",
    split: "held_out",
    category: "OS command injection",
    cwe: "CWE-78",
    vulnerable: true,
    language: "JavaScript",
    description: "child_process.exec with template literal",
    files: [{ path: "routes/dns.js", content: `const child_process = require('child_process');
app.get('/dns', (req, res) => {
  const host = req.query.host;
  child_process.exec(\`nslookup \${host}\`, (err, out) => res.send(out));
});
` }],
  },
  {
    id: "HO-DESER-02",
    split: "held_out",
    category: "Unsafe deserialization",
    cwe: "CWE-502",
    vulnerable: true,
    language: "Java",
    description: "readObject on the servlet input stream",
    files: [{ path: "src/main/java/app/Importer.java", content: `public class Importer {
    public Object load(HttpServletRequest request) throws Exception {
        InputStream in = request.getInputStream();
        ObjectInputStream ois = new ObjectInputStream(in);
        return ois.readObject();
    }
}
` }],
  },
  {
    id: "HO-DESER-03",
    split: "held_out",
    category: "Unsafe deserialization",
    cwe: "CWE-502",
    vulnerable: true,
    language: "Python",
    description: "unsafe yaml.load on request body",
    files: [{ path: "service/config_api.py", content: `import yaml
from flask import request
def update():
    cfg = yaml.load(request.data)
    return str(cfg)
` }],
  },
  {
    id: "HO-DESER-04",
    split: "held_out",
    category: "Unsafe deserialization",
    cwe: "CWE-502",
    vulnerable: false,
    language: "Python",
    description: "json.loads instead of a native deserializer",
    files: [{ path: "service/config_api.py", content: `import json
from flask import request
def update():
    cfg = json.loads(request.data)
    return str(cfg)
` }],
  },
  {
    id: "HO-SSRF-01",
    split: "held_out",
    category: "SSRF",
    cwe: "CWE-918",
    vulnerable: true,
    interprocedural: true,
    language: "Python",
    description: "tainted URL passed to a fetch helper",
    files: [{ path: "service/fetcher.py", content: `import requests
def fetch_remote(url):
    return requests.get(url, timeout=3).text

def callback():
    target = request.json["callback_url"]
    return fetch_remote(target)
` }],
  },
  {
    id: "HO-SSRF-02",
    split: "held_out",
    category: "SSRF",
    cwe: "CWE-918",
    vulnerable: false,
    language: "Python",
    description: "allowlist guard exits before the request",
    files: [{ path: "service/fetcher.py", content: `import requests
def callback():
    url = request.json["callback_url"]
    if not is_allowed_url(url):
        return "blocked"
    return requests.get(url, timeout=3, allow_redirects=False).text
` }],
  },
  {
    id: "HO-CODE-01",
    split: "held_out",
    category: "Code injection",
    cwe: "CWE-94",
    vulnerable: false,
    language: "Python",
    description: "eval of a constant expression",
    files: [{ path: "service/math_util.py", content: `def default_rate():
    return eval("1 + 2")
` }],
  },
  {
    id: "HO-PATH-01",
    split: "held_out",
    category: "Path traversal",
    cwe: "CWE-22",
    vulnerable: true,
    language: "Python",
    description: "open() on user-supplied path",
    files: [{ path: "service/files.py", content: `from flask import request
def download():
    name = request.args.get("file")
    with open("/srv/uploads/" + name) as fh:
        return fh.read()
` }],
  },
  {
    id: "HO-PATH-02",
    split: "held_out",
    category: "Path traversal",
    cwe: "CWE-22",
    vulnerable: false,
    language: "Python",
    description: "open() on a constant path",
    files: [{ path: "service/files.py", content: `def banner():
    with open("/srv/static/banner.txt") as fh:
        return fh.read()
` }],
  },
  {
    id: "HO-XMOD-01",
    split: "held_out",
    category: "Inter-procedural",
    cwe: "CWE-89",
    vulnerable: true,
    interprocedural: true,
    language: "JavaScript",
    description: "Express handler passes tainted value to helper that concatenates SQL",
    files: [{ path: "routes/invoices.js", content: `function lookup(id) {
  return db.query("SELECT * FROM invoices WHERE id = " + id);
}
app.get('/invoice', (req, res) => {
  const invoiceId = req.query.id;
  res.json(lookup(invoiceId));
});
` }],
  },
  {
    id: "HO-XMOD-02",
    split: "held_out",
    category: "Inter-procedural",
    cwe: "CWE-89",
    vulnerable: true,
    interprocedural: true,
    language: "Java",
    description: "Java handler delegates to a repository method that concatenates SQL",
    files: [{ path: "src/main/java/app/Repo.java", content: `public class Repo {
    public ResultSet find(Connection connection, String name) throws Exception {
        String query = "SELECT * FROM users WHERE name = '" + name + "'";
        Statement st = connection.createStatement();
        return st.executeQuery(query);
    }
    public String handle(@RequestParam String user, Connection connection) throws Exception {
        return find(connection, user).toString();
    }
}
` }],
  },
  {
    id: "HO-CS-SQLI-01",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: true,
    language: "C#",
    description: "ASP.NET Core [FromQuery] parameter concatenated into SqlCommand",
    files: [{ path: "Controllers/SqlInjectionController.cs", content: `using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
public class SqlInjectionController : ControllerBase {
    public IActionResult Search([FromQuery] string userFilter, SqlConnection conn) {
        var cmd = new SqlCommand("SELECT * FROM Invoices WHERE Customer = '" + userFilter + "'", conn);
        return Ok(cmd.ExecuteReader());
    }
}
` }],
  },
  {
    id: "HO-CS-SQLI-02",
    split: "held_out",
    category: "SQL injection",
    cwe: "CWE-89",
    vulnerable: false,
    language: "C#",
    description: "ASP.NET Core SqlCommand with parameterized @customer placeholder and SqlParameter",
    files: [{ path: "Controllers/SafeSqlController.cs", content: `using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
public class SafeSqlController : ControllerBase {
    public IActionResult Search([FromQuery] string userFilter, SqlConnection conn) {
        using var cmd = new SqlCommand("SELECT * FROM Invoices WHERE Customer = @customer", conn);
        cmd.Parameters.AddWithValue("@customer", userFilter);
        return Ok(cmd.ExecuteReader());
    }
}
` }],
  },
  {
    id: "HO-CS-CMD-01",
    split: "held_out",
    category: "OS command injection",
    cwe: "CWE-78",
    vulnerable: true,
    language: "C#",
    description: "C# Process.Start with concatenated diagnostic argument",
    files: [{ path: "Services/CommandDiagnosticsService.cs", content: `using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
public class CommandDiagnosticsService {
    public Process? RunPing([FromQuery] string diagArg) {
        return Process.Start("cmd.exe", "/c ping -n 1 " + diagArg);
    }
}
` }],
  },
  {
    id: "HO-CS-XMOD-01",
    split: "held_out",
    category: "Inter-procedural",
    cwe: "CWE-89",
    vulnerable: true,
    interprocedural: true,
    language: "C#",
    description: "C# controller delegates [FromQuery] input to a repository method that interpolates SqlCommand",
    files: [{ path: "Controllers/InvoiceRepoController.cs", content: `using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
public class InvoiceRepoController : ControllerBase {
    private SqlDataReader QueryByCustomer(SqlConnection conn, string customer) {
        var cmd = new SqlCommand($"SELECT * FROM Invoices WHERE Customer = '{customer}'", conn);
        return cmd.ExecuteReader();
    }
    public IActionResult Get([FromQuery] string customer, SqlConnection conn) {
        return Ok(QueryByCustomer(conn, customer));
    }
}
` }],
  },
  {
    id: "HO-JAVA-XMOD-3HOP",
    split: "held_out",
    category: "Inter-procedural",
    cwe: "CWE-89",
    vulnerable: true,
    interprocedural: true,
    language: "Java",
    description: "3-file Java Controller.java -> Service.java -> Repository.java cross-module SQLi chain",
    files: [
      {
        path: "src/main/java/app/Controller.java",
        content: `package app;
import javax.servlet.http.HttpServletRequest;
public class Controller {
    public void controller(HttpServletRequest request, Service service) throws Exception {
        String input = request.getParameter("query");
        service.process(input);
    }
}
`,
      },
      {
        path: "src/main/java/app/Service.java",
        content: `package app;
public class Service {
    public void process(String input) throws Exception {
        Repository repository = new Repository();
        repository.execute(input);
    }
}
`,
      },
      {
        path: "src/main/java/app/Repository.java",
        content: `package app;
import java.sql.Statement;
public class Repository {
    public void execute(String input) throws Exception {
        Statement statement = null;
        statement.executeQuery("SELECT * FROM users WHERE name = '" + input + "'");
    }
}
`,
      },
    ],
  },
];
