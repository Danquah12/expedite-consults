# -*- coding: utf-8 -*-
"""
Script to generate TruePlace Phase 1 Core Platform SRS Word Document (.docx).
Covers Epic 1 (User Management & Ghost Mode), Epic 2 (Property Search & Mapbox Overlays),
and Epic 3 (Property Details Page & Neighborhood Intelligence) with full PostGIS schemas,
OpenAPI contracts, and Gherkin user stories.
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_phase_1_srs():
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

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(20)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEAL

        p_div = doc.add_paragraph()
        p_div.paragraph_format.space_before = Pt(0)
        p_div.paragraph_format.space_after = Pt(8)
        p_div.paragraph_format.keep_with_next = True
        r_div = p_div.add_run("―" * 40)
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
    # COVER / HEADER
    # ---------------------------------------------------------
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(24)
    p_top.paragraph_format.space_after = Pt(6)
    r_tag = p_top.add_run("TRUEPLACE ENGINEERING SPECIFICATION")
    r_tag.font.name = "Arial"
    r_tag.font.size = Pt(11)
    r_tag.font.bold = True
    r_tag.font.color.rgb = COLOR_TERRACOTTA

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(8)
    rt = p_title.add_run("Software Requirements Specification (SRS) & Epic Backlog\nPhase 1: Core Platform")
    rt.font.name = "Arial"
    rt.font.size = Pt(22)
    rt.font.bold = True
    rt.font.color.rgb = COLOR_TEAL

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(4)
    p_sub.paragraph_format.space_after = Pt(20)
    rs = p_sub.add_run("Implementation Requirements for Epic 1 (User Management & Ghost Mode), Epic 2 (Property Search & Mapbox Overlays), and Epic 3 (Property Details Page & Neighborhood Intelligence)")
    rs.font.name = "Calibri"
    rs.font.size = Pt(12)
    rs.font.color.rgb = COLOR_GRAY

    # Document Control Table
    tbl_ctrl = doc.add_table(rows=4, cols=2)
    tbl_ctrl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_ctrl.autofit = False
    set_table_borders(tbl_ctrl)
    ctrl_data = [
        ("Document Version", "v1.1.0-PROD (Phase 1 Baseline)"),
        ("Epics Covered", "Epic 1: User Management | Epic 2: Property Search | Epic 3: Property Details"),
        ("Target Database", "PostgreSQL 16 + PostGIS 3.4 Spatial Registry + Redis 7.2 Cache"),
        ("Frontend & Mapping", "Next.js 15 App Router, React Native (Expo 52), Mapbox GL Vector Tiles")
    ]
    for idx, (k, v) in enumerate(ctrl_data):
        c0, c1 = tbl_ctrl.cell(idx, 0), tbl_ctrl.cell(idx, 1)
        c0.width, c1.width = Inches(2.0), Inches(4.5)
        set_cell_margins(c0, 60, 60, 80, 80)
        set_cell_margins(c1, 60, 60, 80, 80)
        set_cell_background(c0, HEX_LIGHT_BG)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9)
        r0.font.color.rgb = COLOR_TEAL
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ---------------------------------------------------------
    # SECTION 1: DATABASE SCHEMA
    # ---------------------------------------------------------
    add_heading_1("1. Relational & Geospatial Schema (PostgreSQL 16 + PostGIS)")
    add_body("The Phase 1 database schema powers user identity, Ghost Mode flags, spatial boundary searches, environmental overlays, and listing metadata.")
    
    schema_sql = """-- Users & Ghost Mode
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(32),
    ghost_mode BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(64),
    preferences JSONB NOT NULL DEFAULT '{"theme": "warm_sand", "alerts": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties & Spatial Coordinates
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mls_id VARCHAR(64) UNIQUE,
    listing_agent_id UUID,
    title VARCHAR(255) NOT NULL,
    list_price INTEGER NOT NULL,
    address_street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    bedrooms SMALLINT NOT NULL,
    bathrooms NUMERIC(3,1) NOT NULL,
    living_area_sqft INTEGER NOT NULL,
    lot_size_sqft INTEGER NOT NULL,
    year_built SMALLINT NOT NULL,
    school_rating_avg NUMERIC(3,1) DEFAULT 0.0,
    climate_risk_score SMALLINT DEFAULT 1,
    walk_score SMALLINT DEFAULT 0,
    photo_urls TEXT[] NOT NULL DEFAULT '{}',
    is_verified_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_properties_search ON properties(list_price, bedrooms, bathrooms, living_area_sqft);"""
    add_code_block(schema_sql, label="SQL DDL: Phase 1 Schema Core")

    # ---------------------------------------------------------
    # SECTION 2: EPIC 1 - USER MANAGEMENT & GHOST MODE
    # ---------------------------------------------------------
    add_heading_1("2. Epic 1: User Management & Ghost Mode")
    add_body(
        "User Management provides authenticated account features with enterprise-grade MFA and the proprietary "
        "Ghost Mode privacy engine that eliminates lead monetization."
    )

    add_heading_2("User Story 1.1: Registration, Authentication & MFA")
    add_body("• Role: User | Action: Register, Login, Forgot Password, and configure TOTP MFA | Outcome: Secure account access to bookmark properties and save custom searches.")
    add_body("Gherkin Acceptance Criteria:", bold_prefix="Acceptance Criteria: ")
    add_body("Given an unauthenticated visitor on the registration screen,\nWhen valid email, Argon2id-hashed password, and full name are submitted,\nThen a user row is created with role 'buyer' and JWT access token is returned.\nWhen a user enables MFA in security settings,\nThen an RFC 6238 TOTP base32 secret is generated and verified with a 6-digit authenticator code.", space_after=6)

    add_heading_2("User Story 1.2: Ghost Mode Privacy Engine")
    add_body("• Role: Homebuyer | Action: Toggle Ghost Mode ON | Outcome: Zero agent contact, zero lead resale, zero marketing tracking, and completely anonymous browsing.")
    add_body("Gherkin Acceptance Criteria:", bold_prefix="Acceptance Criteria: ")
    add_body("Given a user toggles 'Ghost Mode' to ON,\nThen the API Gateway sets a cryptographic session cookie and updates users.ghost_mode = TRUE,\nAnd all marketing tags (Google Analytics, Meta Pixel) are unloaded from the DOM,\nAnd when the user views a property or requests a tour, agent lead-routing webhooks are intercepted and blocked,\nAnd a privacy badge confirms: 'Ghost Mode Active: Your personal data will never be sold.'", space_after=10)

    # ---------------------------------------------------------
    # SECTION 3: EPIC 2 - PROPERTY SEARCH & GEOSPATIAL MAPS
    # ---------------------------------------------------------
    add_heading_1("3. Epic 2: Property Search & Geospatial Discovery")
    add_body("Provides multi-filter search and Mapbox GL vector tile exploration with sub-100ms response times.")

    add_heading_2("User Story 2.1: Multi-Filter Search Engine")
    add_body("Supports 10 simultaneous filters: Price ($min-$max), Bedrooms, Bathrooms, SQFT, Lot Size, Zip Code, School Rating (1-10), Climate Risk (1-10), and Property Type.")
    add_body("Given search parameters price_min=500000, price_max=850000, beds=3, and school_rating_min=8.0,\nWhen the search API executes against PostgreSQL,\nThen parameterized query uses composite B-Tree indexes to return paginated results in < 75ms.", bold_prefix="Acceptance Criteria: ")

    add_heading_2("User Story 2.2: Map Search & Custom Boundary Drawing")
    add_body("Integrates Mapbox GL with interactive polygon drawing tool (@mapbox/mapbox-gl-draw) and environmental heatmap overlays.")
    add_body("Given a user draws a 5-point polygon around a target neighborhood on Mapbox,\nWhen the client posts the GeoJSON boundary to /api/v1/properties/search/spatial,\nThen PostGIS executes ST_Contains(ST_GeomFromGeoJSON(:boundary), location) and updates pins in < 100ms.\nWhen user activates 'Flood Zones' or 'School Boundaries' overlays,\nThen FEMA flood polygons (AE/VE) and NCES school districts render with interactive click cards.", bold_prefix="Acceptance Criteria: ")

    # ---------------------------------------------------------
    # SECTION 4: EPIC 3 - PROPERTY DETAILS PAGE (PDP)
    # ---------------------------------------------------------
    add_heading_1("4. Epic 3: Property Details Page (PDP)")
    add_body("High-performance Next.js Server-Side Rendered (SSR) page displaying verified property facts, high-resolution imagery, and hyper-local neighborhood intelligence.")

    add_heading_2("User Story 3.1: Property Header, Details & Neighborhood")
    add_body("Required Components:", space_after=4)
    add_body("1. Property Header: Address, listing price, TrueValue estimate ($711,400), verified 48h active badge, WebP photo carousel, and listing agent card.")
    add_body("2. Property Details Grid: Beds (4), Baths (3.0), SQFT (2,450), Year Built (2018), Lot Size (8,200 sqft / 0.19 acres), Stories (2), Garage (2 attached), HOA dues ($45/mo).")
    add_body("3. Neighborhood Intelligence: Assigned schools with GreatSchools ratings, WalkScore (88/100) and TransitScore gauges, 12-month crime trend ('Declining 8%'), and municipal development pipeline.", space_after=8)

    add_heading_2("OpenAPI Contract: GET /api/v1/properties/{id}")
    api_json = """// Sample JSON Response from /api/v1/properties/{id}
{
  "id": "c1f7b03a-86cb-4022-86ee-71328eb97e68",
  "title": "Modern Craftsman in Travis Heights",
  "list_price": 725000,
  "truevalue_estimate": 711400,
  "confidence_score": 91,
  "specs": {
    "bedrooms": 4, "bathrooms": 3.0, "living_area_sqft": 2450,
    "lot_size_sqft": 8200, "year_built": 2018
  },
  "neighborhood": {
    "walk_score": 88,
    "schools": [{"name": "Travis Heights Elem", "rating": 9}],
    "crime_trend": "declining_by_8_percent",
    "development_pipeline": "4-acre park renovation 0.6mi north"
  }
}"""
    add_code_block(api_json, label="REST API JSON: Property Details Payload")

    out_path = r"d:\Anti-gravity\expedite-consults\expedite-consults\TruePlace_Phase_1_Core_Platform_SRS.docx"
    doc.save(out_path)
    print("Successfully generated Phase 1 SRS at:", out_path)

if __name__ == "__main__":
    create_phase_1_srs()
