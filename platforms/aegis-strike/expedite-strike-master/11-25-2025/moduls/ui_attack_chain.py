# ==============================================================
# ui_attack_chain.py — Attack Chain Simulator (FINAL VERSION)
# ==============================================================
from dash import html, dcc, Input, Output, State, callback, no_update
import dash_cytoscape as cyto

from cyber_range.services.attack_paths import (
    get_all_assets,
    safe_attack_path,
    get_exploit_chain_for_asset,
    get_edge_exploits
)

# ==============================================================
# Layout
# ==============================================================
def attack_chain_simulator_layout():
    return html.Div(
        [
            html.H3("Attack Chain Simulator", className="text-warning mb-4"),

            # Attacker Starting Asset
            html.Div(
                [
                    html.Label("Attacker Starting Asset", className="text-info"),
                    dcc.Dropdown(
                        id="attack-start-asset",
                        options=[{"label": a, "value": a} for a in get_all_assets()],
                        placeholder="Select starting asset",
                    ),
                ],
                className="mb-3"
            ),

            # Target Asset
            html.Div(
                [
                    html.Label("Target Asset (Crown Jewel)", className="text-danger"),
                    dcc.Dropdown(
                        id="attack-target-asset",
                        options=[{"label": a, "value": a} for a in get_all_assets()],
                        placeholder="Select target asset",
                    ),
                ],
                className="mb-3"
            ),

            # Run button
            html.Button(
                "Run Attack Simulation",
                id="run-attack-sim",
                className="btn btn-primary mb-4"
            ),

            # Graph Output
            html.H4("Attack Path Visualization", className="text-warning"),
            cyto.Cytoscape(
                id="attack-path-graph",
                layout={"name": "dagre"},
                style={"width": "100%", "height": "600px", "background-color": "#111"},
                stylesheet=[
                    {
                        "selector": "node",
                        "style": {
                            "label": "data(label)",
                            "color": "white",
                            "background-color": "#00b7ff",
                            "font-size": "18px"
                        }
                    },
                    {
                        "selector": "edge",
                        "style": {
                            "label": "data(label)",
                            "line-color": "#ffcc00",
                            "target-arrow-color": "#ffcc00",
                            "target-arrow-shape": "triangle",
                            "curve-style": "bezier",
                            "font-size": "14px",
                            "color": "#ffcc00"
                        }
                    }
                ],
                elements=[]
            ),

            html.H4("Attack Chain Summary", className="text-warning mt-4"),
            html.Div(id="attack-chain-summary", className="text-light"),

            html.H4("Attack Path Narration", className="text-warning mt-4"),
            html.Div(id="attack-path-narration", className="text-info", style={"whiteSpace": "pre-wrap"}),
        ],
        className="p-4"
    )


# ==============================================================
# Dropdown Refresh
# ==============================================================
@callback(
    Output("attack-start-asset", "options"),
    Output("attack-target-asset", "options"),
    Input("run-attack-sim", "n_clicks"),
    prevent_initial_call=False
)
def refresh_asset_dropdowns(_):
    assets = get_all_assets()
    opts = [{"label": a, "value": a} for a in assets]
    return opts, opts


# ==============================================================
# Narration builder WITH CVE PER HOP
# ==============================================================
def generate_narration(nodes, src, dst, edge_data):
    narration = []

    narration.append(f"🟢 **Attack begins** at `{src}`.\n")
    narration.append("The adversary begins lateral movement across the network.\n")

    labels = [n["data"]["label"] for n in nodes]

    # Step-by-step hop narration
    for hop in edge_data:
        frm = hop["from"]
        to = hop["to"]

        narration.append(f"➡️ Pivot **{frm} → {to}**")

        if hop["vulns"]:
            narration.append("   • Vulnerabilities exploited:")
            for v in hop["vulns"]:
                narration.append(f"        - {v}")

        if hop["cves"]:
            narration.append("   • CVEs used:")
            for c in hop["cves"]:
                narration.append(f"        - {c}")

        narration.append("")  # spacing

    narration.append(f"🏁 **Attack successfully reaches `{dst}` (Crown Jewel).**")

    return "\n".join(narration)


# ==============================================================
# MAIN Callback — Run Simulation
# ==============================================================
@callback(
    Output("attack-path-graph", "elements"),
    Output("attack-chain-summary", "children"),
    Output("attack-path-narration", "children"),
    Input("run-attack-sim", "n_clicks"),
    State("attack-start-asset", "value"),
    State("attack-target-asset", "value"),
    prevent_initial_call=True
)
def run_attack_simulation(_, src, dst):

    # Input validation
    if not src or not dst:
        return no_update, "❌ Select both assets.", ""

    if src == dst:
        return [], f"⚠ Starting and target assets cannot match ({src}).", ""

    # Run Neo4j shortest path
    result = safe_attack_path(src, dst)
    if result is None:
        return [], f"⚠ No attack path found from {src} → {dst}.", ""

    nodes = result["nodes"]
    edges = result["edges"]

    # Summary panel (overall CVEs, techniques)
    chain_data = get_exploit_chain_for_asset(src)

    summary = html.Div(
        [
            html.P(f"🔥 Attack Path Found: {src} → {dst}", className="text-success"),
            html.P(f"Vulnerabilities Exploited: {len(chain_data['vulns'])}", className="text-info"),
            html.P(f"CVEs: {', '.join(chain_data['cves']) or 'None'}"),
            html.P(f"Techniques: {', '.join(chain_data['techniques']) or 'None'}"),
        ]
    )

    # Build hop-by-hop CVE chain from backend
    labels = [n["data"]["label"] for n in nodes]
    edge_data = get_edge_exploits(labels)

    narration = generate_narration(nodes, src, dst, edge_data)

    return nodes + edges, summary, narration
