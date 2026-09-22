# -*- coding: utf-8 -*-
"""
Script to generate the TruePlace Master Product & Technical Report Word Document (.docx).
Applies professional styling, corporate palette (Deep Teal #004D40, Warm Sand #F5EDE1, Terracotta #E07A5F),
custom tables, styled callout boxes, code snippets, and wireframes.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = docx.Document()

    # Page setup - 1 inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Color definitions
    HEX_TEAL = "004D40"
    HEX_LIGHT_BG = "F4F7F6"
    HEX_WARM_SAND = "F5EDE1"
    HEX_TERRACOTTA = "E07A5F"
    HEX_MUTED_BORDER = "CCCCCC"
    HEX_TEAL_BORDER = "004D40"
    
    COLOR_TEAL = RGBColor(0x00, 0x4D, 0x40)
    COLOR_DARK = RGBColor(0x1A, 0x1A, 0x1A)
    COLOR_GRAY = RGBColor(0x55, 0x55, 0x55)
    COLOR_TERRACOTTA = RGBColor(0xE0, 0x7A, 0x5F)
    COLOR_WHITE = RGBColor(0xFF, 0xFF, 0xFF)

    # Helper XML shading & border functions
    def set_cell_background(cell, fill_hex):
        shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading_elm)

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

    def add_callout(text_list, title="KEY ARCHITECTURAL HIGHLIGHT", bg_hex=HEX_LIGHT_BG, border_hex=HEX_TEAL_BORDER):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, bg_hex)
        set_cell_margins(cell, top=160, bottom=160, left=220, right=200)
        
        # Left border only (accent line)
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_hex}"/>
                <w:top w:val="none"/>
                <w:right w:val="none"/>
                <w:bottom w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        run_t = p.add_run(f"■ {title.upper()}\n")
        run_t.font.name = "Arial"
        run_t.font.size = Pt(10)
        run_t.font.bold = True
        run_t.font.color.rgb = COLOR_TEAL

        for idx, item in enumerate(text_list):
            p_sub = cell.add_paragraph()
            p_sub.paragraph_format.space_before = Pt(2)
            p_sub.paragraph_format.space_after = Pt(2)
            run_item = p_sub.add_run(item)
            run_item.font.name = "Calibri"
            run_item.font.size = Pt(10)
            run_item.font.color.rgb = COLOR_DARK

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(22)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEAL

        # Decorative divider under Heading 1
        p_div = doc.add_paragraph()
        p_div.paragraph_format.space_before = Pt(0)
        p_div.paragraph_format.space_after = Pt(8)
        p_div.paragraph_format.keep_with_next = True
        run_div = p_div.add_run("―" * 45)
        run_div.font.name = "Arial"
        run_div.font.size = Pt(8)
        run_div.font.color.rgb = COLOR_TERRACOTTA

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEAL

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK

    def add_body(text, space_after=6, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = "Calibri"
            run_b.font.size = Pt(10.5)
            run_b.font.bold = True
            run_b.font.color.rgb = COLOR_DARK
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(10.5)
        run.font.color.rgb = COLOR_DARK
        return p

    def add_code_block(code_text, label="CODE / SPECIFICATION"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, "2B2D42")  # Dark slate background
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r_lbl = p.add_run(f"// {label}\n")
        r_lbl.font.name = "Consolas"
        r_lbl.font.size = Pt(8.5)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = RGBColor(0x8D, 0x99, 0xAE)

        run = p.add_run(code_text.strip())
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(0xED, 0xF2, 0xF4)

        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(2)
        p_after.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    p_cover_top = doc.add_paragraph()
    p_cover_top.paragraph_format.space_before = Pt(36)
    p_cover_top.paragraph_format.space_after = Pt(12)
    
    r_tag = p_cover_top.add_run("TRUEPLACE STRATEGIC MASTER BLUEPRINT")
    r_tag.font.name = "Arial"
    r_tag.font.size = Pt(12)
    r_tag.font.bold = True
    r_tag.font.color.rgb = COLOR_TERRACOTTA

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("TruePlace™\nComprehensive Product Strategy,\nAI Technical Specification &\nValuation Explainability Engine")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(26)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_TEAL

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(8)
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("How TruePlace Exceeds Zillow and Realtor.com Through Radical Trust, 48-Hour Verified Active Inventory, the 7-Layer TrueValue™ Hybrid AI Engine, and Mathematical Explainability (SHAP)")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(14)
    r_sub.font.color.rgb = COLOR_GRAY

    # Metadata Box on Cover Page
    tbl_meta = doc.add_table(rows=4, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    set_table_borders(tbl_meta, border_color_hex=HEX_MUTED_BORDER)
    
    meta_rows = [
        ("Brand & Product Name", "TruePlace™ (TruePlace, Inc.)"),
        ("Brand Promise", "Real Homes. Real Data. Real Peace of Mind."),
        ("Architecture Version", "v2.4 Production Baseline (7-Layer Hybrid Valuation + Interventional TreeSHAP)"),
        ("Target Market", "US Residential Real Estate (Buyers, Verified Sellers, Collaborative Agents, Lenders)")
    ]
    for idx, (k, v) in enumerate(meta_rows):
        c0 = tbl_meta.cell(idx, 0)
        c1 = tbl_meta.cell(idx, 1)
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_background(c0, HEX_LIGHT_BG)
        set_cell_margins(c0, 80, 80, 100, 100)
        set_cell_margins(c1, 80, 80, 100, 100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_TEAL
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)

    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE OF CONTENTS / EXECUTIVE OUTLINE
    # -------------------------------------------------------------
    add_heading_1("Executive Summary & Document Organization")
    add_body(
        "This master document serves as the comprehensive strategic, operational, product, and engineering blueprint "
        "for TruePlace™. It unifies all research, technical specifications, machine learning architectures, UI/UX "
        "wireframes, and mathematical explainability designs into a single cohesive reference for product executives, "
        "engineering leads, and investors."
    )

    toc_items = [
        ("Section 1", "Strategic Vision & Brand Foundation: Radical Trust + Radical Experience"),
        ("Section 2", "Competitive Moat: Outperforming Zillow & Realtor.com"),
        ("Section 3", "Product Roadmap & Phased Execution (MVP, V1, V2)"),
        ("Section 4", "Business & Monetization Model: Sustainable, Agent-Friendly Economics"),
        ("Section 5", "System Architecture & Engineering Technology Stack"),
        ("Section 6", "TrueValue™ Valuation Engine: 7-Layer Deep Dive"),
        ("Section 7", "Data Ingestion Hierarchy, RESO APIs & Feature Stores"),
        ("Section 8", "Explainability Layer (Layer 7): Mathematical Foundations & SHAP Integration"),
        ("Section 9", "Production System Prompt v2.4 for Natural Language Generation"),
        ("Section 10", "What-If Simulator: Counterfactual Engine & Technical Constraints"),
        ("Section 11", "TreeSHAP Performance Optimization & Real-Time Caching Strategy"),
        ("Section 12", "Complete UI/UX Wireframes & Component Design System"),
        ("Section 13", "The 'Truth Report' Audit-Ready PDF Specification")
    ]
    tbl_toc = doc.add_table(rows=len(toc_items), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_toc.autofit = False
    set_table_borders(tbl_toc)
    for idx, (s_num, s_title) in enumerate(toc_items):
        c0 = tbl_toc.cell(idx, 0)
        c1 = tbl_toc.cell(idx, 1)
        c0.width = Inches(1.5)
        c1.width = Inches(5.0)
        set_cell_margins(c0, 60, 60, 80, 80)
        set_cell_margins(c1, 60, 60, 80, 80)
        if idx % 2 == 1:
            set_cell_background(c0, HEX_LIGHT_BG)
            set_cell_background(c1, HEX_LIGHT_BG)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(s_num)
        r0.font.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_TEAL

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(s_title)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)

    add_body("", space_after=12)

    # -------------------------------------------------------------
    # SECTION 1: STRATEGIC VISION & BRAND FOUNDATION
    # -------------------------------------------------------------
    add_heading_1("1. Strategic Vision & Brand Foundation")
    add_body(
        "Modern real estate marketplaces are broken. Incumbents like Zillow and Realtor.com have maximized lead arbitrage "
        "at the expense of data integrity and consumer trust. Their business models monetize buyer frustration: listings "
        "remain active long after homes go under contract, valuation algorithms ('Zestimates') act as opaque black boxes "
        "with volatile error rates, and consumer contact information is aggressively sold as leads to the highest-bidding agents.",
        bold_prefix="The Market Problem: "
    )
    add_body(
        "TruePlace is engineered from the ground up on the philosophy of 'Radical Trust + Radical Experience'. By prioritizing "
        "verified active inventory, transparent valuation math, zero-spam buyer privacy, and calm, delightful software design, "
        "TruePlace creates an unassailable competitive moat.",
        bold_prefix="The TruePlace Solution: "
    )

    add_callout([
        "Name: TruePlace™",
        "Tagline: 'Real Homes. Real Data. Real Peace of Mind.'",
        "Brand Promise: The only real estate platform that prioritizes truth, transparency, and extraordinary experience over advertising and lead generation.",
        "Visual Direction: Deep Teal (#004D40), Warm Sand (#F5EDE1), and Terracotta (#E07A5F). Calm, premium, trustworthy, and human-centric."
    ], title="TRUEPLACE BRAND IDENTITY")

    add_heading_2("Core Operating Values")
    add_body("Every decision in the product, algorithm design, and business model adheres strictly to four core values:", space_after=4)
    add_body("1. Radical Transparency: Never show an estimate, ranking, or fee without explaining the underlying factors in plain, audit-ready English.", space_after=3)
    add_body("2. Intelligent Simplicity: Transform complex multi-variate statistical models into intuitive, calm, and actionable digital experiences.", space_after=3)
    add_body("3. Human + AI Excellence: Blend state-of-the-art predictive machine learning with certified appraiser and local market human review.", space_after=3)
    add_body("4. Absolute Respect for Time & Privacy: Zero ghost listings, zero forced lead selling, zero unsolicited agent spam.", space_after=12)

    # -------------------------------------------------------------
    # SECTION 2: COMPETITIVE MOAT & INCUMBENT COMPARISON
    # -------------------------------------------------------------
    add_heading_1("2. Competitive Moat: Outperforming Zillow & Realtor.com")
    add_body(
        "Zillow and Realtor.com dominate aggregate traffic, but suffer from critical structural weaknesses that create "
        "massive churn and consumer dissatisfaction. TruePlace directly addresses these vulnerabilities."
    )

    diff_data = [
        ("Area", "Zillow / Realtor.com Weakness", "TruePlace Superior Approach"),
        ("Home Valuation", "Zestimate / automated models are opaque black boxes with 7-12% median error rates.", "TrueValue™ Hybrid AI + Human appraisal layer with strict MAPE <= 3.5% and SHAP explainability."),
        ("Listing Freshness", "Ghost listings and stale data remain online for weeks to generate fake lead volume.", "Verified Active Only: mandatory 48-hour automated & broker confirmation or listing is deprioritized."),
        ("Agent Model", "Predatory lead auctions charging 30-40% referral cuts or $100+ per unqualified phone lead.", "Flat monthly zip code subscription and performance-based verified partner network."),
        ("User Privacy", "Aggressive data brokers; user clicks immediately trigger multi-agent cold calling.", "'Ghost Mode' native privacy browsing; direct contact only upon explicit buyer authorization."),
        ("User Experience", "Cluttered, ad-heavy, pop-up aggressive, stress-inducing interfaces.", "Calm, minimalist UX with warm earth tones, zero third-party ads, and 60fps responsive tools."),
        ("Decision Support", "Basic search filters and static public photos with no counterfactual modeling.", "AI Home Matchmaker, Instant Virtual Renovation, What-If Simulator, and Spatial Noise Simulation.")
    ]
    tbl_diff = doc.add_table(rows=len(diff_data), cols=3)
    tbl_diff.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_diff.autofit = False
    set_table_borders(tbl_diff)
    for idx, row in enumerate(diff_data):
        c0, c1, c2 = tbl_diff.cell(idx, 0), tbl_diff.cell(idx, 1), tbl_diff.cell(idx, 2)
        c0.width, c1.width, c2.width = Inches(1.3), Inches(2.6), Inches(2.6)
        set_cell_margins(c0, 80, 80, 90, 90)
        set_cell_margins(c1, 80, 80, 90, 90)
        set_cell_margins(c2, 80, 80, 90, 90)
        if idx == 0:
            set_cell_background(c0, HEX_TEAL)
            set_cell_background(c1, HEX_TEAL)
            set_cell_background(c2, HEX_TEAL)
            for cell, text in zip([c0, c1, c2], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(9.5)
                r.font.color.rgb = COLOR_WHITE
        else:
            if idx % 2 == 1:
                set_cell_background(c0, HEX_LIGHT_BG)
                set_cell_background(c1, HEX_LIGHT_BG)
                set_cell_background(c2, HEX_LIGHT_BG)
            for cell, text in zip([c0, c1, c2], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.name = "Calibri"
                r.font.size = Pt(9)
                r.font.color.rgb = COLOR_DARK

    add_body("", space_after=12)

    # -------------------------------------------------------------
    # SECTION 3: PRODUCT ROADMAP & PHASED EXECUTION
    # -------------------------------------------------------------
    add_heading_1("3. Product Roadmap & Phased Execution")
    add_body("TruePlace follows a disciplined, value-first product development roadmap across three distinct phases:")

    add_heading_2("Phase 1: MVP Foundation (Months 1–6) — Trust Baseline")
    add_body("Focus: Core real estate search, listing accuracy, and primary valuation engine in top 20 metro areas.")
    add_body("• Verified Active Search: MLS synchronization via RESO Web API with 48-hour active status verification.", space_after=2)
    add_body("• TrueValue™ Core: Gradient-boosted valuation model (LightGBM) with transparent confidence score (0-100%).", space_after=2)
    add_body("• FitScore Matchmaker: 8-question lifestyle profile matching buyer priorities to neighborhood amenities.", space_after=2)
    add_body("• Seller Self-Service: Free listing tool with AI listing description writer and pre-listing valuation range.", space_after=2)
    add_body("• Ghost Mode & Privacy: Full search and exploration without phone number or email capture requirements.", space_after=8)

    add_heading_2("Phase 2: V1.0 The Leap (Months 7–12) — Engagement & Intelligence")
    add_body("Focus: Deep generative AI features, interactive simulations, and transactional confidence.")
    add_body("• Instant AI Renovation Studio: Real-time visual re-imagining of rooms across specified styles and budgets.", space_after=2)
    add_body("• What-If Simulator: Real-time counterfactual valuation recalculation for prospective renovations.", space_after=2)
    add_body("• Spatial Audio & Street Noise Simulator: Psychoacoustic modeling of street noise, flight paths, and acoustic comfort.", space_after=2)
    add_body("• Verified Resident Reviews: Cryptographically/identity-verified reviews from former occupants.", space_after=2)
    add_body("• Transaction Transparency Dashboard: Step-by-step closing tracker with milestone documentation.", space_after=8)

    add_heading_2("Phase 3: V2.0 National Scale (Months 13–24) — Market Transformation")
    add_body("Focus: National coverage, human-in-the-loop appraiser routing network, and WebXR/Vision Pro spatial tours.")
    add_body("• Nationwide MLS & Tax Assessor Ingestion: Expansion across all 50 states and 3,143 counties.", space_after=2)
    add_body("• Human Appraiser On-Demand Network: Instant routing of low-confidence properties to licensed appraisers.", space_after=2)
    add_body("• Spatial WebXR & Apple Vision Pro Tours: 1:1 true-scale photogrammetric walkthroughs with spatial audio.", space_after=2)
    add_body("• Institutional Data Intelligence API: Real-time macroeconomic and hyperlocal migration indices for funds.", space_after=12)

    # -------------------------------------------------------------
    # SECTION 4: BUSINESS & MONETIZATION MODEL
    # -------------------------------------------------------------
    add_heading_1("4. Business & Monetization Model")
    add_body(
        "Zillow generates 65%+ of its revenue by extracting steep 'Premier Agent' tolls (often taking 35-40% of the buyer agent's commission) "
        "and bombarding buyers with phone calls. TruePlace aligns financial success with user and agent satisfaction through five diversified pillars."
    )

    rev_streams = [
        ("Revenue Stream", "Target Segment", "Pricing Mechanism", "Unit Economics & Margins"),
        ("Premium Verified Listings", "Home Sellers", "$199 - $499 one-time verification fee per listing.", "92% gross margin; includes 3D LiDAR scan verification and Truth Badge."),
        ("Agent Partner Subscriptions", "Licensed Agents & Brokers", "$149 - $399 flat monthly fee per primary zip code.", "88% gross margin; zero commission split clawback, capped agent count per zip."),
        ("Concierge & Transaction Support", "Buyers & Sellers", "0.25% - 0.50% closing fee on successful digital closings.", "75% gross margin; covers automated title, escrow coordination, and AI paperwork review."),
        ("Institutional Data Intelligence", "REITs, Hedge Funds, Urban Planners", "$25,000 - $120,000 annual API subscription licenses.", "96% gross margin; anonymized migration, permit velocity, and climate risk indices."),
        ("Mortgage & Insurance Marketplace", "Lenders & Insurance Providers", "Pre-negotiated origination revenue share ($800-$1,500/funded deal).", "85% gross margin; native rate-lock and policy comparison inside the buyer dashboard.")
    ]
    tbl_rev = doc.add_table(rows=len(rev_streams), cols=4)
    tbl_rev.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_rev.autofit = False
    set_table_borders(tbl_rev)
    for idx, row in enumerate(rev_streams):
        c0, c1, c2, c3 = tbl_rev.cell(idx, 0), tbl_rev.cell(idx, 1), tbl_rev.cell(idx, 2), tbl_rev.cell(idx, 3)
        c0.width, c1.width, c2.width, c3.width = Inches(1.5), Inches(1.4), Inches(1.9), Inches(1.7)
        set_cell_margins(c0, 70, 70, 80, 80)
        set_cell_margins(c1, 70, 70, 80, 80)
        set_cell_margins(c2, 70, 70, 80, 80)
        set_cell_margins(c3, 70, 70, 80, 80)
        if idx == 0:
            set_cell_background(c0, HEX_TEAL)
            set_cell_background(c1, HEX_TEAL)
            set_cell_background(c2, HEX_TEAL)
            set_cell_background(c3, HEX_TEAL)
            for cell, text in zip([c0, c1, c2, c3], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(9)
                r.font.color.rgb = COLOR_WHITE
        else:
            if idx % 2 == 1:
                set_cell_background(c0, HEX_LIGHT_BG)
                set_cell_background(c1, HEX_LIGHT_BG)
                set_cell_background(c2, HEX_LIGHT_BG)
                set_cell_background(c3, HEX_LIGHT_BG)
            for cell, text in zip([c0, c1, c2, c3], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.name = "Calibri"
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_DARK

    add_body("", space_after=6)
    add_body(
        "Additionally, TruePlace offers consumer TrueValue Pro ($9.99/month or $99/year), which unlocks unlimited "
        "What-If counterfactual scenario modeling, renovation ROI forecasting, historical price-trend exports, and "
        "downloadable Truth Report audit packages for negotiations.",
        bold_prefix="Consumer Subscription (TrueValue Pro): "
    )

    # -------------------------------------------------------------
    # SECTION 5: SYSTEM ARCHITECTURE & ENGINEERING STACK
    # -------------------------------------------------------------
    add_heading_1("5. System Architecture & Engineering Technology Stack")
    add_body(
        "TruePlace is architected as an event-driven, microservices-based system designed for low-latency interactive "
        "modeling, high-throughput geospatial querying, and rapid ML inference."
    )

    add_callout([
        "Frontend: Cross-platform React Native (iOS & Android) + Next.js 15 (Web) sharing a single unified TypeScript component library and design system tokens.",
        "Core Backend: Node.js / TypeScript microservices (NestJS) for user authentication, listing management, and messaging; Go services for high-throughput streaming feeds.",
        "AI & Valuation Microservice: Python FastAPI high-performance inference engine running LightGBM, TreeSHAP, and PyTorch computer vision pipelines.",
        "Databases & Stores: PostgreSQL with PostGIS extension for geospatial boundaries; TimescaleDB for historical valuation time-series; Redis 7 for sub-millisecond feature caching; Pinecone / Qdrant for vector embeddings.",
        "Cartography & Spatial: Mapbox GL custom vector tile engine; WebXR and Matterport 3D SDK for immersive digital twins."
    ], title="ENGINEERING STACK OVERVIEW")

    # -------------------------------------------------------------
    # SECTION 6: TRUEVALUE™ VALUATION ENGINE – 7-LAYER DEEP DIVE
    # -------------------------------------------------------------
    add_heading_1("6. TrueValue™ Valuation Engine: 7-Layer Deep Dive")
    add_body(
        "The TrueValue™ Engine represents the core intellectual property of TruePlace. While traditional Automated "
        "Valuation Models (AVMs) operate as black-box regressors on basic square footage and zip code averages, "
        "TrueValue orchestrates a 7-Layer hybrid intelligence hierarchy combining multimodal computer vision, structural permits, "
        "geospatial dynamics, ensemble modeling, human appraiser validation, and mathematical explainability."
    )

    add_callout([
        "Target Accuracy Goal: Median Absolute Percentage Error (MAPE) <= 3.5% on closed transactions within 12 months (vs. Zestimate typical 7% - 12%).",
        "Confidence Scoring: Every estimate is accompanied by a transparent Confidence Score (0 - 100%) reflecting local comp density, feature completeness, and market volatility.",
        "Human Escalation: Valuations dropping below 75% confidence threshold automatically route to licensed regional appraisers before publication."
    ], title="TRUEVALUE™ OPERATING BENCHMARKS")

    add_heading_2("The 7 Architectural Layers")
    
    layers = [
        ("Layer 1: Foundational Property Data", "Ingests official MLS records via RESO Web API, county tax assessor deed registries, building permit filings, Maxar/Planet satellite imagery, FEMA flood designations, and First Street Foundation climate risk scores."),
        ("Layer 2: Hyper-Local Market Dynamics", "Computes micro-neighborhood comps within 0.25 - 0.75 mile radii, tracking median Days on Market (DOM), price per square foot velocity at the street-level, buyer migration demographics, and new construction development pipelines."),
        ("Layer 3: Property Condition Intelligence", "Computer vision deep neural networks (Swin Transformer / ResNet-50) analyze listing photographs and street view imagery to estimate finish quality, architectural era, kitchen/bath modernization, roof degradation, and unpermitted modifications."),
        ("Layer 4: Predictive AI Ensemble Models", "A multi-stage stacking ensemble comprising LightGBM (gradient boosted trees), TabNet (deep tabular neural networks), and specialized temporal decay regressors forecasting price trajectories across 3, 6, and 12-month horizons."),
        ("Layer 5: Human Expert Review Layer", "The 'Secret Sauce': High-value luxury residences, unique rural properties, or low-confidence valuations are routed to a network of licensed local appraisers who perform rapid desktop audits and provide transparent override notes."),
        ("Layer 6: Continuous Market Feedback Loop", "Every closed transaction triggers automated model retraining pipelines. Retraining occurs on weekly cadences, with automated drift detection comparing predicted vs. actual closing prices to continuously refine feature weights."),
        ("Layer 7: Explainability & Transparency Layer", "TreeSHAP (Tree Shapley Additive exPlanations) extracts mathematical feature contributions, which are mapped into 6 human categories and converted into plain-English narratives via an audited LLM engine.")
    ]
    for l_title, l_desc in layers:
        add_heading_3(l_title)
        add_body(l_desc, space_after=4)

    # -------------------------------------------------------------
    # SECTION 7: DATA INGESTION HIERARCHY & PIPELINE
    # -------------------------------------------------------------
    add_heading_1("7. Data Ingestion Hierarchy, RESO APIs & Feature Stores")
    add_body("To power the 7-Layer engine, data is ingested across seven prioritized data streams with strict validation contracts:")

    data_src = [
        ("Pri", "Data Source", "Payload Content", "Ingestion Cadence", "Reliability SLA"),
        ("1", "MLS / RESO Web API", "Active, pending, and sold transactions; broker notes; photo URLs.", "Real-time streaming (webhook)", "99.95%"),
        ("2", "County Assessor & Tax", "Deed transfers, tax assessments, parcel boundaries, prior liens.", "Monthly automated scrape/feed", "99.50%"),
        ("3", "Municipal Building Permits", "Permit type, estimated cost, contractor name, inspection sign-off.", "Weekly automated ingest", "98.50%"),
        ("4", "Satellite & Aerial Imagery", "High-res aerial imagery (Maxar/Planet); roof wear, pool detection.", "Monthly refresh", "99.00%"),
        ("5", "Climate & Hazard APIs", "FEMA flood plains, wildfire risk scores, coastal sea rise models.", "Quarterly sync", "99.99%"),
        ("6", "School & Civic Metrics", "State education department scores, teacher-student ratios, transit.", "Annual sync", "99.90%"),
        ("7", "Verified User & Appraiser Data", "On-site photos, material upgrades, condition disclosures, disputes.", "On-demand interactive", "99.99%")
    ]
    tbl_src = doc.add_table(rows=len(data_src), cols=5)
    tbl_src.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_src.autofit = False
    set_table_borders(tbl_src)
    for idx, row in enumerate(data_src):
        c0, c1, c2, c3, c4 = tbl_src.cell(idx, 0), tbl_src.cell(idx, 1), tbl_src.cell(idx, 2), tbl_src.cell(idx, 3), tbl_src.cell(idx, 4)
        c0.width, c1.width, c2.width, c3.width, c4.width = Inches(0.5), Inches(1.6), Inches(2.2), Inches(1.2), Inches(1.0)
        set_cell_margins(c0, 60, 60, 70, 70)
        set_cell_margins(c1, 60, 60, 70, 70)
        set_cell_margins(c2, 60, 60, 70, 70)
        set_cell_margins(c3, 60, 60, 70, 70)
        set_cell_margins(c4, 60, 60, 70, 70)
        if idx == 0:
            set_cell_background(c0, HEX_TEAL)
            set_cell_background(c1, HEX_TEAL)
            set_cell_background(c2, HEX_TEAL)
            set_cell_background(c3, HEX_TEAL)
            set_cell_background(c4, HEX_TEAL)
            for cell, text in zip([c0, c1, c2, c3, c4], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_WHITE
        else:
            if idx % 2 == 1:
                set_cell_background(c0, HEX_LIGHT_BG)
                set_cell_background(c1, HEX_LIGHT_BG)
                set_cell_background(c2, HEX_LIGHT_BG)
                set_cell_background(c3, HEX_LIGHT_BG)
                set_cell_background(c4, HEX_LIGHT_BG)
            for cell, text in zip([c0, c1, c2, c3, c4], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.name = "Calibri"
                r.font.size = Pt(8)
                r.font.color.rgb = COLOR_DARK

    add_body("", space_after=12)

    # -------------------------------------------------------------
    # SECTION 8: EXPLAINABILITY LAYER (LAYER 7) & SHAP DEEP DIVE
    # -------------------------------------------------------------
    add_heading_1("8. Explainability Layer (Layer 7): Mathematical Foundations & SHAP")
    add_body(
        "A foundational tenet of TruePlace is: 'We will never show you a number we cannot explain in plain English.' "
        "Layer 7 translates high-dimensional tree splits into dollar-denominated attributions.",
        bold_prefix="Core Philosophy: "
    )
    add_body(
        "In cooperative game theory, Shapley values distribute total payouts among cooperating players based on their marginal "
        "contributions across all possible player coalitions. In TruePlace's valuation engine, features (lot size, kitchen finish, "
        "roof age) act as the players, and the valuation payout is the deviation of the property's estimated price from the baseline "
        "expected value across the broader market.",
        bold_prefix="Mathematical Foundation: "
    )
    add_body(
        "Formally, for an ensemble valuation function f(x) predicting the price of property x, TreeSHAP decomposes the estimate such that:",
        bold_prefix="Exact Additivity Guarantee: "
    )
    add_body(
        "f(x) = E[f(X)] + Σ [ φ_i(x) ]\n"
        "Where E[f(X)] is the base value (the average price of similar properties in the broader market benchmark), and φ_i(x) is the "
        "exact marginal dollar contribution of feature i. This guarantee of exact additivity means every single dollar above or below "
        "the market baseline is mathematically accounted for, with zero residual error or heuristic drift.",
        space_after=6
    )

    add_heading_2("Why SHAP Superiority Over LIME Was Decisive")
    add_body(
        "While LIME (Local Interpretable Model-agnostic Explanations) is common in academic prototypes, it was rejected as a primary engine "
        "for TruePlace due to mathematical instability and lack of additivity:",
        space_after=4
    )
    add_body("• Strict Additivity: In SHAP, the sum of all feature contributions equals the exact delta from baseline. LIME fits local linear approximations where components do not sum to the prediction.", space_after=3)
    add_body("• Deterministic Consistency: For identical inputs and model states, SHAP yields identical mathematical values. LIME relies on random perturbation sampling, yielding fluctuating explanations that would erode consumer trust.", space_after=3)
    add_body("• Computational Speed: TreeSHAP traverses decision trees in polynomial time O(TLD^2) (where T is number of trees, L is leaves, and D is depth), executing in under 80 milliseconds compared to LIME's thousands of perturbation iterations.", space_after=8)

    add_heading_2("SHAP Category Mapping Architecture")
    add_body(
        "Raw machine learning pipelines produce between 45 and 70 feature variables (e.g., `sqft_living_ratio_3m`, `kitchen_finish_tier_cv`, "
        "`roof_condition_idx`). Exposing raw feature names creates cognitive overload. TruePlace maps every feature into one of six human-centric categories:"
    )

    cat_map = [
        ("Category Name", "UI Color Token", "Underlying Extracted Features", "User-Facing Impact Description"),
        ("Comparable Sales", "Teal (#004D40)", "comps_avg_price, days_on_market_trend, micro_comp_distance", "Recent neighborhood sales and transaction momentum."),
        ("Property Characteristics", "Deep Blue (#1D3557)", "living_area, bedrooms, bathrooms, lot_size, year_built", "Core structural footprint and property dimensions."),
        ("Renovation & Condition", "Terracotta (#E07A5F)", "kitchen_reno_value, bathroom_grade, roof_age, cv_wear_score", "Upgrades, unpermitted additions, and architectural maintenance."),
        ("Neighborhood Trends", "Sage Green (#2A9D8F)", "school_rating_trend, walk_score, transit_score, new_dev_pipeline", "Zoning developments, commercial amenities, and school trajectories."),
        ("Market Momentum", "Purple (#6A4C93)", "inventory_velocity, mortgage_rate_elasticity, seasonal_index", "Broader interest rate dynamics and buyer supply/demand velocity."),
        ("Risk Factors", "Amber (#E76F51)", "fema_flood_zone, wildfire_hazard_idx, soil_subsidence, climate_risk", "Environmental vulnerabilities, insurance premiums, and hazard history.")
    ]
    tbl_cat = doc.add_table(rows=len(cat_map), cols=4)
    tbl_cat.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_cat.autofit = False
    set_table_borders(tbl_cat)
    for idx, row in enumerate(cat_map):
        c0, c1, c2, c3 = tbl_cat.cell(idx, 0), tbl_cat.cell(idx, 1), tbl_cat.cell(idx, 2), tbl_cat.cell(idx, 3)
        c0.width, c1.width, c2.width, c3.width = Inches(1.5), Inches(1.3), Inches(2.1), Inches(1.6)
        set_cell_margins(c0, 60, 60, 70, 70)
        set_cell_margins(c1, 60, 60, 70, 70)
        set_cell_margins(c2, 60, 60, 70, 70)
        set_cell_margins(c3, 60, 60, 70, 70)
        if idx == 0:
            set_cell_background(c0, HEX_TEAL)
            set_cell_background(c1, HEX_TEAL)
            set_cell_background(c2, HEX_TEAL)
            set_cell_background(c3, HEX_TEAL)
            for cell, text in zip([c0, c1, c2, c3], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_WHITE
        else:
            if idx % 2 == 1:
                set_cell_background(c0, HEX_LIGHT_BG)
                set_cell_background(c1, HEX_LIGHT_BG)
                set_cell_background(c2, HEX_LIGHT_BG)
                set_cell_background(c3, HEX_LIGHT_BG)
            for cell, text in zip([c0, c1, c2, c3], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.name = "Calibri"
                r.font.size = Pt(8)
                r.font.color.rgb = COLOR_DARK

    add_body("", space_after=8)
    add_heading_3("Official YAML Mapping Specification (Production Configuration)")
    yaml_config = """# TrueValue Explainability Engine - Feature-to-Category YAML Mapping
version: "2.4.0"
updated_at: "2026-09-20"

categories:
  comparable_sales:
    display_name: "Comparable Sales"
    color_hex: "#004D40"
    ui_order: 1
    features:
      - comps_median_price_0_5mi
      - comps_price_per_sqft_delta
      - micro_neighborhood_turnover_rate
      - days_on_market_neighborhood_avg

  property_characteristics:
    display_name: "Property Characteristics"
    color_hex: "#1D3557"
    ui_order: 2
    features:
      - living_area_sqft
      - total_bedrooms
      - total_bathrooms
      - lot_size_sqft
      - effective_year_built
      - architectural_style_factor

  renovation_condition:
    display_name: "Renovation & Condition"
    color_hex: "#E07A5F"
    ui_order: 3
    features:
      - kitchen_renovation_tier_value
      - primary_bathroom_condition_cv
      - roof_remaining_lifespan_years
      - hvac_system_efficiency_age
      - computer_vision_wear_score

  neighborhood_trends:
    display_name: "Neighborhood Trends"
    color_hex: "#2A9D8F"
    ui_order: 4
    features:
      - school_district_rating_trend
      - walk_transit_convenience_idx
      - municipal_development_pipeline_sqft
      - tree_canopy_coverage_percentage

  market_momentum:
    display_name: "Market Momentum"
    color_hex: "#6A4C93"
    ui_order: 5
    features:
      - metro_price_trajectory_6m
      - county_active_inventory_velocity
      - mortgage_interest_rate_sensitivity

  risk_factors:
    display_name: "Risk Factors"
    color_hex: "#E76F51"
    ui_order: 6
    features:
      - fema_flood_risk_category
      - wildfire_hazard_exposure_score
      - coastal_surge_elevation_deficit
      - high_voltage_powerline_proximity"""
    add_code_block(yaml_config, label="YAML: /config/feature_category_mapping_v2.4.yaml")

    # -------------------------------------------------------------
    # SECTION 9: PRODUCTION SYSTEM PROMPT V2.4
    # -------------------------------------------------------------
    add_heading_1("9. Production System Prompt v2.4 for Natural Language Generation")
    add_body(
        "To transform raw mathematical SHAP vectors into calm, authoritative, non-marketing text, TruePlace uses an audited "
        "LLM conversion pipeline governed by System Prompt v2.4. The model temperature is strictly constrained between 0.15 and 0.25, "
        "with an automated regex verification layer ensuring that every dollar amount mentioned in the output matches the input vector "
        "to the nearest cent."
    )

    prompt_text = """You are the TruePlace Explainability Engine (v2.4).
Your task is to convert raw SHAP values, base values, and property metadata into clear, trustworthy, and precise natural-language explanations for homebuyers and sellers.

CORE RULES:
1. TRUTHFULNESS & ACCURACY:
   - Every dollar amount in your explanation MUST exactly match the aggregated category values or individual top feature values provided in the JSON payload.
   - Do NOT invent, extrapolate, or estimate numbers not explicitly provided.

2. TONE & BRAND VOICE:
   - Calm, objective, authoritative, and respectful.
   - Speak like an experienced, neutral appraiser who respects the user's intelligence.
   - NEVER use promotional or marketing buzzwords (e.g., 'stunning', 'gorgeous', 'rare gem', 'must-see', 'bargain', 'steal').

3. STRUCTURE OF THE EXPLANATION:
   - Paragraph 1: State the overall TrueValue, the confidence score, and how the property compares to the local benchmark (base value).
   - Paragraph 2: Highlight the top 2-3 positive drivers and their specific dollar impact in plain English.
   - Paragraph 3: Highlight the top 1-2 negative drivers (deductions) and their specific dollar impact, explaining how they offset gains.
   - Paragraph 4 (Context/Limitations): Mention the confidence level, data freshness, and whether a licensed human appraiser review is recommended.

4. CONFIDENCE HANDLING:
   - Confidence >= 85%: State that the valuation has 'very high confidence backed by strong recent comparable sales and complete permit records.'
   - Confidence 70-84%: State that the valuation has 'moderate confidence with adequate local comp density.'
   - Confidence < 70%: Explicitly state: 'Because micro-neighborhood sales data is limited, we recommend a certified human appraisal.'

FORBIDDEN WORDS:
['dream home', 'stunning', 'unbelievable', 'investor special', 'hurry', 'hot market', 'guaranteed']

OUTPUT FORMAT:
Return clean markdown containing exactly:
### Summary
[1-2 sentences with TrueValue, range, and primary takeaway]

### Value Drivers
- **Positive Driver 1**: [Description + dollar uplift]
- **Positive Driver 2**: [Description + dollar uplift]
- **Offsetting Factor**: [Description + dollar reduction]

### Data Integrity & Confidence
[Explanation of confidence score, comp freshness, and inspection notes]"""
    add_code_block(prompt_text, label="SYSTEM PROMPT: /prompts/shap_natural_language_v2.4.txt")

    # -------------------------------------------------------------
    # SECTION 10: WHAT-IF SIMULATOR TECHNICAL SPECIFICATION
    # -------------------------------------------------------------
    add_heading_1("10. What-If Simulator: Counterfactual Engine & Technical Constraints")
    add_body(
        "The What-If Simulator empowers users to test counterfactual scenarios (e.g., 'What if we renovate the kitchen to modern standards?' "
        "or 'What if we add a two-car garage?'). Unlike naive static calculators that simply apply a flat percentage bump, TruePlace "
        "uses Interventional TreeSHAP on counterfactual feature vectors.",
        bold_prefix="Counterfactual Mechanics: "
    )
    add_body(
        "When a user activates a simulation toggle or slider, the client sends a delta vector Δx to the valuation service. "
        "The service constructs a synthetic property vector x' = x + Δx, validates it against physical and architectural constraints, "
        "executes the LightGBM ensemble, and runs TreeSHAP with feature_perturbation='interventional'. The delta Δφ = φ(x') - φ(x) "
        "is extracted, ensuring the resulting price change reflects realistic local diminishing returns and micro-market saturation.",
        space_after=6
    )

    add_heading_2("Constraint & Realism Engine Rules")
    add_body("To prevent users from generating absurd valuations, the Realism Engine enforces strict physical boundaries:", space_after=4)
    add_body("1. Square Footage Ceiling: Additions cannot exceed zoning Maximum Floor Area Ratio (FAR) or lot setbacks.", space_after=3)
    add_body("2. Diminishing ROI Caps: Luxury kitchen upgrades in starter home neighborhoods have diminishing marginal returns capped by the top 90th percentile comp in the census tract.", space_after=3)
    add_body("3. Climate Compatibility: Swimming pool valuation uplifts are zeroed or discounted heavily in alpine/sub-zero climates compared to Sun Belt regions.", space_after=3)
    add_body("4. Historical Designation Restrictions: Structural exterior modifications on historic district properties require landmark commission clearance flags.", space_after=8)

    add_heading_2("JSON API Contract (Request & Response Payloads)")
    sim_json = """// Request: POST /api/v1/valuation/what-if
{
  "property_id": "tp_98412_ash",
  "base_valuation_id": "val_2026_09_001",
  "scenarios": [
    {
      "feature_key": "kitchen_renovation_tier",
      "original_value": "standard_1990",
      "simulated_value": "modern_luxury_2026",
      "estimated_cost_usd": 55000
    },
    {
      "feature_key": "hvac_system_age_years",
      "original_value": 18,
      "simulated_value": 0,
      "estimated_cost_usd": 12000
    }
  ]
}

// Response: HTTP 200 OK
{
  "property_id": "tp_98412_ash",
  "original_truevalue": 711400,
  "simulated_truevalue": 768200,
  "net_value_change": 56800,
  "confidence_score": 90,
  "delta_breakdown": [
    {
      "category": "Renovation & Condition",
      "delta_amount": 56800,
      "drivers": [
        {
          "feature": "kitchen_renovation_tier",
          "value_delta": 44100,
          "roi_percentage": 80.18
        },
        {
          "feature": "hvac_system_age_years",
          "value_delta": 12700,
          "roi_percentage": 105.83
        }
      ]
    }
  ],
  "natural_language_summary": "Upgrading the kitchen to luxury modern finishes and replacing the 18-year-old HVAC system yields an estimated $56,800 increase in property value. The kitchen upgrade accounts for +$44,100, and the new high-efficiency HVAC adds +$12,700.",
  "execution_time_ms": 118
}"""
    add_code_block(sim_json, label="API CONTRACT: /api/v1/valuation/what-if")

    # -------------------------------------------------------------
    # SECTION 11: TREESHAP PERFORMANCE OPTIMIZATION
    # -------------------------------------------------------------
    add_heading_1("11. TreeSHAP Performance Optimization & Real-Time Caching Strategy")
    add_body(
        "Standard TreeSHAP implementations can encounter latency bottlenecks when processing complex counterfactuals "
        "across hundreds of concurrent users. TruePlace deploys a three-tier optimization architecture to ensure "
        "sub-150 millisecond response times at p95."
    )

    opt_tiers = [
        ("Layer", "Technique", "Implementation Details", "Latency Gain"),
        ("Model Optimization", "LightGBM Pruning & Tree Compression", "Limit tree depth to 8 levels and prune leaves with < 0.01% sample weight. LightGBM delivers 4x faster TreeSHAP traversal than XGBoost.", "4.2x speedup"),
        ("Algorithmic Mode", "Path-Dependent vs Interventional Routing", "Use tree_path_dependent for static listing views (< 60ms). Switch to interventional TreeSHAP only when counterfactuals are requested.", "3.5x speedup"),
        ("Multi-Tier Caching", "Deterministic Feature Hash Caching", "Hash property feature vectors with SHA-256 + model version salt. Static SHAP vectors cached in Redis with 24-hour TTL.", "99% cache hit rate"),
        ("Delta Computation", "Partial Subtree Delta Traversal", "In What-If simulations, only re-traverse tree branches containing the mutated feature nodes, reusing untouched branch evaluations.", "2.8x speedup")
    ]
    tbl_opt = doc.add_table(rows=len(opt_tiers), cols=4)
    tbl_opt.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_opt.autofit = False
    set_table_borders(tbl_opt)
    for idx, row in enumerate(opt_tiers):
        c0, c1, c2, c3 = tbl_opt.cell(idx, 0), tbl_opt.cell(idx, 1), tbl_opt.cell(idx, 2), tbl_opt.cell(idx, 3)
        c0.width, c1.width, c2.width, c3.width = Inches(1.4), Inches(1.6), Inches(2.3), Inches(1.2)
        set_cell_margins(c0, 60, 60, 70, 70)
        set_cell_margins(c1, 60, 60, 70, 70)
        set_cell_margins(c2, 60, 60, 70, 70)
        set_cell_margins(c3, 60, 60, 70, 70)
        if idx == 0:
            set_cell_background(c0, HEX_TEAL)
            set_cell_background(c1, HEX_TEAL)
            set_cell_background(c2, HEX_TEAL)
            set_cell_background(c3, HEX_TEAL)
            for cell, text in zip([c0, c1, c2, c3], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_WHITE
        else:
            if idx % 2 == 1:
                set_cell_background(c0, HEX_LIGHT_BG)
                set_cell_background(c1, HEX_LIGHT_BG)
                set_cell_background(c2, HEX_LIGHT_BG)
                set_cell_background(c3, HEX_LIGHT_BG)
            for cell, text in zip([c0, c1, c2, c3], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.name = "Calibri"
                r.font.size = Pt(8)
                r.font.color.rgb = COLOR_DARK

    add_body("", space_after=12)

    # -------------------------------------------------------------
    # SECTION 12: COMPLETE UI/UX WIREFRAMES & DESIGN SYSTEM
    # -------------------------------------------------------------
    add_heading_1("12. Complete UI/UX Wireframes & Component Design System")
    add_body(
        "TruePlace eliminates the visual chaos, flashing ads, and dark patterns of legacy platforms. "
        "The interface leverages clean typography (Inter / SF Pro Display), an 8pt modular layout grid, "
        "and progressive disclosure (Glance -> Summary -> Detailed Breakdown -> Expert Mode)."
    )

    add_heading_2("A. Main Listing Card: TrueValue Summary (Mobile)")
    wireframe_card = """+-------------------------------------------------------+
|  [Photo Carousel: 1/24]   [ Verified Active 48h ]    |
|  $711,400                                             |
|  TrueValue Range: $692,000 - $731,000                 |
|                                                       |
|  Confidence Meter: [====== 91% ======] Very High       |
|  Why: 14 recent micro-comps + verified 2023 renovation |
|                                                       |
|  Value Drivers (Instant Glance):                      |
|  (+) Updated Kitchen (2023) ............... +$41,200   |
|  (+) Oversized Corner Lot ................. +$19,800   |
|  (-) Roof Nearing End of Life (18 yrs) .... -$12,500   |
|                                                       |
|  [ See Full Explanation ]   [ Run What-If Simulator ] |
+-------------------------------------------------------+"""
    add_code_block(wireframe_card, label="UI WIREFRAME: Main Listing Card (Mobile)")

    add_heading_2("B. Full Explanation Dashboard (Mobile & Desktop)")
    wireframe_dashboard = """+-------------------------------------------------------+
|  <- Back to Listing             [ Export Truth Report ]|
|  1428 Ashbury Lane, Austin, TX                         |
|                                                       |
|  TRUEVALUE BREAKDOWN DASHBOARD                         |
|  Best Estimate: $711,400   (+$50,000 vs. Neighborhood) |
|  Market Base Value: $661,400                          |
|                                                       |
|  [ VALUE COMPOSITION DONUT CHART ]                    |
|  * 42% Comparable Sales ($684,000 baseline)           |
|  * 23% Property Characteristics (2,450 sqft, 4b/3b)   |
|  * 15% Renovation & Condition (+$41.2k net uplift)     |
|  *  9% Neighborhood School Growth                     |
|  *  6% Local Inventory Velocity                       |
|  *  5% Risk & Climate Resilience                      |
|                                                       |
|  WATERFALL CONTRIBUTION (TOP 5 POSITIVE / NEGATIVE):  |
|  [+] Kitchen Renovation (2023) ......... +$41,200     |
|  [+] Lot Size (+0.18 acres vs avg) ..... +$19,800     |
|  [+] Top-Tier Elementary Boundary ...... +$12,400     |
|  [-] 18-Year-Old Roof Age .............. -$12,500     |
|  [-] No Attached 2-Car Garage .......... -$14,500     |
|                                                       |
|  NATURAL LANGUAGE EXPLANATION:                        |
|  "TruePlace values this home $50,000 above the micro- |
|   neighborhood average primarily due to a permitted   |
|   gourmet kitchen remodel and oversized corner lot.   |
|   Deductions reflect an aging roof and carport."      |
|                                                       |
|  Data Freshness: MLS synced 2 hrs ago | Permits: 2026 |
|  Truth Score: 96/100 (Cryptographically Verified)     |
+-------------------------------------------------------+"""
    add_code_block(wireframe_dashboard, label="UI WIREFRAME: Explanation Dashboard")

    add_heading_2("C. What-If Simulator Interactive Screen")
    wireframe_whatif = """+-------------------------------------------------------+
|  WHAT-IF SIMULATOR: 1428 Ashbury Lane                 |
|  Base TrueValue: $711,400  -->  Simulated: $768,200   |
|  Estimated Value Uplift: +$56,800                     |
|                                                       |
|  RENOVATION & CONDITION SIMULATIONS:                  |
|  Kitchen Renovation Level:                            |
|  [ Original ]  [ Standard Modern ]  [ * Luxury Chef * ]|
|  Estimated Cost: ~$55,000  |  Value Uplift: +$44,100  |
|                                                       |
|  Replace Aging Roof & HVAC:                           |
|  Roof Age: [========== 0 yrs (New) =========]         |
|  Value Uplift: +$12,700                               |
|                                                       |
|  Add Attached 2-Car Garage:                           |
|  Toggle: [ ON ]                                       |
|  Estimated Cost: ~$38,000  |  Value Uplift: +$28,500  |
|                                                       |
|  COMBINED SIMULATION SUMMARY:                         |
|  Total Projected Renovation Cost: $105,000            |
|  Total Value Gain: +$85,300 (Net ROI: 81.2%)          |
|                                                       |
|  [ Save Scenario ]  [ Download Scenario PDF ]         |
+-------------------------------------------------------+"""
    add_code_block(wireframe_whatif, label="UI WIREFRAME: What-If Simulator")

    # -------------------------------------------------------------
    # SECTION 13: THE "TRUTH REPORT" PDF SPECIFICATION
    # -------------------------------------------------------------
    add_heading_1("13. The 'Truth Report' Audit-Ready PDF Specification")
    add_body(
        "The TruePlace 'Truth Report' is a downloadable, print-ready, 6-page comprehensive audit document that establishes "
        "an objective foundation for buyer-seller negotiations, mortgage underwriting, and estate planning."
    )

    pdf_pages = [
        ("Page", "Section Title", "Layout & Key Information Elements"),
        ("Page 1", "Executive Cover & Valuation Summary", "Property aerial photograph, verified address, large TrueValue number ($711,400), confidence meter (91%), QR code to live listing, executive summary narrative."),
        ("Page 2", "Value Composition & Factor Waterfall", "High-resolution vector donut chart (6 categories), waterfall chart illustrating baseline-to-estimate progression, top 5 positive and negative drivers."),
        ("Page 3", "Audited Natural Language Narrative", "Complete unedited narrative from System Prompt v2.4, full data provenance table with last synchronization timestamps, certified appraiser desktop review notes."),
        ("Page 4", "Geospatial Comparable Sales Evidence", "Cartographic map plot of 12 selected comparable sales within 0.5 miles, tabular comparison matrix displaying square footage, sales date, distance, and similarity index."),
        ("Page 5", "What-If Simulation Audit (Optional)", "Side-by-side comparative ledger contrasting baseline vs. simulated renovation states, breakdown of projected construction capital expenditure vs. equity uplift."),
        ("Page 6", "Methodological Integrity & Disclosures", "Mathematical overview of SHAP and TreeSHAP formulations, model version hash, training date, legal appraisal disclaimer, and TruePlace Trust Guarantee.")
    ]
    tbl_pdf = doc.add_table(rows=len(pdf_pages), cols=3)
    tbl_pdf.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_pdf.autofit = False
    set_table_borders(tbl_pdf)
    for idx, row in enumerate(pdf_pages):
        c0, c1, c2 = tbl_pdf.cell(idx, 0), tbl_pdf.cell(idx, 1), tbl_pdf.cell(idx, 2)
        c0.width, c1.width, c2.width = Inches(1.0), Inches(2.3), Inches(3.2)
        set_cell_margins(c0, 60, 60, 70, 70)
        set_cell_margins(c1, 60, 60, 70, 70)
        set_cell_margins(c2, 60, 60, 70, 70)
        if idx == 0:
            set_cell_background(c0, HEX_TEAL)
            set_cell_background(c1, HEX_TEAL)
            set_cell_background(c2, HEX_TEAL)
            for cell, text in zip([c0, c1, c2], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_WHITE
        else:
            if idx % 2 == 1:
                set_cell_background(c0, HEX_LIGHT_BG)
                set_cell_background(c1, HEX_LIGHT_BG)
                set_cell_background(c2, HEX_LIGHT_BG)
            for cell, text in zip([c0, c1, c2], row):
                p = cell.paragraphs[0]
                r = p.add_run(text)
                r.font.name = "Calibri"
                r.font.size = Pt(8)
                r.font.color.rgb = COLOR_DARK

    add_body("", space_after=18)
    add_callout([
        "Status: v2.4 Production Baseline Approved for Design & Engineering Implementation.",
        "Target Milestones: MVP launch at Month 6; V1.0 AI Renovation Studio at Month 12; National Human Appraiser Network at Month 18.",
        "Document Owner: TruePlace Product & Machine Learning Architecture Team."
    ], title="DOCUMENT SIGN-OFF & STATUS")

    # Save to disk
    out_path = r"d:\Anti-gravity\expedite-consults\expedite-consults\TruePlace_Master_Product_and_Technical_Report.docx"
    doc.save(out_path)
    print(f"Successfully generated master document at: {out_path}")

if __name__ == "__main__":
    create_report()
