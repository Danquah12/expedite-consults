"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Map, Globe } from "lucide-react";
import { methodColor, methodBg } from "@/lib/utils";
import type { HttpMethod } from "@/types/dast";

interface SiteNode {
  path:     string;
  method?:  HttpMethod;
  params:   number;
  findings: number;
  children: SiteNode[];
}

const SITE_TREE: SiteNode[] = [
  {
    path: "/", params: 0, findings: 0, children: [
      { path: "/login",    params: 2, findings: 0, children: [], method: "POST" },
      { path: "/register", params: 4, findings: 0, children: [], method: "POST" },
      { path: "/dashboard",params: 1, findings: 0, children: [] },
      {
        path: "/api", params: 0, findings: 0, children: [
          {
            path: "/api/auth", params: 0, findings: 0, children: [
              { path: "/api/auth/login",   params: 2, findings: 0, children: [], method: "POST" },
              { path: "/api/auth/refresh", params: 1, findings: 0, children: [], method: "POST" },
            ],
          },
          {
            path: "/api/users", params: 0, findings: 0, children: [
              { path: "/api/users/{id}",   params: 3, findings: 1, children: [], method: "GET" },
              { path: "/api/users/me",     params: 0, findings: 1, children: [], method: "GET" },
              { path: "/api/users/{id}",   params: 5, findings: 1, children: [], method: "PUT" },
            ],
          },
          {
            path: "/api/products", params: 0, findings: 0, children: [
              { path: "/api/products",         params: 3, findings: 0, children: [], method: "GET" },
              { path: "/api/products/search",  params: 2, findings: 2, children: [], method: "GET" },
              { path: "/api/products/{id}",    params: 1, findings: 0, children: [], method: "GET" },
            ],
          },
          {
            path: "/api/profile", params: 0, findings: 0, children: [
              { path: "/api/profile/update",   params: 4, findings: 1, children: [], method: "PUT" },
            ],
          },
          {
            path: "/api/webhooks", params: 0, findings: 0, children: [
              { path: "/api/webhooks/test",    params: 2, findings: 1, children: [], method: "POST" },
            ],
          },
          {
            path: "/api/files", params: 0, findings: 0, children: [
              { path: "/api/files/{filename}", params: 1, findings: 1, children: [], method: "GET" },
            ],
          },
        ],
      },
      {
        path: "/admin", params: 0, findings: 0, children: [
          { path: "/admin/users",    params: 2, findings: 0, children: [], method: "GET" },
          { path: "/admin/settings", params: 0, findings: 0, children: [] },
        ],
      },
      {
        path: "/static", params: 0, findings: 0, children: [
          { path: "/static/js",  params: 0, findings: 0, children: [] },
          { path: "/static/css", params: 0, findings: 0, children: [] },
        ],
      },
    ],
  },
];

function TreeNode({ node, depth = 0 }: { node: SiteNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, padding: `4px 10px 4px ${10 + depth * 16}px`, borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(13,148,136,0.04)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <span style={{ flexShrink: 0, width: 12 }}>
          {hasChildren ? (open ? <ChevronDown size={11} color="var(--muted)" /> : <ChevronRight size={11} color="var(--muted)" />) : null}
        </span>
        {node.method && <span className="pill" style={{ background: methodBg(node.method), color: methodColor(node.method), fontSize: 8.5, flexShrink: 0 }}>{node.method}</span>}
        <span style={{ fontSize: 11.5, fontFamily: "monospace", color: node.findings > 0 ? "#ef5350" : "var(--muted)", flex: 1 }}>{node.path}</span>
        {node.params > 0 && <span style={{ fontSize: 9.5, color: "var(--muted)" }}>{node.params} params</span>}
        {node.findings > 0 && (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#ef5350", background: "rgba(239,83,80,0.1)", padding: "1px 5px", borderRadius: 8 }}>
            {node.findings} finding{node.findings > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {open && node.children.map((child, i) => <TreeNode key={i} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function SitemapPage() {
  const totalEndpoints = 20;
  const totalParams    = 34;
  const totalFindings  = 8;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Map size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Application Site Map</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 11 }}>
          <span style={{ color: "var(--primary)" }}>{totalEndpoints} endpoints</span>
          <span style={{ color: "var(--muted)" }}>{totalParams} params</span>
          <span style={{ color: "#ef5350" }}>{totalFindings} findings</span>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Tree */}
        <div style={{ width: 420, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "5px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={11} color="var(--muted)" />
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--primary)" }}>app.target.local</span>
            <span style={{ fontSize: 9.5, color: "var(--green)", marginLeft: "auto" }}>● Live</span>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {SITE_TREE.map((node, i) => <TreeNode key={i} node={node} depth={0} />)}
          </div>
        </div>

        {/* Legend + stats */}
        <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", marginBottom: 10 }}>Sources</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {[
              { label: "Proxy traffic", count: 8,  color: "var(--primary)" },
              { label: "Crawler", count: 9,         color: "#ce93d8" },
              { label: "API spec import", count: 3, color: "var(--blue)" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ color: "var(--muted)", flex: 1 }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700 }}>{s.count}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", marginBottom: 10 }}>Findings by Path</div>
          {[
            { path: "/api/products/search",  finding: "SQL Injection",  sev: "Critical" },
            { path: "/api/webhooks/test",    finding: "SSRF",            sev: "Critical" },
            { path: "/api/profile/update",   finding: "Stored XSS",     sev: "Critical" },
            { path: "/api/users/{id}",       finding: "IDOR",            sev: "High" },
            { path: "/api/users/me",         finding: "CORS",            sev: "High" },
            { path: "/api/files/{filename}", finding: "Path Traversal",  sev: "High" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "6px 8px", marginBottom: 4, borderRadius: 5, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)", flex: 1 }}>{f.path}</span>
              <span style={{ fontSize: 11, color: f.sev === "Critical" ? "#ef5350" : "#ffb74d", fontWeight: 700 }}>{f.finding}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
