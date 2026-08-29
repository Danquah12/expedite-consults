# digital_twin.py
"""
Digital Twin Infrastructure Simulator
-------------------------------------
A full logical model of the environment for use in:
 - Attack simulation
 - Segmentation validation
 - Ransomware propagation
 - Blue/Red wargames
 - MITRE mapping
 - Cloud & on-prem hybrid modeling
"""

from cyber_range.services.neo4j_engine import Neo4jEngine


class DigitalTwin:
    def __init__(self):
        self.neo4j = Neo4jEngine()

    # ---------------------------------------------------------
    # Build a synthetic digital twin model from stored data
    # ---------------------------------------------------------
    def build_twin(self):
        """
        Pull all relevant graph components and build a structured twin:
        - Assets
        - Services
        - Vulnerabilities
        - Cloud resources
        - Network segments
        - Identity/Access objects
        """
        cypher = """
        MATCH (a:Asset)
        OPTIONAL MATCH (a)-[:HAS_SERVICE]->(s:Service)
        OPTIONAL MATCH (a)-[:HAS_VULN]->(v:Vulnerability)
        OPTIONAL MATCH (a)-[:SEGMENT]->(seg:Segment)
        OPTIONAL MATCH (a)-[:HAS_IDENTITY]->(id:Identity)
        OPTIONAL MATCH (a)-[:HAS_POLICY]->(p:Policy)
        RETURN a, collect(s) AS services, collect(v) AS vulns,
               seg, id, p
        """

        result = self.neo4j.query(cypher)
        twin = []

        for record in result:
            a = record["a"]
            twin.append({
                "asset": a,
                "services": [s for s in record["services"] if s],
                "vulns": [v for v in record["vulns"] if v],
                "segment": record["seg"],
                "identity": record["id"],
                "policy": record["p"]
            })

        return twin

    # ---------------------------------------------------------
    # Predict attack propagation from a compromised node
    # ---------------------------------------------------------
    def propagate_attack(self, start_id, depth=4):
        cypher = f"""
        MATCH p = (s {{id:$id}})-[:REL*..{depth}]->(t)
        RETURN DISTINCT t
        """
        result = self.neo4j.query(cypher, {"id": start_id})
        return [r["t"] for r in result]

    # ---------------------------------------------------------
    # Firewall / segmentation simulation
    # ---------------------------------------------------------
    def validate_segmentation(self, asset_a, asset_b):
        cypher = """
        MATCH (a:Asset {id:$a})-[:SEGMENT]->(seg1),
              (b:Asset {id:$b})-[:SEGMENT]->(seg2)
        OPTIONAL MATCH p = shortestPath((a)-[:REL*..5]-(b))
        RETURN seg1, seg2, p
        """

        result = self.neo4j.query(cypher, {"a": asset_a, "b": asset_b})
        if not result:
            return None

        rec = result[0]
        return {
            "seg1": rec["seg1"],
            "seg2": rec["seg2"],
            "path": rec["p"]
        }

    # ---------------------------------------------------------
    # Cloud IAM simulation (AWS-like)
    # ---------------------------------------------------------
    def cloud_iam_exposure(self, user_id):
        cypher = """
        MATCH path = (u:AWSUser {id:$id})-[:USES|ASSUMES|ALLOWS*..4]->(r)
        RETURN path LIMIT 10
        """
        result = self.neo4j.query(cypher, {"id": user_id})
        return [r["path"] for r in result]

    # ---------------------------------------------------------
    # Generate a summary of the infrastructure model
    # ---------------------------------------------------------
    def summary(self):
        twin = self.build_twin()
        total_assets = len(twin)
        total_services = sum(len(t["services"]) for t in twin)
        total_vulns = sum(len(t["vulns"]) for t in twin)

        return {
            "assets": total_assets,
            "services": total_services,
            "vulns": total_vulns
        }
