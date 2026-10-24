export type BenchmarkRepoCategory =
  | "All"
  | "OWASP Benchmark Suite"
  | "DAST — Vulnerable Web & API Apps"
  | "DAST + SAST Combined Testing"
  | "Polyglot Vulnerable Snippets"
  | "SAST Rule & Analyzer Testbeds";

export interface BenchmarkSeedFile {
  path: string;
  language: string;
  content: string;
}

export interface BenchmarkRepoTarget {
  id: string;
  name: string;
  ownerRepo: string;
  url: string;
  fallbackGitHubUrl?: string;
  category: Exclude<BenchmarkRepoCategory, "All">;
  testingMode: "SAST" | "DAST + SAST" | "DAST Web/API";
  language: string;
  defaultBranch: string;
  defaultCommitSha: string;
  expectedFindings: number;
  keyCwes: string[];
  description: string;
  seedFiles: BenchmarkSeedFile[];
}

export const BENCHMARK_REPO_CATEGORIES: BenchmarkRepoCategory[] = [
  "All",
  "OWASP Benchmark Suite",
  "DAST — Vulnerable Web & API Apps",
  "DAST + SAST Combined Testing",
  "Polyglot Vulnerable Snippets",
  "SAST Rule & Analyzer Testbeds",
];

/**
 * Complete catalog of 58 SAST, DAST, and Combined DAST+SAST Benchmark, Vulnerable Application,
 * GraphQL/API, Cloud/Serverless, and Static Analyzer Testbed repositories integrated into XTRIKE.
 */
export const BENCHMARK_32_REPOS: BenchmarkRepoTarget[] = [
  // ===========================================================================
  // 1. OWASP BENCHMARK SUITE (8 REPOSITORIES)
  // ===========================================================================
  {
    id: "owasp-benchmark",
    name: "OWASP Benchmark",
    ownerRepo: "OWASP/Benchmark",
    url: "https://github.com/OWASP/Benchmark",
    fallbackGitHubUrl: "https://github.com/OWASP/BenchmarkJava",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "b101e4a98c3d7201",
    expectedFindings: 32,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-22", "CWE-327", "CWE-328"],
    description: "Official OWASP Benchmark test suite evaluating SAST & DAST accuracy, recall, and false-positive suppression across 2,740+ Java servlet test cases.",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/benchmark/testcode/BenchmarkTest00001.java",
        language: "Java",
        content: `package org.owasp.benchmark.testcode;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Statement;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BenchmarkTest00001 extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String param = request.getParameter("BenchmarkTest00001");
        String sql = "SELECT * from USERS where USERNAME='foo' and PASSWORD='" + param + "'";
        try {
            Connection conn = org.owasp.benchmark.helpers.DatabaseHelper.getSqlConnection();
            Statement statement = conn.createStatement();
            statement.execute(sql);
        } catch (Exception e) {
            response.getWriter().println("Error processing SQL");
        }
    }
}`,
      },
      {
        path: "src/main/java/org/owasp/benchmark/testcode/BenchmarkTest00017.java",
        language: "Java",
        content: `package org.owasp.benchmark.testcode;
import java.io.File;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BenchmarkTest00017 {
    public void runCommandAndFile(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String cmd = request.getHeader("X-Benchmark-Command");
        Runtime.getRuntime().exec("sh -c " + cmd);
        File target = new File("/var/owasp/data/" + request.getParameter("reportFile"));
        response.getWriter().write(target.getCanonicalPath());
    }
}`,
      },
    ],
  },
  {
    id: "owasp-benchmark-java",
    name: "OWASP BenchmarkJava",
    ownerRepo: "OWASP/BenchmarkJava",
    url: "https://github.com/OWASP/BenchmarkJava",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "main",
    defaultCommitSha: "b102f8c41d9a6302",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-78", "CWE-90", "CWE-502", "CWE-611"],
    description: "OWASP BenchmarkJava v1.2+ calibration repository containing 2,740+ Java servlet vulnerability test cases for SAST & DAST scorecard verification.",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/benchmark/testcode/BenchmarkTest00842.java",
        language: "Java",
        content: `package org.owasp.benchmark.testcode;
import javax.servlet.http.HttpServletRequest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.io.ObjectInputStream;

public class BenchmarkTest00842 {
    public void handleServlet(HttpServletRequest request, Connection conn) throws Exception {
        String bar = request.getParameter("accountFilter");
        String sql = "SELECT * FROM accounts WHERE owner = '" + bar + "'";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.execute();
        ObjectInputStream ois = new ObjectInputStream(request.getInputStream());
        Object obj = ois.readObject();
    }
}`,
      },
    ],
  },
  {
    id: "shiftleft-benchmark",
    name: "ShiftLeftSecurity Benchmark",
    ownerRepo: "ShiftLeftSecurity/Benchmark",
    url: "https://github.com/ShiftLeftSecurity/Benchmark",
    fallbackGitHubUrl: "https://github.com/OWASP/BenchmarkJava",
    category: "OWASP Benchmark Suite",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "b103c7e52a1b8403",
    expectedFindings: 29,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-22", "CWE-643"],
    description: "Code Property Graph (CPG) & dataflow taint benchmark fork used to measure inter-procedural source-to-sink reachability.",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/benchmark/testcode/CpgDataflowBenchmark01.java",
        language: "Java",
        content: `package org.owasp.benchmark.testcode;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Statement;

public class CpgDataflowBenchmark01 {
    public void traceInterproceduralTaint(HttpServletRequest req, HttpServletResponse resp, Statement stmt) throws Exception {
        String source = req.getParameter("userQuery");
        String propagated = source.trim();
        stmt.executeQuery("SELECT * FROM ledger WHERE memo = '" + propagated + "'");
        resp.getWriter().println("<div>Search result for: " + source + "</div>");
    }
}`,
      },
    ],
  },
  {
    id: "owasp-benchmark-dotnet",
    name: "OWASP BenchmarkDotNet",
    ownerRepo: "OWASP/BenchmarkDotNet",
    url: "https://github.com/OWASP/BenchmarkDotNet",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "C#",
    defaultBranch: "main",
    defaultCommitSha: "b104d2a19f5c9504",
    expectedFindings: 28,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-22", "CWE-918"],
    description: "ASP.NET Core & C# SAST benchmark suite testing ADO.NET SQLi, BinaryFormatter deserialization, and OS Process injection.",
    seedFiles: [
      {
        path: "Controllers/BenchmarkDotNetTest00104.cs",
        language: "C#",
        content: `using System;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Runtime.Serialization.Formatters.Binary;
using Microsoft.AspNetCore.Mvc;

namespace Owasp.BenchmarkDotNet.Controllers {
    [ApiController]
    [Route("api/benchmark/dotnet")]
    public class BenchmarkDotNetTest00104 : ControllerBase {
        [HttpPost("evaluate")]
        public IActionResult Evaluate([FromQuery] string userFilter, [FromQuery] string diagArg) {
            using var conn = new SqlConnection("Server=tcp:prod-db;Password=HardcodedDotNetSecret!2026;");
            var cmd = new SqlCommand("SELECT * FROM Invoices WHERE Customer = '" + userFilter + "'", conn);
            cmd.ExecuteReader();
            Process.Start("cmd.exe", "/c ping " + diagArg);
            var bf = new BinaryFormatter();
            var obj = bf.Deserialize(Request.Body);
            return Ok(obj);
        }
    }
}`,
      },
    ],
  },
  {
    id: "owasp-benchmark-php",
    name: "OWASP BenchmarkPHP",
    ownerRepo: "OWASP/BenchmarkPHP",
    url: "https://github.com/OWASP/BenchmarkPHP",
    fallbackGitHubUrl: "https://github.com/digininja/DVWA",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "PHP",
    defaultBranch: "main",
    defaultCommitSha: "b105e9b31c7d0605",
    expectedFindings: 27,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-98", "CWE-502"],
    description: "PHP SAST benchmark suite covering mysqli query concatenation, shell_exec command injection, LFI/RFI, and unserialize() object injection.",
    seedFiles: [
      {
        path: "testcode/BenchmarkTest00201.php",
        language: "PHP",
        content: `<?php
$param = $_GET['benchmark_param'];
$cmd = $_POST['benchmark_cmd'];
$serialized = $_COOKIE['session_state'];

$query = "SELECT * FROM benchmark_users WHERE token = '" . $param . "'";
mysqli_query($db_conn, $query);

shell_exec("grep -rn " . $cmd . " /var/log/app/");
$state = unserialize(base64_decode($serialized));
echo "<div>Benchmark output: " . $param . "</div>";
?>`,
      },
    ],
  },
  {
    id: "owasp-benchmark-python",
    name: "OWASP BenchmarkPython",
    ownerRepo: "OWASP/BenchmarkPython",
    url: "https://github.com/OWASP/BenchmarkPython",
    fallbackGitHubUrl: "https://github.com/OWASP/pygoat",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "b106f4c82e1a1706",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-918", "CWE-22"],
    description: "Python SAST benchmark testbed evaluating Flask/Django taint paths, subprocess shell=True, pickle.loads, and SSRF.",
    seedFiles: [
      {
        path: "testcode/BenchmarkTest00301.py",
        language: "Python",
        content: `import os
import pickle
import subprocess
import sqlite3
import requests
from flask import Flask, request

app = Flask(__name__)

@app.route("/benchmark/python/test00301", methods=["POST"])
def benchmark_test_00301():
    user_id = request.args.get("user_id", "")
    cmd_arg = request.form.get("cmd", "")
    webhook = request.form.get("webhook_url", "")

    conn = sqlite3.connect("benchmark.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM accounts WHERE user_id = '{user_id}'")

    subprocess.Popen(f"nslookup {cmd_arg}", shell=True)
    requests.get(webhook, timeout=3)
    obj = pickle.loads(request.data)
    return str(obj)
`,
      },
    ],
  },
  {
    id: "owasp-benchmark-go",
    name: "OWASP BenchmarkGo",
    ownerRepo: "OWASP/BenchmarkGo",
    url: "https://github.com/OWASP/BenchmarkGo",
    fallbackGitHubUrl: "https://github.com/securego/gosec",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "Go",
    defaultBranch: "main",
    defaultCommitSha: "b107a3d94b2c2807",
    expectedFindings: 26,
    keyCwes: ["CWE-89", "CWE-78", "CWE-22", "CWE-918", "CWE-327"],
    description: "Go SAST benchmark suite testing database/sql string formatting, os/exec bash invocation, filepath traversal, and SSRF.",
    seedFiles: [
      {
        path: "testcode/benchmark_test_00401.go",
        language: "Go",
        content: `package testcode

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"os/exec"
)

func BenchmarkTest00401(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	acct := r.URL.Query().Get("acct")
	host := r.URL.Query().Get("host")
	file := r.URL.Query().Get("file")

	query := fmt.Sprintf("SELECT balance FROM wallets WHERE owner = '%s'", acct)
	_, _ = db.Query(query)

	cmd := exec.Command("sh", "-c", "ping -c 1 "+host)
	_ = cmd.Run()

	data, _ := os.ReadFile("/var/data/exports/" + file)
	_, _ = w.Write(data)
}
`,
      },
    ],
  },
  {
    id: "owasp-benchmark-javascript",
    name: "OWASP BenchmarkJavaScript",
    ownerRepo: "OWASP/BenchmarkJavaScript",
    url: "https://github.com/OWASP/BenchmarkJavaScript",
    fallbackGitHubUrl: "https://github.com/OWASP/NodeGoat",
    category: "OWASP Benchmark Suite",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "main",
    defaultCommitSha: "b108c5e71d4f3908",
    expectedFindings: 29,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-94", "CWE-918"],
    description: "JavaScript & Node.js SAST benchmark suite testing Express.js SQLi, child_process.exec, eval() injection, and prototype pollution.",
    seedFiles: [
      {
        path: "testcode/BenchmarkTest00501.js",
        language: "Node.js",
        content: `const express = require("express");
const { exec } = require("child_process");
const router = express.Router();

router.post("/benchmark/js/test00501", async (req, res) => {
  const filter = req.query.filter;
  const formula = req.body.formula;
  const host = req.body.host;

  const sql = "SELECT * FROM orders WHERE code = '" + filter + "'";
  await req.db.query(sql);

  exec("traceroute " + host, (err, stdout) => {
    const computed = eval(formula);
    res.send("<div>Output: " + stdout + " / " + computed + "</div>");
  });
});

module.exports = router;
`,
      },
    ],
  },

  // ===========================================================================
  // 2. DAST — VULNERABLE WEB, API, GRAPHQL & CLOUD APPLICATIONS (25 REPOS)
  // ===========================================================================
  {
    id: "juice-shop-official",
    name: "OWASP Juice Shop",
    ownerRepo: "juice-shop/juice-shop",
    url: "https://github.com/juice-shop/juice-shop",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "TypeScript",
    defaultBranch: "master",
    defaultCommitSha: "c201a8f34e9b1011",
    expectedFindings: 34,
    keyCwes: ["CWE-89", "CWE-79", "CWE-94", "CWE-918", "CWE-611", "CWE-798"],
    description: "Flagship OWASP vulnerable modern web application built with Node.js, Express, TypeScript, and Angular containing 100+ real-world DAST & SAST flaws.",
    seedFiles: [
      {
        path: "routes/search.ts",
        language: "TypeScript",
        content: `import { Request, Response, NextFunction } from "express";
import { sequelize } from "../models";
import { exec } from "child_process";

export function searchProducts() {
  return (req: Request, res: Response, next: NextFunction) => {
    const criteria: string = req.query.q as string;
    sequelize.query("SELECT * FROM Products WHERE ((name LIKE '%" + criteria + "%' OR description LIKE '%" + criteria + "%') AND deletedAt IS NULL) ORDER BY name")
      .then(([products]: any) => {
        res.json({ status: "success", data: products });
      });
  };
}

export function trackOrderEval(req: Request, res: Response) {
  const id = req.params.id;
  const evaluated = eval("(" + id + ")");
  exec("curl -s " + req.query.webhookUrl);
  res.send(evaluated);
}
`,
      },
      {
        path: "routes/profileImageUrlUpload.ts",
        language: "TypeScript",
        content: `import { Request, Response } from "express";
import fs from "fs";
import axios from "axios";

export async function profileImageUrlUpload(req: Request, res: Response) {
  const imageUrl = req.body.imageUrl;
  const response = await axios.get(imageUrl, { responseType: "stream" });
  const targetPath = "frontend/dist/frontend/assets/public/images/uploads/" + req.body.fileName;
  fs.writeFileSync(targetPath, response.data);
  res.status(200).send("Uploaded from " + imageUrl);
}
`,
      },
    ],
  },
  {
    id: "owasp-juice-shop-alias",
    name: "OWASP Juice Shop (OWASP Org)",
    ownerRepo: "OWASP/juice-shop",
    url: "https://github.com/OWASP/juice-shop",
    fallbackGitHubUrl: "https://github.com/juice-shop/juice-shop",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "TypeScript",
    defaultBranch: "master",
    defaultCommitSha: "c201f3d91b4c1099",
    expectedFindings: 34,
    keyCwes: ["CWE-89", "CWE-79", "CWE-94", "CWE-918", "CWE-611"],
    description: "OWASP organization mirror of Juice Shop for combined DAST active probing and SAST TypeScript route analysis.",
    seedFiles: [
      {
        path: "routes/b2bOrder.ts",
        language: "TypeScript",
        content: `import { Request, Response } from "express";
import vm from "vm";
import { exec } from "child_process";

export function b2bOrderLines(req: Request, res: Response) {
  const orderLinesData = req.body.orderLinesData || "";
  const result = vm.runInNewContext("eval(" + orderLinesData + ")");
  exec("notify-b2b " + req.body.supplierHost);
  res.json({ orderLines: result });
}
`,
      },
    ],
  },
  {
    id: "bkimminich-juice-shop",
    name: "Juice Shop (bkimminich Mirror)",
    ownerRepo: "bkimminich/juice-shop",
    url: "https://github.com/bkimminich/juice-shop",
    fallbackGitHubUrl: "https://github.com/juice-shop/juice-shop",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "master",
    defaultCommitSha: "c202b7d45f8a2012",
    expectedFindings: 33,
    keyCwes: ["CWE-89", "CWE-79", "CWE-94", "CWE-22", "CWE-798"],
    description: "Upstream creator repository of OWASP Juice Shop covering JWT forgery, NoSQL/$where injection, B2B XML/XXE, and SSRF.",
    seedFiles: [
      {
        path: "routes/login.ts",
        language: "TypeScript",
        content: `import { Request, Response } from "express";
import { sequelize } from "../models";
import jwt from "jsonwebtoken";

const JWT_HARDCODED_PRIVATE_KEY = "super-secret-juice-shop-hmac-key-2026";

export function loginHandler(req: Request, res: Response) {
  const email = req.body.email || "";
  const password = req.body.password || "";
  sequelize.query("SELECT * FROM Users WHERE email = '" + email + "' AND password = '" + password + "' AND deletedAt IS NULL")
    .then(([user]: any) => {
      const token = jwt.sign({ data: user }, JWT_HARDCODED_PRIVATE_KEY);
      res.json({ authentication: { token } });
    });
}
`,
      },
    ],
  },
  {
    id: "digininja-dvwa",
    name: "Damn Vulnerable Web App (digininja/DVWA)",
    ownerRepo: "digininja/DVWA",
    url: "https://github.com/digininja/DVWA",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "PHP",
    defaultBranch: "master",
    defaultCommitSha: "c203d6e12a4c3013",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-98", "CWE-434"],
    description: "Industry-standard PHP/MySQL vulnerable application testing SQL Injection, Command Execution, File Inclusion, and XSS.",
    seedFiles: [
      {
        path: "vulnerabilities/sqli/source/low.php",
        language: "PHP",
        content: `<?php
if (isset($_REQUEST['Submit'])) {
    $id = $_REQUEST['id'];
    $query  = "SELECT first_name, last_name FROM users WHERE user_id = '$id';";
    $result = mysqli_query($GLOBALS["___mysqli_ston"], $query);
    while ($row = mysqli_fetch_assoc($result)) {
        $first = $row["first_name"];
        $last  = $row["last_name"];
        echo "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";
    }
}
?>`,
      },
      {
        path: "vulnerabilities/exec/source/low.php",
        language: "PHP",
        content: `<?php
if (isset($_POST['Submit'])) {
    $target = $_REQUEST['ip'];
    $cmd = shell_exec('ping -c 4 ' . $target);
    echo "<pre>{$cmd}</pre>";
    $page = $_GET['page'];
    include($page);
}
?>`,
      },
    ],
  },
  {
    id: "ethicalhack3r-dvwa",
    name: "DVWA (ethicalhack3r Original)",
    ownerRepo: "ethicalhack3r/DVWA",
    url: "https://github.com/ethicalhack3r/DVWA",
    fallbackGitHubUrl: "https://github.com/digininja/DVWA",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "PHP",
    defaultBranch: "master",
    defaultCommitSha: "c210a4e81d7b3091",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-98", "CWE-352"],
    description: "Original ethicalhack3r DVWA repository used for DAST scanner calibration and PHP SAST taint verification.",
    seedFiles: [
      {
        path: "vulnerabilities/fi/index.php",
        language: "PHP",
        content: `<?php
$file = $_GET['page'];
include($file);
$id = $_GET['user_id'];
mysqli_query($conn, "SELECT * FROM dvwa_users WHERE user_id = '" . $id . "'");
shell_exec("whois " . $_POST['domain']);
?>`,
      },
    ],
  },
  {
    id: "owasp-webgoat",
    name: "OWASP WebGoat (OWASP/WebGoat)",
    ownerRepo: "OWASP/WebGoat",
    url: "https://github.com/OWASP/WebGoat",
    fallbackGitHubUrl: "https://github.com/WebGoat/WebGoat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "main",
    defaultCommitSha: "c204f9a83b5d4014",
    expectedFindings: 34,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-611", "CWE-918", "CWE-798"],
    description: "Deliberately insecure Spring Boot / Java enterprise application maintained by OWASP covering OWASP Top 10 lessons.",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/webgoat/lessons/sqlinjection/introduction/SqlInjectionLesson5a.java",
        language: "Java",
        content: `package org.owasp.webgoat.lessons.sqlinjection.introduction;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.springframework.web.bind.annotation.*;

@RestController
public class SqlInjectionLesson5a {
    @PostMapping("/SqlInjection/attack5a")
    public String injectableQuery(@RequestParam String account, Connection connection) throws Exception {
        String query = "SELECT * FROM user_data WHERE first_name = 'John' AND last_name = '" + account + "'";
        Statement statement = connection.createStatement();
        ResultSet results = statement.executeQuery(query);
        return results.toString();
    }
}`,
      },
    ],
  },
  {
    id: "webgoat-org",
    name: "WebGoat Official (WebGoat/WebGoat)",
    ownerRepo: "WebGoat/WebGoat",
    url: "https://github.com/WebGoat/WebGoat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "main",
    defaultCommitSha: "c211e5b92c8a4092",
    expectedFindings: 34,
    keyCwes: ["CWE-89", "CWE-502", "CWE-611", "CWE-918", "CWE-79"],
    description: "Primary GitHub organization repository for WebGoat & WebWolf interactive DAST/SAST Java Spring Boot lessons.",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/webgoat/lessons/xxe/SimpleXXE.java",
        language: "Java",
        content: `package org.owasp.webgoat.lessons.xxe;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.ObjectInputStream;
import org.springframework.web.bind.annotation.*;

@RestController
public class SimpleXXE {
    @PostMapping("/xxe/simple")
    public String parseXml(@RequestBody String xmlStr, @RequestParam String cmd) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.newDocumentBuilder().parse(new ByteArrayInputStream(xmlStr.getBytes()));
        Runtime.getRuntime().exec("sh -c " + cmd);
        return "Parsed";
    }
}`,
      },
    ],
  },
  {
    id: "owasp-nodegoat",
    name: "OWASP NodeGoat",
    ownerRepo: "OWASP/NodeGoat",
    url: "https://github.com/OWASP/NodeGoat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "master",
    defaultCommitSha: "c205e1c74d6e5015",
    expectedFindings: 29,
    keyCwes: ["CWE-94", "CWE-89", "CWE-79", "CWE-943", "CWE-352"],
    description: "OWASP Node.js Express & MongoDB vulnerable pension management portal demonstrating eval() code injection, NoSQL injection, and SSRF.",
    seedFiles: [
      {
        path: "app/routes/contributions.js",
        language: "Node.js",
        content: `function ContributionsHandler(db) {
    this.handleContributionsUpdate = (req, res, next) => {
        const preTax = eval(req.body.preTax);
        const afterTax = eval(req.body.afterTax);
        const roth = eval(req.body.roth);
        const userId = req.session.userId;
        db.collection("contributions").updateOne(
            { userId: userId, $where: "this.userId == " + req.query.threshold },
            { $set: { preTax, afterTax, roth } }
        );
        res.redirect("/contributions?msg=" + req.query.msg);
    };
}
module.exports = ContributionsHandler;
`,
      },
    ],
  },
  {
    id: "owasp-pygoat",
    name: "OWASP PyGoat",
    ownerRepo: "OWASP/pygoat",
    url: "https://github.com/OWASP/pygoat",
    fallbackGitHubUrl: "https://github.com/adeyosemanputra/pygoat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c206a4b92e7f6016",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-611", "CWE-918"],
    description: "Intentionally vulnerable Python & Django web application designed by OWASP to test Python SAST & DAST engines against Top 10 flaws.",
    seedFiles: [
      {
        path: "introduction/views.py",
        language: "Python",
        content: `import os
import pickle
import base64
import subprocess
from django.http import HttpResponse
from django.db import connection

def sql_lab(request):
    name = request.POST.get("name", "")
    password = request.POST.get("pass", "")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM introduction_login WHERE user='" + name + "' AND password='" + password + "'")
    return HttpResponse(str(cursor.fetchall()))

def cmd_lab(request):
    domain = request.POST.get("domain", "")
    output = subprocess.Popen("nslookup " + domain, shell=True, stdout=subprocess.PIPE).communicate()[0]
    token = request.COOKIES.get("pygoat_session", "")
    if token:
        pickle.loads(base64.b64decode(token))
    return HttpResponse(output)
`,
      },
    ],
  },
  {
    id: "owasp-railsgoat",
    name: "OWASP RailsGoat",
    ownerRepo: "OWASP/railsgoat",
    url: "https://github.com/OWASP/railsgoat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Ruby",
    defaultBranch: "master",
    defaultCommitSha: "c207b8c31f9a7017",
    expectedFindings: 27,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-22", "CWE-639"],
    description: "Vulnerable Ruby on Rails application featuring ActiveRecord SQLi, Marshal.load deserialization, mass assignment, and command injection.",
    seedFiles: [
      {
        path: "app/controllers/users_controller.rb",
        language: "Ruby",
        content: `class UsersController < ApplicationController
  def index
    dept = params[:department]
    @users = User.where("department = '#{dept}' AND active = 1")
    system("logger -t railsgoat_audit " + params[:audit_tag].to_s)
    if cookies[:LegacyMarshal]
      @prefs = Marshal.load(Base64.decode64(cookies[:LegacyMarshal]))
    end
    render json: @users
  end

  def download_benefit_form
    send_file Rails.root.join("public", "data", params[:file_name])
  end
end
`,
      },
    ],
  },
  {
    id: "owasp-mutillidae",
    name: "OWASP Mutillidae II",
    ownerRepo: "OWASP/Mutillidae",
    url: "https://github.com/OWASP/Mutillidae",
    fallbackGitHubUrl: "https://github.com/webpwnized/mutillidae",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "PHP",
    defaultBranch: "master",
    defaultCommitSha: "c208d2e64a1b8018",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-611", "CWE-90"],
    description: "Free, open-source, deliberately vulnerable PHP web application providing 40+ OWASP Top 10 DAST & SAST target scripts.",
    seedFiles: [
      {
        path: "src/dns-lookup.php",
        language: "PHP",
        content: `<?php
$lTargetHost = $_POST["target_host"];
$lUsername = $_GET["username"];

$lCommandOutput = shell_exec("nslookup " . $lTargetHost);
$lQueryResult = mysqli_query($conn, "SELECT * FROM accounts WHERE username = '" . $lUsername . "'");
echo "<div>Host Lookup Results for " . $lTargetHost . ": <pre>" . $lCommandOutput . "</pre></div>";
?>`,
      },
    ],
  },
  {
    id: "owasp-security-shepherd",
    name: "OWASP Security Shepherd",
    ownerRepo: "OWASP/SecurityShepherd",
    url: "https://github.com/OWASP/SecurityShepherd",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "dev",
    defaultCommitSha: "c209f5a18c3d9019",
    expectedFindings: 29,
    keyCwes: ["CWE-89", "CWE-79", "CWE-22", "CWE-306", "CWE-798"],
    description: "OWASP web and mobile application security training platform built in Java/JSP with intentional SQLi, XSS, and broken access control modules.",
    seedFiles: [
      {
        path: "src/main/java/servlets/module/challenge/SqlInjectionStoredChallenge.java",
        language: "Java",
        content: `package servlets.module.challenge;
import java.sql.Connection;
import java.sql.Statement;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SqlInjectionStoredChallenge {
    public void doPost(HttpServletRequest req, HttpServletResponse resp, Connection conn) throws Exception {
        String searchUser = req.getParameter("searchUser");
        Statement stmt = conn.createStatement();
        stmt.executeQuery("SELECT * FROM customers WHERE customerName = '" + searchUser + "'");
        resp.getWriter().write("<p>Result for " + searchUser + "</p>");
    }
}`,
      },
    ],
  },
  {
    id: "portswigger-web-security-academy",
    name: "PortSwigger Web Security Academy",
    ownerRepo: "PortSwigger/web-security-academy",
    url: "https://github.com/PortSwigger/web-security-academy",
    fallbackGitHubUrl: "https://github.com/PortSwigger/burp-extensions-montoya-api-examples",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST Web/API",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "c212a1b48e9c5001",
    expectedFindings: 33,
    keyCwes: ["CWE-89", "CWE-918", "CWE-444", "CWE-1336", "CWE-502"],
    description: "PortSwigger Web Security Academy lab scenarios covering SQLi, SSRF, HTTP Request Smuggling, SSTI, XXE, OAuth flaws, and Deserialization.",
    seedFiles: [
      {
        path: "labs/ssrf_sqli_ssti/academy_lab_controller.py",
        language: "Python",
        content: `import subprocess
import sqlite3
import requests
from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route("/product/stock", methods=["POST"])
def check_stock_ssrf():
    stock_api = request.form.get("stockApi", "")
    resp = requests.get(stock_api, timeout=4)
    category = request.args.get("category", "")
    conn = sqlite3.connect("academy.db")
    conn.execute("SELECT * FROM products WHERE category = '" + category + "' AND released = 1")
    return render_template_string("<div>Stock response: " + resp.text + "</div>")
`,
      },
    ],
  },
  {
    id: "owasp-mastg",
    name: "OWASP MASTG (Mobile Security Testing)",
    ownerRepo: "OWASP/owasp-mastg",
    url: "https://github.com/OWASP/owasp-mastg",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Kotlin",
    defaultBranch: "master",
    defaultCommitSha: "c213b2c59f0d6002",
    expectedFindings: 28,
    keyCwes: ["CWE-798", "CWE-327", "CWE-89", "CWE-295", "CWE-926"],
    description: "OWASP Mobile Application Security Testing Guide (MASTG) & MASVS crackmes/samples for Android (Kotlin/Java) and iOS (Swift).",
    seedFiles: [
      {
        path: "samples/android/MastgInsecureStorageAndSql.kt",
        language: "Kotlin",
        content: `package org.owasp.mastg.samples
import android.database.sqlite.SQLiteDatabase
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

class MastgInsecureStorageAndSql {
    private val hardcodedSecret = "MASTG_ANDROID_HARDCODED_AES_KEY!"
    fun queryLocalUser(db: SQLiteDatabase, userInput: String) {
        db.rawQuery("SELECT * FROM mobile_tokens WHERE user = '$userInput'", null)
        val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(hardcodedSecret.toByteArray(), "AES"))
        Runtime.getRuntime().exec("sh -c " + userInput)
    }
}`,
      },
    ],
  },
  {
    id: "owasp-crapi",
    name: "OWASP crAPI (Completely Ridiculous API)",
    ownerRepo: "OWASP/crAPI",
    url: "https://github.com/OWASP/crAPI",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST Web/API",
    language: "Python",
    defaultBranch: "develop",
    defaultCommitSha: "c214c3d60a1e7003",
    expectedFindings: 34,
    keyCwes: ["CWE-639", "CWE-918", "CWE-89", "CWE-798", "CWE-285"],
    description: "OWASP API Security Top 10 microservice testbed (Python, Java, Go) featuring BOLA/IDOR, SSRF, NoSQLi, JWT weaknesses, and Mass Assignment.",
    seedFiles: [
      {
        path: "services/workshop/crapi/merchant/views.py",
        language: "Python",
        content: `import requests
import subprocess
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response

class ContactMechanicView(APIView):
    def post(self, request):
        mechanic_api = request.data.get("mechanic_api")
        vin = request.data.get("vin", "")
        resp = requests.get(mechanic_api, timeout=5)
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM vehicle_details WHERE vin = '{vin}'")
        subprocess.Popen("echo " + vin, shell=True)
        return Response({"mechanic_response": resp.text})
`,
      },
    ],
  },
  {
    id: "owasp-cloudgoat",
    name: "OWASP / Rhino CloudGoat",
    ownerRepo: "OWASP/CloudGoat",
    url: "https://github.com/OWASP/CloudGoat",
    fallbackGitHubUrl: "https://github.com/RhinoSecurityLabs/cloudgoat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c215d4e71b2f8004",
    expectedFindings: 29,
    keyCwes: ["CWE-798", "CWE-918", "CWE-78", "CWE-269", "CWE-522"],
    description: "Vulnerable-by-design AWS cloud deployment & Lambda/EC2 SSRF escalation scenarios for cloud penetration testing and IaC/SAST audit.",
    seedFiles: [
      {
        path: "scenarios/ec2_ssrf/app/cloudgoat_ssrf_handler.py",
        language: "Python",
        content: `import os
import subprocess
import requests
from flask import Flask, request

AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7CLOUDGOAT"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYCLOUDGOAT"

app = Flask(__name__)

@app.route("/cg/proxy", methods=["GET"])
def metadata_ssrf_proxy():
    target_url = request.args.get("url", "http://169.254.169.254/latest/meta-data/iam/security-credentials/")
    res = requests.get(target_url)
    subprocess.Popen("aws s3 ls " + request.args.get("bucket", ""), shell=True)
    return res.text
`,
      },
    ],
  },
  {
    id: "owasp-dso",
    name: "OWASP DevSecOps (DSO) Portal",
    ownerRepo: "OWASP/DSO",
    url: "https://github.com/OWASP/DSO",
    fallbackGitHubUrl: "https://github.com/OWASP/DevSecOpsGuideline",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "main",
    defaultCommitSha: "c216e5f82c3a9005",
    expectedFindings: 27,
    keyCwes: ["CWE-78", "CWE-89", "CWE-798", "CWE-94", "CWE-918"],
    description: "OWASP DevSecOps pipeline verification target for testing CI/CD SAST, DAST, and container security gates.",
    seedFiles: [
      {
        path: "pipeline-app/src/controllers/deployHook.js",
        language: "Node.js",
        content: `const { exec } = require("child_process");
const axios = require("axios");

exports.triggerPipelineHook = async (req, res) => {
  const repoBranch = req.body.branch;
  const callback = req.body.callbackUrl;
  exec("git checkout " + repoBranch + " && ./deploy.sh", (err, out) => {
    axios.get(callback);
    res.send("<div>Pipeline output: " + out + "</div>");
  });
};
`,
      },
    ],
  },
  {
    id: "vulhub-cve-environments",
    name: "Vulhub CVE Reproduction Environments",
    ownerRepo: "vulhub/vulhub",
    url: "https://github.com/vulhub/vulhub",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c217f6a93d4b0006",
    expectedFindings: 34,
    keyCwes: ["CWE-78", "CWE-502", "CWE-89", "CWE-918", "CWE-94"],
    description: "Pre-built vulnerable Docker environments for 200+ high-impact CVEs (Spring4Shell, Log4Shell, Struts2, Django SQLi, Fastjson RCE).",
    seedFiles: [
      {
        path: "django/CVE-2022-28346/vulhub_sqli_demo.py",
        language: "Python",
        content: `import subprocess
import pickle
import sqlite3
from django.http import HttpResponse

def vulhub_cve_reproducer(request):
    field = request.GET.get("field", "username")
    conn = sqlite3.connect("vulhub.db")
    conn.execute("SELECT * FROM auth_user ORDER BY " + field)
    subprocess.Popen("curl -s " + request.GET.get("CheckUrl", ""), shell=True)
    if request.body:
        pickle.loads(request.body)
    return HttpResponse("Vulhub CVE Evaluated")
`,
      },
    ],
  },
  {
    id: "erev0s-vampi",
    name: "VAmPI (Vulnerable REST API)",
    ownerRepo: "erev0s/VAmPI",
    url: "https://github.com/erev0s/VAmPI",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST Web/API",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c218a7b04e5c1007",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-639", "CWE-798", "CWE-285", "CWE-915"],
    description: "Vulnerable API made with Flask covering OWASP API Top 10: SQLi, Unauthorized Password Change, BOLA/IDOR, Mass Assignment, and Regex DoS.",
    seedFiles: [
      {
        path: "api_views/users.py",
        language: "Python",
        content: `import sqlite3
import subprocess
from flask import request, jsonify

JWT_SECRET_KEY = "vampi_hardcoded_weak_secret"

def get_by_username(username):
    conn = sqlite3.connect("vampi.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = '" + username + "'")
    if request.args.get("debug_exec"):
        subprocess.Popen(request.args.get("debug_exec"), shell=True)
    return jsonify(cursor.fetchall())
`,
      },
    ],
  },
  {
    id: "erev0s-vampi-graphql",
    name: "VAmPI-GraphQL (Vulnerable GraphQL API)",
    ownerRepo: "erev0s/VAmPI-GraphQL",
    url: "https://github.com/erev0s/VAmPI-GraphQL",
    fallbackGitHubUrl: "https://github.com/erev0s/VAmPI",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST Web/API",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "c219b8c15f6d2008",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-639", "CWE-200", "CWE-918"],
    description: "GraphQL edition of VAmPI demonstrating GraphQL introspection abuse, resolver SQL injection, batching brute-force, and OS command injection.",
    seedFiles: [
      {
        path: "graphql_api/resolvers.py",
        language: "Python",
        content: `import sqlite3
import subprocess
import requests

def resolve_book_by_title(root, info, title: str, webhook_url: str = ""):
    conn = sqlite3.connect("vampi_graphql.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM books WHERE title = '{title}'")
    if webhook_url:
        requests.get(webhook_url)
        subprocess.Popen(f"logger {title}", shell=True)
    return cursor.fetchall()
`,
      },
    ],
  },
  {
    id: "dolevf-dvga",
    name: "Damn Vulnerable GraphQL App (DVGA)",
    ownerRepo: "dolevf/Damn-Vulnerable-GraphQL-Application",
    url: "https://github.com/dolevf/Damn-Vulnerable-GraphQL-Application",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST Web/API",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c220c9d26a7e3009",
    expectedFindings: 33,
    keyCwes: ["CWE-78", "CWE-89", "CWE-918", "CWE-79", "CWE-502"],
    description: "Deliberately vulnerable GraphQL implementation in Python/Flask covering GraphQL RCE (`importPaste`), SQLi (`pastes` filter), SSRF, and Query Depth DoS.",
    seedFiles: [
      {
        path: "core/views.py",
        language: "Python",
        content: `import os
import sqlite3
import requests

def resolve_import_paste(host, port, path, scheme):
    url = f"{scheme}://{host}:{port}{path}"
    resp = requests.get(url)
    cmd = f"curl --insecure {url}"
    os.system(cmd)
    conn = sqlite3.connect("dvga.db")
    conn.execute("SELECT * FROM pastes WHERE owner = '" + host + "'")
    return resp.text
`,
      },
    ],
  },
  {
    id: "snoopy-dvws",
    name: "Damn Vulnerable Web Services (DVWS)",
    ownerRepo: "snoopysecurity/dvws",
    url: "https://github.com/snoopysecurity/dvws",
    fallbackGitHubUrl: "https://github.com/snoopysecurity/dvws-node",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST Web/API",
    language: "Node.js",
    defaultBranch: "master",
    defaultCommitSha: "c221d0e37b8f4010",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-611", "CWE-918", "CWE-502"],
    description: "Vulnerable REST/SOAP/XML/JWT Web Services application featuring XXE, SQLi, Command Injection, SSRF, and CORS misconfigurations.",
    seedFiles: [
      {
        path: "controllers/notebook.js",
        language: "Node.js",
        content: `const { exec } = require("child_process");
const axios = require("axios");

exports.runDiagnosticService = async (req, res, db) => {
  const noteName = req.body.name;
  const remoteEndpoint = req.body.endpoint;
  await db.query("SELECT * FROM notes WHERE title = '" + noteName + "'");
  exec("hostname -i && ping -c 1 " + req.body.hostname);
  const data = await axios.get(remoteEndpoint);
  res.send("<div>Service response: " + data.data + "</div>");
};
`,
      },
    ],
  },
  {
    id: "commix-testbed",
    name: "Commix OS Command Injection Testbed",
    ownerRepo: "commixproject/commix",
    url: "https://github.com/commixproject/commix",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c222e1f48c9a5011",
    expectedFindings: 29,
    keyCwes: ["CWE-78", "CWE-88", "CWE-94", "CWE-89", "CWE-22"],
    description: "Automated All-in-One OS Command Injection exploitation and verification testbed covering classic, time-based, and file-based command injection sinks.",
    seedFiles: [
      {
        path: "src/targets/commix_vulnerable_endpoint.py",
        language: "Python",
        content: `import os
import subprocess
from flask import request

def commix_exec_sink():
    addr = request.args.get("addr", "127.0.0.1")
    os.system("ping -c 2 " + addr)
    output = subprocess.check_output("traceroute " + addr, shell=True)
    eval(request.args.get("expr", "1+1"))
    return output
`,
      },
    ],
  },
  {
    id: "owasp-wrongsecrets",
    name: "OWASP WrongSecrets",
    ownerRepo: "OWASP/wrongsecrets",
    url: "https://github.com/OWASP/wrongsecrets",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "c223f2a59d0b6012",
    expectedFindings: 31,
    keyCwes: ["CWE-798", "CWE-321", "CWE-522", "CWE-327", "CWE-89"],
    description: "OWASP flagship secrets management vulnerable app demonstrating hardcoded keys in Java, Docker, Kubernetes, Vault, AWS/GCP/Azure, and Git history.",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/wrongsecrets/challenges/docker/Challenge1HardcodedSecret.java",
        language: "Java",
        content: `package org.owasp.wrongsecrets.challenges.docker;
import java.sql.Connection;
import java.sql.Statement;
import javax.crypto.spec.SecretKeySpec;

public class Challenge1HardcodedSecret {
    private static final String HARDCODED_PASSWORD = "MySuperSecretWrongSecretsPassword!2026";
    private static final String AWS_PRIVATE_TOKEN = "AKIAIOSFODNN7WRONGSECRETS";

    public void checkSecretAndLog(Connection conn, String attempt) throws Exception {
        SecretKeySpec key = new SecretKeySpec(HARDCODED_PASSWORD.getBytes(), "AES");
        Statement stmt = conn.createStatement();
        stmt.executeQuery("SELECT * FROM challenge_attempts WHERE user_attempt = '" + attempt + "'");
    }
}`,
      },
    ],
  },
  {
    id: "owasp-ssti",
    name: "OWASP SSTI (Server-Side Template Injection)",
    ownerRepo: "OWASP/SSTI",
    url: "https://github.com/OWASP/SSTI",
    fallbackGitHubUrl: "https://github.com/epinna/tplmap",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "c224a3b60e1c7013",
    expectedFindings: 29,
    keyCwes: ["CWE-1336", "CWE-94", "CWE-78", "CWE-79", "CWE-89"],
    description: "Server-Side Template Injection (SSTI) vulnerable reference endpoints across Jinja2, Twig, Freemarker, Velocity, and Mako.",
    seedFiles: [
      {
        path: "ssti_labs/jinja2_eval_lab.py",
        language: "Python",
        content: `import subprocess
from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route("/ssti/render")
def render_vulnerable_template():
    name = request.args.get("name", "Guest")
    template = f"<h1>Welcome to OWASP SSTI Lab, {name}!</h1>"
    eval(request.args.get("calc", "0"))
    subprocess.Popen("echo " + name, shell=True)
    return render_template_string(template)
`,
      },
    ],
  },
  {
    id: "owasp-serverless-goat",
    name: "OWASP Serverless-Goat",
    ownerRepo: "OWASP/Serverless-Goat",
    url: "https://github.com/OWASP/Serverless-Goat",
    category: "DAST — Vulnerable Web & API Apps",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "master",
    defaultCommitSha: "c225b4c71f2d8014",
    expectedFindings: 28,
    keyCwes: ["CWE-78", "CWE-918", "CWE-89", "CWE-798", "CWE-269"],
    description: "OWASP Serverless Top 10 AWS Lambda application demonstrating event-data command injection, over-privileged IAM roles, and NoSQL injection.",
    seedFiles: [
      {
        path: "src/functions/convertDocToText/index.js",
        language: "Node.js",
        content: `const { exec } = require("child_process");
const axios = require("axios");

exports.handler = async (event) => {
  const documentUrl = event.queryStringParameters.document_url;
  const resp = await axios.get(documentUrl);
  return new Promise((resolve) => {
    exec("curl -s " + documentUrl + " | catdoc -", (err, stdout) => {
      resolve({ statusCode: 200, body: stdout });
    });
  });
};
`,
      },
    ],
  },

  // ===========================================================================
  // 3. DAST + SAST COMBINED TESTING BENCHMARKS (4 REPOSITORIES)
  // ===========================================================================
  {
    id: "owasp-vulnerableapp",
    name: "OWASP VulnerableApp",
    ownerRepo: "SasanLabs/VulnerableApp",
    url: "https://owasp.org/www-project-vulnerableapp/",
    fallbackGitHubUrl: "https://github.com/SasanLabs/VulnerableApp",
    category: "DAST + SAST Combined Testing",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "f501a1b23c4d1001",
    expectedFindings: 33,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-611", "CWE-918", "CWE-434"],
    description: "Official OWASP VulnerableApp project built specifically for combined DAST + SAST scanner benchmarking across multi-level vulnerability endpoints.",
    seedFiles: [
      {
        path: "src/main/java/org/sasanlabs/service/vulnerability/sqlInjection/UnionBasedSQLInjection.java",
        language: "Java",
        content: `package org.sasanlabs.service.vulnerability.sqlInjection;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.springframework.web.bind.annotation.*;

@RestController
public class UnionBasedSQLInjection {
    @GetMapping("/VulnerableApp/SQLInjection/Level1")
    public String getCarInformation(@RequestParam String id, Connection conn) throws Exception {
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM cars WHERE id = '" + id + "'");
        Runtime.getRuntime().exec("sh -c echo " + id);
        return rs.toString();
    }
}`,
      },
    ],
  },
  {
    id: "owasp-project-benchmark-portal",
    name: "OWASP Benchmark Project Portal",
    ownerRepo: "OWASP/www-project-benchmark",
    url: "https://owasp.org/www-project-benchmark/",
    fallbackGitHubUrl: "https://github.com/OWASP/BenchmarkJava",
    category: "DAST + SAST Combined Testing",
    testingMode: "DAST + SAST",
    language: "Java",
    defaultBranch: "main",
    defaultCommitSha: "f502b2c34d5e2002",
    expectedFindings: 32,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-22", "CWE-502"],
    description: "OWASP Foundation Benchmark standard project combining SAST, DAST, and IAST evaluation scorecards (Yououden Index calibration).",
    seedFiles: [
      {
        path: "src/main/java/org/owasp/benchmark/score/BenchmarkCombinedVerifier.java",
        language: "Java",
        content: `package org.owasp.benchmark.score;
import javax.servlet.http.HttpServletRequest;
import java.sql.Connection;
import java.sql.Statement;

public class BenchmarkCombinedVerifier {
    public void verifyDastSastCorrelation(HttpServletRequest req, Connection conn) throws Exception {
        String input = req.getParameter("testCaseInput");
        Statement st = conn.createStatement();
        st.executeQuery("SELECT * FROM scorecard WHERE testcase = '" + input + "'");
        Runtime.getRuntime().exec("sh -c " + input);
    }
}`,
      },
    ],
  },
  {
    id: "ossf-cve-benchmark",
    name: "OpenSSF CVE Benchmark",
    ownerRepo: "ossf-cve-benchmark/ossf-cve-benchmark",
    url: "https://github.com/ossf-cve-benchmark/ossf-cve-benchmark",
    category: "DAST + SAST Combined Testing",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "main",
    defaultCommitSha: "f503c3d45e6f3003",
    expectedFindings: 31,
    keyCwes: ["CWE-78", "CWE-89", "CWE-94", "CWE-22", "CWE-1321"],
    description: "Linux Foundation OpenSSF benchmark repository of 200+ historical real-world JavaScript/TypeScript CVEs with pre-patch and post-patch commits.",
    seedFiles: [
      {
        path: "benchmark/CVEs/CVE-2020-7788/vulnerable_sink.js",
        language: "Node.js",
        content: `const { exec } = require("child_process");
const fs = require("fs");

function ossfCveReproduction(req, res, db) {
  const pkgCmd = req.query.pkg;
  const userSql = req.query.user;
  exec("npm view " + pkgCmd, (err, stdout) => {
    db.query("SELECT * FROM maintainers WHERE name = '" + userSql + "'");
    const out = eval(req.body.transformExpr);
    res.send(stdout + out);
  });
}
module.exports = { ossfCveReproduction };
`,
      },
    ],
  },
  {
    id: "vulnerable-code-sast-benchmark",
    name: "Vulnerable-Code SAST-Benchmark",
    ownerRepo: "vulnerable-code/SAST-Benchmark",
    url: "https://github.com/vulnerable-code/SAST-Benchmark",
    fallbackGitHubUrl: "https://github.com/OWASP/BenchmarkJava",
    category: "DAST + SAST Combined Testing",
    testingMode: "DAST + SAST",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "f504d4e56f7a4004",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-918", "CWE-22"],
    description: "Multi-language SAST + DAST ground-truth benchmark repository for measuring true-positive vs false-positive detection accuracy.",
    seedFiles: [
      {
        path: "benchmarks/python/ground_truth_cases.py",
        language: "Python",
        content: `import subprocess
import pickle
import sqlite3
import requests
from flask import request

def ground_truth_true_positive():
    query_param = request.args.get("q", "")
    conn = sqlite3.connect("sast_bench.db")
    conn.execute("SELECT * FROM records WHERE label = '" + query_param + "'")
    subprocess.Popen("grep " + query_param + " /var/log/syslog", shell=True)
    requests.get(request.args.get("target_url", "http://localhost"))
    return pickle.loads(request.data)
`,
      },
    ],
  },

  // ===========================================================================
  // 4. POLYGLOT VULNERABLE SNIPPETS & MULTI-APP LABS (5 REPOSITORIES)
  // ===========================================================================
  {
    id: "snoopy-vulnerable-snippets",
    name: "Vulnerable-Code-Snippets",
    ownerRepo: "snoopysecurity/Vulnerable-Code-Snippets",
    url: "https://github.com/snoopysecurity/Vulnerable-Code-Snippets",
    category: "Polyglot Vulnerable Snippets",
    testingMode: "SAST",
    language: "Python",
    defaultBranch: "master",
    defaultCommitSha: "d301a9c42e8b1020",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-78", "CWE-918", "CWE-502", "CWE-611", "CWE-22"],
    description: "Curated collection of real-world vulnerable code snippets across Python, PHP, Java, JS, and Go for SAST rule validation.",
    seedFiles: [
      {
        path: "SQL Injection/sqli_example.py",
        language: "Python",
        content: `import sqlite3
import subprocess
import requests
from flask import request

def vulnerable_snippet_handler():
    email = request.args.get("email")
    target_ip = request.args.get("ip")
    internal_url = request.args.get("url")

    db = sqlite3.connect("users.db")
    db.execute("SELECT * FROM users WHERE email = '%s'" % email)
    subprocess.call("ping -c 2 " + target_ip, shell=True)
    return requests.get(internal_url).text
`,
      },
    ],
  },
  {
    id: "appsecco-vulnerable-apps",
    name: "Appsecco Vulnerable Apps",
    ownerRepo: "appsecco/vulnerable-apps",
    url: "https://github.com/appsecco/vulnerable-apps",
    category: "Polyglot Vulnerable Snippets",
    testingMode: "DAST + SAST",
    language: "Node.js",
    defaultBranch: "master",
    defaultCommitSha: "d302c4e71b9a2021",
    expectedFindings: 28,
    keyCwes: ["CWE-78", "CWE-89", "CWE-502", "CWE-918", "CWE-79"],
    description: "Multi-stack vulnerable application lab directory maintained by Appsecco for offensive/defensive SAST & pentest verification.",
    seedFiles: [
      {
        path: "node-rce-deserialize/server.js",
        language: "Node.js",
        content: `const express = require("express");
const { exec } = require("child_process");
const serialize = require("node-serialize");
const app = express();

app.get("/api/profile", (req, res) => {
  if (req.cookies.profile) {
    const str = Buffer.from(req.cookies.profile, "base64").toString();
    const obj = serialize.unserialize(str);
    exec("id && echo " + req.query.debugCmd);
    res.send("Hello " + obj.username);
  }
});
`,
      },
    ],
  },
  {
    id: "rootup-personal-sast",
    name: "RootUp Personal_SAST",
    ownerRepo: "RootUp/Personal_SAST",
    url: "https://github.com/RootUp/Personal_SAST",
    category: "Polyglot Vulnerable Snippets",
    testingMode: "SAST",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "d303e8b53d1c3022",
    expectedFindings: 27,
    keyCwes: ["CWE-78", "CWE-89", "CWE-94", "CWE-502", "CWE-798"],
    description: "Custom SAST engine test corpus with vulnerable Python/JS/Java source targets for static taint & AST rule benchmarking.",
    seedFiles: [
      {
        path: "tests/vulnerable_samples/sast_target.py",
        language: "Python",
        content: `import os
import yaml
import sqlite3
from flask import request

AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE_ROOTUP_SECRET"

def run_sast_target():
    raw_yaml = request.data.decode("utf-8")
    config = yaml.load(raw_yaml, Loader=yaml.Loader)
    os.system("tar -czf /tmp/backup.tar.gz " + request.args.get("dir", ""))
    conn = sqlite3.connect(":memory:")
    conn.execute("SELECT * FROM secrets WHERE key_id = '" + request.args.get("id", "") + "'")
    return str(config)
`,
      },
    ],
  },
  {
    id: "sonatype-sonar-examples",
    name: "Sonatype Sonar Examples",
    ownerRepo: "sonatype/sonar-examples",
    url: "https://github.com/sonatype/sonar-examples",
    fallbackGitHubUrl: "https://github.com/SonarSource/sonar-scanning-examples",
    category: "Polyglot Vulnerable Snippets",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "d304f1d84c2e4023",
    expectedFindings: 26,
    keyCwes: ["CWE-89", "CWE-78", "CWE-611", "CWE-327", "CWE-798"],
    description: "Multi-module Maven/Gradle Java and polyglot code scanning examples for enterprise SAST & SCA quality gates.",
    seedFiles: [
      {
        path: "projects/languages/java/sonar-runner/src/main/java/example/LegacyAccountDao.java",
        language: "Java",
        content: `package example;
import java.sql.Connection;
import java.sql.Statement;
import java.security.MessageDigest;

public class LegacyAccountDao {
    private static final String DB_PASSWORD = "SonatypeHardcodedPassword!2026";
    public void queryCustomer(Connection conn, String customerId) throws Exception {
        Statement stmt = conn.createStatement();
        stmt.executeQuery("SELECT * FROM CUSTOMERS WHERE ID = '" + customerId + "'");
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        md5.update(DB_PASSWORD.getBytes());
    }
}`,
      },
    ],
  },
  {
    id: "sonarsource-scanning-examples",
    name: "SonarSource Scanning Examples",
    ownerRepo: "SonarSource/sonar-scanning-examples",
    url: "https://github.com/SonarSource/sonar-scanning-examples",
    category: "Polyglot Vulnerable Snippets",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "d305b6a29e4f5024",
    expectedFindings: 28,
    keyCwes: ["CWE-89", "CWE-78", "CWE-22", "CWE-502", "CWE-798"],
    description: "Official SonarSource multi-language scanning example projects across Java, Python, C#, TypeScript, and Go.",
    seedFiles: [
      {
        path: "sonarqube-scanner-maven/maven-multimodule/module1/src/main/java/com/acme/ReportService.java",
        language: "Java",
        content: `package com.acme;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.sql.Connection;
import java.sql.Statement;

public class ReportService {
    public File loadAndLogReport(HttpServletRequest req, Connection conn) throws Exception {
        String reportId = req.getParameter("reportId");
        Statement stmt = conn.createStatement();
        stmt.execute("INSERT INTO audit_log VALUES ('" + reportId + "')");
        Runtime.getRuntime().exec("sh -c /opt/bin/render_pdf " + reportId);
        return new File("/var/reports/" + req.getParameter("path"));
    }
}`,
      },
    ],
  },

  // ===========================================================================
  // 5. SAST RULE CORPORA, AI/LLM BENCHMARKS & ANALYZER TESTBEDS (15 REPOS)
  // ===========================================================================
  {
    id: "timothee-chauvin-eyeballvul",
    name: "EyeballVul (Real-World CVE SAST Benchmark)",
    ownerRepo: "timothee-chauvin/eyeballvul",
    url: "https://github.com/timothee-chauvin/eyeballvul",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "e501a2b34c5d1001",
    expectedFindings: 34,
    keyCwes: ["CWE-89", "CWE-78", "CWE-918", "CWE-502", "CWE-287"],
    description: "Stream-updated benchmark of real-world CVEs in open-source repositories designed to test LLM-assisted and semantic SAST engines at scale.",
    seedFiles: [
      {
        path: "eyeballvul/benchmarks/cve_stream_sample.py",
        language: "Python",
        content: `import subprocess
import sqlite3
import requests
from flask import request

def eyeballvul_cve_handler():
    repo_Revision = request.args.get("rev", "HEAD")
    subprocess.Popen(f"git log -n 1 {repo_Revision}", shell=True)
    conn = sqlite3.connect("eyeballvul.db")
    conn.execute("SELECT * FROM vulnerabilities WHERE cve_id = '" + request.args.get("cve", "") + "'")
    return requests.get(request.args.get("advisory_url", "")).text
`,
      },
    ],
  },
  {
    id: "iris-sast-benchmark",
    name: "IRIS (Neuro-Symbolic SAST & CWE-Bench-Java)",
    ownerRepo: "iris-sast/iris",
    url: "https://github.com/iris-sast/iris",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "main",
    defaultCommitSha: "e502b3c45d6e2002",
    expectedFindings: 33,
    keyCwes: ["CWE-22", "CWE-78", "CWE-79", "CWE-89", "CWE-502"],
    description: "IRIS whole-repository neuro-symbolic SAST framework combining CodeQL dataflow with CWE-Bench-Java real-world CVE targets.",
    seedFiles: [
      {
        path: "data/cwe-bench-java/CweBenchSourceSink.java",
        language: "Java",
        content: `package iris.cwebench;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.sql.Connection;
import java.sql.Statement;

public class CweBenchSourceSink {
    public void evaluateInterproceduralPath(HttpServletRequest req, Connection conn) throws Exception {
        String untrusted = req.getParameter("artifactPath");
        File f = new File("/srv/artifacts/" + untrusted);
        Statement st = conn.createStatement();
        st.executeQuery("SELECT * FROM metadata WHERE path = '" + f.getPath() + "'");
        Runtime.getRuntime().exec("sh -c tar -xf " + untrusted);
    }
}`,
      },
    ],
  },
  {
    id: "rivalsecurity-sastbench",
    name: "RivalSecurity SASTBench",
    ownerRepo: "RivalSecurity/sastbench",
    url: "https://github.com/RivalSecurity/sastbench",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Python",
    defaultBranch: "main",
    defaultCommitSha: "e503c4d56e7f3003",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-918", "CWE-798"],
    description: "Modern SAST & triage agent benchmark evaluating precision, recall, and exploitability verification across real-world CVEs.",
    seedFiles: [
      {
        path: "sastbench/suites/multi_hop_taint.py",
        language: "Python",
        content: `import os
import pickle
import sqlite3
from flask import request

def sastbench_multi_hop():
    hop1 = request.headers.get("X-Rival-Payload", "")
    hop2 = hop1.strip()
    conn = sqlite3.connect("sastbench.db")
    conn.execute(f"SELECT * FROM findings WHERE signature = '{hop2}'")
    os.system("python3 verifier.py " + hop2)
    return pickle.loads(request.data)
`,
      },
    ],
  },
  {
    id: "bearer-sast-cli",
    name: "Bearer Data-Flow & Privacy SAST",
    ownerRepo: "Bearer/bearer",
    url: "https://github.com/Bearer/bearer",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Ruby",
    defaultBranch: "main",
    defaultCommitSha: "e504d5e67f8a4004",
    expectedFindings: 29,
    keyCwes: ["CWE-89", "CWE-78", "CWE-327", "CWE-200", "CWE-502"],
    description: "Bearer SAST security & sensitive data-flow scanner repository with Ruby, JavaScript/TypeScript, Go, and Python rule fixtures.",
    seedFiles: [
      {
        path: "pkg/rules/fixtures/ruby_sensitive_data_sqli.rb",
        language: "Ruby",
        content: `class BearerRuleFixtureController < ApplicationController
  def export_pii
    user_filter = params[:user_filter]
    records = ActiveRecord::Base.connection.execute("SELECT ssn, credit_card FROM customers WHERE email = '#{user_filter}'")
    system("curl -X POST " + params[:exfil_webhook].to_s)
    render json: records
  end
end
`,
      },
    ],
  },
  {
    id: "analysis-tools-dev-static-analysis",
    name: "Analysis-Tools-Dev Static Analysis Directory",
    ownerRepo: "analysis-tools-dev/static-analysis",
    url: "https://github.com/analysis-tools-dev/static-analysis",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Go",
    defaultBranch: "master",
    defaultCommitSha: "e505e6f78a9b5005",
    expectedFindings: 27,
    keyCwes: ["CWE-89", "CWE-78", "CWE-22", "CWE-918", "CWE-798"],
    description: "Comprehensive polyglot static analysis tool & benchmark reference index covering 10+ programming languages.",
    seedFiles: [
      {
        path: "benchmarks/polyglot_analyzer_target.go",
        language: "Go",
        content: `package benchmarks

import (
	"database/sql"
	"fmt"
	"net/http"
	"os/exec"
)

func PolyglotVerifyTarget(r *http.Request, db *sql.DB) {
	q := fmt.Sprintf("SELECT * FROM analyzers WHERE lang = '%s'", r.URL.Query().Get("lang"))
	_, _ = db.Query(q)
	_ = exec.Command("sh", "-c", r.URL.Query().Get("runner")).Run()
}
`,
      },
    ],
  },
  {
    id: "returntocorp-semgrep-rules",
    name: "r2c Semgrep Rules Corpus",
    ownerRepo: "returntocorp/semgrep-rules",
    url: "https://github.com/returntocorp/semgrep-rules",
    fallbackGitHubUrl: "https://github.com/semgrep/semgrep-rules",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Python",
    defaultBranch: "develop",
    defaultCommitSha: "e401c3f82a6b1025",
    expectedFindings: 32,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-918", "CWE-79"],
    description: "Multi-language SAST rule test corpus containing hundreds of annotated vulnerable & safe test files across Python, JS, Java, Go, and Ruby.",
    seedFiles: [
      {
        path: "python/lang/security/audit/subprocess-shell-true.py",
        language: "Python",
        content: `import subprocess
import sqlite3
import requests
from flask import request

def rule_test_case():
    # ruleid: subprocess-shell-true
    user_cmd = request.args.get("cmd")
    subprocess.Popen(f"echo {user_cmd}", shell=True)

    # ruleid: formatted-sql-query
    conn = sqlite3.connect("test.db")
    conn.execute("SELECT * FROM tokens WHERE value = '" + request.args.get("token", "") + "'")

    # ruleid: request-ssrf
    requests.post(request.form.get("callback_url"))
`,
      },
    ],
  },
  {
    id: "semgrep-core",
    name: "Semgrep AST Engine Testbed",
    ownerRepo: "semgrep/semgrep",
    url: "https://github.com/semgrep/semgrep",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Python",
    defaultBranch: "develop",
    defaultCommitSha: "e402d7a91c8e2026",
    expectedFindings: 29,
    keyCwes: ["CWE-78", "CWE-89", "CWE-502", "CWE-22", "CWE-94"],
    description: "Polyglot AST & taint-mode test fixtures from the Semgrep static analysis engine repository.",
    seedFiles: [
      {
        path: "tests/taint_maturity/python/taint_sql_cmd.py",
        language: "Python",
        content: `import os
import pickle
import sqlite3
from flask import request

def taint_maturity_fixture():
    tainted = request.args.get("input")
    conn = sqlite3.connect("app.db")
    conn.execute(f"DELETE FROM sessions WHERE session_id = '{tainted}'")
    os.system("rm -rf /tmp/cache/" + tainted)
    return pickle.loads(request.data)
`,
      },
    ],
  },
  {
    id: "semgrep-rules-official",
    name: "Semgrep Rules (Official)",
    ownerRepo: "semgrep/semgrep-rules",
    url: "https://github.com/semgrep/semgrep-rules",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "TypeScript",
    defaultBranch: "develop",
    defaultCommitSha: "e403e9b45d2f3027",
    expectedFindings: 31,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-94", "CWE-918"],
    description: "Official Semgrep Registry rule test cases for TypeScript, Node.js, Express, React, and cloud infrastructure.",
    seedFiles: [
      {
        path: "typescript/express/security/audit/express-sqli-cmdi.ts",
        language: "TypeScript",
        content: `import { Request, Response } from "express";
import { exec } from "child_process";
import axios from "axios";

export async function expressRuleFixture(req: Request, res: Response, db: any) {
  const id = req.query.id as string;
  const target = req.body.target as string;

  await db.query("SELECT * FROM accounts WHERE id = '" + id + "'");
  exec("dig " + target);
  const upstream = await axios.get(req.query.proxyUrl as string);
  res.send("<div>" + upstream.data + "</div>");
}
`,
      },
    ],
  },
  {
    id: "returntocorp-semgrep-mirror",
    name: "r2c Semgrep Polyglot Suite",
    ownerRepo: "returntocorp/semgrep",
    url: "https://github.com/returntocorp/semgrep",
    fallbackGitHubUrl: "https://github.com/semgrep/semgrep",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Go",
    defaultBranch: "develop",
    defaultCommitSha: "e404f2c63b4a4028",
    expectedFindings: 27,
    keyCwes: ["CWE-89", "CWE-78", "CWE-22", "CWE-918", "CWE-327"],
    description: "r2c polyglot taint-tracking benchmark fixtures covering Go, Python, and Java inter-function dataflows.",
    seedFiles: [
      {
        path: "tests/taint_maturity/go/taint_http_sqli.go",
        language: "Go",
        content: `package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os/exec"
)

func TaintHttpHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	user := r.URL.Query().Get("user")
	cmdArg := r.URL.Query().Get("cmd")
	q := fmt.Sprintf("SELECT * FROM credentials WHERE username = '%s'", user)
	_, _ = db.Query(q)
	_ = exec.Command("sh", "-c", cmdArg).Run()
}
`,
      },
    ],
  },
  {
    id: "securego-gosec",
    name: "SecureGo Gosec AST Analyzer",
    ownerRepo: "securego/gosec",
    url: "https://github.com/securego/gosec",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Go",
    defaultBranch: "master",
    defaultCommitSha: "e405a8d17e5c5029",
    expectedFindings: 29,
    keyCwes: ["CWE-89", "CWE-78", "CWE-22", "CWE-327", "CWE-798"],
    description: "Golang security checker repository containing G101–G602 AST vulnerability test samples (hardcoded creds, SQLi, command execution, weak TLS).",
    seedFiles: [
      {
        path: "testutils/gosec_samples.go",
        language: "Go",
        content: `package testutils

import (
	"crypto/md5"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"os/exec"
)

const G101HardcodedToken = "ghp_9A8b7C6d5E4f3G2h1I0jKlMnOpQrStUvWxYz"

func GosecRuleSamples(r *http.Request, db *sql.DB) {
	empId := r.URL.Query().Get("emp_id")
	_, _ = db.Query(fmt.Sprintf("SELECT * FROM employees WHERE id = '%s'", empId))
	_ = exec.Command("bash", "-c", r.URL.Query().Get("script")).Run()
	_, _ = os.ReadFile("/etc/app/" + r.URL.Query().Get("cfg"))
	_ = md5.New()
}
`,
      },
    ],
  },
  {
    id: "spotbugs-core",
    name: "SpotBugs Static Analyzer",
    ownerRepo: "spotbugs/spotbugs",
    url: "https://github.com/spotbugs/spotbugs",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "e406b1e39f6d6030",
    expectedFindings: 28,
    keyCwes: ["CWE-89", "CWE-78", "CWE-79", "CWE-502", "CWE-476"],
    description: "Java bytecode & source defect analyzer test cases covering SQL_NONCONSTANT_STRING_PASSED_TO_EXECUTE and command injection.",
    seedFiles: [
      {
        path: "spotbugsTestCases/src/java/sfBugsNew/BugSqlAndExecSample.java",
        language: "Java",
        content: `package sfBugsNew;
import java.sql.Connection;
import java.sql.Statement;
import javax.servlet.http.HttpServletRequest;

public class BugSqlAndExecSample {
    public void testSpotBugsSecurity(HttpServletRequest req, Connection conn) throws Exception {
        String filter = req.getParameter("filter");
        Statement stmt = conn.createStatement();
        stmt.executeQuery("SELECT * FROM inventory WHERE category = '" + filter + "'");
        Runtime.getRuntime().exec("sh -c " + req.getParameter("task"));
    }
}`,
      },
    ],
  },
  {
    id: "find-sec-bugs",
    name: "Find Security Bugs (Java)",
    ownerRepo: "find-sec-bugs/find-sec-bugs",
    url: "https://github.com/find-sec-bugs/find-sec-bugs",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "e407c4f52a7e7031",
    expectedFindings: 33,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-611", "CWE-918", "CWE-327"],
    description: "OWASP Find Security Bugs plugin repository with 140+ Java enterprise vulnerability patterns (Spring, Hibernate, JDBC, XXE, Deserialization).",
    seedFiles: [
      {
        path: "findsecbugs-samples-java/src/test/java/testcode/sqli/JdoSqlFilterSample.java",
        language: "Java",
        content: `package testcode.sqli;
import java.sql.Connection;
import java.sql.Statement;
import java.io.ObjectInputStream;
import javax.servlet.http.HttpServletRequest;

public class JdoSqlFilterSample {
    public void unsafeFindSecBugsSample(HttpServletRequest req, Connection conn) throws Exception {
        String input = req.getParameter("username");
        Statement stmt = conn.createStatement();
        stmt.executeQuery("SELECT * FROM users WHERE username = '" + input + "'");
        Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", req.getParameter("cmd")});
        ObjectInputStream ois = new ObjectInputStream(req.getInputStream());
        ois.readObject();
    }
}`,
      },
    ],
  },
  {
    id: "pmd-analyzer",
    name: "PMD Source Code Analyzer",
    ownerRepo: "pmd/pmd",
    url: "https://github.com/pmd/pmd",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "master",
    defaultCommitSha: "e408d9a64b8f8032",
    expectedFindings: 27,
    keyCwes: ["CWE-89", "CWE-798", "CWE-327", "CWE-78", "CWE-22"],
    description: "Extensible cross-language AST static analyzer repository with security rule test cases for hardcoded crypto keys, SQLi, and insecure connections.",
    seedFiles: [
      {
        path: "pmd-java/src/test/resources/net/sourceforge/pmd/lang/java/rule/security/HardCodedCryptoAndSqliSample.java",
        language: "Java",
        content: `package net.sourceforge.pmd.lang.java.rule.security;
import javax.crypto.spec.SecretKeySpec;
import java.sql.Connection;
import java.sql.Statement;
import javax.servlet.http.HttpServletRequest;

public class HardCodedCryptoAndSqliSample {
    private static final String SECRET = "PmdHardcodedAesKey99887766554433";
    public void evaluate(HttpServletRequest req, Connection conn) throws Exception {
        SecretKeySpec spec = new SecretKeySpec(SECRET.getBytes(), "AES");
        Statement st = conn.createStatement();
        st.executeQuery("SELECT * FROM audit WHERE actor = '" + req.getParameter("actor") + "'");
    }
}`,
      },
    ],
  },
  {
    id: "checkmarx-cxsast-bench",
    name: "CxSAST Enterprise Query Suite",
    ownerRepo: "Checkmarx/CxSAST",
    url: "https://github.com/Checkmarx/CxSAST",
    fallbackGitHubUrl: "https://github.com/OWASP/BenchmarkDotNet",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "C#",
    defaultBranch: "main",
    defaultCommitSha: "e409e2b75c9a9033",
    expectedFindings: 30,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-79", "CWE-918"],
    description: "Enterprise C# / .NET Best-Fix-Location (BFL) and inter-procedural taint graph reference target.",
    seedFiles: [
      {
        path: "EnterpriseTargets/PaymentGatewayController.cs",
        language: "C#",
        content: `using System;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseTargets {
    [ApiController]
    [Route("api/v1/payments")]
    public class PaymentGatewayController : ControllerBase {
        [HttpPost("settle")]
        public IActionResult SettlePayment([FromQuery] string merchantId, [FromQuery] string callbackUrl) {
            using var conn = new SqlConnection("Server=tcp:fin-db;Password=HardcodedVaultKey!99;");
            var cmd = new SqlCommand("SELECT * FROM MerchantLedgers WHERE MerchantId = '" + merchantId + "'", conn);
            cmd.ExecuteReader();
            Process.Start("cmd.exe", "/c AuditExporter.exe " + merchantId);
            using var http = new HttpClient();
            var resp = http.GetStringAsync(callbackUrl).Result;
            return Content("<div>Settled for " + merchantId + ": " + resp + "</div>", "text/html");
        }
    }
}`,
      },
    ],
  },
  {
    id: "github-codeql",
    name: "GitHub CodeQL Query Suite",
    ownerRepo: "github/codeql",
    url: "https://github.com/github/codeql",
    category: "SAST Rule & Analyzer Testbeds",
    testingMode: "SAST",
    language: "Java",
    defaultBranch: "main",
    defaultCommitSha: "e410f6c81d0b0034",
    expectedFindings: 33,
    keyCwes: ["CWE-89", "CWE-78", "CWE-502", "CWE-918", "CWE-22", "CWE-611"],
    description: "Official GitHub CodeQL semantic analysis & CWE query test suite across Java, C#, Python, Go, JavaScript/TypeScript, and Ruby.",
    seedFiles: [
      {
        path: "java/ql/test/query-tests/security/CWE-089/semmle/examples/SqlInjectionSample.java",
        language: "Java",
        content: `package semmle.examples;
import java.sql.Connection;
import java.sql.Statement;
import java.net.URL;
import javax.servlet.http.HttpServletRequest;

public class SqlInjectionSample {
    public void handleCodeQlTest(HttpServletRequest request, Connection conn) throws Exception {
        String category = request.getParameter("category");
        Statement stmt = conn.createStatement();
        stmt.executeQuery("SELECT * FROM items WHERE category = '" + category + "'");
        Runtime.getRuntime().exec("sh -c " + request.getParameter("hook"));
        new URL(request.getParameter("upstreamUrl")).openConnection().connect();
    }
}`,
      },
    ],
  },
];

/**
 * Finds a matching BenchmarkRepoTarget by repository URL or owner/repo slug.
 */
export function findBenchmarkRepoByUrl(repoUrl: string): BenchmarkRepoTarget | undefined {
  const cleaned = (repoUrl || "")
    .trim()
    .toLowerCase()
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "");

  return BENCHMARK_32_REPOS.find((r) => {
    const rClean = r.url.toLowerCase().replace(/\/+$/, "");
    return cleaned === rClean || cleaned.endsWith(r.ownerRepo.toLowerCase());
  });
}
