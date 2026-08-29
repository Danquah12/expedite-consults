# ==============================================================
# attack_paths.py — FINAL VERSION
# Supports CONNECTED, EXPLOITS, HAS_VULN
# Neo4j 5.x Compatible + CVE Narration
# ==============================================================

from neo4j import GraphDatabase

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASS = "Adomaa12@"


# --------------------------------------------------------------
# Neo4j Driver Helper
# --------------------------------------------------------------
def get_driver():
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))


# --------------------------------------------------------------
# 1. Get All Asset Names (Dropdown)
# --------------------------------------------------------------
def get_all_assets():
    driver = get_driver()
    with driver.session() as session:
        result = session.run("""
            MATCH (a:Asset)
            WHERE a.host IS NOT NULL AND a.host <> ""
            RETURN DISTINCT a.host AS asset
            ORDER BY asset
        """)

        assets = [row["asset"] for row in result]

    driver.close()
    return assets


# --------------------------------------------------------------
# 2. SAFE SHORTEST PATH (Neo4j 5.x)
# --------------------------------------------------------------
def safe_attack_path(src, dst):
    """
    Computes shortest attack path using:
        CONNECTED  (network hops)
        HAS_VULN   (asset -> vulnerability)
        EXPLOITS   (vuln -> next asset)
    """

    driver = get_driver()

    with driver.session() as session:

        query = """
            MATCH (start:Asset {host:$src})
            MATCH (end:Asset   {host:$dst})

            CALL {
                WITH start, end
                MATCH p = shortestPath(
                    (start)-[:CONNECTED|HAS_VULN|EXPLOITS*1..6]->(end)
                )
                RETURN p LIMIT 1
            }

            RETURN p
        """

        try:
            res = session.run(query, src=src, dst=dst).single()
        except Exception as e:
            print(f"[!] Attack path Neo4j error: {e}")
            driver.close()
            return None

        if res is None:
            driver.close()
            return None

        path = res["p"]

        # -------------------------
        # Extract Nodes
        # -------------------------
        nodes = []
        for n in path.nodes:
            nid = str(id(n))
            label = n.get("host") or n.get("name") or "node"

            nodes.append({
                "data": {"id": nid, "label": label},
                "classes": "bright-node"
            })

        # -------------------------
        # Extract Edges
        # -------------------------
        edges = []
        for r in path.relationships:
            rid = str(id(r))
            src_id = str(id(r.start_node))
            dst_id = str(id(r.end_node))

            edges.append({
                "data": {
                    "id": rid,
                    "source": src_id,
                    "target": dst_id,
                    "label": r.type
                },
                "classes": "bright-edge"
            })

    driver.close()

    return {"nodes": nodes, "edges": edges}


# --------------------------------------------------------------
# 3. Summary Panel (CVEs, Vulns, MITRE)
# --------------------------------------------------------------
def get_exploit_chain_for_asset(asset):
    driver = get_driver()

    with driver.session() as session:

        vulns = session.run("""
            MATCH (a:Asset {host:$asset})-[:HAS_VULN]->(v:Vulnerability)
            RETURN DISTINCT v.name AS vuln
        """, asset=asset)
        vuln_list = [r["vuln"] for r in vulns]

        cves = session.run("""
            MATCH (a:Asset {host:$asset})-[:HAS_VULN]->(:Vulnerability)-[:IS_CVE]->(c:CVE)
            RETURN DISTINCT c.id AS cve
        """, asset=asset)
        cve_list = [r["cve"] for r in cves]

        tech = session.run("""
            MATCH (a:Asset {host:$asset})-[:HAS_VULN]->(:Vulnerability)-[:USES_TECHNIQUE]->(t:Technique)
            RETURN DISTINCT t.id AS technique
        """, asset=asset)
        tech_list = [r["technique"] for r in tech]

    driver.close()

    return {
        "vulns": vuln_list,
        "cves": cve_list,
        "techniques": tech_list
    }


# --------------------------------------------------------------
# 4. CVE / Vulnerability Narration for EACH HOP
# --------------------------------------------------------------
def get_edge_exploits(node_labels):
    """
    Takes ordered asset labels from the attack path:
        [A → B → C → D]

    For each hop:
        A → B
        B → C
        C → D

    Returns vulnerabilities + CVEs used for the pivot.
    """

    edges_info = []
    driver = get_driver()

    with driver.session() as session:

        for i in range(len(node_labels) - 1):
            src = node_labels[i]
            dst = node_labels[i + 1]

            rows = session.run("""
                MATCH (src:Asset {host:$src})-[:HAS_VULN]->(v:Vulnerability)
                OPTIONAL MATCH (v)-[:IS_CVE]->(c:CVE)
                WITH src, v, COLLECT(DISTINCT c.id) AS cves

                MATCH (src)-[:EXPLOITS]->(dst:Asset {host:$dst})

                RETURN DISTINCT v.name AS vuln, cves
            """, src=src, dst=dst)

            hop_vulns = []
            hop_cves = []

            for r in rows:
                if r["vuln"]:
                    hop_vulns.append(r["vuln"])
                if r["cves"]:
                    hop_cves.extend(r["cves"])

            edges_info.append({
                "from": src,
                "to": dst,
                "vulns": list(set(hop_vulns)),
                "cves": list(set(hop_cves))
            })

    driver.close()
    return edges_info
