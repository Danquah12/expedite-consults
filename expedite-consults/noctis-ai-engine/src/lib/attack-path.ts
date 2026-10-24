export type PathNode = {
  id: string;
  label: string;
  blurb: string;
  finding: string;
};

export const CLINIC_PATH: PathNode[] = [
  { id: "net", label: "Internet", blurb: "Anyone can knock.", finding: "The door is public." },
  { id: "s3", label: "Public bucket", blurb: "clinic-lab-public, Principal *.", finding: "Object read is world-open." },
  { id: "role", label: "Over-permissive role", blurb: "Bucket policy grants s3:* plus sts:AssumeRole.", finding: "Identity is the hop, not the CVE." },
  { id: "assume", label: "AssumeRole", blurb: "From the object, a note with a role ARN.", finding: "Privilege escalation via a relationship." },
  { id: "sa", label: "Privileged workload", blurb: "The role binds to a prod service account.", finding: "Lateral into the cluster." },
  { id: "rds", label: "Crown jewel", blurb: "RDS clinic-patients. Encryption on. Access from the SA.", finding: "Data is the destination." },
];

export const PATH_EDGES: [string, string][] = [
  ["net", "s3"],
  ["s3", "role"],
  ["role", "assume"],
  ["assume", "sa"],
  ["sa", "rds"],
];
