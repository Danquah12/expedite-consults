# -*- coding: utf-8 -*-
"""
Script to generate TruePlace Epics 4, 5, 6 & 7 SRS Word Document (.docx).
Covers Epic 4 (TrueValue Engine MVP), Epic 5 (Explainability Layer & System Prompt v2.4),
Epic 6 (Confidence Score System), and Epic 7 (Truth Score Engine).
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_epics_4_7_srs():
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
    r_tag = p_top.add_run("TRUEPLACE MACHINE LEARNING & AI SPECIFICATION")
    r_tag.font.name = "Arial"
    r_tag.font.size = Pt(11)
    r_tag.font.bold = True
    r_tag.font.color.rgb = COLOR_TERRACOTTA

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(8)
    rt = p_title.add_run("Software Requirements Specification (SRS) & Epic Backlog\nEpics 4, 5, 6 & 7: TrueValue™ AI Engine & Explainability Core")
    rt.font.name = "Arial"
    rt.font.size = Pt(22)
    rt.font.bold = True
    rt.font.color.rgb = COLOR_TEAL

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(4)
    p_sub.paragraph_format.space_after = Pt(20)
    rs = p_sub.add_run("Technical Requirements for Epic 4 (TrueValue LightGBM Model & Feature Store), Epic 5 (TreeSHAP Explainability & System Prompt v2.4), Epic 6 (Multi-Factor Confidence Scoring), and Epic 7 (Transparency Truth Score)")
    rs.font.name = "Calibri"
    rs.font.size = Pt(12)
    rs.font.color.rgb = COLOR_GRAY

    # Document Control Table
    tbl_ctrl = doc.add_table(rows=4, cols=2)
    tbl_ctrl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_ctrl.autofit = False
    set_table_borders(tbl_ctrl)
    ctrl_data = [
        ("Specification Version", "v1.2.0-PROD (TrueValue AI Core Baseline)"),
        ("Epics Covered", "Epic 4: TrueValue MVP | Epic 5: Explainability | Epic 6: Confidence | Epic 7: Truth Score"),
        ("Model Frameworks", "LightGBM Regressor (MAE), TreeSHAP Explainer, LLM Prompt v2.4 (Temp 0.2)"),
        ("Target Accuracy Goal", "Median Absolute Percentage Error (MAPE) <= 6.0% (MVP) -> <= 3.5% (V2)")
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
    # SECTION 1: FEATURE STORE SCHEMA
    # ---------------------------------------------------------
    add_heading_1("1. Feature Store Schema Specification (5 Tables)")
    add_body("The Feature Store unifies MLS characteristics, county deed records, municipal permits, and computer-vision photos into normalized tabular matrices for model inference:")

    sql_schema = """-- 1. Property Features
CREATE TABLE property_features (
    property_id UUID PRIMARY KEY,
    living_area_sqft INTEGER NOT NULL,
    bedrooms SMALLINT NOT NULL,
    bathrooms NUMERIC(3,1) NOT NULL,
    year_built SMALLINT NOT NULL,
    lot_size_sqft INTEGER NOT NULL,
    micro_comp_median_price_0_5mi INTEGER NOT NULL,
    days_on_market_neighborhood_avg SMALLINT NOT NULL,
    school_district_rating_avg NUMERIC(3,1) NOT NULL,
    fema_flood_risk_category VARCHAR(16) NOT NULL,
    kitchen_condition_cv NUMERIC(3,2) DEFAULT 3.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Property History
CREATE TABLE property_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    event_type VARCHAR(32) NOT NULL, -- sold, listed, assessed
    event_date DATE NOT NULL,
    price_usd INTEGER NOT NULL,
    source_agency VARCHAR(64) NOT NULL
);

-- 3. Property Photos (CV Analyzed)
CREATE TABLE property_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    photo_url VARCHAR(512) NOT NULL,
    room_classification VARCHAR(64) NOT NULL,
    quality_resolution_score NUMERIC(3,2) NOT NULL
);

-- 4. Permits
CREATE TABLE permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    permit_type VARCHAR(64) NOT NULL, -- kitchen_remodel, addition, roof
    declared_job_cost INTEGER NOT NULL,
    issue_date DATE NOT NULL
);

-- 5. Comparable Sales
CREATE TABLE comparable_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_property_id UUID NOT NULL,
    comp_property_id UUID NOT NULL,
    sale_price INTEGER NOT NULL,
    distance_miles NUMERIC(4,2) NOT NULL,
    similarity_index NUMERIC(3,2) NOT NULL
);"""
    add_code_block(sql_schema, label="SQL DDL: 5 Feature Store Tables")

    # ---------------------------------------------------------
    # SECTION 2: EPIC 4 - TRUEVALUE ENGINE MVP
    # ---------------------------------------------------------
    add_heading_1("2. Epic 4: TrueValue Engine MVP")
    add_body("The TrueValue Engine MVP executes LightGBM gradient boosted decision trees against the Feature Store to generate point estimates, confidence scores, and dynamic error bands.")
    
    add_heading_2("Target Output JSON Contract")
    target_json = """{
  "true_value": 711400,
  "confidence": 91,
  "range": {
    "low": 692000,
    "high": 731000
  }
}"""
    add_code_block(target_json, label="JSON OUTPUT: TrueValue Prediction Payload")

    add_heading_2("User Story 4.1: Feature Store Ingestion & LightGBM Model")
    add_body("Given valid feature vectors in the Feature Store,\nWhen the FastAPI inference service receives a valuation request,\nThen LightGBM executes and returns true_value, confidence, and range in < 40ms,\nAnd the evaluation pipeline verifies MAPE <= 6.0% and logs RMSE to MLflow.", bold_prefix="Acceptance Criteria: ")

    # ---------------------------------------------------------
    # SECTION 3: EPIC 5 - EXPLAINABILITY LAYER
    # ---------------------------------------------------------
    add_heading_1("3. Epic 5: Explainability Layer (SHAP & NL Generation)")
    add_body("Enforces the TruePlace mandate: 'No valuation may be shown without an explanation.'")

    add_heading_2("User Story 5.1: Mathematical SHAP Attribution")
    add_body("Given a property valuation prediction,\nWhen TreeSHAP processes the model trees,\nThen every active feature receives an exact dollar contribution,\nAnd the sum of all SHAP values plus market base value equals the true_value within $1.00 USD,\nAnd the top drivers return in structured format: {\"driver\": \"Kitchen Renovation\", \"impact\": 41200}.", bold_prefix="Acceptance Criteria: ")

    add_heading_2("User Story 5.2: Natural Language Explanations (System Prompt v2.4)")
    add_body("Given SHAP values, confidence score, and property facts,\nWhen the LLM executes with System Prompt v2.4 at temperature 0.2,\nThen plain-English text is generated starting with: 'This home is valued at $711,400...',\nAnd all dollar amounts match the SHAP values exactly with zero forbidden marketing buzzwords.", bold_prefix="Acceptance Criteria: ")

    # ---------------------------------------------------------
    # SECTION 4: EPIC 6 - CONFIDENCE SCORE SYSTEM
    # ---------------------------------------------------------
    add_heading_1("4. Epic 6: Confidence Score System")
    add_body("Calculates a 0-100% confidence rating based on 5 weighted variables:")
    add_body("1. Data Completeness (25%): Non-null count across 28 required property attributes.")
    add_body("2. Comp Quality (30%): Density and proximity of arms-length comps within 0.5 miles over the past 6 months.")
    add_body("3. Model Agreement (20%): Percent divergence between LightGBM and secondary validation model.")
    add_body("4. Market Stability (15%): Low coefficient of variation in census tract 90-day price trends.")
    add_body("5. Human Review (10%): Certified appraiser audit status (verified = 100).", space_after=6)

    add_body("Output Format:", bold_prefix="Output: ")
    add_body("91% | Very High (Green Meter)")

    # ---------------------------------------------------------
    # SECTION 5: EPIC 7 - TRUTH SCORE ENGINE
    # ---------------------------------------------------------
    add_heading_1("5. Epic 7: Truth Score Engine")
    add_body("Measures overall data freshness and objective empirical integrity:")
    add_body("Formula: Truth Score = 0.30*(Data Freshness) + 0.25*(Photo Quality) + 0.25*(Comp Quality) + 0.20*(Model Agreement)")
    add_body("Output Example: 'Truth Score = 94' (displayed as a trust badge on listing cards). If MLS updates lag beyond 48 hours, the Truth Score automatically drops below 70, prompting a freshness warning banner.", space_after=12)

    out_path = r"d:\Anti-gravity\expedite-consults\expedite-consults\TruePlace_Epics_4_to_7_TrueValue_and_Explainability_SRS.docx"
    doc.save(out_path)
    print("Successfully generated Epics 4-7 SRS at:", out_path)

if __name__ == "__main__":
    create_epics_4_7_srs()
