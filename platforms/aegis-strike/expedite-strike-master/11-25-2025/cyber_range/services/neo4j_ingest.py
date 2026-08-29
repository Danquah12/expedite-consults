# cyber_range/services/neo4j_ingest.py

from cyber_range.services.neo4j_engine import Neo4jEngine
from cyber_range.services.ti_feed import ThreatIntelFeed

ti = ThreatIntelFeed()

class Neo4jIngestor:

    def __init__(self):
        self.db = Neo4jEngine()

    # ----------------------------------------------------------
    # MAIN ENTRY: Ingest parsed DF from Assessment
    # ----------------------------------------------------------
    def ingest_dataframe(self, df):
        """
        df must contain columns:
        asset, name/plugin/service, severity, cve (optional)
        """

        for _, row in df.iterrows():
            asset = row.get("asset", "Unknown")
            name  = row.get("name") or row.get("plugin") or row.get("service") or "Unknown"
            sev   = row.get("severity", "unknown")
            cve   = row.get("cve", None)

            # Create Asset node
            self.db.run_query(f"""
                MERGE (a:Asset {{name: '{asset}'}})
                ON CREATE SET a.first_seen = timestamp()
                SET a.last_seen = timestamp();
            """)

            # Create Vulnerability node
            self.db.run_query(f"""
                MERGE (v:Vulnerability {{name: '{name}'}})
                SET v.severity = '{sev}';
            """)

            # Link Asset → Vulnerability
            self.db.run_query(f"""
                MATCH (a:Asset {{name:'{asset}'}})
                MATCH (v:Vulnerability {{name:'{name}'}})
                MERGE (a)-[:HAS_VULN]->(v);
            """)

            # ------------------------------------------------------
            # If CVE exists → enrich & create nodes
            # ------------------------------------------------------
            if cve and cve != "None":
                kev = ti.check_kev(cve)
                epss_score = ti.get_epss(cve) or 0.0
                mitre_techs = ti.map_cve_to_mitre(cve)

                # Create CVE node
                self.db.run_query(f"""
                    MERGE (c:CVE {{id:'{cve}'}})
                    SET c.epss={epss_score},
                        c.kev={kev},
                        c.last_seen = timestamp();
                """)

                # Link Vulnerability → CVE
                self.db.run_query(f"""
                    MATCH (v:Vulnerability {{name:'{name}'}})
                    MATCH (c:CVE {{id:'{cve}'}})
                    MERGE (v)-[:HAS_CVE]->(c);
                """)

                # Map to MITRE Techniques
                for tech in mitre_techs:
                    self.db.run_query(f"""
                        MERGE (t:Technique {{id:'{tech}'}})
                        MERGE (c:CVE {{id:'{cve}'}})
                        MERGE (c)-[:MAPS_TO]->(t);
                    """)

        return True

    # ----------------------------------------------------------
    # Helper: Clear graph (optional)
    # ----------------------------------------------------------
    def clear_graph(self):
        self.db.run_query("MATCH (n) DETACH DELETE n")

