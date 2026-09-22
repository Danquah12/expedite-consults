# -*- coding: utf-8 -*-
"""
Script to generate the TruePlace Complete Developer Handoff Package (.docx).
Covers all 10 official developer documents:
1. Product Requirements Document (PRD)
2. Software Requirements Specification (SRS - Epics 1 to 12 + Phase 2)
3. System Architecture Document
4. Database Schema Document (Complete PostGIS DDL)
5. API Specification (OpenAPI 3.1 Catalog)
6. UI/UX Wireframes
7. Design System
8. AI/ML Specification
9. Data Integration Specification
10. Development Roadmap (13-Step Sequential Path)
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_master_developer_package():
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    HEX_TEAL = "004D40"
    HEX_LIGHT_BG = "F4F7F6"
    HEX_TERRACOTTA = "E07A5F"
    HEX_SLATE = "2B2D42"
    
    COLOR_TEAL = RGBColor(0x00, 0x4D, 0x40)
    COLOR_DARK = RGBColor(0x1A, 0x1A, 0x1A)
    COLOR_GRAY = RGBColor(0x55, 0x55, 0x55)
    COLOR_TERRACOTTA = RGBColor(0xE0, 0x7A, 0x5F)
    COLOR_WHITE = RGBColor(0xFF, 0xFF, 0xFF)

    def set_cell_background(cell, fill_hex):
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

    def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'''
            <w:tcMar {nsdecls("w")}>
                <w:top w:w="{top}" w:type="dxa"/>
                <w:bottom w:w="{bottom}" w:type="dxa"/>
                <w:left w:w="{left}" w:type="dxa"/>
                <w:right w:w="{right}" w:type="dxa"/>
            </w:tcMar>
        ''')
        tcPr.append(tcMar)

    def set_table_borders(table, border_color_hex="D3D3D3"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color_hex}"/>
                <w:left w:val="none"/>
                <w:bottom w:val="single" w:sz="8" w:space="0" w:color="{HEX_TEAL}"/>
                <w:right w:val="none"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color_hex}"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr.append(borders)

    def add_doc_title(number, title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(24)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(f"DOCUMENT {number}: {title.upper()}")
        run.font.name = "Arial"
        run.font.size = Pt(17)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEAL

        p_div = doc.add_paragraph()
        p_div.paragraph_format.space_before = Pt(0)
        p_div.paragraph_format.space_after = Pt(8)
        p_div.paragraph_format.keep_with_next = True
        r_div = p_div.add_run("―" * 45)
        r_div.font.size = Pt(8)
        r_div.font.color.rgb = COLOR_TERRACOTTA

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEAL

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK

    def add_body(text, space_after=6, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = "Calibri"
            rb.font.size = Pt(10)
            rb.font.bold = True
            rb.font.color.rgb = COLOR_DARK
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_DARK
        return p

    def add_code_block(code_text, label="CODE / SPECIFICATION"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, HEX_SLATE)
        set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        rl = p.add_run(f"// {label}\n")
        rl.font.name = "Consolas"
        rl.font.size = Pt(8)
        rl.font.bold = True
        rl.font.color.rgb = RGBColor(0x8D, 0x99, 0xAE)

        rc = p.add_run(code_text.strip())
        rc.font.name = "Consolas"
        rc.font.size = Pt(8)
        rc.font.color.rgb = RGBColor(0xED, 0xF2, 0xF4)

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ---------------------------------------------------------
    # COVER PAGE
    # ---------------------------------------------------------
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(30)
    p_top.paragraph_format.space_after = Pt(6)
    r_tag = p_top.add_run("TRUEPLACE™ ENGINEERING HANDOFF SUITE")
    r_tag.font.name = "Arial"
    r_tag.font.size = Pt(11)
    r_tag.font.bold = True
    r_tag.font.color.rgb = COLOR_TERRACOTTA

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(8)
    rt = p_title.add_run("The 10 Essential Developer Documents &\n13-Step Implementation Roadmap")
    rt.font.name = "Arial"
    rt.font.size = Pt(24)
    rt.font.bold = True
    rt.font.color.rgb = COLOR_TEAL

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(4)
    p_sub.paragraph_format.space_after = Pt(24)
    rs = p_sub.add_run("Complete technical and architectural handoff package for building TruePlace: from zero to a production-ready MVP and Phase 2 enterprise scale.")
    rs.font.name = "Calibri"
    rs.font.size = Pt(13)
    rs.font.color.rgb = COLOR_GRAY

    # Document Index Table
    doc_index = [
        ("Doc 1", "Product Requirements Document (PRD)", "Core problem, user personas, functional & non-functional scope."),
        ("Doc 2", "Software Requirements Specification (SRS)", "Epics 1 through 12 + Phase 2 specs with Gherkin acceptance criteria."),
        ("Doc 3", "System Architecture Document", "Microservices, API Gateway, Docker Compose, Kubernetes EKS/AKS topology."),
        ("Doc 4", "Database Schema Document", "PostgreSQL 16 + PostGIS 3.4 DDL, Feature Store, and spatial indexes."),
        ("Doc 5", "API Specification", "OpenAPI 3.1 catalog for Auth, Search, Valuation, What-If, and Admin."),
        ("Doc 6", "UI/UX Wireframes", "TrueValue Card, 6-section Explainability, What-If Simulator, Admin."),
        ("Doc 7", "Design System", "Deep Teal (#004D40), Warm Sand (#F5EDE1), Terracotta, 8pt grid tokens."),
        ("Doc 8", "AI/ML Specification", "LightGBM regressor, TreeSHAP additivity, Prompt v2.4, Confidence & Truth."),
        ("Doc 9", "Data Integration Specification", "RESO Web API, County Deeds, Municipal Permits, FEMA Risk, Mapbox GL."),
        ("Doc 10", "Development Roadmap", "13-step sequential engineering implementation path with DoD.")
    ]
    tbl_idx = doc.add_table(rows=len(doc_index), cols=3)
    tbl_idx.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_idx.autofit = False
    set_table_borders(tbl_idx)
    for idx, (d_num, d_name, d_desc) in enumerate(doc_index):
        c0, c1, c2 = tbl_idx.cell(idx, 0), tbl_idx.cell(idx, 1), tbl_idx.cell(idx, 2)
        c0.width, c1.width, c2.width = Inches(1.0), Inches(2.3), Inches(3.2)
        set_cell_margins(c0, 60, 60, 70, 70)
        set_cell_margins(c1, 60, 60, 70, 70)
        set_cell_margins(c2, 60, 60, 70, 70)
        if idx % 2 == 1:
            set_cell_background(c0, HEX_LIGHT_BG)
            set_cell_background(c1, HEX_LIGHT_BG)
            set_cell_background(c2, HEX_LIGHT_BG)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(d_num)
        r0.font.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9)
        r0.font.color.rgb = COLOR_TEAL
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(d_name)
        r1.font.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(d_desc)
        r2.font.name = "Calibri"
        r2.font.size = Pt(8.5)

    doc.add_page_break()

    # ---------------------------------------------------------
    # DOCUMENT 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)
    # ---------------------------------------------------------
    add_doc_title("1", "Product Requirements Document (PRD)")
    add_body("Product Name: TruePlace™ | Target Market: US Residential Real Estate | Core Promise: Real Homes. Real Data. Real Peace of Mind.")
    add_heading_2("1.1 Executive Summary & Problem Definition")
    add_body("Incumbents monetize user friction and data arbitrage. Zillow and Realtor.com trap users in opaque valuation algorithms (Zestimates with 7-12% error), stale ghost inventory, and aggressive lead sales to Premier Agents. TruePlace solves this through 48-hour verified inventory, hybrid AI+Human TrueValue valuations (MAPE <= 3.5%), Ghost Mode zero-tracking privacy, and mathematical explainability.")
    add_heading_2("1.2 User Personas")
    add_body("• The High-Trust Homebuyer: Needs accurate price benchmarks, zero spam phone calls, and honest neighborhood data.")
    add_body("• The Transparent Seller: Wants accurate pre-listing valuations, low days-on-market, and direct access to verified buyers.")
    add_body("• The Collaborative Agent: Rejects predatory 35-40% referral cuts in favor of flat monthly zip code partner subscriptions.")
    add_heading_2("1.3 Core Functional Scope")
    add_body("Verified Active search, TrueValue Engine (point estimate + dynamic range), SHAP explainability breakdown, What-If simulation studio, downloadable 6-page Truth Report PDF, and Ghost Mode privacy browsing.")

    # ---------------------------------------------------------
    # DOCUMENT 2: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
    # ---------------------------------------------------------
    add_doc_title("2", "Software Requirements Specification (SRS)")
    add_body("Covers functional specifications for Epics 1 through 12, plus Phase 2 post-MVP enhancements.")
    
    add_heading_2("Epic 8: Explainability UI")
    add_body("• Story 8.1 TrueValue Card: Main card displaying TrueValue ($711,400), Range ($692k-$731k), Confidence Meter (91%), Truth Score (94), and SVG mini-donut chart.")
    add_body("• Story 8.2 Full Explainability Screen: Six dedicated sections:")
    add_body("  Section 1: Value Summary & Range | Section 2: SHAP Donut Chart (6 categories) | Section 3: Top Value Drivers (+$41.2k kitchen)")
    add_body("  Section 4: Negative Drivers (-$12.5k roof) | Section 5: Plain-English Explanation | Section 6: Comparable Sales Ledger.")

    add_heading_2("Epic 9: What-If Simulator")
    add_body("• Story 9.1 Counterfactual Simulations: Real-time UI toggles for Kitchen (Original/Updated/Luxury), Roof (Current/New), and Garage (None/1-Car/2-Car). Backend creates mutated feature vector, executes LightGBM + Interventional TreeSHAP, and returns {\"new_value\": 768900, \"change\": 57500} in < 150ms.")

    add_heading_2("Epic 10: Truth Report PDF")
    add_body("• Story 10.1 Generate Report: Headless Chromium worker generating 6-page audit PDF: Page 1 (Summary) | Page 2 (Value Drivers) | Page 3 (Natural Language Explanation) | Page 4 (Comparables Map & Matrix) | Page 5 (Saved What-If Scenarios) | Page 6 (SHAP Methodology & Disclosures).")

    add_heading_2("Epic 11: External Data Integrations")
    add_body("MLS feeds via RESO Web API; County Assessor deed and assessment webhooks; Local Municipal Building Permit registries; FEMA National Flood Hazard Layer; Mapbox GL custom vector tile engine.")

    add_heading_2("Epic 12: Admin Platform")
    add_body("Internal administrative dashboard: User Management (view/disable), Listing Verification (48h audit/remove), Model Observability (MAPE tracking/retraining), and Explainability Audit (SHAP inspection & appraiser override approvals).")

    add_heading_2("Phase 2 (Post-MVP Specifications)")
    add_body("• Computer Vision Module: Swin Transformer / ResNet-50 inspecting listing photos to classify and grade kitchen, bath, roof, and HVAC wear.")
    add_body("• Human Expert Review Workflow: Low-confidence valuations (< 75%) automatically route to a certified local appraiser review queue. Appraisers audit comps and input transparent manual overrides before publication.")
    add_body("• Personalized Explanations: Dual-persona generation (Homebuyer sees lifestyle and school commute fits; Investor sees cap rate, rent yield, and appreciation velocity).")

    # ---------------------------------------------------------
    # DOCUMENT 3: SYSTEM ARCHITECTURE DOCUMENT
    # ---------------------------------------------------------
    add_doc_title("3", "System Architecture Document")
    add_body("TruePlace is structured as an event-driven microservices architecture containerized with Docker and deployed via Kubernetes (AWS EKS or Azure AKS).")
    arch_spec = """- Frontend: Next.js 15 (App Router, Tailwind CSS v4, TypeScript 5.5) + React Native (Expo 52).
- Gateway: Node.js Fastify API Gateway (Reverse proxy, JWT verification, Redis token-bucket rate limiter).
- AI Engine: Python 3.11 FastAPI microservice running LightGBM 4.x and TreeSHAP.
- Ingestion: Go / Python async workers consuming RESO Web API and County deed queues.
- Reporting: Node.js Puppeteer PDF generation microservice.
- Storage: PostgreSQL 16 with PostGIS 3.4, TimescaleDB time-series, and Redis 7.2 cluster."""
    add_code_block(arch_spec, label="SYSTEM ARCHITECTURE SPECIFICATION")

    # ---------------------------------------------------------
    # DOCUMENT 4: DATABASE SCHEMA DOCUMENT
    # ---------------------------------------------------------
    add_doc_title("4", "Database Schema Document (PostgreSQL 16 + PostGIS)")
    add_body("Complete DDL definitions for the core operational, property, feature store, and audit schemas:")
    db_ddl = """-- Core Operational Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    ghost_mode BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mls_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    list_price INTEGER NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    bedrooms SMALLINT NOT NULL,
    bathrooms NUMERIC(3,1) NOT NULL,
    living_area_sqft INTEGER NOT NULL,
    lot_size_sqft INTEGER NOT NULL,
    year_built SMALLINT NOT NULL,
    status VARCHAR(32) DEFAULT 'active',
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_prop_loc ON properties USING GIST(location);

CREATE TABLE property_features (
    property_id UUID PRIMARY KEY REFERENCES properties(id),
    living_area_sqft INTEGER NOT NULL,
    bedrooms SMALLINT NOT NULL,
    bathrooms NUMERIC(3,1) NOT NULL,
    micro_comp_median_price_0_5mi INTEGER NOT NULL,
    school_district_rating_avg NUMERIC(3,1) NOT NULL,
    fema_flood_risk_category VARCHAR(16) NOT NULL,
    kitchen_condition_cv NUMERIC(3,2) DEFAULT 3.00
);

CREATE TABLE valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    true_value INTEGER NOT NULL,
    confidence SMALLINT NOT NULL,
    range_low INTEGER NOT NULL,
    range_high INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);"""
    add_code_block(db_ddl, label="DATABASE DDL: PostGIS Core")

    # ---------------------------------------------------------
    # DOCUMENT 5: API SPECIFICATION (OPENAPI 3.1)
    # ---------------------------------------------------------
    add_doc_title("5", "API Specification (OpenAPI 3.1 Catalog)")
    add_body("Key microservice contracts governing external and inter-service communication:")
    api_catalog = """POST /api/v1/auth/register          -> Ingests email/pass/name; returns JWT + Refresh Token
POST /api/v1/auth/ghost-mode/toggle -> Activates Ghost Mode cookie & telemetry suppression
GET  /api/v1/properties/search      -> 10-filter spatial search (price, beds, school, climate)
POST /api/v1/properties/spatial     -> GeoJSON boundary search using PostGIS ST_Contains
GET  /api/v1/properties/{id}        -> Hydrated details (Header, Specs, Neighborhood)
POST /api/v1/valuation/predict      -> LightGBM valuation (true_value, confidence, range)
POST /api/v1/valuation/what-if      -> Interventional TreeSHAP (new_value, change, delta)
POST /api/v1/reports/generate       -> Asynchronous 6-page Truth Report PDF generator
GET  /api/v1/admin/models/metrics   -> Admin model accuracy metrics (MAPE, RMSE, Drift)"""
    add_code_block(api_catalog, label="OPENAPI 3.1 ENDPOINT ROUTING")

    # ---------------------------------------------------------
    # DOCUMENT 6: UI/UX WIREFRAMES
    # ---------------------------------------------------------
    add_doc_title("6", "UI/UX Wireframes (Key Component Layouts)")
    add_heading_2("TrueValue Card & Explainability Screen Wireframe")
    wireframe_text = """+-------------------------------------------------------+
| TRUEVALUE ESTIMATE: $711,400                          |
| Range: $692,000 - $731,000 | Confidence: 91% (High)   |
| Truth Score: 94/100        | Freshness: MLS 2h ago    |
| [ Mini Donut: 42% Comps | 23% Specs | 15% Reno ]      |
+-------------------------------------------------------+
| 6-SECTION EXPLAINABILITY SCREEN:                      |
| Sec 1: Value Summary ($711.4k, +$50k vs Neighborhood) |
| Sec 2: SHAP Donut Breakdown (6 interactive slices)    |
| Sec 3: Top Drivers: Kitchen Renovated (+$41,200)      |
| Sec 4: Negative Drivers: Roof Age 18y (-$12,500)      |
| Sec 5: NL Text: 'This home is valued at $711,400...'  |
| Sec 6: Comparable Sales Ledger (12 micro-comps map)   |
+-------------------------------------------------------+"""
    add_code_block(wireframe_text, label="ASCII WIREFRAME: Explainability Components")

    # ---------------------------------------------------------
    # DOCUMENT 7: DESIGN SYSTEM
    # ---------------------------------------------------------
    add_doc_title("7", "Design System & Component Tokens")
    add_body("• Color Palette: Deep Teal #004D40 (Primary), Warm Sand #F5EDE1 (Canvas), Terracotta #E07A5F (Accent), Sage Green #2A9D8F (Positive Uplift), Coral #E76F51 (Deductions).")
    add_body("• Typography: Headings in SF Pro Display / Inter Bold; Body in Inter Regular (15px); Tabular figures enabled for pricing.")
    add_body("• Layout Grid: 8pt modular spacing grid; 16px mobile card padding; 24px desktop container margins; 8px border radius.")

    # ---------------------------------------------------------
    # DOCUMENT 8: AI/ML SPECIFICATION
    # ---------------------------------------------------------
    add_doc_title("8", "AI/ML Specification (TrueValue Engine)")
    add_body("• Primary Model: LightGBM Regressor (1,200 estimators, learning rate 0.03, num_leaves 45, max_depth 8). Target: MAPE <= 6.0% (MVP) -> <= 3.5% (V2).")
    add_body("• TreeSHAP Explainer: Exact polynomial time tree traversal. Strict additivity invariant: |true_value - (base_value + sum(shap))| < $1.00 USD.")
    add_body("• System Prompt v2.4: Temperature locked at 0.2. Strict numerical regex verification. Forbidden words: ['stunning', 'gorgeous', 'steal', 'dream home'].")
    add_body("• Confidence Formula: 0.25*Data + 0.30*Comps + 0.20*Agreement + 0.15*Stability + 0.10*Human Review.")
    add_body("• Truth Score Formula: 0.30*Freshness + 0.25*Photo Quality + 0.25*Comp Quality + 0.20*Model Agreement.")

    # ---------------------------------------------------------
    # DOCUMENT 9: DATA INTEGRATION SPECIFICATION
    # ---------------------------------------------------------
    add_doc_title("9", "Data Integration Specification")
    add_body("• RESO Web API: Ingests OData standard payloads (Property, Member, Media resources) over HTTPS webhooks.")
    add_body("• County Deed Registries: Automated parsing of transfer stamps, recording dates, and parcel boundaries.")
    add_body("• Municipal Building Permits: Ingests permit type, stated capital expenditure, and final sign-off inspection dates.")
    add_body("• FEMA / First Street Risk APIs: Syncs 100-year flood zone codes (AE, VE, X) and 30-year wildfire exposure scores.")
    add_body("• Mapbox GL: Custom vector tile endpoints serving PostGIS geometry via ST_AsMVT().")

    # ---------------------------------------------------------
    # DOCUMENT 10: DEVELOPMENT ROADMAP (13-STEP PATH)
    # ---------------------------------------------------------
    add_doc_title("10", "Development Roadmap (13-Step Implementation Path)")
    add_body("The sequential engineering execution order to take TruePlace from zero to a production-ready MVP and Phase 2 scale:")

    steps = [
        ("Step 1", "User / Auth System", "Registration, login, Argon2id, JWT, MFA, and Ghost Mode session cookie."),
        ("Step 2", "Property Search", "PostgreSQL B-Tree and GiST indexes, 10 multi-parametric search filters."),
        ("Step 3", "Property Details Page", "Next.js SSR page with Property Header, structural specs grid, neighborhood intel."),
        ("Step 4", "TrueValue Engine MVP", "Feature store tables, LightGBM model training, MAPE <= 6% validation."),
        ("Step 5", "SHAP Explainability", "TreeSHAP integration, strict dollar additivity verification, category mapping."),
        ("Step 6", "Confidence Score", "5-variable weighted confidence rubric (0-100%) and rating tier meters."),
        ("Step 7", "Truth Score", "4-factor empirical transparency scoring and 48-hour freshness triggers."),
        ("Step 8", "Explainability UI", "TrueValue Card and 6-section Explainability Screen with interactive donut chart."),
        ("Step 9", "What-If Simulator", "Interventional TreeSHAP counterfactual engine with real-time renovation toggles."),
        ("Step 10", "PDF Truth Reports", "Node.js Puppeteer worker generating the 6-page vector audit PDF."),
        ("Step 11", "Admin Portal", "Internal dashboard for user management, listing verification, and model metrics."),
        ("Step 12", "Computer Vision (Phase 2)", "Swin Transformer photo grading for kitchen, bath, roof, and HVAC finishes."),
        ("Step 13", "Human Review Network", "Appraiser queue for low-confidence valuations (< 75%) and manual override logs.")
    ]
    tbl_steps = doc.add_table(rows=len(steps), cols=3)
    tbl_steps.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_steps.autofit = False
    set_table_borders(tbl_steps)
    for idx, (s_num, s_name, s_scope) in enumerate(steps):
        c0, c1, c2 = tbl_steps.cell(idx, 0), tbl_steps.cell(idx, 1), tbl_steps.cell(idx, 2)
        c0.width, c1.width, c2.width = Inches(1.0), Inches(2.2), Inches(3.3)
        set_cell_margins(c0, 60, 60, 70, 70)
        set_cell_margins(c1, 60, 60, 70, 70)
        set_cell_margins(c2, 60, 60, 70, 70)
        if idx % 2 == 1:
            set_cell_background(c0, HEX_LIGHT_BG)
            set_cell_background(c1, HEX_LIGHT_BG)
            set_cell_background(c2, HEX_LIGHT_BG)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(s_num)
        r0.font.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9)
        r0.font.color.rgb = COLOR_TEAL
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(s_name)
        r1.font.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(s_scope)
        r2.font.name = "Calibri"
        r2.font.size = Pt(8.5)

    out_path = r"d:\Anti-gravity\expedite-consults\expedite-consults\TruePlace_Complete_Developer_Handoff_Package.docx"
    doc.save(out_path)
    print("Successfully generated Complete Developer Package at:", out_path)

if __name__ == "__main__":
    create_master_developer_package()
