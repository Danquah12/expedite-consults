# ==============================================================
# attack_paths.py — FIXED VERSION (NO EXPLOITS REQUIRED)
# FULLY WORKING WITH YOUR CURRENT GRAPH
# ==============================================================

from neo4j import GraphDatabase

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASS = "Adomaa12@"


# --------------------------------------------------------------
# Neo4j Driver
# --------------------------------------------------------------
def get_driver():
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))


# --------------------------------------------------------------
# Get all assets
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
        assets = [r["asset"] for r in result]
    driver.close()
    return assets


# --------------------------------------------------------------
# SAFE SHORTEST PATH (ONLY CONNECTED — BECAUSE YOU HAVE NO EXPLOITS)
# --------------------------------------------------------------
def safe_attack_path(src, dst):
    driver = get_driver()
    with driver.session() as session:
        query = """
            MATCH (start:Asset {host:$src})
            MATCH (end:Asset {host:$dst})

            CALL {
                WITH start, end
                MATCH p = shortestPath((start)-[:CONNECTED*1..10]->(end))
                RETURN p LIMIT 1
            }

            RETURN p
        """
        try:
            res = session.run(query, src=src, dst=dst).single()
        except Exception as e:
            print(f"[!] Neo4j shortest path error: {e}")
            driver.close()
            return None

        if not res:
            driver.close()
            return None

        path = res["p"]

        # Build nodes
        nodes = []
        for n in path.nodes:
            nid = str(id(n))
            label = n.get("host") or n.get("name") or "node"
            nodes.append({
                "data": {"id": nid, "label": label},
                "classes": "bright-node"
            })

        # Build edges
        edges = []
        for r in path.relationships:
            rid = str(id(r))
            edges.append({
                "data": {
                    "id": rid,
                    "source": str(id(r.start_node)),
                    "target": str(id(r.end_node)),
                    "label": r.type
                },
                "classes": "bright-edge"
            })

    driver.close()
    return {"nodes": nodes, "edges": edges}


# --------------------------------------------------------------
# Summary panel (CVEs, vulns)
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

    driver.close()
    return {
        "vulns": vuln_list,
        "cves": cve_list,
        "techniques": []
    }


# --------------------------------------------------------------
# Hop-by-hop analysis (NOW WORKS — NO EXPLOITS NEEDED)
# --------------------------------------------------------------
def get_edge_exploits(node_labels):
    """
    For each hop A -> B:
    Report vulnerabilities & CVEs present on A.
    (This simulates attacker exploiting vulns on source system
    before lateral movement.)
    """
    edges_info = []
    driver = get_driver()

    with driver.session() as session:
        for i in range(len(node_labels) - 1):
            src = node_labels[i]
            dst = node_labels[i + 1]

            rows = session.run("""
                MATCH (a:Asset {host:$src})-[:HAS_VULN]->(v:Vulnerability)
                OPTIONAL MATCH (v)-[:IS_CVE]->(c:CVE)
                RETURN DISTINCT v.name AS vuln, COLLECT(DISTINCT c.id) AS cves
            """, src=src)

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

