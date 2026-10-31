# Report Validation Rules

A report build must fail if:
- product/module versions conflict within one scan record;
- scan ID, target, ROE, collector identity or timestamps are missing;
- a finding is called exploited without runtime reproduction and impact evidence;
- EPSS is attached without a valid CVE and dated source snapshot;
- a CVSS score/vector pair is invalid or inconsistent;
- an ATT&CK technique is described as executed when it is only mapped or planned;
- evidence hash does not match stored bytes;
- a finding has no supporting evidence or an explicit evidence limitation;
- planned, executed, skipped, blocked and inconclusive tests are conflated;
- projected scores are represented as measured results.
