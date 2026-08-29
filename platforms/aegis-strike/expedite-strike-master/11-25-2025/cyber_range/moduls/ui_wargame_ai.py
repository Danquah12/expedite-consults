# ui_wargame_ai.py

from dash import html, dcc, Input, Output, State
import dash_bootstrap_components as dbc
from cyber_range.services.wargame_ai import WargameAI
from cyber_range.services.neo4j_engine import Neo4jEngine

war_ai = WargameAI()
neo = Neo4jEngine()

# -------------------------------------------------------------
# Layout
# -------------------------------------------------------------
def wargame_tab():
    return dbc.Container(
        [
            html.H3("⚔️ AI Wargame Simulator", className="text-warning mb-3"),

            dbc.Row([
                dbc.Col([
                    html.Label("Start Node (Attacker Entry)"),
                    dcc.Dropdown(id="wg-start", placeholder="Select entry node...")
                ], width=6),

                dbc.Col([
                    html.Label("Target Node (Crown Jewel)"),
                    dcc.Dropdown(id="wg-target", placeholder="Select target node...")
                ], width=6),
            ], className="mb-3"),

            dbc.Row([
                dbc.Col([
                    html.Label("Number of Rounds"),
                    dcc.Input(id="wg-rounds", type="number", value=3, min=1, max=20),
                ], width=4)
            ], className="mb-3"),

            dbc.Button("Run Wargame Simulation", id="wg-run", color="danger", className="mb-3"),

            html.Hr(),

            html.Div(id="wg-output", className="text-light mt-3")
        ],
        fluid=True
    )

# -------------------------------------------------------------
# Callbacks
# -------------------------------------------------------------
def register_callbacks(app):

    # Populate node dropdowns
    @app.callback(
        [
            Output("wg-start", "options"),
            Output("wg-target", "options")
        ],
        Input("neo4j-graph", "elements"),
        prevent_initial_call=False
    )
    def populate_nodes(elements):
        if not elements:
            return [], []

        nodes = []
        seen = set()

        for el in elements:
            if "data" not in el:
                continue
            d = el["data"]
            if "id" not in d:
                continue

            nid = d["id"]
            label = d.get("label", nid)

            if nid not in seen:
                seen.add(nid)
                nodes.append({"label": label, "value": nid})

        return nodes, nodes

    # ---------------------------------------------------------
    # Run wargame
    # ---------------------------------------------------------
    @app.callback(
        Output("wg-output", "children"),
        Input("wg-run", "n_clicks"),
        State("wg-start", "value"),
        State("wg-target", "value"),
        State("wg-rounds", "value"),
        prevent_initial_call=True
    )
    def run_simulation(_, start, target, rounds):
        if not start or not target:
            return "⚠ Please select start and target nodes."

        if not rounds or rounds < 1:
            rounds = 1

        battle = war_ai.run_match(start, target, rounds)

        return html.Pre(battle, style={
            "whiteSpace": "pre-wrap",
            "color": "#ff9999",
            "fontSize": "14px"
        })
