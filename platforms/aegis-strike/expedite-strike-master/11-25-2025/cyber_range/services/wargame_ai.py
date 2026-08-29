# wargame_ai.py
"""
Autonomous Cyber Wargame Engine
-------------------------------
This module simulates Red-Team vs Blue-Team AI-driven battles.

Red Team AI:
 - Chooses attack vectors
 - Lateral movement
 - Exploitation planning
 - Tries to reach crown jewels
 - Avoids honeypots
 - Evades detection

Blue Team AI:
 - Detects anomalies
 - Correlates attack nodes
 - Generates alerts
 - Blocks movement
 - Deploys deception
 - Applies Zero Trust restrictions
"""
import os
import openai
from datetime import datetime
from cyber_range.services.neo4j_engine import Neo4jEngine
from cyber_range.services.honeypot import HoneypotEngine


openai.api_key = openai.api_key or os.getenv("OPENAI_API_KEY")

class WargameAI:

    def __init__(self):
        self.neo4j = Neo4jEngine()
        self.honey = HoneypotEngine()

    # ---------------------------------------------------------
    # Core function: run one full wargame round
    # ---------------------------------------------------------
    def run_round(self, start, target):
        """
        Produces:
        - Red team move
        - Blue team move
        - Outcome
        """

        # 1) Pull environment context
        full_graph = self.neo4j.get_full_graph()

        # 2) Attempt to get attack path
        path = self.neo4j.get_shortest_path(start, target)

        # Format data for the AI
        context = {
            "nodes": [str(r["n"]) for r in full_graph if "n" in r],
            "edges": [str(r["r"]) for r in full_graph if "r" in r],
            "path": str(path) if path else "None"
        }

        prompt = f"""
You are simulating a cyber wargame.

Environment Graph:
{context}

Start Node: {start}
Target Node: {target}

Simulate ONE ROUND with:
1. Red Team move
2. Blue Team move
3. Outcome
4. Next-step recommendations for each team
5. Which MITRE ATT&CK techniques apply
6. Detection & evasion effects
        """

        # Call OpenAI
        decision = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )

        return decision.choices[0].message["content"]

    # ---------------------------------------------------------
    # Run a multi-round match
    # ---------------------------------------------------------
    def run_match(self, start, target, rounds=5):
        results = []

        for r in range(1, rounds+1):
            result = self.run_round(start, target)
            results.append(f"### Round {r}\n{result}\n")

        final_output = "\n".join(results)
        return final_output

    # ---------------------------------------------------------
    # Automatically deploy honeypots during match
    # ---------------------------------------------------------
    def deploy_dynamic_honeypots(self, quantity=3):
        created = []
        for i in range(quantity):
            name = f"decoy-{i}"
            created.append(self.honey.deploy_honeypot(name))
        return created
