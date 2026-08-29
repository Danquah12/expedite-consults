# cyber_range/services/neo4j_engine.py

from neo4j import GraphDatabase
import os

class Neo4jEngine:

    def __init__(self):
        # Pull from environment OR use defaults
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        pwd  = os.getenv("NEO4J_PASSWORD", "Adomaa12@")

        self.driver = GraphDatabase.driver(uri, auth=(user, pwd))

    # --------------------------------------------------------------
    # RUN RAW QUERY → returns full Neo4j records
    # --------------------------------------------------------------
    def run_query(self, query, params=None):
        """
        Executes a full Neo4j query & returns raw records.
        """
        with self.driver.session() as session:
            return list(session.run(query, params or {}))

    # --------------------------------------------------------------
    # SIMPLE QUERY → returns extracted string values
    # --------------------------------------------------------------
    def run_query_simple(self, query, params=None):
        """
        Executes a Neo4j query but returns only primitive strings.
        Used for killchain + digital twin modules.
        """
        with self.driver.session() as session:
            data = []
            for record in session.run(query, params or {}):
                for item in record.values():
                    data.append(item if not isinstance(item, str) else item)
            return data

    # ==============================================================
    # BACKWARD COMPATIBILITY WRAPPERS  ← CRITICAL FIX
    # ==============================================================

    def query(self, query, params=None):
        """
        Compatibility alias for older cyber_range modules.
        Many modules call neo4j.query() — so we forward to run_query().
        """
        return self.run_query(query, params)

    def query_simple(self, query, params=None):
        """
        Compatibility alias for modules expecting query_simple().
        """
        return self.run_query_simple(query, params)

    # --------------------------------------------------------------
    # CONNECTION TEST
    # --------------------------------------------------------------
    def test_connection(self):
        """
        Simple connection test. Returns True if Neo4j responds.
        """
        try:
            with self.driver.session() as session:
                result = session.run("RETURN 1 AS ok")
                record = result.single()
                print("[Neo4j] Connected successfully.")
                return record["ok"] == 1
        except Exception as e:
            print(f"[Neo4j] Connection failed: {e}")
            return False
