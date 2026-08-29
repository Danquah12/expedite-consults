# ==============================================================
# ui_attack_chain.py — Dash UI + Attack Path Narration
# ==============================================================

from dash import html, dcc, Input, Output, State, callback, no_update
import dash_cytoscape as cyto

from cyber_range.services.attack_paths import (
    get_all_assets,
    safe_attack_path,
    get_exploit_chain_for_asset
)


# ---------------------------------------------------------------
# Layout
# ---------------------------------------------------------------
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
                elements=[]
            ),

            html.H4("Attack Chain Summary", className="text-warning mt-4"),
            html.Div(id="attack-chain-summary", className="text-light"),

            html.H4("Attack Path Narration", className="text-warning mt-4"),
            html.Div(id="attack-path-narration", className="text-info", style={"whiteSpace": "pre-wrap"}),

        ],
        className="p-4"
    )


# ---------------------------------------------------------------
# Dropdown Refresh
# ---------------------------------------------------------------
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


# ---------------------------------------------------------------
# Narration generator
# ---------------------------------------------------------------
def generate_narration(nodes, chain_data, src, dst):
    narration = []

    narration.append(f"🟢 The attack begins at **{src}**.\n")
    narration.append("The adversary attempts to move laterally across the environment.\n")

    # Step-by-step node narration
    for i in range(len(nodes) - 1):
        a = nodes[i]['data']['label']
        b = nodes[i+1]['data']['label']
        narration.append(f"➡️ Attacker pivots from **{a}** to **{b}**.\n")

    if chain_data['vulns']:
        narration.append("\n🔥 **Vulnerabilities exploited along the chain:**")
        for v in chain_data['vulns']:
            narration.append(f"   • {v}")

    if chain_data['cves']:
        narration.append("\n🔻 **Associated CVEs:**")
        for c in chain_data['cves']:
            narration.append(f"   • {c}")

    narration.append(f"\n🏁 The attack successfully reaches the crown jewel: **{dst}**.")

    return "\n".join(narration)


# ---------------------------------------------------------------
# MAIN Attack Path Simulation Callback
# ---------------------------------------------------------------
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

    if not src or not dst:
        return no_update, "❌ Select both assets.", ""

    if src == dst:
        return [], f"⚠ Starting and target assets cannot match ({src}).", ""

    result = safe_attack_path(src, dst)
    if result is None:
        return [], f"⚠ No attack path found from {src} → {dst}.", ""

    nodes = result["nodes"]
    edges = result["edges"]

    chain_data = get_exploit_chain_for_asset(src)

    summary = html.Div(
        [
            html.P(f"🔥 Attack Path Found: {src} → {dst}", className="text-success"),
            html.P(f"Vulnerabilities Exploited: {len(chain_data['vulns'])}", className="text-info"),
            html.P(f"CVEs: {', '.join(chain_data['cves']) or 'None'}"),
            html.P(f"Techniques: {', '.join(chain_data['techniques']) or 'None'}"),
        ]
    )

    narration = generate_narration(nodes, chain_data, src, dst)

    return nodes + edges, summary, narration
