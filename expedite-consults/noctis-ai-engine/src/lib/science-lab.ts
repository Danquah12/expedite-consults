/** A named model. Not a world, an orbit, or a running machine. */
export function scienceLab(question: string) {
  if (/gravity (?:is |were )?doubled|doubl(?:e|ed) gravity/i.test(question)) {
    return [
      "Model: weight = mass × g.",
      "The mass stays the same. g is replaced by 2g.",
      "The weight doubles.",
      "This is that model only. It is not a simulation of a falling object, an orbit, or a building.",
    ].join("\n");
  }
  if (/simulate (?:this |an )?engineering system/i.test(question)) {
    return "No engineering model was named, so no simulation was run. Name a formula the calculator already knows.";
  }
  return null;
}
