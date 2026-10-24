export type LabPrompt = { label: string; q: string };

export type ResearchLab = {
  id: string;
  label: string;
  role: string;
  line: string;
  prompts: LabPrompt[];
};

export const RESEARCH_LABS: ResearchLab[] = [
  {
    id: "cyber",
    label: "Cybersecurity",
    role: "cybersecurity scientist",
    line: "Vulnerability research, threat intelligence, malware, and application security. Findings stay tied to a source.",
    prompts: [
      { label: "Memory safety", q: "How are memory-safety vulnerabilities discovered, and what evidence separates a theoretical weakness from an exploitable one?" },
      { label: "Validate a finding", q: "How can vulnerability findings from static analysis and language models be automatically validated?" },
      { label: "CVE and patches", q: "How can CVEs be correlated with affected versions and patches without treating a database row as proof of exploitation?" },
      { label: "Threat correlation", q: "How can conflicting threat-intelligence reports be reconciled into an evidence-backed attack timeline?" },
      { label: "Malware behavior", q: "How can behavioral analysis detect previously unseen malware without relying only on known signatures?" },
      { label: "Encrypted traffic", q: "How can encrypted traffic be analyzed for attacks without decrypting payloads?" },
      { label: "Insecure code", q: "How can AI-assisted code review find insecure coding patterns while avoiding untested automated changes?" },
    ],
  },
  {
    id: "ai-security",
    label: "AI security",
    role: "AI security researcher",
    line: "Prompt injection, tool abuse, agent sandboxing, and checking a claim before it is trusted.",
    prompts: [
      { label: "Prompt injection", q: "How can prompt injection attacks be detected?" },
      { label: "Tool instructions", q: "How can AI systems defend against malicious tool instructions?" },
      { label: "Sandbox agents", q: "How should autonomous AI agents be sandboxed?" },
      { label: "Check a source", q: "How can an AI verify information retrieved from external sources?" },
      { label: "Hallucinated claims", q: "How can AI systems detect hallucinated technical claims?" },
      { label: "Untrusted sites", q: "How can an AI agent safely interact with untrusted websites?" },
      { label: "Defense in depth", q: "What defense-in-depth architecture fits an autonomous AI agent that reads untrusted data and calls external tools?" },
    ],
  },
  {
    id: "science",
    label: "Science",
    role: "research scientist",
    line: "Physics, chemistry, biology, and earth science. Ask what evidence supports the claim.",
    prompts: [
      { label: "Quantum mechanics", q: "What evidence supports the current experimental claims of quantum mechanics, and what remains unresolved?" },
      { label: "Astrophysics", q: "What evidence supports current astrophysics claims about stellar evolution, and which measurements disagree?" },
      { label: "Materials chemistry", q: "What evidence supports using computational chemistry to propose new energy materials?" },
      { label: "Genomics", q: "What evidence supports a genomics claim, and how should a conflicting study be weighed?" },
      { label: "Climate modeling", q: "What evidence supports machine-learning climate models versus traditional numerical forecasts?" },
      { label: "Protein interactions", q: "How can artificial intelligence predict protein–protein interactions, and what are the scientific limits?" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    role: "engineering researcher",
    line: "Mechanical, electrical, civil, and aerospace questions, answered as engineering research.",
    prompts: [
      { label: "Robotics", q: "How can autonomous robots operate safely in unknown, dynamic, and partially observable environments?" },
      { label: "Fluid dynamics", q: "What evidence is required before a computational fluid-dynamics result is treated as a design decision?" },
      { label: "Power systems", q: "How can AI optimize a grid that includes large amounts of intermittent renewable energy?" },
      { label: "Semiconductors", q: "How can AI-assisted electronic design automation improve semiconductor design without weakening verification?" },
      { label: "Structures", q: "How can structural monitoring detect a failing bridge or building before collapse?" },
      { label: "Spacecraft", q: "How could an autonomous spacecraft make a scientific decision when communication with Earth is delayed?" },
    ],
  },
  {
    id: "software",
    label: "Software",
    role: "software engineering researcher",
    line: "Languages, systems, verification, and whether generated code is safe to run.",
    prompts: [
      { label: "Formal verification", q: "Can AI-generated software be formally verified enough to operate in a safety-critical system?" },
      { label: "Compilers", q: "What evidence shows that a compiler optimization preserves the meaning of a program?" },
      { label: "Distributed systems", q: "How should a distributed-systems claim about consistency be tested rather than asserted?" },
      { label: "Databases", q: "What evidence distinguishes a database benchmark result from a production guarantee?" },
      { label: "Kubernetes", q: "How can a Kubernetes configuration be reviewed for security without treating a manifest as proof it is safe?" },
      { label: "Testing", q: "How can software security testing be automated without executing an untrusted exploit?" },
    ],
  },
  {
    id: "robotics",
    label: "Robotics",
    role: "robotics researcher",
    line: "Navigation, vision, manipulation, and robot safety.",
    prompts: [
      { label: "Unknown environments", q: "What evidence should guide a robot's decision when the environment is unknown?" },
      { label: "SLAM", q: "What evidence shows that a SLAM system knows where it is, and when does that evidence fail?" },
      { label: "Manipulation", q: "What has to be measured before a robot grasp is called reliable?" },
      { label: "Human-robot", q: "How should a human-robot interaction study separate a demo from evidence of safety?" },
      { label: "Swarms", q: "What evidence supports a swarm-robotics claim about collective behavior?" },
      { label: "Robot safety", q: "What safety case is required before an industrial robot changes its own motion plan?" },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    role: "energy systems researcher",
    line: "Grids, storage, generation, and the security of the infrastructure.",
    prompts: [
      { label: "Grid and security", q: "How can AI coordinate distributed energy resources while maintaining grid stability and cybersecurity?" },
      { label: "Solar and wind", q: "What evidence is required to claim that a forecast improved renewable dispatch?" },
      { label: "Batteries", q: "What measurements support a claim of higher-density energy storage?" },
      { label: "Nuclear", q: "What public evidence is appropriate when discussing nuclear plant safety and grid support?" },
      { label: "Hydrogen", q: "What evidence separates a hydrogen pilot from a deployable energy system?" },
      { label: "Predictive maintenance", q: "How can predictive maintenance reduce failures in bridges, grids, and industrial machinery?" },
    ],
  },
  {
    id: "wildlife",
    label: "Wildlife",
    role: "ecology researcher",
    line: "Animal behavior, forests, and conservation. A camera clip is not a population study.",
    prompts: [
      { label: "Behavior change", q: "Can multimodal AI detect changes in wildlife behavior and ecosystem health from camera, acoustic, and environmental data?" },
      { label: "Communication", q: "What evidence supports a claim that an animal's call carries a specific meaning?" },
      { label: "Predator and prey", q: "How should a predator-prey observation be distinguished from a food-web conclusion?" },
      { label: "Forest succession", q: "What measurements show that a forest is recovering after fire or disease?" },
      { label: "Habitat loss", q: "What evidence links habitat fragmentation to a decline in a named species?" },
      { label: "Camera traps", q: "What can a camera-trap study prove, and what can it not prove?" },
    ],
  },
  {
    id: "biomedical",
    label: "Biomedical",
    role: "biomedical researcher",
    line: "Research evidence only. This is not medical advice.",
    prompts: [
      { label: "Genomics evidence", q: "What counts as primary evidence for a genomics finding, and what is only a commentary?" },
      { label: "Medical imaging", q: "How should an imaging-model result be validated before anyone treats it as a diagnosis?" },
      { label: "Drug discovery", q: "What evidence is required before a computational drug candidate is called promising?" },
      { label: "Protein folding", q: "What can a protein-structure prediction support, and what experiment is still required?" },
      { label: "Epidemiology", q: "How should conflicting epidemiological studies be compared without turning a correlation into a cause?" },
      { label: "Medical devices", q: "What safety evidence should a biomedical device paper include?" },
    ],
  },
  {
    id: "mathematics",
    label: "Mathematics",
    role: "mathematician",
    line: "A conjecture is not a proof. Say what was verified.",
    prompts: [
      { label: "Conjectures", q: "Can an AI generate a mathematical conjecture and verify it with a formal proof system?" },
      { label: "Probability", q: "What has to be stated before a probability claim is meaningful?" },
      { label: "Graph theory", q: "How should a graph-theory claim be checked rather than illustrated with one picture?" },
      { label: "Cryptography", q: "What evidence supports a cryptographic security claim, and what would falsify it?" },
      { label: "Complexity", q: "How should a complexity claim be separated from a benchmark on one machine?" },
      { label: "Optimization", q: "What evidence shows that an optimization result is optimal rather than merely better on a sample?" },
    ],
  },
  {
    id: "ai",
    label: "AI research",
    role: "machine-learning researcher",
    line: "Models, retrieval, agents, and how reliability is measured.",
    prompts: [
      { label: "Factual reliability", q: "What methods most reliably improve factual reliability in retrieval-augmented AI systems, and how should reliability be measured?" },
      { label: "Hallucination", q: "How should a hallucination be measured in an experiment rather than described in a demo?" },
      { label: "Agents", q: "What evaluation is required before an agentic system is said to complete a research task?" },
      { label: "RAG", q: "How can a retrieval-augmented answer show which sentence came from which source?" },
      { label: "Interpretability", q: "What evidence supports an interpretability claim about a model?" },
      { label: "Benchmarks", q: "When does a benchmark score fail to support a claim of general ability?" },
    ],
  },
  {
    id: "method",
    label: "Method",
    role: "research methodologist",
    line: "Question, retrieve, compare, and say what is still unknown.",
    prompts: [
      { label: "What is the evidence?", q: "What is the evidence, where did it come from, can it be checked, what disagrees, and what remains unknown?" },
      { label: "Primary or commentary?", q: "Classify the available sources as primary, official, secondary, unverified, or contradicted, and say why." },
      { label: "What would test it?", q: "What experiment or check could test this claim, and what result would weaken it?" },
      { label: "Conflicting sources", q: "How should conflicting sources be shown side by side without picking a winner that the evidence does not support?" },
    ],
  },
];
