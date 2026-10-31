import os

def create_simple_pdf(text: str, output_path: str) -> None:
    """Create a minimal PDF containing the given text (single line).
    This implementation builds a very small PDF using raw PDF syntax –
    sufficient for a short report. It does not support advanced layout.
    """
    # Escape parentheses in PDF string
    escaped = text.replace('(', '\\(').replace(')', '\\)')
    header = "%PDF-1.4\n"
    # Objects
    obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n"
    # Simple content stream: move to (70,720), set font, show text
    stream_content = f"BT\n70 720 Td\n/F1 24 Tf\n({escaped}) Tj\nET"
    obj4 = f"4 0 obj\n<< /Length {len(stream_content)} >>\nstream\n{stream_content}\nendstream\nendobj\n"
    obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    # xref table placeholder (will be corrected later)
    xref_start_placeholder = "xref\n0 6\n"
    # We'll compute byte offsets after building objects
    pdf_body = header + obj1 + obj2 + obj3 + obj4 + obj5
    # Compute offsets
    offsets = []
    pos = 0
    for line in pdf_body.split('\n'):
        offsets.append(pos)
        pos += len(line) + 1  # +1 for the newline we split on
    # Build xref entries
    xref = "xref\n0 6\n"
    xref += "0000000000 65535 f \n"  # object 0
    for off in offsets[1:6]:  # we have 5 objects + header
        xref += f"{off:010d} 00000 n \n"
    trailer = "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"
    startxref = len(pdf_body) + len(xref)
    trailer += f"{startxref}\n%%EOF"
    pdf_content = pdf_body + xref + trailer
    with open(output_path, "wb") as f:
        f.write(pdf_content.encode('latin-1'))

if __name__ == "__main__":
    report_text = "Safe Lab PoC Exploitation – adapters added, ROE profile, UI badge, unit tests and documentation."
    out_path = os.path.join(os.path.dirname(__file__), "report.pdf")
    create_simple_pdf(report_text, out_path)
    print(f"PDF written to {out_path}")
