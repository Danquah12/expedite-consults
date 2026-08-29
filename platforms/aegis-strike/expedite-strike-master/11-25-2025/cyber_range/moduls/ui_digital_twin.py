# ui_digital_twin.py
from dash import html, dcc, Input, Output
import dash_bootstrap_components as dbc
from cyber_range.services.digital_twin import DigitalTwin


dt = DigitalTwin()

def digital_twin_tab():
    return dbc.Container(
        [
            html.H3("🌐 Digital Twin Overview", className="text-warning mb-3"),

            dbc.Button("Refresh Model", id="dt-refresh", color="primary", className="mb-3"),

            html.Div(id="dt-summary", className="text-light mt-3"),

            html.Hr(),
            html.H4("Propagation Simulation"),
            dcc.Input(id="dt-start", placeholder="Start Node ID", className="mb-2"),
            dbc.Button("Simulate Propagation", id="dt-propagate", color="secondary"),
            html.Div(id="dt-propagation-output", className="text-light mt-3"),
        ],
        fluid=True
    )


def register_callbacks(app):

    @app.callback(
        Output("dt-summary", "children"),
        Input("dt-refresh", "n_clicks"),
        prevent_initial_call=True
    )
    def refresh_model(_):
        summary = dt.summary()
        return html.Div([
            html.P(f"Total Assets: {summary['assets']}"),
            html.P(f"Total Services: {summary['services']}"),
            html.P(f"Total Vulnerabilities: {summary['vulns']}"),
        ])

    @app.callback(
        Output("dt-propagation-output", "children"),
        Input("dt-propagate", "n_clicks"),
        Input("dt-start", "value"),
        prevent_initial_call=True
    )
    def propagate(_, start):
        if not start:
            return "⚠ Enter a start node."

        nodes = dt.propagate_attack(start)
        return html.Ul([html.Li(n.get("name") or str(n.id)) for n in nodes])
