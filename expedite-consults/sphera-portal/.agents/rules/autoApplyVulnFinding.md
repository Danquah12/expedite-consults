---
name: autoApplyVulnFinding
trigger:
  type: pattern
  pattern: "{\\\"scanner\\\":\\\".*?\\\",\\\"finding\\\":\\\".*?\\\"}"
  language: json
action:
  type: skill
  skill: applyVulnScript
  input_from_match: true
---
