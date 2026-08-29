# ui_honeypot.py

from dash import html, dcc, Input, Output, State
import dash_bootstrap_components as dbc
from cyber_range.services.honeypot import HoneypotEngine

honeypot = HoneypotEngine()

# -------------------------------------------------------------
# Layout
# -------------------------------------------------------------
def honeypot_tab():
    return dbc.Container(
        [
            html.H3("🕵️ Honeypot & Deception Engine", className="text-warning mb-3"),
            
            dbc.Row([
                dbc.Col([
                    html.Label("Honeypot Name"),
                    dcc.Input(id="hp-name", placeholder="decoy-db", className="mb-2"),
                ], width=6),

                dbc.Col([
                    html.Label("Segment"),
                    dcc.Input(id="hp-segment", placeholder="DeceptionNet", className="mb-2"),
                ], width=6),
            ]),

            dbc.Button("Deploy Honeypot", id="hp-deploy", color="danger", className="mt-2 mb-4"),

            html.Hr(),

            dbc.Button("List Active Honeypots", id="hp-list", color="primary", className="mb-3"),

            html.Div(id="hp-output", className="text-light mt-3")
        ],
        fluid=True
    )

# -------------------------------------------------------------
# Callbacks
# -------------------------------------------------------------
def register_callbacks(app):

    # Deploy honeypot
    @app.callback(
        Output("hp-output", "children"),
        Input("hp-deploy", "n_clicks"),
        State("hp-name", "value"),
        State("hp-segment", "value"),
        prevent_initial_call=True
    )
    def deploy_hp(_, name, segment):
        if not name:
            return "⚠ Please provide a honeypot name."

        hp = honeypot.deploy_honeypot(name, segment or "DeceptionNet")
        return html.Div(f"✔ Honeypot deployed: {hp['name']}")

    # List honeypots
    @app.callback(
        Output("hp-output", "children", allow_duplicate=True),
        Input("hp-list", "n_clicks"),
        prevent_initial_call=True
    )
    def list_hp(_):
        hps = honeypot.list_honeypots()
        if not hps:
            return "No honeypots deployed."

        return html.Ul([html.Li(h.get("name", "Unknown")) for h in hps])

