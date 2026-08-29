"use client";
import { useState } from "react";
import { COLLECTIONS } from "@/data/findings";
import { methodColor, methodBg } from "@/lib/utils";
import type { ApiRequest, CollectionFolder, Collection } from "@/types/api";
import { ChevronRight, ChevronDown, Play, Plus, FolderOpen, Folder, Send, Copy, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

function RequestRow({ req, depth = 0 }: { req: ApiRequest; depth?: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: `5px 12px 5px ${12 + depth * 14}px`,
      borderBottom: "1px solid var(--border)", cursor: "pointer",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(13,148,136,0.04)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <span className="pill" style={{ background: methodBg(req.method), color: methodColor(req.method), fontSize: 9, minWidth: 38, textAlign: "center" }}>{req.method}</span>
      <span style={{ flex: 1, fontSize: 11.5, color: "var(--foreground)" }}>{req.name}</span>
      {req.tags.map(t => (
        <span key={t} className="pill" style={{ background: "rgba(13,148,136,0.08)", color: "var(--primary)", fontSize: 8.5 }}>{t}</span>
      ))}
      <div style={{ display: "flex", gap: 3, opacity: 0, transition: "opacity 0.1s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}>
        <button title="Open in builder" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 2 }}><Send size={10} /></button>
        <button title="Duplicate" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 2 }}><Copy size={10} /></button>
        <button title="Delete" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 2 }}><Trash2 size={10} /></button>
      </div>
    </div>
  );
}

function FolderTree({ folder, depth = 0 }: { folder: CollectionFolder; depth?: number }) {
  const [open, setOpen] = useState(true);
  const totalReqs = folder.requests.length + (folder.folders?.reduce((a, f) => a + f.requests.length, 0) ?? 0);
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: `6px 12px 6px ${12 + depth * 14}px`,
        borderBottom: "1px solid var(--border)", cursor: "pointer", userSelect: "none",
      }}
      onClick={() => setOpen(o => !o)}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(13,148,136,0.03)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        {open ? <ChevronDown size={12} color="var(--muted)" /> : <ChevronRight size={12} color="var(--muted)" />}
        {open ? <FolderOpen size={13} color="var(--primary)" /> : <Folder size={13} color="var(--muted)" />}
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", flex: 1 }}>{folder.name}</span>
        <span style={{ fontSize: 9.5, color: "var(--muted)" }}>{totalReqs}</span>
      </div>
      {open && (
        <>
          {folder.requests.map(r => <RequestRow key={r.id} req={r} depth={depth + 1} />)}
          {folder.folders?.map(f => <FolderTree key={f.id} folder={f} depth={depth + 1} />)}
        </>
      )}
    </div>
  );
}

export default function CollectionsPage() {
  const [selected, setSelected] = useState<Collection>(COLLECTIONS[0]);
  const [detailReq, setDetailReq] = useState<ApiRequest | null>(null);

  const allRequests = selected.folders.flatMap(f => [
    ...f.requests,
    ...(f.folders?.flatMap(sf => sf.requests) ?? []),
  ]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <FolderOpen size={12} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Collections</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn-secondary"><Plus size={11} /> New Collection</button>
          <button className="btn-secondary"><Plus size={11} /> Import</button>
          <Link href="/runner" className="btn-primary" style={{ textDecoration: "none" }}><Play size={11} /> Run Collection</Link>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Collection list */}
        <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {COLLECTIONS.map(col => (
            <div key={col.id}
              onClick={() => setSelected(col)}
              style={{
                padding: "10px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                background: selected.id === col.id ? "rgba(13,148,136,0.08)" : "transparent",
                borderLeft: selected.id === col.id ? "2px solid var(--primary)" : "2px solid transparent",
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: selected.id === col.id ? "var(--foreground)" : "var(--muted)" }}>{col.icon} {col.name}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{col.folders.length} folders · {allRequests.length} requests</div>
            </div>
          ))}
        </div>

        {/* Folder tree */}
        <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", flex: 1 }}>{selected.icon} {selected.name}</span>
            <button style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><MoreHorizontal size={12} /></button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {selected.folders.map(f => <FolderTree key={f.id} folder={f} />)}
          </div>

          {/* Collection variables */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "8px 12px", flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Collection Variables</div>
            {selected.variables.map(v => (
              <div key={v.id} style={{ display: "flex", gap: 6, marginBottom: 3, fontSize: 10.5 }}>
                <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>{"{{" + v.key + "}}"}</span>
                <span style={{ color: "var(--yellow)", fontFamily: "monospace", flex: 1 }}>{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: request detail / collection overview */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>{allRequests.length} requests across {selected.folders.length} folders</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {["GET","POST","PUT","DELETE","PATCH"].map(m => {
                const count = allRequests.filter(r => r.method === m).length;
                if (!count) return null;
                return (
                  <div key={m} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="pill" style={{ background: methodBg(m as any), color: methodColor(m as any) }}>{m}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{count} request{count > 1 ? "s" : ""}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>All Requests</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              <table className="data-table">
                <thead><tr><th style={{ width: 60 }}>Method</th><th>Name</th><th>URL</th><th>Tags</th></tr></thead>
                <tbody>
                  {allRequests.map(r => (
                    <tr key={r.id} onClick={() => setDetailReq(r)}>
                      <td><span className="pill" style={{ background: methodBg(r.method), color: methodColor(r.method) }}>{r.method}</span></td>
                      <td style={{ color: "var(--foreground)", fontWeight: 500 }}>{r.name}</td>
                      <td style={{ fontFamily: "monospace", color: "var(--muted)", fontSize: 11 }}>{r.url}</td>
                      <td>{r.tags.map(t => <span key={t} className="pill" style={{ background: "rgba(13,148,136,0.08)", color: "var(--primary)", fontSize: 9, marginRight: 3 }}>{t}</span>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {detailReq && (
              <div style={{ marginTop: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span className="pill" style={{ background: methodBg(detailReq.method), color: methodColor(detailReq.method) }}>{detailReq.method}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{detailReq.name}</span>
                </div>
                <div style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--yellow)", marginBottom: 8 }}>{detailReq.url}</div>
                <p style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 10 }}>{detailReq.description}</p>
                {detailReq.testScript && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Test Script</div>
                    <pre style={{ fontSize: 11, color: "#a5d6a7", background: "var(--background)", padding: 10, borderRadius: 4, overflow: "auto" }}>{detailReq.testScript}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
