import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hourlyGrid, optimizeOptions } from "./noctis-grid.ts";
import { graphFromNotes, statedRules } from "./noctis-rules.ts";
import { onlyMath, workedFigures } from "./worked-figures.ts";
import { changeLine, executionFindings, executionSheet } from "./noctis-execute.ts";
import { attachLedger, buildLedger, ledgerFindings } from "./noctis-ledger.ts";
import { attachHard, completenessAudit, completionNote, hardFindings, hardRows, retrievalReport, retainSources, scenarioText, strategySheet, verificationTable, withCalculations } from "./noctis-hard.ts";
import { hardProblem, resourcePlan } from "./worked-figures.ts";
import {
  EMPTY_JOURNEY,
  JOURNEY_PATHS,
  computeJourneyIndicators,
  evaluateProjectSubmission,
  generateNoctisTutorResponse,
  getJourneyLifecycleState,
  pathForNamedCourse,
} from "./journey-paths.ts";
import { COURSE_GROUPS, RELEASE_WAVES, getCourseRecordDetails } from "./course-catalog.ts";
import {
  CAREER_OCCUPATIONS,
  CERTIFICATION_READINESS_TRACKS,
  CORE_VIBE_PROMISE_STAGES,
  DISCOVER_CONTENT_ITEMS,
  EMPTY_DISCOVER_JOURNEY_STATE,
  PRACTICAL_SIMULATIONS,
  buildJourneyFromDiscoverContent,
  discoverItemFromKnowledgeAsset,
  getAdaptiveLearningActions,
  getDiscoverMenuChannel,
  getJourneyRecommendations,
  linkContentToJourney,
  listDiscoverContent,
  markDiscoverItemReviewed,
  matchContentToJourney,
  removeContentLink,
} from "./discover-journey-bridge.ts";
import {
  JOURNEY_TO_LEARN_CONNECTIONS,
  LEARN_FORMAT_CARDS,
  buildAuthorisedNoctisLessonContext,
  completeLearnActivity,
  getMyJourneyLessons,
  listAllSharedJourneys,
  resolveContinueLearningTarget,
  resolveJourneyActionToLearn,
  validateLearnRouteAccess,
} from "./journey-learn-bridge.ts";
import {
  EMPTY_WORK_STORE,
  WORK_CAREERS,
  WORK_CREDENTIALS,
  WORK_OPPORTUNITIES,
  WORK_PROJECTS,
  WORK_SKILLED_TRADES,
  buildCareerJourney,
  computeCareerReadiness,
  getWorkRecommendedNextSteps,
  matchOpportunitiesForLearner,
  readWorkStore,
  recordExternalCredentialClaim,
  startCredentialPrepInLearn,
  submitWorkProjectEvidence,
  updatePassportVisibility,
} from "./work-engine.ts";

describe("vibe limits", () => {
  it("calculates a plain product", () => {
    assert.match(onlyMath("40 × 25"), /1000/);
  });

  it("simulates 24 hours from stated daily energy", () => {
    const text = hourlyGrid("Simulate the grid hour by hour. Daily energy: 240 kWh. Peak: 20 kW. Solar: 10 kW. 5 peak-sun-hours. Battery: 50 kWh. Discharge: 10 kW.");
    assert.match(text, /Unmet energy/);
    assert.match(text, /Assumed/);
    assert.equal(text.match(/^\d+:/gm)?.length, 24);
  });

  it("refuses an hourly simulation without daily energy", () => {
    assert.match(hourlyGrid("Simulate the grid hour by hour."), /UNKNOWN/);
  });

  it("picks the priced option inside the budget", () => {
    const text = optimizeOptions("Minimize cost. Budget $10 million. Option A costs $12 million. Option B costs $8 million.");
    assert.match(text, /B/);
    assert.match(text, /FAIL/);
  });

  it("keeps a typed correction as a user-said rule", () => {
    const text = statedRules([{ role: "user", content: "Correction: peak is power, not energy." }]);
    assert.match(text, /not verified/);
    assert.match(text, /peak is power/);
  });

  it("adds a graph node only from an opened page", () => {
    assert.match(graphFromNotes("Wikipedia — Gravity (https://en.wikipedia.org/wiki/Gravity): an attraction."), /Gravity/);
    assert.equal(graphFromNotes("no page"), "");
  });

  it("keeps demand when any supply is cut", () => {
    assert.match(changeLine("water", 1000, "L/day", "water availability", 25, true), /demand stays 1000/);
    assert.match(changeLine("food", 1000, "kcal/day", "food production", 15, true), /Shortage = 150/);
    assert.match(changeLine("electricity", 100, "MWh/day", "renewable generation", 30, true), /Available supply = 100/);
    const sheet = workedFigures("Calculate the shortage. Population: 1000000. Water: 200 L per person per day. Water availability falls by 25%.");
    assert.match(sheet, /demand stays/);
    assert.doesNotMatch(sheet, /demand stays[\s\S]*× 0\.75 = 1[05]0000000[\s\S]*Demand/);
  });

  it("treats fuel hours as one stock for any generator", () => {
    const sheet = executionSheet("Design the backup. Generator 300 MW. Fuel 48 hours. Outage for 7 days.");
    assert.match(sheet, /14400 MWh once/);
    const found = executionFindings(sheet && "Design the backup. Generator 300 MW. Fuel 48 hours.", "Generator Contribution = 300 × 24 = 7200 MWh/day");
    assert.match(found.join(" "), /does not refill/);
  });

  it("fails energy even when power is unknown", () => {
    const question = "Size the reserve. Deficit of 2840 MWh per day for 7 days. Battery 2000 MWh. Generator 300 MW. Fuel 48 hours.";
    const sheet = executionSheet(question);
    assert.match(sheet, /Energy: FAIL/);
    const found = executionFindings(question, "Battery power is UNKNOWN, so the surplus is acceptable.");
    assert.match(found.join(" "), /does not erase that FAIL/);
  });

  it("rejects an unpriced choice, a bare rating, and a self-check", () => {
    const question = "Compare Strategy A and Strategy B for the outage.";
    const found = executionFindings(question, "Strategy A is preferable. Reliability: High. Recalculation: Confirmed.");
    const text = found.join(" ");
    assert.match(text, /NOT POSSIBLE/);
    assert.match(text, /NOT DEMONSTRATED/);
    assert.match(text, /VERIFICATION FAILED/);
  });

  it("keeps a fuel stock, a 7-day cut, a nameplate, and one capacity", () => {
    const fuel = buildLedger("Calculate backup. Generator 300 MW. Fuel 48 hours.");
    const stock = fuel.find((row) => row.name === "fuel stock");
    assert.equal(stock?.quantity, 14400);
    assert.equal(stock?.role, "stock");
    assert.equal(stock?.source, "calculated");
    assert.equal(stock?.equation, "300 MW × 48 h");
    const year = ledgerFindings("Solar falls 60% for 7 days. Calculate the week.", "Annual solar production decreases 60%.");
    assert.match(year.join(" "), /7 days only/);
    const plate = ledgerFindings("Calculate storage. Battery nameplate: 5000 MWh.", "Usable energy is 5000 MWh.");
    assert.match(plate.join(" "), /Nameplate is not usable/);
    const twice = ledgerFindings("Calculate the plant. Solar 100 MW. Wind 100 MW.", "Combined capacity is 200 MW.");
    assert.match(twice.join(" "), /counts the same capacity twice/);
    const choice = ledgerFindings("Calculate water. Water demand: 1000 L per day. 25% reduction in availability.", "I recommend more storage.");
    assert.match(choice.join(" "), /qualitative/);
    const shown = attachLedger("Calculate backup. Generator 300 MW. Fuel 48 hours.", "The generator can help.");
    assert.match(shown, /14400/);
    assert.match(shown, /calculated/);
  });

  it("recomputes a multi-year crisis instead of trusting the draft", () => {
    const question = `Calculate the 10-year plan.
Current population:
5,000,000
Annual population growth:
1.8%
Calculate population in Year 5 and Year 10.
Current annual electricity consumption:
30 TWh/year
Current peak demand:
5 GW
Annual electricity demand growth:
2.5%
| Solar   | 4 GW     | 25%             |
| Wind    | 3 GW     | 35%             |
| Hydro   | 2 GW     | 50%             |
Battery storage:
5 GWh usable energy
Battery maximum discharge power:
1 GW
Battery round-trip efficiency:
90%
Emergency generators:
1.5 GW
Available generator fuel:
72 hours at rated output
In Year 10, for 14 consecutive days, a severe heat wave increases electricity demand by:
20% above normal demand
Solar generation falls:
50% for 14 days
Wind generation falls:
40% for 14 days
Hydro generation falls:
25% for 30 days
Gas fuel deliveries fall:
60% for 45 days
A major transmission corridor carrying:
30% of national generation capacity
Domestic water requirement:
180 liters/person/day
Emergency water storage contains 50 billion liters
Daily food requirement:
2,500 kcal/person/day
Current domestic production supplies:
80% of national food requirement
Imports supply:
20%
Domestic agricultural production falls 25% for 90 days
Food imports fall 50% for 90 days
Critical infrastructure:
2,000 systems
Network-connected:
75%
A sophisticated cyberattack compromises:
20% of network-connected systems
The government has:
$12 billion
Option A — Grid reinforcement
Cost: $3B
Option B — Additional battery storage
Cost: $2B
Perform sensitivity by ±10%.
During the worst 7 days, calculate the balance.`;
    const rows = hardRows(question);
    const text = rows.map((row) => row.text).join("\n");
    assert.equal(rows.find((row) => row.id === "population-10")?.quantity, Math.round(5_000_000 * 1.018 ** 10));
    assert.equal(rows.find((row) => row.id === "population-5")?.quantity, Math.round(5_000_000 * 1.018 ** 5));
    assert.equal(rows.find((row) => row.id === "energy-10")?.quantity, Math.round(30 * 1.025 ** 10 * 1000) / 1000);
    assert.match(text, /peak = UNKNOWN/);
    assert.match(text, /8760 GWh\/year/);
    assert.match(text, /5 h/);
    assert.match(text, /108 GWh once/);
    assert.match(text, /Gas generation = UNKNOWN/);
    assert.match(text, /Transmission loss = UNKNOWN/);
    assert.match(text, /days of that domestic demand/);
    assert.match(text, /Food deficit over 90 days/);
    assert.match(text, /low /);
    assert.match(text, /not a resilience optimum/);
    assert.match(text, /counted once/);
    assert.match(text, /FEASIBILITY NOT DEMONSTRATED/);
    const found = hardFindings(question, "Year 10 population is 9,000,000. The battery supplies 5 GWh every day. Gas generation falls 60%. This is Verified. Electricity: PASS.");
    const notes = found.join(" ");
    assert.match(notes, /does not match/);
    assert.match(notes, /available once/);
    assert.match(notes, /UNKNOWN/);
    assert.match(notes, /Remove the stamp/);
    assert.match(notes, /NOT DEMONSTRATED/);
  });

  it("uses the same rules on a town, not the national wording", () => {
    const question = `A town of 20000 people grows at 2% per year. Calculate the population in 4 years.
Electricity use is 10 GWh per year and demand grows by 3% a year.
Solar is 2 MW at 20% capacity factor. Solar output falls 50% for 3 days.
The battery has usable energy of 8 MWh and discharge of 2 MW.
The backup generator is 1 MW with 10 hours of fuel.
Diesel fuel deliveries fall 30% for 5 days.
A line carrying 15% of capacity is out.
Each person needs 100 L per person per day. Storage is 2 million liters.
Food need is 2000 kcal per person per day. Domestic supplies 70%. Imports cover 30%.
Production falls 10% for 20 days. Imports fall 20% for 20 days.
There are 400 systems and 50% are network connected. An attack hits 10% of the connected systems.
Budget is $4 million. A costs $1 million. B costs $3 million.
Test sensitivity +/- 10%. During the worst 3 days the town must be served.`;
    const rows = hardRows(question);
    const text = rows.map((row) => row.text).join("\n");
    assert.equal(rows.find((row) => row.id === "population-4")?.quantity, Math.round(20000 * 1.02 ** 4));
    assert.match(text, /Year 4 electricity/);
    assert.match(text, /2 MW × 20%/);
    assert.match(text, /4 h/);
    assert.match(text, /0\.01 GWh once/);
    assert.match(text, /Diesel generation = UNKNOWN/);
    assert.match(text, /Transmission loss = UNKNOWN/);
    assert.match(text, /days of that domestic demand/);
    assert.match(text, /Food deficit over 20 days/);
    assert.match(text, /Compromised systems = 20/);
    assert.match(text, /not a resilience optimum/);
    assert.match(text, /after its stated cut/);
    assert.match(text, /FEASIBILITY NOT DEMONSTRATED/);
    const found = hardFindings(question, "Diesel generation falls 30%. Generation loses 15%. This is Verified. Overall: PASS.");
    assert.match(found.join(" "), /UNKNOWN/);
    assert.match(found.join(" "), /Remove the stamp/);
  });

  it("derives a water share and finishes the food balance for any percents", () => {
    const question = `Calculate the supplies.
population: 9376204
Domestic water is 200 L per person per day.
Agriculture is 60% of total freshwater.
Agricultural availability falls 35%.
Municipal treatment capacity falls 25%.
Emergency storage is 75 billion liters.
Food need is 2600 kcal per person per day.
Domestic supplies 70%. Imports cover 30%.
Production falls 30% for 90 days. Imports fall 40% for 90 days.
Fertilizer imports fall 40% for 90 days.`;
    const rows = hardRows(question);
    const people = 9376204;
    const domestic = people * 200;
    const total = domestic / 0.4;
    const agriculture = total * 0.6;
    assert.equal(rows.find((row) => row.id === "water-total")?.quantity, Math.round(total));
    assert.equal(rows.find((row) => row.id === "water-total")?.status, "CONDITIONAL");
    assert.equal(rows.find((row) => row.id === "water-agriculture")?.quantity, Math.round(agriculture));
    assert.equal(rows.find((row) => row.id === "water-ag-supply")?.quantity, Math.round(agriculture * 0.65));
    assert.match(rows.map((row) => row.text).join("\n"), /Treatment volume = UNKNOWN/);
    const daily = people * 2600;
    const have = daily * 0.7 * 0.7 + daily * 0.3 * 0.6;
    assert.equal(rows.find((row) => row.id === "food-daily")?.quantity, Math.round(daily));
    assert.equal(rows.find((row) => row.id === "food-available")?.quantity, Math.round(have));
    assert.equal(rows.find((row) => row.id === "food-deficit")?.quantity, Math.round((daily - have) * 90));
    assert.match(rows.map((row) => row.text).join("\n"), /not applied to food/);
    const table = verificationTable(question, "Year 1 water is 1. The food deficit is 999.");
    assert.match(table, /Independent/);
    assert.match(table, /DISCREPANCY|not stated|RECOMPUTED|CONDITIONAL/);
    const matched = verificationTable(question, `Food deficit over 90 days is ${Math.round((daily - have) * 90)}.`);
    assert.match(matched, /VERIFIED/);
  });

  it("calculates the fleet, storage, fuel, and cyber counts without blocking on an unknown", () => {
    const question = `Calculate what can be calculated.
Annual electricity consumption: 200 TWh/year
Solar | 12 GW | 24%
Wind | 8 GW | 38%
Hydro | 6 GW | 45%
Gas | 10 GW | 55%
Nuclear | 4 GW | 90%
Gas fuel deliveries fall 55%.
population: 1000000
200 L per person per day
Treatment capacity is 5.5 billion liters/day. Treatment falls 35%.
Emergency storage is 120 billion liters.
An additional electricity 20% reduction applies to treatment.
Fuel use is 180 million L per month.
45% of national fuel is imported.
The strategic reserve holds 160 million L.
Fuel imports are interrupted for 75 days.
Transportation demand rises 15%.
10000 critical systems
85% network-connected
18% compromised
reducing successful compromise by 70%`;
    const rows = hardRows(question);
    const fleet = 12 * 0.24 * 8760 + 8 * 0.38 * 8760 + 6 * 0.45 * 8760 + 10 * 0.55 * 8760 + 4 * 0.9 * 8760;
    assert.equal(rows.find((row) => row.id === "fleet-total")?.quantity, Math.round(fleet * 1000) / 1000);
    assert.ok((rows.find((row) => row.id === "energy-gap")?.quantity || 0) > 0);
    assert.match(rows.map((row) => row.text).join("\n"), /DEMONSTRATED ANNUAL ENERGY SHORTFALL/);
    assert.match(rows.map((row) => row.text).join("\n"), /Gas generation = UNKNOWN/);
    assert.equal(rows.find((row) => row.id === "water-days")?.quantity, 600);
    assert.equal(rows.find((row) => row.id === "treatment-cut")?.quantity, Math.round(5_500_000_000 * 0.65));
    assert.equal(rows.find((row) => row.id === "treatment-extra")?.status, "CONDITIONAL");
    assert.equal(rows.find((row) => row.id === "fuel-imports")?.quantity, 81_000_000);
    assert.equal(rows.find((row) => row.id === "fuel-gap")?.quantity, 42_500_000);
    assert.match(rows.map((row) => row.text).join("\n"), /Transportation fuel = UNKNOWN/);
    assert.equal(rows.find((row) => row.id === "cyber-lost")?.quantity, 1530);
    assert.equal(rows.find((row) => row.id === "cyber-after")?.quantity, 459);
    const quiet = verificationTable(question, "The draft contains no calculated result.");
    assert.match(quiet, /RECOMPUTED/);
    assert.doesNotMatch(quiet, /\| VERIFIED \|/);
    assert.match(completenessAudit(question), /Calculable/);
  });

  it("recomputes growth from the inputs and keeps a short cut off the year", () => {
    const question = `Population: 40 million
Population growth: 1.7%
Calculate Year 1, Year 5, Year 10 and Year 15.
Electricity demand is 220 TWh/year.
Electricity demand growth: 2.4%
Peak demand: 32 GW
Solar capacity is 20 GW. Capacity factor is 25%.
Wind capacity is 15 GW. Capacity factor is 40%.
Hydro capacity is 8 GW. Capacity factor is 50%.
Gas capacity is 14 GW. Capacity factor is 55%.
Nuclear capacity is 6 GW. Capacity factor is 90%.
Solar output falls 50% for 10 days.
Gas fuel deliveries fall 50% for 60 days.
Battery capacity: 50 GWh
The battery starts at 75% SOC.
Duration at 12 GW.
Emergency generators: 8 GW
96 hours of fuel
A corridor carries 18% of national generation.`;
    const rows = hardRows(question);
    const year15 = Math.round(40_000_000 * 1.017 ** 15);
    const energy15 = Math.round(220 * 1.024 ** 15 * 1000) / 1000;
    assert.equal(rows.find((row) => row.id === "population-15")?.quantity, year15);
    assert.notEqual(year15, 52_204_000);
    assert.equal(rows.find((row) => row.id === "energy-15")?.quantity, energy15);
    assert.equal(rows.find((row) => row.id === "days-solar")?.quantity, 600);
    assert.match(rows.map((row) => row.text).join("\n"), /A short cut is not a yearly cut/);
    assert.match(rows.map((row) => row.text).join("\n"), /Gas generation = UNKNOWN/);
    assert.match(rows.map((row) => row.text).join("\n"), /Annual energy: FAIL/);
    assert.match(rows.map((row) => row.text).join("\n"), /Peak = UNKNOWN/);
    assert.equal(rows.find((row) => row.id === "peak-assumed")?.status, "CONDITIONAL");
    assert.equal(rows.find((row) => row.id === "battery-soc")?.quantity, 37.5);
    assert.equal(rows.find((row) => row.id === "battery-at-12gw")?.quantity, 3.125);
    assert.equal(rows.find((row) => row.id === "generator-stock")?.quantity, 768);
    assert.match(rows.map((row) => row.text).join("\n"), /slice of the 96 h stock/);
    const wrong = "Year 15 population is 52,204,000. Solar crisis output = 21.9 TWh. Independent 52,204,000 PASS.";
    assert.match(hardFindings(question, wrong).join(" "), /52,204,000 does not match|52204000 does not match|does not match/);
    assert.match(hardFindings(question, wrong).join(" "), /not a yearly cut|annual figure/);
    const table = verificationTable(question, "Year 15 population is 52,204,000.");
    assert.match(table, /DISCREPANCY/);
  });

  it("finishes reserves, generator coverage, budget, and stated sensitivities", () => {
    const question = `Crisis lasts 30 days.
Electricity demand is 100 GWh/day.
Electricity supply is 42 GWh/day.
Water demand is 1.25 billion L/day.
Water supply is 800 million L/day.
Water storage is 5 billion L.
Food demand is 60 billion kcal/day.
Food supply is 38 billion kcal/day.
Food reserve is 300 billion kcal.
Oxygen demand is 100000 m3/day.
Oxygen supply is 65000 m3/day.
Oxygen reserve is 500000 m3.
Critical services need 18 GWh/day.
Treating the water requires 1 GWh/day.
Emergency generators: 5 GW
72 hours of fuel
Budget: $2 billion
Option A
Cost: $400 million
Option B
Cost: $300 million
Water: +250 million L/day
Option C
Cost: $250 million
Option D
Cost: $200 million
Option E
Cost: $150 million
Food: +8 billion kcal/day
Option F
Cost: $200 million
Option G
Cost: $350 million
Option H
Cost: $250 million
Option I
Cost: $200 million
Compare portfolios.
If the crisis lasts 45 days.
Food supply falls another 10%.
25% increase in water-treatment energy.
Reserves are only 80% of stated inventory.`;
    const rows = hardRows(question);
    const text = rows.map((row) => row.text).join("\n");
    assert.equal(rows.find((row) => row.id === "flow-electricity-deficit")?.quantity, 58);
    assert.equal(rows.find((row) => row.id === "flow-water-deficit")?.quantity, 450_000_000);
    assert.equal(rows.find((row) => row.id === "flow-food-deficit")?.quantity, 22_000_000_000);
    assert.equal(rows.find((row) => row.id === "flow-oxygen-deficit")?.quantity, 35_000);
    assert.equal(rows.find((row) => row.id === "flow-electricity-30")?.quantity, 1_740);
    assert.equal(rows.find((row) => row.id === "flow-water-remain")?.quantity, 8_500_000_000);
    assert.equal(rows.find((row) => row.id === "flow-food-remain")?.quantity, 360_000_000_000);
    assert.equal(rows.find((row) => row.id === "flow-oxygen-remain")?.quantity, 550_000);
    assert.equal(rows.find((row) => row.id === "flow-water-cover-demand")?.quantity, 4);
    assert.equal(rows.find((row) => row.id === "flow-water-cover-gap")?.quantity, 11.11);
    assert.equal(rows.find((row) => row.id === "after-critical")?.quantity, 24);
    assert.equal(rows.find((row) => row.id === "after-treatment")?.quantity, 23);
    assert.match(text, /not the water-treatment step/);
    assert.match(text, /distribution = UNKNOWN/i);
    assert.equal(rows.find((row) => row.id === "generator-stock")?.quantity, 360);
    assert.equal(rows.find((row) => row.id === "generator-cover")?.quantity, 6.21);
    assert.equal(rows.find((row) => row.id === "generator-spread")?.quantity, 12);
    assert.equal(rows.find((row) => row.id === "budget-over")?.quantity, 300_000_000);
    assert.match(text, /not an optimum/);
    assert.equal(rows.find((row) => row.id === "flow-electricity-45")?.quantity, 2_610);
    assert.equal(rows.find((row) => row.id === "flow-water-45")?.quantity, 20_250_000_000);
    assert.equal(rows.find((row) => row.id === "sense-food-supply")?.quantity, 34_200_000_000);
    assert.equal(rows.find((row) => row.id === "sense-treatment")?.quantity, 1.25);
    assert.equal(rows.find((row) => row.id === "sense-water-stock")?.quantity, 9_500_000_000);
    assert.match(text, /subtracted once/);
    const quiet = verificationTable(question, "The draft did not state the water storage days.");
    assert.match(quiet, /flow-water-cover-demand/);
    assert.doesNotMatch(quiet, /cover-demand \|[^|]+\|[^|]+\|[^|]+\| VERIFIED \|/);
  });

  it("keeps the same strategy on a question that is not a crisis", () => {
    const asked = "My hardest test for Vibe: Can it produce a recommendation that is numerically consistent from beginning to end, and then independently find and correct its own mistakes?";
    assert.equal(hardProblem(asked), false);
    assert.equal(resourcePlan(asked), false);
    assert.match(strategySheet(asked), /Do not add a feasibility label/);
    assert.equal(withCalculations(asked, "FEASIBILITY NOT DEMONSTRATED"), "A feasibility label is not an answer. This question did not give quantities to calculate. Answer the question that was asked.");
    const crisis = strategySheet("Crisis lasts 30 days. Electricity demand is 100 GWh/day. Electricity supply is 42 GWh/day.");
    assert.match(crisis, /58/);
    const restored = withCalculations("Crisis lasts 30 days. Electricity demand is 100 GWh/day. Electricity supply is 42 GWh/day.", "FEASIBILITY NOT DEMONSTRATED");
    assert.match(restored, /58/);
    assert.doesNotMatch(restored, /^FEASIBILITY NOT DEMONSTRATED/);
    const prior = "Electricity demand is 100 GWh/day. Electricity supply is 42 GWh/day. Crisis lasts 30 days.";
    const joined = scenarioText([{ role: "user", content: prior }, { role: "user", content: "Calculate the missing figures." }], "Calculate the missing figures.");
    assert.match(joined, /100 GWh/);
    assert.equal(scenarioText([{ role: "user", content: prior }, { role: "user", content: asked }], asked), asked);
    const scenario = "Crisis lasts 90 days. Water demand is 1.25 billion L/day. Food demand is 60 billion kcal/day. Oxygen demand is 100000 m3/day. Water reserve is 5 billion L. Electricity demand is 100 GWh/day. Electricity supply is 42 GWh/day. Treatment energy is 1 GWh/day.";
    const critique = "Score 1/10. The reply marked water UNKNOWN.";
    const recover = "Recover the original scenario. You classified supplied inputs as UNKNOWN. Example only: 120 GWh/day for 90 days.";
    const recovered = scenarioText([
      { role: "user", content: scenario },
      { role: "user", content: critique },
      { role: "user", content: recover },
    ], recover);
    assert.match(recovered, /1\.25 billion L\/day/);
    assert.doesNotMatch(recovered, /120 GWh/);
    const fixed = withCalculations(recovered, "Water = UNKNOWN.\nFood = UNKNOWN.\nOxygen = UNKNOWN.\nElectricity demand = 100 GWh/day.");
    assert.match(fixed, /PROVIDED: Water demand is 1\.25 billion L/);
    assert.match(fixed, /water demand = 1\.25 billion L\/day/i);
    assert.match(fixed, /food demand = 60 billion kcal\/day/i);
    assert.match(fixed, /oxygen demand = 100000 m3\/day/i);
    assert.doesNotMatch(fixed, /Water = UNKNOWN/);
  });

  it("keeps a titled scenario after 24 later turns and does not claim the values never existed", () => {
    const source = "VIBE EXTREME STRESS TEST #6 — THE 90-DAY NATIONAL AI DECISION CHALLENGE\nWater demand is 1.25 billion L/day. Electricity supply is 8 GWh/day.";
    const turns: { role: string; content: string }[] = [{ role: "user", content: source }, { role: "assistant", content: "Noted." }];
    for (let i = 0; i < 30; i += 1) {
      turns.push({ role: "user", content: `Aside ${i}. Electricity is 8 GWh/day in this note only.` });
      turns.push({ role: "assistant", content: "ok" });
    }
    const latest = "VIBE DIAGNOSTIC TEST — INPUT RETRIEVAL FAILURE. Recover the original source. Do not solve the problem yet. Which stage failed?";
    turns.push({ role: "user", content: latest });
    const kept = retainSources(turns);
    assert.ok(kept.length <= 24);
    assert.match(kept.map((turn) => turn.content).join("\n"), /1\.25 billion L\/day/);
    const report = retrievalReport(kept, latest);
    assert.match(report, /RETRIEVED/);
    assert.match(report, /1\.25/);
    assert.match(report, /PROVIDED/);
    assert.doesNotMatch(report, /never contained/);
    const missing = retrievalReport([{ role: "user", content: latest }], latest);
    assert.match(missing, /NOT IN THE TURNS/);
    assert.match(missing, /does not mean/);
    assert.match(missing, /B\. Context construction/);
    assert.doesNotMatch(missing, /full crisis analysis was run|1\.25/);
  });

  it("keeps a supplied spoilage rate and refuses a one-row audit as complete", () => {
    const source = "VIBE EXTREME STRESS TEST #6 — THE 90-DAY NATIONAL AI DECISION CHALLENGE. Crisis lasts 90 days. Food demand is 60 billion kcal/day. Food supply is 40 billion kcal/day. Spoilage is 12%. Compare five portfolios. Execute five sensitivity tests. Audit at least 20 specific checks.";
    const draft = "Outline of the method.\nA hypothetical food spoilage of 10% is used.\n8 × 90 = 720.\nFEASIBILITY NOT DEMONSTRATED";
    const fixed = withCalculations(source, draft);
    assert.match(fixed, /Supplied food spoilage = 12%/);
    assert.match(fixed, /DISCREPANCY/);
    assert.match(fixed, /1 − 0\.12/);
    assert.doesNotMatch(fixed, /1 − 0\.1[^\d]/);
    assert.match(fixed, /Task not complete/);
    assert.match(fixed, /Audit asked for 20/);
    assert.match(fixed, /Five portfolios were requested/);
    assert.match(completionNote(source), /not marked done/);
    assert.equal(completionNote("Electricity demand is 100 GWh/day. Electricity supply is 42 GWh/day."), "");
  });

  it("sums a named portfolio once and recalculates the stated sensitivities", () => {
    const question = `Crisis lasts 90 days.
Electricity demand is 120 GWh/day.
Electricity supply is 75 GWh/day.
Electricity storage is 400 GWh.
Storage discharge is 8 GW.
Water demand is 1.5 billion L/day.
Water supply is 950 million L/day.
Water reserve is 8 billion L.
Food demand is 72 billion kcal/day.
Food supply is 48 billion kcal/day.
Food reserve is 500 billion kcal.
Spoilage is 12%.
Oxygen demand is 100000 m3/day.
Oxygen supply is 60000 m3/day.
Oxygen reserve is 700000 m3.
Budget: $3 billion
Option A
Cost: $600 million
Electricity: +15 GWh/day
Option B
Cost: $400 million
Water: +300 million L/day raw water available for treatment
Option C
Cost: $250 million
Option D
Cost: $300 million
Option E
Cost: $300 million
Option F
Cost: $250 million
Water: +250 million L/day if sufficient treated water is available
Recommended portfolio: A+B+C+D+E
If the crisis lasts 120 days.
Food supply falls another 15%.
Only 70% of the water supply is confirmed safe.
Demand management saves 15 GWh/day.
Demand management saves only 8 GWh/day.
Only 80% of reserves are usable.`;
    const rows = hardRows(question);
    assert.equal(rows.find((row) => row.id === "flow-electricity-90")?.quantity, 4_050);
    assert.equal(rows.find((row) => row.id === "flow-electricity-120")?.quantity, 5_400);
    assert.equal(rows.find((row) => row.id === "flow-water-120")?.quantity, 66_000_000_000);
    assert.equal(rows.find((row) => row.id === "flow-food-120")?.quantity, 2_880_000_000_000);
    assert.equal(rows.find((row) => row.id === "flow-oxygen-120")?.quantity, 4_800_000);
    assert.equal(rows.find((row) => row.id === "portfolio-sum")?.quantity, 1_850_000_000);
    assert.equal(rows.find((row) => row.id === "portfolio-left")?.quantity, 1_150_000_000);
    assert.equal(rows.find((row) => row.id === "storage-once")?.quantity, 400);
    assert.equal(rows.find((row) => row.id === "storage-limit")?.quantity, 192);
    assert.match(rows.find((row) => row.id === "storage-limit")?.text || "", /not sustainable generation/);
    assert.match(rows.find((row) => row.id === "raw-B-water")?.text || "", /not guaranteed safe water/);
    assert.match(rows.find((row) => row.id === "cond-F-water")?.text || "", /not counted as delivered/);
    assert.equal(rows.find((row) => row.id === "sense-food-supply")?.quantity, 40_800_000_000);
    assert.equal(rows.find((row) => row.id === "sense-food-horizon")?.quantity, 2_808_000_000_000);
    assert.equal(rows.find((row) => row.id === "sense-water-safe")?.quantity, 835_000_000);
    assert.equal(rows.find((row) => row.id === "sense-save-only")?.quantity, 720);
    assert.equal(rows.find((row) => row.id === "sense-save-gap")?.quantity, 630);
    assert.equal(rows.find((row) => row.id === "food-usable-reserve")?.quantity, 440_000_000_000);
    assert.equal(rows.find((row) => row.id === "sense-electricity-usable")?.quantity, 320);
    assert.equal(rows.find((row) => row.id === "sense-water-usable")?.quantity, 6_400_000_000);
    assert.equal(rows.find((row) => row.id === "sense-food-usable")?.quantity, 352_000_000_000);
    assert.equal(rows.find((row) => row.id === "sense-oxygen-usable")?.quantity, 560_000);
    assert.equal(rows.find((row) => row.id === "portfolio-electricity-sum")?.quantity, 1_350);
    const checked = verificationTable(question, "The recommended portfolio costs $2.15 billion and leaves $850 million.");
    assert.match(checked, /portfolio-sum/);
    assert.match(checked, /DISCREPANCY|RECOMPUTED/);
  });

  it("solves every section of the 2.4M-person 21-day multi-system stress test with zero false unknowns", () => {
    const stressPrompt = `A regional metropolitan authority has a current population of 2.4 million people growing at 2.2% per year for 4 years.
Current annual electricity demand is 1,850 GWh/year, growing at 4.0% per year for 4 years. Essential services require 35% of normal electricity demand.
Generation fleet:
- Solar is rated at 320 MW with a 24% capacity factor
- Wind is rated at 280 MW with a 32% capacity factor
- Hydro is rated at 150 MW with a 48% capacity factor
Battery storage holds 1,200 MWh usable energy, 250 MW maximum discharge.
Backup diesel generator is rated at 150 MW with fuel stock for 48 hours at rated output.
During a 21-day emergency, solar output drops by 45%, wind output drops by 60%, hydro output drops by 69.3%, and grid transmission losses are 8%.
Water system: normal domestic water demand is 160 L/person/day, and emergency minimum water demand is 50 L/person/day.
The region has 10 equal water treatment plants of 22.5 million L/day each (225 million L/day total), 2 of the 10 water treatment plants are offline during the outage, and water distribution losses are 12%.
Food system: each person requires 2,300 kcal/person/day. Normal food supply is 45% local and 55% shipped in. During the 21-day emergency, local food production drops by 30%, shipped-in food drops by 64%, and emergency food reserves of 45 billion kcal suffer 6% spoilage.
Cybersecurity: the authority operates 24,000 municipal devices, of which 65% are network-connected. A concurrent cyber intrusion compromises 8% of network-connected devices; 20% of compromised devices are in critical services, and baseline automatic containment isolates 70% of compromised devices.
Three resilience packages are proposed under a $120 million capital budget:
- Package A ($55M): +500 MWh battery, +100 MW discharge, and grid hardening that cuts transmission losses from 8% to 4%
- Package B ($45M): backup power for 2 offline water treatment plants and leak repair that cuts water distribution losses from 12% to 7%
- Package C ($35M): cybersecurity containment that raises isolation from 70% to 95%
Run a ±10% sensitivity analysis on growth rates, usable storage, and food reserves, and provide a phased emergency response plan.`;

    const rows = hardRows(stressPrompt);
    assert.equal(rows.find((r) => r.id === "population-4")?.quantity, 2_618_272);
    assert.equal(rows.find((r) => r.id === "energy-4")?.quantity, 2_164.238);
    assert.equal(rows.find((r) => r.id === "average-power")?.quantity, 0.247);
    assert.equal(rows.find((r) => r.id === "daily-energy")?.quantity, 5.929);
    assert.equal(rows.find((r) => r.id === "energy-demand-21d")?.quantity, 124.52);
    assert.equal(rows.find((r) => r.id === "energy-essential-21d")?.quantity, 43.58);
    assert.equal(rows.find((r) => r.id === "battery-hours")?.quantity, 4.8);
    assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 4.86);
    assert.equal(rows.find((r) => r.id === "emergency-renewable-raw")?.quantity, 50.49);
    assert.equal(rows.find((r) => r.id === "emergency-supply-total")?.quantity, 54.18);
    assert.equal(rows.find((r) => r.id === "water-daily")?.quantity, 418_923_520);
    assert.equal(rows.find((r) => r.id === "water-emergency-daily")?.quantity, 130_913_600);
    assert.equal(rows.find((r) => r.id === "water-delivered-base")?.quantity, 158_400_000);
    assert.equal(rows.find((r) => r.id === "water-package-b")?.quantity, 198_000_000);
    assert.equal(rows.find((r) => r.id === "food-usable-reserve")?.quantity, 42_300_000_000);
    assert.equal(rows.find((r) => r.id === "cyber-linked")?.quantity, 15_600);
    assert.equal(rows.find((r) => r.id === "cyber-lost")?.quantity, 1_248);
    assert.equal(rows.find((r) => r.id === "cyber-critical")?.quantity, 250);
    assert.equal(rows.find((r) => r.id === "cyber-isolated-base")?.quantity, 874);
    assert.equal(rows.find((r) => r.id === "cyber-package-c")?.quantity, 1_186);
    assert.equal(rows.find((r) => r.id === "option-total")?.quantity, 135_000_000);
    assert.equal(rows.find((r) => r.id === "budget-over")?.quantity, 15_000_000);

    const rendered = attachHard(stressPrompt, "Incomplete draft");
    assert.match(rendered, /### Executive Decision Summary/);
    assert.match(rendered, /### Capital-Budget Package Combination Analysis/);
    assert.match(rendered, /### Phased Emergency Response & Operational Allocation Plan/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /0\.02200000|2\.164237999|8460000000\.000/);
    assert.doesNotMatch(rendered, /PROVIDED:\s*(?:devices|battery|systems|options|packages),\s*$/m);
    assert.match(rendered, /\| `sense-food-reserve` \|/);
    assert.match(rendered, /\| sense-food-reserve \| yes \| yes \|/);
  });

  it("passes the Vibe Input Isolation & Cross-Scenario Contamination Regression Test right after the 2.4M-person scenario", () => {
    const prior24MPrompt = `A regional authority has 2.4 million people growing at 2.2% per year for 4 years. Current annual electricity demand is 1,850 GWh/year, growing at 4.0% per year for 4 years. Battery holds 1,200 MWh usable energy, 250 MW maximum discharge. 24,000 municipal devices, 65% network-connected, 8% compromised. Budget: $120 million. Package A ($55M), Package B ($45M), Package C ($35M).`;
    const regressionPrompt = `### Vibe Regression Test: Input Isolation and Cross-Scenario Contamination

Ignore all numerical values from earlier scenarios. Use only the values stated in this prompt.

#### New Scenario
- Population: 120,000
- Annual electricity demand: 90 GWh
- Battery: 600 MWh usable energy, 150 MW maximum discharge
- Connected municipal devices: 8,000
- Compromise rate: 5%
- Capital budget: $20 million
- Proposed options cost $8 million, $7 million, and $9 million

#### Required Output
1. Calculate battery duration at full discharge.
2. Calculate the number of compromised devices.
3. Calculate the total cost of all options and state whether buying all options is within budget.
4. List the exact input values used and confirm that no values from earlier scenarios were reused.`;

    const turns = [
      { role: "user", content: prior24MPrompt },
      { role: "assistant", content: attachHard(prior24MPrompt, "Old scenario answer") },
      { role: "user", content: regressionPrompt },
    ];

    const selectedScenario = scenarioText(turns, regressionPrompt);
    assert.equal(selectedScenario, regressionPrompt);

    const rows = hardRows(selectedScenario);
    assert.equal(rows.find((r) => r.id === "population-base")?.quantity, 120_000);
    assert.equal(rows.find((r) => r.id === "energy-annual")?.quantity, 90);
    assert.equal(rows.find((r) => r.id === "battery-hours")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "cyber-linked")?.quantity, 8_000);
    assert.equal(rows.find((r) => r.id === "cyber-lost")?.quantity, 400);
    assert.equal(rows.find((r) => r.id === "option-total")?.quantity, 24_000_000);
    assert.equal(rows.find((r) => r.id === "budget-over")?.quantity, 4_000_000);

    const finalOutput = attachHard(selectedScenario, "Incomplete draft");
    assert.match(finalOutput, /600 MWh ÷ 150 MW = 4 h/);
    assert.match(finalOutput, /8000 × 5% = 400/);
    assert.match(finalOutput, /NOT FEASIBLE/);
    assert.match(finalOutput, /Input Isolation Check\*\*: PASS/);
    assert.doesNotMatch(finalOutput, /2618272|2,618,272|2164\.238|1200 MWh|24,000\s+municipal|15,600|1,248/);
  });

  it("maintains 100% input isolation and arithmetic exactness across 100 consecutive randomized scenarios", () => {
    const turns: { role: string; content: string }[] = [];
    for (let i = 1; i <= 100; i += 1) {
      const pop = 50_000 + i * 1_500;
      const gwh = 40 + i * 3;
      const batMw = 25 + (i % 10) * 15;
      const hours = 2 + (i % 5);
      const batMwh = batMw * hours;
      const devices = 2_000 + i * 200;
      const compPct = 4 + (i % 7);
      const expectedComp = Math.round(devices * (compPct / 100) * 1000) / 1000;
      const optA = 5 + (i % 6);
      const optB = 6 + (i % 5);
      const optC = 7 + (i % 4);
      const totalOptM = optA + optB + optC;
      const budgetM = totalOptM - 3;

      const prompt = `Scenario #${i}:
- Population: ${pop.toLocaleString("en-US")}
- Annual electricity demand: ${gwh} GWh
- Battery: ${batMwh.toLocaleString("en-US")} MWh usable energy, ${batMw} MW maximum discharge
- Connected municipal devices: ${devices.toLocaleString("en-US")}
- Compromise rate: ${compPct}%
- Capital budget: $${budgetM} million
- Proposed options cost $${optA} million, $${optB} million, and $${optC} million
Calculate battery duration, compromised devices, and option budget feasibility.`;

      turns.push({ role: "user", content: prompt });
      const active = scenarioText(turns, prompt);
      assert.equal(active, prompt, `Scenario #${i} must not reuse earlier scenario text`);

      const rows = hardRows(active);
      assert.equal(rows.find((r) => r.id === "population-base")?.quantity, pop);
      assert.equal(rows.find((r) => r.id === "energy-annual")?.quantity, gwh);
      assert.equal(rows.find((r) => r.id === "battery-hours")?.quantity, hours);
      assert.equal(rows.find((r) => r.id === "cyber-lost")?.quantity, expectedComp);
      assert.equal(rows.find((r) => r.id === "option-total")?.quantity, totalOptM * 1_000_000);
      assert.equal(rows.find((r) => r.id === "budget-over")?.quantity, 3_000_000);

      turns.push({ role: "assistant", content: `Completed Scenario #${i}` });
    }
  });

  it("solves every section of the 1.5M-person 5-year 14-day metropolitan crisis stress test with full accuracy", () => {
    const prompt15M = `### VIBE COUPLED ENGINEERING & INPUT-ISOLATION STRESS TEST — 5-YEAR / 14-DAY METROPOLITAN CRISIS

Ignore all numerical values from earlier scenarios. Use only the inputs stated below.

#### 1. Demographics & Electricity Demand (5-Year Horizon)
- A metropolitan district currently has 1,500,000 residents, growing at 1.8% per year for 5 years.
- Current annual electricity demand is 1,200 GWh/year, growing at 3.2% per year for 5 years.
- Essential services require 40% of normal electricity demand during an emergency.

#### 2. Generation Fleet, Storage & 14-Day Storm Disruption
- Solar capacity is 250 MW with a 22% capacity factor.
- Wind capacity is 200 MW with a 35% capacity factor.
- Hydro capacity is 100 MW with a 50% capacity factor.
- During a 14-day severe storm in Year 5:
  - Solar output drops by 40% for all 14 days.
  - Wind output drops by 50% for 10 days and returns to normal for the remaining 4 days.
  - Hydro output drops by 25% for all 14 days.
  - Grid transmission losses are 6% of generated electricity.
- A utility battery bank holds 900 MWh of usable storage and discharges at up to 180 MW (one-time reserve unless recharged).
- A backup diesel generator plant is rated at 90 MW with fuel stock for 48 hours once.

#### 3. Water Supply & Treatment (Year 5)
- Normal domestic water demand is 150 L/person/day; emergency minimum water requirement is 60 L/person/day.
- The district operates 3 water treatment plants, each rated at 85,000,000 L/day.
- During the 14-day crisis, 1 water treatment plant goes offline completely, and pipe distribution losses are 15%.

#### 4. Food Security & Spoilage (Year 5, 14-Day Disruption)
- Each resident requires 2,200 kcal/day. Normal food supply is 60% local and 40% imported.
- During the 14-day corridor closure, local food output drops by 30% and imported food drops by 75%.
- Emergency food reserves hold 15,000,000,000 kcal, but suffer 10% spoilage before distribution.

#### 5. Municipal Cybersecurity Intrusion
- The district operates 18,000 municipal devices; 60% are network-connected, and 10% of connected devices are compromised in a concurrent intrusion.
- 25% of compromised devices control critical services.
- Baseline automated containment isolates 65% of compromised devices within 2 hours.

#### 6. Capital Budget & Mitigation Packages
- The district has a strict capital budget of $90 million.
- Package A (Cost: $40 million): Adds 300 MWh usable battery storage, increases maximum battery discharge by 60 MW, and reduces grid transmission losses from 6% to 3%.
- Package B (Cost: $35 million): Restores the offline water treatment plant to 70% capacity and reduces water distribution losses from 15% to 10%.
- Package C (Cost: $30 million): Increases compromised-device containment from 65% to 90% and adds 2,500,000,000 kcal of verified non-spoiled emergency food stock.

#### Required Deliverables
1. Compute Year-5 population, Year-5 annual electricity demand, average power (GW and MW), daily electricity demand, 14-day total demand, and 14-day essential-service demand.
2. Compute normal annual generation by source, 14-day emergency generation before and after transmission losses, battery duration at full discharge (baseline and with Package A), one-time diesel fuel stock, and the 14-day electricity balance (vs. full demand and vs. essential demand).
3. Compute Year-5 normal and emergency daily water demand, normal and active treatment capacity, baseline delivered water supply after 15% loss, and delivered water supply with Package B.
4. Compute Year-5 daily food requirement, normal local/imported split, crisis daily food supply, 14-day gross food deficit, usable food reserve after 10% spoilage, and net 14-day food deficit after applying the usable reserve once.
5. Compute network-connected devices, compromised devices, compromised critical-service devices, and isolated devices (baseline 65% vs. Package C 90%).
6. Evaluate all 8 capital-budget package combinations against the $90 million budget, state whether buying all three packages (A + B + C) is FEASIBLE or NOT FEASIBLE, and run ±10% sensitivity analyses on population growth rate, electricity demand growth rate, usable battery storage, and usable food reserve.`;

    const rows = hardRows(prompt15M);
    assert.equal(rows.find((r) => r.id === "population-5")?.quantity, 1_639_948);
    assert.equal(rows.find((r) => r.id === "energy-5")?.quantity, 1_404.688);
    assert.equal(rows.find((r) => r.id === "days-wind")?.quantity, 15.12);
    assert.equal(rows.find((r) => r.id === "days-solar")?.quantity, 11.088);
    assert.equal(rows.find((r) => r.id === "days-hydro")?.quantity, 12.6);
    assert.equal(rows.find((r) => r.id === "emergency-renewable-raw")?.quantity, 38.81);
    assert.equal(rows.find((r) => r.id === "battery-hours")?.quantity, 5);
    assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 5);
    assert.equal(rows.find((r) => r.id === "generator-stock")?.quantity, 4.32);
    assert.equal(rows.find((r) => r.id === "treatment-normal")?.quantity, 255_000_000);
    assert.equal(rows.find((r) => r.id === "treatment-active")?.quantity, 170_000_000);
    assert.equal(rows.find((r) => r.id === "water-delivered-base")?.quantity, 144_500_000);
    assert.equal(rows.find((r) => r.id === "water-package-b")?.quantity, 206_550_000);
    assert.equal(rows.find((r) => r.id === "cyber-linked")?.quantity, 10_800);
    assert.equal(rows.find((r) => r.id === "cyber-lost")?.quantity, 1_080);
    assert.equal(rows.find((r) => r.id === "cyber-critical")?.quantity, 270);
    assert.equal(rows.find((r) => r.id === "cyber-isolated-base")?.quantity, 702);
    assert.equal(rows.find((r) => r.id === "cyber-package-c")?.quantity, 972);
    assert.equal(rows.find((r) => r.id === "sense-battery")?.quantity, 90);
    assert.equal(rows.find((r) => r.id === "sense-food-reserve")?.quantity, 2_700_000_000);

    const rendered = attachHard(prompt15M, "Incomplete draft");
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /0\.01800000|1\.404688000/);
    assert.doesNotMatch(rendered, /PROVIDED:\s*Electricity Demand \(5/);
  });

  it("solves the 4-year 16-day metropolitan healthcare & cold-chain crisis with full-digit budgets and parenthetical essential load", () => {
    const prompt16M = `### VIBE COUPLED ENGINEERING & INPUT-ISOLATION STRESS TEST — 4-YEAR / 16-DAY METROPOLITAN HEALTHCARE & COLD-CHAIN CRISIS

Ignore all numerical values from earlier scenarios. Use only the inputs stated below.

#### 1. Demographics & Electricity Demand (4-Year Horizon)
- A metropolitan healthcare district currently has 1,600,000 residents, growing at 2.5% per year for 4 years.
- Current annual electricity demand is 1,400 GWh/year, growing at 4.0% per year for 4 years.
- Essential services (hospitals, ICU life-support, and cold-chain) require 42% of normal electricity demand during an emergency.

#### 2. Generation Fleet, Storage & 16-Day Storm Disruption
- Solar capacity is 300 MW with a 20% capacity factor.
- Wind capacity is 250 MW with a 36% capacity factor.
- Hydro capacity is 120 MW with a 50% capacity factor.
- During a 16-day severe storm in Year 4:
  - Solar output drops by 45% for all 16 days.
  - Wind output drops by 50% for 10 days and returns to normal for the remaining 6 days.
  - Hydro output drops by 25% for all 16 days.
  - Grid transmission losses are 8% of generated electricity.
- A utility battery bank holds 1,000 MWh of usable storage and discharges at up to 200 MW (one-time reserve unless recharged).
- A backup diesel generator plant is rated at 100 MW with fuel stock for 60 hours once.

#### 3. Water Supply & Treatment (Year 4)
- Normal domestic water demand is 150 L/person/day; emergency minimum water requirement is 55 L/person/day.
- The district operates 6 water treatment plants, each rated at 50,000,000 L/day.
- During the 16-day crisis, 2 water treatment plants go offline completely, and pipe distribution losses are 12%.

#### 4. Food & Cold-Chain Nutrition Security (Year 4, 16-Day Disruption)
- Each resident requires 2,400 kcal/day. Normal food supply is 55% local and 45% imported.
- During the 16-day disruption, local food output drops by 30%, imported food drops by 80%, and emergency food reserves of 25,000,000,000 kcal suffer 12% spoilage before distribution.

#### 5. Healthcare & Municipal Telemetry Intrusion (Year 4)
- The district manages 25,000 municipal devices; 64% are network-connected, and 10% of connected devices are compromised in a concurrent cyber intrusion.
- 25% of compromised devices control critical services.
- Baseline automated containment isolates 65% of compromised devices.

#### 6. Capital Budget & Mitigation Packages
The district has a strict capital budget of $80,000,000 and is evaluating three mitigation packages:
- Package A ($34,000,000): Adds 400 MWh usable battery storage, increases maximum battery discharge by 50 MW.
- Package B ($28,000,000): Restores 2 offline water treatment plants and reduces pipe distribution losses from 12% to 6%.
- Package C ($26,000,000): Raises automated cyber containment from 65% to 90% of compromised devices.

#### 7. Required Calculations & Sensitivity Analysis
Compute all Year-4 baseline and 16-day emergency balances across electricity, water, food, cybersecurity, and budget combinations. Run sensitivity checks for ±15% on population growth, electricity demand growth, and usable battery storage, plus a 20% reduction in usable food reserve.`;

    const rows = hardRows(prompt16M);
    assert.equal(rows.find((r) => r.id === "population-4")?.quantity, 1_766_101);
    assert.equal(rows.find((r) => r.id === "energy-4")?.quantity, 1_637.802);
    assert.equal(rows.find((r) => r.id === "energy-demand-16d")?.quantity, 71.79);
    assert.equal(rows.find((r) => r.id === "energy-essential-16d")?.quantity, 30.15);
    assert.equal(rows.find((r) => r.id === "emergency-essential-balance")?.quantity, 25.7);
    assert.equal(rows.find((r) => r.id === "option-total")?.quantity, 88_000_000);
    assert.equal(rows.find((r) => r.id === "budget-over")?.quantity, 8_000_000);
    assert.equal(rows.find((r) => r.id === "cost-pack")?.quantity, 54_000_000);
    assert.equal(rows.find((r) => r.id === "package-combinations")?.quantity, 7);
    assert.equal(rows.find((r) => r.id === "sense-food-reserve")?.quantity, 4_400_000_000);

    const rendered = attachHard(prompt16M, "Incomplete draft");
    assert.match(rendered, /### Capital-Budget Package Combination Analysis/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves the 10-year 24-day semiconductor & desalination corridor stress test and does not false-trigger draw skill on 'reserve draw'", async () => {
    const prompt10Y = `Perform a full deterministic engineering audit, verification, and executive decision analysis for the following 10-Year Semiconductor & Desalination Coastal Corridor Resilience Plan. Recompute every metric from first principles, audit every pre-computed claim and embedded trap in the text, evaluate all 8 mitigation package combinations (including the empty set and full set) against the capital budget, and provide a complete sensitivity analysis.

1. DEMOGRAPHIC & ELECTRICITY DEMAND HORIZON (10-YEAR PROJECTION)
- Baseline population: 4,500,000 people, growing at 1.2% per year compounded annually over 10 years.
- Baseline annual electricity demand: 3,800 GWh/year, growing at 3.5% per year compounded annually over 10 years.
- Essential services (semiconductor fab cleanroom safety systems, desalination high-pressure pumps, and emergency hospitals) require 35% of total electricity demand during any emergency window.
- TRAP 1 (Linear Growth Claim): The corridor planning office claims Year 10 population is 5,040,000 people (a 12.00% increase) and Year 10 annual electricity demand is 5,130.000 GWh/year, corresponding to an average power demand of 0.586 GW and a daily electricity demand of 14.055 GWh/day.

2. ANNUAL GENERATION FLEET
- Solar fleet: 600 MW nameplate capacity at a 22% annual capacity factor.
- Wind fleet: 500 MW nameplate capacity at a 42% annual capacity factor.
- Hydro fleet: 250 MW nameplate capacity at a 48% annual capacity factor.
- TRAP 2 (Nameplate vs. Capacity Factor Claim): The utility contractor claims the stated renewable fleet generates 5,450.00 GWh/year and therefore provides a comfortable Year 10 annual energy surplus of 320.000 GWh/year before any crisis occurs.

3. 24-DAY TYPHOON & SUBSEA CABLE DISRUPTION WINDOW
During a 24-day typhoon and subsea intertie disruption in Year 10:
- Wind output drops by 55% for 14 days and returns to normal for the remaining 10 days.
- Solar output drops by 40% for all 24 days.
- Hydro output drops by 35% for all 24 days.
- Grid distribution and transformer losses during the 24-day emergency are 8% on grid-delivered generation.
- TRAP 3 (Full-Window Wind Cut Claim): A junior analyst multiplied the 55% wind cut across all 24 days and claimed 24-day wind generation is only 54.432 GWh, and claimed total 24-day electricity demand is only 310.00 GWh.

4. BATTERY STORAGE & EMERGENCY GENERATOR PLANT
- Utility battery storage: 1,200 MWh of usable storage at 300 MW maximum discharge power (delivered once during the multi-day disruption unless recharged).
- Package A ($45,000,000): Adds 600 MWh of usable battery storage and 100 MW of discharge capacity.
- Emergency thermal generator plant: 180 MW dispatchable capacity backed by 9,000 MWh of on-site fuel stock. Checkpoints are evaluated at 24 hours and 72 hours of continuous full-load operation, as well as across the full 24-day crisis.
- TRAP 4 (Daily Battery Multiplication & Uncapped 72h Fuel Claim): The vendor claims the 1,200 MWh battery delivers 28.80 GWh over 24 days by discharging once every single day, claims Package A extends battery duration to 6.0 hours, and claims the 180 MW generator plant delivers 12.96 GWh over a 72-hour continuous run without hitting its fuel limit.

5. POTABLE WATER & DESALINATION SYSTEM (YEAR 10)
- Normal potable water demand: 160 L/person/day.
- Emergency minimum potable water requirement: 60 L/person/day.
- Normal water treatment plant capacity is 650,000,000 L/day, but intake fouling during the 24-day crisis reduces active treatment capacity to 320,000,000 L/day.
- Pipe network distribution losses are 14% in the baseline emergency state.
- Package B ($52,000,000): Restores 80% of the lost treatment capacity and reduces pipe distribution losses from 14% to 7%.
- TRAP 5 (Baseline Water Sufficiency Claim): Operations staff claim baseline emergency delivered water is 295,000,000 L/day, which they claim is a surplus above the Year 10 emergency minimum water requirement even without Package B, and claim Package B delivers 604,500,000 L/day at 7% loss.

6. FOOD & EMERGENCY RATION LOGISTICS (24-DAY CRISIS)
- Minimum nutrition requirement: 2,300 kcal/person/day.
- Disrupted coastal ports deliver 45% of required daily calories, and 8% of delivered food is lost to humidity and spoilage before distribution.
- Emergency ration reserve: 40,000,000,000 kcal total stockpile, of which 90% is usable.
- TRAP 6 (Gross Reserve & Unspoiled Supply Claim): Logistics planners counted all 40,000,000,000 kcal of the reserve as usable and ignored the 8% spoilage loss on incoming deliveries, claiming the net unmet 24-day food deficit after reserve draw is only 110,000,000,000 kcal.

7. CYBER & SCADA TELEMETRY ISOLATION
- The corridor operates 50,000 network endpoints, of which 28% are linked to grid and desalination telemetry.
- During the crisis, 15% of linked telemetry nodes are compromised by an intrusion, and 20% of compromised nodes control critical services.
- Baseline automated containment isolates 60% of compromised nodes within 18 hours.
- Package C ($22,000,000): Deploys zero-trust micro-segmentation that increases compromised node isolation from 60% to 85% within 18 hours.
- TRAP 7 (Endpoint Confusion Claim): The security vendor applied the 15% compromise rate to all 50,000 endpoints instead of the 14,000 linked telemetry nodes, claiming 7,500 nodes are compromised and 1,500 critical nodes are affected.

8. CAPITAL BUDGET & MITIGATION PACKAGES
- Total emergency capital budget: $105,000,000.
- Available packages:
  * Package A: $45,000,000 (Battery expansion: +600 MWh usable storage, +100 MW discharge power)
  * Package B: $52,000,000 (Desalination & pipe rehab: restores 80% of lost treatment capacity and cuts distribution loss from 14% to 7%)
  * Package C: $22,000,000 (Cyber micro-segmentation: raises compromised node isolation from 60% to 85%)
- TRAP 8 (Budget & Subset Count Claim): The finance committee claims all three packages (A + B + C) can be funded simultaneously within the $105,000,000 budget with $6,000,000 to spare, and claims there are only 5 non-empty package combinations.

9. SENSITIVITY ANALYSIS
- Evaluate a ±12% variation in the annual population growth rate, the annual electricity demand growth rate, and usable battery storage capacity.
- Additionally, evaluate a 25% reduction in usable food reserve due to warehouse flooding.
- TRAP 9 (Sensitivity Understatement Claim): The risk register claims a 25% reduction in usable food reserve reduces available reserve calories by only 4,320,000,000 kcal.`;

    const { skillFromWords } = await import("./noctis-skills.ts");
    assert.equal(skillFromWords(prompt10Y), "");
    assert.equal(skillFromWords("Draw a diagram of a volcano"), "draw");

    const rows = hardRows(prompt10Y);
    assert.equal(rows.find((r) => r.id === "population-10")?.quantity, 5_070_113);
    assert.equal(rows.find((r) => r.id === "energy-10")?.quantity, 5_360.275);
    assert.equal(rows.find((r) => r.id === "energy-demand-24d")?.quantity, 352.46);
    assert.equal(rows.find((r) => r.id === "energy-essential-24d")?.quantity, 123.36);
    assert.equal(rows.find((r) => r.id === "cf-solar")?.quantity, 1_156.32);
    assert.equal(rows.find((r) => r.id === "cf-wind")?.quantity, 1_839.6);
    assert.equal(rows.find((r) => r.id === "cf-hydro")?.quantity, 1_051.2);
    assert.equal(rows.find((r) => r.id === "fleet-total")?.quantity, 4_047.12);
    assert.equal(rows.find((r) => r.id === "energy-gap")?.quantity, 1_313.155);
    assert.equal(rows.find((r) => r.id === "days-wind")?.quantity, 82.152);
    assert.equal(rows.find((r) => r.id === "days-solar")?.quantity, 45.619);
    assert.equal(rows.find((r) => r.id === "days-hydro")?.quantity, 44.928);
    assert.equal(rows.find((r) => r.id === "emergency-renewable-raw")?.quantity, 172.7);
    assert.equal(rows.find((r) => r.id === "battery-hours")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 4.5);
    assert.equal(rows.find((r) => r.id === "generator-stock")?.quantity, 9);
    assert.equal(rows.find((r) => r.id === "generator-24")?.quantity, 4.32);
    assert.equal(rows.find((r) => r.id === "generator-72")?.quantity, 9);
    assert.equal(rows.find((r) => r.id === "treatment-normal")?.quantity, 650_000_000);
    assert.equal(rows.find((r) => r.id === "treatment-active")?.quantity, 320_000_000);
    assert.equal(rows.find((r) => r.id === "water-delivered-base")?.quantity, 275_200_000);
    assert.equal(rows.find((r) => r.id === "water-emergency-balance")?.quantity, 29_006_780);
    assert.equal(rows.find((r) => r.id === "water-package-b")?.quantity, 543_120_000);
    assert.equal(rows.find((r) => r.id === "food-daily")?.quantity, 11_661_259_900);
    assert.equal(rows.find((r) => r.id === "food-available")?.quantity, 4_827_761_599);
    assert.equal(rows.find((r) => r.id === "food-deficit")?.quantity, 164_003_959_224);
    assert.equal(rows.find((r) => r.id === "food-usable-reserve")?.quantity, 36_000_000_000);
    assert.equal(rows.find((r) => r.id === "food-net-after-reserve")?.quantity, 128_003_959_224);
    assert.equal(rows.find((r) => r.id === "cyber-linked")?.quantity, 14_000);
    assert.equal(rows.find((r) => r.id === "cyber-lost")?.quantity, 2_100);
    assert.equal(rows.find((r) => r.id === "cyber-critical")?.quantity, 420);
    assert.equal(rows.find((r) => r.id === "cyber-isolated-base")?.quantity, 1_260);
    assert.equal(rows.find((r) => r.id === "cyber-package-c")?.quantity, 1_785);
    assert.equal(rows.find((r) => r.id === "sense-food-reserve")?.quantity, 9_000_000_000);
    assert.equal(rows.find((r) => r.id === "flow-electricity-demand"), undefined);

    const rendered = attachHard(prompt10Y, "Incomplete draft");
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves SCENARIO-70C29A9F with 4 packages, reservoir drawdown, per-metric sensitivity bands, and zero duplicate food-usable-reserve rows", () => {
    const prompt70C = `[VIBE-STRESS-TEST: SCENARIO-70C29A9F — 10-YEAR / 24-DAY SEMICONDUCTOR & DESALINATION COASTAL CORRIDOR RESILIENCE PLAN]
We are stress-testing Vibe's deterministic quantitative reasoning and audit engine. Treat every number below as scenario-specific input for THIS prompt only. Do NOT carry over any numbers from prior conversations. Audit and reject every flawed claim in the Draft Consultant Memo, and recompute every metric from first principles.

1. DEMOGRAPHICS & 10-YEAR ELECTRICITY GROWTH
- Base population (Year 0): 4,500,000 residents, growing at 1.2% per year compounded for 10 years.
- Base annual electricity demand (Year 0): 3,800 GWh/year, growing at 3.5% per year compounded for 10 years.
- Essential-service electricity load (semiconductor cleanroom safety systems, desalination high-pressure pumps, and trauma hospitals) equals 35% of total 24-day electricity demand.

2. GENERATION FLEET, 24-DAY TYPHOON DISRUPTION & STORAGE
- Solar fleet: 600 MW nameplate capacity at a 22% annual capacity factor. During the 24-day typhoon disruption, solar output drops by 40% for all 24 days.
- Wind fleet: 450 MW nameplate capacity at a 46% annual capacity factor. During the 24-day typhoon disruption, wind output drops by 55% for 16 days and operates at normal capacity factor for the remaining 8 days.
- Hydro fleet: 280 MW nameplate capacity at a 50% annual capacity factor. During the 24-day typhoon disruption, hydro output drops by 30% for all 24 days.
- Utility battery bank: 1,200 MWh usable energy capacity and 300 MW maximum discharge rating (discharged once during the 24-day crisis; never multiplied by 24 days).
- Backup diesel generator fleet: 180 MW continuous output, backed by 9,000 MWh of on-site fuel stock (one-time fuel reserve; do not invent daily refueling).
- Grid distribution and transformer loss: 8% of all generated and discharged electricity before delivery to end users.

3. DESALINATION, RESERVOIR & WATER DISTRIBUTION
- Normal domestic water demand: 160 L/person/day at Year 10 population.
- Emergency minimum survival water demand: 60 L/person/day at Year 10 population.
- Normal water treatment capacity across the corridor: 650,000,000 L/day. During the typhoon, intake fouling reduces active water treatment to 320,000,000 L/day.
- Municipal pipe distribution loss: 12% of active treatment output before reaching residents.
- Coastal emergency reservoir: 6,000,000,000 L gross storage, of which 95% is usable, with a fixed emergency drawdown limit of 380,000,000 L/day.

4. PORT FOOD SUPPLY & EMERGENCY RATION STOCKPILE
- Minimum human calorie requirement: 2,300 kcal/person/day at Year 10 population.
- During the 24-day port closure, emergency coastal barges and rail corridors deliver 45% of required daily calories, and 8% of delivered food is lost to humidity and spoilage.
- Emergency food reserve: 40,000,000,000 kcal total stockpile, of which 90% is usable.

5. TELEMETRY & INDUSTRIAL CONTROL CYBERSECURITY
- The corridor operates 50,000 network endpoints, of which 28% are linked to grid and desalination telemetry.
- During the crisis, a coordinated intrusion compromises 15% of linked telemetry nodes.
- Exactly 20% of compromised nodes control critical services.
- Baseline automated containment isolates 70% of compromised nodes.

6. MITIGATION CAPITAL BUDGET ($120,000,000 HARD CAP)
- Capital budget cap: $120,000,000 ($120 million).
- Package A ($45,000,000): Adds 600 MWh of usable battery storage and 100 MW of discharge capacity.
- Package B ($42,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 12% to 7%.
- Package C ($30,000,000): Upgrades automated cyber containment to isolate 92% of compromised telemetry nodes.
- Package D ($38,000,000): Expands emergency food logistics to deliver 65% of required daily calories with 0% spoilage across all 24 days.
- Option E (Unpriced Vendor Proposal): Offshore wave-power array with no capital cost provided.

7. SENSITIVITY ANALYSIS
- Compute the Year 10 population spread under a ±12% sensitivity on the 1.2% annual population growth rate.
- Compute the Year 10 annual electricity demand spread under a ±20% sensitivity on the 3.5% annual electricity growth rate.
- Compute the impact of a 25% reduction in usable food reserve on the net 24-day calorie deficit.

8. DRAFT CONSULTANT MEMO CLAIMS TO AUDIT (REJECT ALL 8 TRAPS)
- TRAP 1: Claims Year 10 population is 5,040,000 using simple linear interest (4,500,000 × (1 + 0.012 × 10)).
- TRAP 2: Claims the 1,200 MWh battery provides 28,800 MWh over 24 days by discharging its full capacity every day without recharging.
- TRAP 3: Claims the 55% wind cut for 16 days removes 55% of annual wind generation (997.326 GWh/year) instead of applying only to 16 days.
- TRAP 4: Claims backup diesel generators produce 103,680 MWh over 24 days (180 MW × 24 h × 24 days), ignoring the 9,000 MWh fuel stock limit.
- TRAP 5: Claims Package B delivers 610,000,000 L/day by ignoring the remaining 20% unrecovered treatment loss and the 7% pipe distribution loss.
- TRAP 6: Claims the remaining 24-day calorie deficit after reserve draw is 100,000,000,000 kcal by forgetting the 8% spoilage on delivered food and the 10% unusable reserve fraction.
- TRAP 7: Claims all 4 priced mitigation packages (A + B + C + D = $155,000,000) fit within the $120,000,000 budget cap, and recommends selecting unpriced Option E.
- TRAP 8: Claims the 2,100 compromised telemetry nodes prove a total blackout and complete desalination shutdown across the corridor.`;

    const rows = hardRows(prompt70C);
    assert.equal(rows.find((r) => r.id === "energy-essential-24d")?.quantity, 123.36);
    assert.equal(rows.find((r) => r.id === "days-wind")?.quantity, 75.514);
    assert.equal(rows.find((r) => r.id === "emergency-renewable-raw")?.quantity, 177.58);
    assert.equal(rows.find((r) => r.id === "water-reservoir-usable")?.quantity, 5_700_000_000);
    assert.equal(rows.find((r) => r.id === "water-days")?.quantity, 15);
    assert.equal(rows.find((r) => r.id === "treatment-normal")?.quantity, 650_000_000);
    assert.equal(rows.find((r) => r.id === "treatment-active")?.quantity, 320_000_000);
    assert.equal(rows.find((r) => r.id === "water-delivered-base")?.quantity, 281_600_000);
    assert.equal(rows.find((r) => r.id === "water-emergency-balance")?.quantity, 22_606_780);
    assert.equal(rows.find((r) => r.id === "water-package-b")?.quantity, 543_120_000);
    assert.equal(rows.filter((r) => r.id === "food-usable-reserve").length, 1);
    assert.equal(rows.find((r) => r.id === "food-usable-reserve")?.quantity, 36_000_000_000);
    assert.equal(rows.find((r) => r.id === "food-package-d")?.quantity, 97_954_583_160);
    assert.equal(rows.find((r) => r.id === "cyber-package-c")?.quantity, 1_932);
    assert.equal(rows.find((r) => r.id === "sense-population")?.quantity, 144_292);
    assert.equal(rows.find((r) => r.id === "sense-energy")?.quantity, 725.46);

    const rendered = attachHard(prompt70C, "Incomplete draft mentioning Package D with 0% spoilage and rejecting TRAP 6.");
    assert.match(rendered, /SCENARIO-70C29A9F/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("continuously stress-tests 240 randomized multi-domain difficult scenario phrasings with zero discrepancies", () => {
    const configs = [
      { years: 3, days: 12, cutDays: 7, basePop: 1_250_000, popRate: 2.4, baseGwh: 1_150, elecRate: 3.8, essPct: 40 },
      { years: 4, days: 16, cutDays: 10, basePop: 1_600_000, popRate: 2.5, baseGwh: 1_400, elecRate: 4.0, essPct: 42 },
      { years: 5, days: 14, cutDays: 8, basePop: 2_200_000, popRate: 1.8, baseGwh: 2_100, elecRate: 3.2, essPct: 38 },
      { years: 5, days: 15, cutDays: 9, basePop: 1_950_000, popRate: 2.1, baseGwh: 1_850, elecRate: 3.4, essPct: 41 },
      { years: 6, days: 18, cutDays: 12, basePop: 3_100_000, popRate: 2.0, baseGwh: 2_600, elecRate: 3.8, essPct: 40 },
      { years: 6, days: 16, cutDays: 11, basePop: 2_850_000, popRate: 1.9, baseGwh: 2_400, elecRate: 3.5, essPct: 37 },
      { years: 7, days: 20, cutDays: 12, basePop: 2_750_000, popRate: 2.2, baseGwh: 2_450, elecRate: 3.6, essPct: 44 },
      { years: 7, days: 21, cutDays: 14, basePop: 3_400_000, popRate: 1.6, baseGwh: 2_900, elecRate: 3.1, essPct: 39 },
      { years: 8, days: 21, cutDays: 14, basePop: 3_800_000, popRate: 1.5, baseGwh: 3_200, elecRate: 3.0, essPct: 36 },
      { years: 8, days: 18, cutDays: 10, basePop: 4_100_000, popRate: 1.4, baseGwh: 3_500, elecRate: 3.3, essPct: 34 },
      { years: 9, days: 22, cutDays: 15, basePop: 4_250_000, popRate: 1.3, baseGwh: 3_650, elecRate: 3.4, essPct: 36 },
      { years: 10, days: 24, cutDays: 16, basePop: 4_500_000, popRate: 1.2, baseGwh: 3_800, elecRate: 3.5, essPct: 35 },
      { years: 10, days: 20, cutDays: 12, basePop: 5_200_000, popRate: 1.1, baseGwh: 4_400, elecRate: 3.2, essPct: 33 },
      { years: 12, days: 25, cutDays: 15, basePop: 4_800_000, popRate: 1.3, baseGwh: 4_100, elecRate: 2.9, essPct: 38 },
      { years: 15, days: 30, cutDays: 18, basePop: 5_500_000, popRate: 1.0, baseGwh: 4_900, elecRate: 2.8, essPct: 35 },
    ];

    const windTemplates = [
      (days: number, cut: number, rem: number) =>
        `During a ${days}-day disruption, wind output drops by 50% for ${cut} days and returns to normal for the remaining ${rem} days.`,
      (days: number, cut: number, rem: number) =>
        `During the ${days}-day typhoon disruption, wind output drops by 50% for ${cut} days and operates at normal capacity factor for the remaining ${rem} days.`,
      (days: number, cut: number, rem: number) =>
        `During the ${days}-day crisis, wind output drops by 50% for ${cut} days, then recovers to normal output for the final ${rem} days.`,
      (days: number, cut: number, rem: number) =>
        `During the ${days}-day emergency, wind output drops by 50% for ${cut} days and resumes normal operation for the last ${rem} days.`,
    ];

    const trapPrefixes = ["TRAP", "FLAW", "CLAIM", "ERROR"];

    let scenariosRun = 0;
    for (const cfg of configs) {
      for (let variant = 0; variant < 16; variant++) {
        const remDays = cfg.days - cfg.cutDays;
        const windClause = windTemplates[variant & 3](cfg.days, cfg.cutDays, remDays);
        const useCorridorWater = (variant & 4) === 4;
        const useFourPackages = (variant & 8) === 8;
        const useAltFoodAndFuel = ((variant >> 1) & 1) === 1;
        const trapLabel = trapPrefixes[variant & 3];

        const fuelClause = useAltFoodAndFuel
          ? `Backup diesel generator capacity: 150 MW with on-site fuel reserve of 7,500 MWh.`
          : `Backup diesel generator fleet: 150 MW continuous output, backed by 7,500 MWh of on-site fuel stock.`;

        const waterClause = useCorridorWater
          ? `Normal water treatment capacity across the corridor: 600,000,000 L/day. During the crisis, intake fouling reduces active water treatment to 300,000,000 L/day. Municipal pipe distribution loss: 12% of active treatment output. Coastal emergency reservoir holds 5,000,000,000 L gross storage, of which 90% is usable. Maximum emergency drawdown limit is 300,000,000 L/day.`
          : `The district operates 6 water treatment plants, each rated at 60,000,000 L/day. During the ${cfg.days}-day crisis, 2 water treatment plants go offline completely, and pipe distribution losses are 12%.`;

        const foodClause = useAltFoodAndFuel
          ? `Emergency convoys supply 45% of required daily calories, and incoming food suffers 8% spoilage.`
          : `Disrupted ports deliver 45% of required daily calories, and 8% of delivered food is lost to humidity and spoilage.`;

        const pkgAClause = useAltFoodAndFuel
          ? `- Package A ($42,000,000): Adds 500 MWh of usable storage and increases discharge rating by 50 MW.`
          : `- Package A ($42,000,000): Adds 500 MWh of usable battery storage and 50 MW of discharge capacity.`;

        const pkgBClause = useCorridorWater
          ? `- Package B ($40,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 12% to 6%.`
          : `- Package B ($40,000,000): Restores 2 offline water treatment plants and reduces pipe distribution losses from 12% to 6%.`;

        const pkgDClause = useFourPackages
          ? `\n- Package D ($35,000,000): Expands emergency food logistics to ${useAltFoodAndFuel ? "supply" : "deliver"} 65% of required daily calories with 0% spoilage across all ${cfg.days} days.`
          : "";

        const senseFoodClause = useAltFoodAndFuel
          ? `- Compute the impact when the usable ration stockpile drops by 20%.`
          : `- Compute a 20% reduction in usable food reserve.`;

        const scenarioTag = `SCENARIO-FUZZ-${cfg.years}Y-${cfg.days}D-V${variant}`;
        const prompt = `[VIBE-STRESS-TEST: ${scenarioTag}]
1. DEMOGRAPHICS & ${cfg.years}-YEAR ELECTRICITY GROWTH
- Base population: ${cfg.basePop.toLocaleString("en-US")} people, growing at ${cfg.popRate}% per year compounded for ${cfg.years} years.
- Base annual electricity demand: ${cfg.baseGwh.toLocaleString("en-US")} GWh/year, growing at ${cfg.elecRate}% per year compounded for ${cfg.years} years.
- Essential-service electricity load equals ${cfg.essPct}% of total ${cfg.days}-day electricity demand.

2. GENERATION FLEET & ${cfg.days}-DAY DISRUPTION
- Solar fleet: 500 MW nameplate capacity at a 20% annual capacity factor. During the ${cfg.days}-day disruption, solar output drops by 40% for all ${cfg.days} days.
- Wind fleet: 400 MW nameplate capacity at a 40% annual capacity factor. ${windClause}
- Hydro fleet: 200 MW nameplate capacity at a 50% annual capacity factor. During the ${cfg.days}-day disruption, hydro output drops by 30% for all ${cfg.days} days.
- Utility battery bank: 1,000 MWh usable energy capacity and 250 MW maximum discharge rating (discharged once).
- ${fuelClause}
- Grid distribution and transformer loss: 8% on grid-delivered generation.

3. WATER SUPPLY & TREATMENT
- Normal domestic water demand: 150 L/person/day. Emergency minimum survival water demand: 55 L/person/day.
- ${waterClause}

4. FOOD & NUTRITION SECURITY
- Minimum human calorie requirement: 2,300 kcal/person/day.
- ${foodClause}
- Emergency food reserve: 30,000,000,000 kcal total stockpile, of which 90% is usable.

5. HOSPITAL ICU MEDICAL OXYGEN & CONVOY LOGISTICS
- Regional trauma centers operate 1,000 active ICU beds, and each ICU bed requires 15 L/min of medical oxygen.
- On-site PSA oxygen concentrators normally produce 18,000,000 L/day, but voltage sags reduce active PSA oxygen generation to 12,000,000 L/day during the ${cfg.days}-day crisis.
- Bulk cryogenic liquid oxygen (LOX) storage holds 50,000,000 L gross reserve, with 10% boil-off loss.
- The corridor operates 60 heavy-duty relief trucks, of which 10 relief trucks are offline. Each active truck carries a payload capacity of 20 metric tons per trip and completes 2 round-trips/day across the ${cfg.days}-day crisis, burning 100 L of diesel per round-trip.

6. CYBERSECURITY
- The corridor operates 40,000 network endpoints, of which 25% are linked to grid and desalination telemetry.
- During the crisis, 15% of linked telemetry nodes are compromised, and 20% of compromised nodes control critical services.
- Baseline automated containment isolates 60% of compromised nodes.

7. MITIGATION CAPITAL BUDGET ($110,000,000 CAP) & ECONOMIC LOSS AVOIDANCE
- Unmitigated daily economic loss is $10,000,000/day across the ${cfg.days}-day crisis. Deploying the cost-feasible mitigation pack avoids 60% of the total ${cfg.days}-day economic loss.
- Total emergency capital budget: $110,000,000.
${pkgAClause}
${pkgBClause}
- Package C ($25,000,000): Upgrades automated cyber containment to isolate 90% of compromised telemetry nodes.${pkgDClause}

8. SENSITIVITY & TRAP AUDIT
- Compute the Year ${cfg.years} population spread under a ±10% sensitivity on the ${cfg.popRate}% annual population growth rate.
- Compute the Year ${cfg.years} annual electricity demand spread under a ±15% sensitivity on the ${cfg.elecRate}% annual electricity growth rate.
${senseFoodClause}
- ${trapLabel} 1: Claims linear population growth, claims Package B ($99,000,000) restores 100% of lost water capacity, and claims the 30,000,000,000 kcal reserve has 0% spoilage.`;

        const rows = hardRows(prompt);
        const expectedPop = Math.round(cfg.basePop * Math.pow(1 + cfg.popRate / 100, cfg.years));
        const expectedEnergy = Number((cfg.baseGwh * Math.pow(1 + cfg.elecRate / 100, cfg.years)).toFixed(3));
        assert.equal(rows.find((r) => r.id === `population-${cfg.years}`)?.quantity, expectedPop, `${scenarioTag} population`);
        assert.equal(rows.find((r) => r.id === `energy-${cfg.years}`)?.quantity, expectedEnergy, `${scenarioTag} energy`);
        assert.ok(rows.find((r) => r.id === `energy-essential-${cfg.days}d`), `${scenarioTag} essential demand`);
        assert.ok(rows.find((r) => r.id === "days-wind"), `${scenarioTag} days-wind`);
        assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 5, `${scenarioTag} battery-package-a`);
        assert.equal(rows.find((r) => r.id === "generator-stock")?.quantity, 7.5, `${scenarioTag} generator-stock`);
        assert.ok(rows.find((r) => r.id === "water-package-b"), `${scenarioTag} water-package-b`);
        if (useCorridorWater) {
          assert.equal(rows.find((r) => r.id === "water-reservoir-usable")?.quantity, 4_500_000_000, `${scenarioTag} water-reservoir-usable`);
          assert.equal(rows.find((r) => r.id === "water-days")?.quantity, 15, `${scenarioTag} water-days`);
        }
        assert.equal(rows.filter((r) => r.id === "food-usable-reserve").length, 1, `${scenarioTag} unique food-usable-reserve`);
        assert.equal(rows.find((r) => r.id === "sense-food-reserve")?.quantity, 5_400_000_000, `${scenarioTag} sense-food-reserve`);
        assert.equal(rows.find((r) => r.id === "oxygen-daily")?.quantity, 21_600_000, `${scenarioTag} oxygen-daily`);
        assert.equal(rows.find((r) => r.id === "oxygen-lox-usable")?.quantity, 45_000_000, `${scenarioTag} oxygen-lox-usable`);
        assert.equal(rows.find((r) => r.id === "logistics-daily-tonnage")?.quantity, 2_000, `${scenarioTag} logistics-daily-tonnage`);
        assert.equal(rows.find((r) => r.id === "logistics-window-tonnage")?.quantity, 2_000 * cfg.days, `${scenarioTag} logistics-window-tonnage`);
        assert.equal(rows.find((r) => r.id === "econ-loss-window")?.quantity, 10_000_000 * cfg.days, `${scenarioTag} econ-loss-window`);
        assert.equal(rows.find((r) => r.id === "cyber-package-c")?.quantity, 1_350, `${scenarioTag} cyber-package-c`);
        assert.equal(rows.find((r) => r.id === "option-total")?.quantity, useFourPackages ? 142_000_000 : 107_000_000, `${scenarioTag} option-total`);
        if (useFourPackages) {
          assert.ok(rows.find((r) => r.id === "food-package-d"), `${scenarioTag} food-package-d`);
        }

        const rendered = attachHard(prompt, "Incomplete draft");
        assert.match(rendered, new RegExp(scenarioTag));
        assert.doesNotMatch(rendered, /DISCREPANCY/);
        assert.doesNotMatch(rendered, /not stated/);
        scenariosRun += 1;
      }
    }
    assert.equal(scenariosRun, 240);
  });

  it("solves SCENARIO-99E4B1C8 11-domain master stress test covering Medical Oxygen/LOX, Convoy Logistics, and Economic BCR", () => {
    const prompt99E = `[VIBE-STRESS-TEST: SCENARIO-99E4B1C8 — 8-YEAR / 18-DAY BIO-DEFENSE, SUBSEA INTERTIE & HOSPITAL OXYGEN CORRIDOR CRISIS]
Treat every number below as scenario-specific input for THIS prompt only. Recompute every metric from first principles, audit and reject all 10 flawed consultant claims, evaluate all 16 mitigation package combinations against the capital budget, and provide a phased emergency plan.

1. DEMOGRAPHICS & 8-YEAR ELECTRICITY GROWTH
- Base population (Year 0): 3,200,000 residents, growing at 1.5% per year compounded for 8 years.
- Base annual electricity demand (Year 0): 2,800 GWh/year, growing at 3.2% per year compounded for 8 years.
- Essential-service electricity load equals 38% of total 18-day electricity demand.

2. GENERATION FLEET, 18-DAY SUBSEA INTERTIE DISRUPTION & STORAGE
- Solar fleet: 500 MW nameplate capacity at a 20% annual capacity factor. During the 18-day disruption, solar output drops by 35% for all 18 days.
- Wind fleet: 400 MW nameplate capacity at a 45% annual capacity factor. During the 18-day disruption, wind output drops by 50% for 12 days and operates at normal capacity factor for the remaining 6 days.
- Hydro fleet: 220 MW nameplate capacity at a 50% annual capacity factor. During the 18-day disruption, hydro output drops by 25% for all 18 days.
- Utility battery bank: 1,000 MWh usable energy capacity and 250 MW maximum discharge rating (discharged once during the 18-day crisis).
- Backup diesel generator fleet: 150 MW continuous output, backed by 6,000 MWh of on-site fuel stock. Checkpoints are evaluated at 24 hours and 48 hours of continuous full-load operation.
- Grid distribution and transformer loss: 6% of all generated and discharged electricity before delivery.

3. DESALINATION, RESERVOIR & WATER DISTRIBUTION
- Normal domestic water demand: 150 L/person/day at Year 8 population.
- Emergency minimum survival water demand: 55 L/person/day at Year 8 population.
- Normal water treatment capacity across the corridor: 500,000,000 L/day. During the crisis, intake fouling reduces active water treatment to 250,000,000 L/day.
- Municipal pipe distribution loss: 10% of active treatment output.
- Coastal emergency reservoir: 4,000,000,000 L gross storage, of which 90% is usable, with a fixed emergency drawdown limit of 300,000,000 L/day.

4. PORT FOOD SUPPLY & EMERGENCY RATION STOCKPILE
- Minimum human calorie requirement: 2,400 kcal/person/day at Year 8 population.
- During the 18-day port closure, emergency rail corridors deliver 50% of required daily calories, and 10% of delivered food is lost to humidity and spoilage.
- Emergency food reserve: 30,000,000,000 kcal total stockpile, of which 90% is usable.

5. HOSPITAL ICU MEDICAL OXYGEN & CRYOGENIC LOX RESERVE
- Regional trauma centers operate 1,200 active ICU beds, and each ICU bed requires 15 L/min of medical oxygen.
- On-site PSA oxygen concentrators normally produce 20,000,000 L/day, but voltage sags reduce active PSA oxygen generation to 12,000,000 L/day during the 18-day crisis.
- Bulk cryogenic liquid oxygen (LOX) storage holds 80,000,000 L gross reserve, with 8% boil-off loss during vaporization.

6. EMERGENCY RELIEF CONVOY LOGISTICS & FLEET FUEL BURN
- The corridor operates 80 heavy-duty relief trucks, of which 20 relief trucks are offline due to flood damage.
- Each active truck carries a payload capacity of 25 metric tons per trip and completes 2 round-trips/day across the 18-day crisis, burning 120 L of diesel per round-trip.

7. TELEMETRY & INDUSTRIAL CONTROL CYBERSECURITY
- The corridor operates 40,000 network endpoints, of which 30% are linked to grid and hospital telemetry.
- During the crisis, a coordinated intrusion compromises 12% of linked telemetry nodes, and 25% of compromised nodes control critical services.
- Baseline automated containment isolates 65% of compromised nodes.

8. MITIGATION CAPITAL BUDGET ($95,000,000 HARD CAP) & ECONOMIC LOSS AVOIDANCE
- Unmitigated daily economic loss across the bio-defense and industrial corridor is $15,000,000/day across the 18-day crisis. Deploying the cost-feasible mitigation pack avoids 60% of the total 18-day economic loss.
- Capital budget cap: $95,000,000.
- Package A ($38,000,000): Adds 500 MWh of usable battery storage and 50 MW of discharge capacity.
- Package B ($34,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 10% to 5%.
- Package C ($24,000,000): Upgrades automated cyber containment to isolate 90% of compromised telemetry nodes.
- Package D ($32,000,000): Expands emergency food logistics to deliver 70% of required daily calories with 0% spoilage across all 18 days.
- Option E (Unpriced Vendor Proposal): Experimental hydrogen fuel-cell barge with no capital cost provided.

9. SENSITIVITY ANALYSIS
- Compute the Year 8 population spread under a ±10% sensitivity on the 1.5% annual population growth rate.
- Compute the Year 8 annual electricity demand spread under a ±15% sensitivity on the 3.2% annual electricity growth rate.
- Compute the impact of a 20% reduction in usable food reserve.

10. DRAFT CONSULTANT MEMO CLAIMS TO AUDIT (REJECT ALL 10 TRAPS)
- TRAP 1: Claims Year 8 population is 3,584,000 using simple linear growth.
- TRAP 2: Claims the 1,000 MWh battery provides 18,000 MWh over 18 days by discharging daily.
- TRAP 3: Claims the 50% wind cut for 12 days removes 50% of annual wind generation.
- TRAP 4: Claims the 150 MW diesel generator delivers 7.20 GWh over a 48-hour continuous run without hitting its 6,000 MWh fuel stock limit.
- TRAP 5: Claims Package B ($99,000,000) delivers 480,000,000 L/day by ignoring unrecovered capacity and 5% pipe loss.
- TRAP 6: Claims the 30,000,000,000 kcal food reserve has 0% spoilage.
- TRAP 7: Claims all 4 priced packages (A + B + C + D = $128,000,000) fit within the $95,000,000 budget.
- TRAP 8: Claims ICU oxygen demand is only 18,000 L/day by forgetting to multiply 15 L/min by 1,440 minutes/day.
- TRAP 9: Claims all 80 relief trucks are active and deliver 4,000 tons/day.
- TRAP 10: Claims the 1,440 compromised telemetry nodes prove a total corridor blackout.`;

    const rows = hardRows(prompt99E);
    assert.equal(rows.find((r) => r.id === "population-8")?.quantity, 3_604_776);
    assert.equal(rows.find((r) => r.id === "energy-8")?.quantity, 3_602.43);
    assert.equal(rows.find((r) => r.id === "energy-demand-18d")?.quantity, 177.65);
    assert.equal(rows.find((r) => r.id === "energy-essential-18d")?.quantity, 67.51);
    assert.equal(rows.find((r) => r.id === "days-wind")?.quantity, 51.84);
    assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 5);
    assert.equal(rows.find((r) => r.id === "generator-stock")?.quantity, 6);
    assert.equal(rows.find((r) => r.id === "generator-48")?.quantity, 6);
    assert.equal(rows.find((r) => r.id === "water-reservoir-usable")?.quantity, 3_600_000_000);
    assert.equal(rows.find((r) => r.id === "water-days")?.quantity, 12);
    assert.equal(rows.find((r) => r.id === "water-package-b")?.quantity, 427_500_000);
    assert.equal(rows.find((r) => r.id === "food-package-d")?.quantity, 46_717_896_960);
    assert.equal(rows.find((r) => r.id === "oxygen-daily")?.quantity, 25_920_000);
    assert.equal(rows.find((r) => r.id === "oxygen-psa-active")?.quantity, 12_000_000);
    assert.equal(rows.find((r) => r.id === "oxygen-lox-usable")?.quantity, 73_600_000);
    assert.equal(rows.find((r) => r.id === "oxygen-net-deficit")?.quantity, 176_960_000);
    assert.equal(rows.find((r) => r.id === "logistics-daily-tonnage")?.quantity, 3_000);
    assert.equal(rows.find((r) => r.id === "logistics-window-tonnage")?.quantity, 54_000);
    assert.equal(rows.find((r) => r.id === "logistics-fuel-burn")?.quantity, 259_200);
    assert.equal(rows.find((r) => r.id === "cyber-package-c")?.quantity, 1_296);
    assert.equal(rows.find((r) => r.id === "option-total")?.quantity, 128_000_000);
    assert.equal(rows.find((r) => r.id === "cost-pack")?.quantity, 90_000_000);
    assert.equal(rows.find((r) => r.id === "econ-loss-window")?.quantity, 270_000_000);
    assert.equal(rows.find((r) => r.id === "econ-loss-avoided")?.quantity, 162_000_000);
    assert.equal(rows.find((r) => r.id === "econ-net-benefit")?.quantity, 72_000_000);
    assert.equal(rows.find((r) => r.id === "econ-bcr")?.quantity, 1.8);

    const rendered = attachHard(prompt99E, "Incomplete draft mentioning Package D with 0% spoilage and rejecting TRAP 6 claim of 0% spoilage.");
    assert.match(rendered, /SCENARIO-99E4B1C8/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves SCENARIO-16D-OMEGA 16-domain master stress test with 76+ verified metrics and zero discrepancies", () => {
    const prompt16D = `[VIBE-STRESS-TEST: SCENARIO-16D-OMEGA — 16-DOMAIN NATIONAL INFRASTRUCTURE, CLINICAL, TELECOM & ENVIRONMENTAL RESILIENCE AUDIT]
Treat every number below as scenario-specific input for THIS prompt only. Recompute every metric across all 16 domains from first principles, reject all consultant traps, and evaluate all 16 mitigation package combinations.

1. DEMOGRAPHICS & 8-YEAR ELECTRICITY GROWTH
- Base population (Year 0): 3,200,000 residents, growing at 1.5% per year compounded for 8 years.
- Base annual electricity demand (Year 0): 2,800 GWh/year, growing at 3.2% per year compounded for 8 years.
- Essential-service electricity load equals 38% of total 18-day electricity demand.

2. GENERATION FLEET, 18-DAY DISRUPTION & STORAGE
- Solar fleet: 500 MW nameplate capacity at a 20% annual capacity factor. During the 18-day disruption, solar output drops by 35% for all 18 days.
- Wind fleet: 400 MW nameplate capacity at a 45% annual capacity factor. During the 18-day disruption, wind output drops by 50% for 12 days and operates at normal capacity factor for the remaining 6 days.
- Hydro fleet: 220 MW nameplate capacity at a 50% annual capacity factor. During the 18-day disruption, hydro output drops by 25% for all 18 days.
- Utility battery bank: 1,000 MWh usable energy capacity and 250 MW maximum discharge rating (discharged once).
- Backup diesel generator fleet: 150 MW continuous output, backed by 6,000 MWh of on-site fuel stock. Checkpoints are evaluated at 24 hours and 48 hours.
- Grid distribution and transformer loss: 6% of all generated and discharged electricity before delivery.

3. DESALINATION, RESERVOIR & WATER DISTRIBUTION
- Normal domestic water demand: 150 L/person/day at Year 8 population.
- Emergency minimum survival water demand: 55 L/person/day at Year 8 population.
- Normal water treatment capacity across the corridor: 500,000,000 L/day. During the crisis, intake fouling reduces active water treatment to 250,000,000 L/day.
- Municipal pipe distribution loss: 10% of active treatment output.
- Coastal emergency reservoir: 4,000,000,000 L gross storage, of which 90% is usable, with a fixed emergency drawdown limit of 300,000,000 L/day.

4. PORT FOOD SUPPLY & EMERGENCY RATION STOCKPILE
- Minimum human calorie requirement: 2,400 kcal/person/day at Year 8 population.
- During the 18-day port closure, emergency rail corridors deliver 50% of required daily calories, and 10% of delivered food is lost to humidity and spoilage.
- Emergency food reserve: 30,000,000,000 kcal total stockpile, of which 90% is usable.

5. HOSPITAL ICU MEDICAL OXYGEN & CRYOGENIC LOX RESERVE
- Regional trauma centers operate 1,200 active ICU beds, and each ICU bed requires 15 L/min of medical oxygen.
- On-site PSA oxygen concentrators normally produce 20,000,000 L/day, but voltage sags reduce active PSA oxygen generation to 12,000,000 L/day during the 18-day crisis.
- Bulk cryogenic liquid oxygen (LOX) storage holds 80,000,000 L gross reserve, with 8% boil-off loss during vaporization.

6. EMERGENCY RELIEF CONVOY LOGISTICS & FLEET FUEL BURN
- The corridor operates 80 heavy-duty relief trucks, of which 20 relief trucks are offline due to flood damage.
- Each active truck carries a payload capacity of 25 metric tons per trip and completes 2 round-trips/day across the 18-day crisis, burning 120 L of diesel per round-trip.

7. TELEMETRY & INDUSTRIAL CONTROL CYBERSECURITY
- The corridor operates 40,000 network endpoints, of which 30% are linked to grid and hospital telemetry.
- During the crisis, a coordinated intrusion compromises 12% of linked telemetry nodes, and 25% of compromised nodes control critical services.
- Baseline automated containment isolates 65% of compromised nodes.

8. EMERGENCY TELECOMMUNICATIONS & SATELLITE BACKHAUL
- The corridor operates 400 5G base stations, of which 120 base stations are offline due to storm damage.
- Each active station provides 0.5 Gbps of backhaul capacity, while emergency command bandwidth requirement is 200 Gbps.

9. PHARMACEUTICAL COLD-CHAIN & VACCINE POTENCY
- The cold-chain vaccine stockpile holds 500,000 vials, with 12% lost to thermal excursion during freezer transfer.
- Each vial contains 5 doses/vial, and the emergency immunization target is 75% of the Year 8 population.

10. WASTEWATER & SEWAGE OVERFLOW CONTAINMENT
- Municipal wastewater inflow is 400,000,000 L/day, while storm surge reduces active sewage treatment capacity to 260,000,000 L/day across the 18-day crisis.

11. EMERGENCY SHELTER & EVACUATION SURGE
- During the typhoon, 5% of the Year 8 population are displaced and require emergency shelter.
- The corridor operates 120 municipal shelters, each holding 1,200 beds.

12. DIESEL GENERATOR CARBON EMISSIONS & SOCIAL COST
- Backup diesel generator emission factor is 0.75 metric tons CO2/MWh across the 6,000 MWh one-time fuel stock, and the social cost of carbon is $80/ton CO2.

13. MITIGATION CAPITAL BUDGET ($95,000,000 HARD CAP) & ECONOMIC LOSS AVOIDANCE
- Unmitigated daily economic loss is $15,000,000/day across the 18-day crisis. Deploying the cost-feasible mitigation pack avoids 60% of the total 18-day economic loss.
- Capital budget cap: $95,000,000.
- Package A ($38,000,000): Adds 500 MWh of usable battery storage and 50 MW of discharge capacity.
- Package B ($34,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 10% to 5%.
- Package C ($24,000,000): Upgrades automated cyber containment to isolate 90% of compromised telemetry nodes.
- Package D ($32,000,000): Expands emergency food logistics to deliver 70% of required daily calories with 0% spoilage across all 18 days.

14. SENSITIVITY ANALYSIS
- Compute the Year 8 population spread under a ±10% sensitivity on the 1.5% annual population growth rate.
- Compute the Year 8 annual electricity demand spread under a ±15% sensitivity on the 3.2% annual electricity growth rate.
- Compute the impact of a 20% reduction in usable food reserve.`;

    const rows = hardRows(prompt16D);
    assert.equal(rows.find((r) => r.id === "telecom-towers-active")?.quantity, 280);
    assert.equal(rows.find((r) => r.id === "telecom-backhaul-gbps")?.quantity, 140);
    assert.equal(rows.find((r) => r.id === "telecom-bandwidth-deficit")?.quantity, 60);
    assert.equal(rows.find((r) => r.id === "pharma-vials-usable")?.quantity, 440_000);
    assert.equal(rows.find((r) => r.id === "pharma-doses-usable")?.quantity, 2_200_000);
    assert.equal(rows.find((r) => r.id === "pharma-coverage-gap")?.quantity, 503_582);
    assert.equal(rows.find((r) => r.id === "wastewater-daily-inflow")?.quantity, 400_000_000);
    assert.equal(rows.find((r) => r.id === "wastewater-active-treatment")?.quantity, 260_000_000);
    assert.equal(rows.find((r) => r.id === "wastewater-untreated-overflow")?.quantity, 2_520_000_000);
    assert.equal(rows.find((r) => r.id === "shelter-displaced-people")?.quantity, 180_239);
    assert.equal(rows.find((r) => r.id === "shelter-capacity-total")?.quantity, 144_000);
    assert.equal(rows.find((r) => r.id === "shelter-unhoused-gap")?.quantity, 36_239);
    assert.equal(rows.find((r) => r.id === "emissions-diesel-co2-tons")?.quantity, 4_500);
    assert.equal(rows.find((r) => r.id === "emissions-social-cost-usd")?.quantity, 360_000);

    const rendered = attachHard(prompt16D, "Incomplete draft mentioning Package D with 0% spoilage.");
    const badLines = rendered.split("\n").filter((l) => /not stated|DISCREPANCY/i.test(l));
    if (badLines.length) console.log("BAD LINES IN 16D:", badLines);
    assert.match(rendered, /SCENARIO-16D-OMEGA/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves SCENARIO-24D-APEX 24-domain universal stress test with 103+ verified metrics and zero discrepancies", () => {
    const prompt24D = "[VIBE-STRESS-TEST: SCENARIO-24D-APEX — 24-DOMAIN UNIVERSAL ENGINEERING, CLINICAL, FINANCIAL, FAB, SRE, AVIATION, RADIOLOGICAL, AGRICULTURAL & REINSURANCE AUDIT]\nTreat every number below as scenario-specific input for THIS prompt only. Recompute every metric across all 24 domains from first principles, reject all consultant traps, and evaluate all 16 mitigation package combinations.\n\n1. DEMOGRAPHICS & 8-YEAR ELECTRICITY GROWTH\n- Base population (Year 0): 3,200,000 residents, growing at 1.5% per year compounded for 8 years.\n- Base annual electricity demand (Year 0): 2,800 GWh/year, growing at 3.2% per year compounded for 8 years.\n- Essential-service electricity load equals 38% of total 18-day electricity demand.\n\n2. GENERATION FLEET, 18-DAY DISRUPTION & STORAGE\n- Solar fleet: 500 MW nameplate capacity at a 20% annual capacity factor. During the 18-day disruption, solar output drops by 35% for all 18 days.\n- Wind fleet: 400 MW nameplate capacity at a 45% annual capacity factor. During the 18-day disruption, wind output drops by 50% for 12 days and operates at normal capacity factor for the remaining 6 days.\n- Hydro fleet: 220 MW nameplate capacity at a 50% annual capacity factor. During the 18-day disruption, hydro output drops by 25% for all 18 days.\n- Utility battery bank: 1,000 MWh usable energy capacity and 250 MW maximum discharge rating (discharged once).\n- Backup diesel generator fleet: 150 MW continuous output, backed by 6,000 MWh of on-site fuel stock. Checkpoints are evaluated at 24 hours and 48 hours.\n- Grid distribution and transformer loss: 6% of all generated and discharged electricity before delivery.\n\n3. DESALINATION, RESERVOIR & WATER DISTRIBUTION\n- Normal domestic water demand: 150 L/person/day at Year 8 population.\n- Emergency minimum survival water demand: 55 L/person/day at Year 8 population.\n- Normal water treatment capacity across the corridor: 500,000,000 L/day. During the crisis, intake fouling reduces active water treatment to 250,000,000 L/day.\n- Municipal pipe distribution loss: 10% of active treatment output.\n- Coastal emergency reservoir: 4,000,000,000 L gross storage, of which 90% is usable, with a fixed emergency drawdown limit of 300,000,000 L/day.\n\n4. PORT FOOD SUPPLY & EMERGENCY RATION STOCKPILE\n- Minimum human calorie requirement: 2,400 kcal/person/day at Year 8 population.\n- During the 18-day port closure, emergency rail corridors deliver 50% of required daily calories, and 10% of delivered food is lost to humidity and spoilage.\n- Emergency food reserve: 30,000,000,000 kcal total stockpile, of which 90% is usable.\n\n5. HOSPITAL ICU MEDICAL OXYGEN & CRYOGENIC LOX RESERVE\n- Regional trauma centers operate 1,200 active ICU beds, and each ICU bed requires 15 L/min of medical oxygen.\n- On-site PSA oxygen concentrators normally produce 20,000,000 L/day, but voltage sags reduce active PSA oxygen generation to 12,000,000 L/day during the 18-day crisis.\n- Bulk cryogenic liquid oxygen (LOX) storage holds 80,000,000 L gross reserve, with 8% boil-off loss during vaporization.\n\n6. EMERGENCY RELIEF CONVOY LOGISTICS & FLEET FUEL BURN\n- The corridor operates 80 heavy-duty relief trucks, of which 20 relief trucks are offline due to flood damage.\n- Each active truck carries a payload capacity of 25 metric tons per trip and completes 2 round-trips/day across the 18-day crisis, burning 120 L of diesel per round-trip.\n\n7. TELEMETRY & INDUSTRIAL CONTROL CYBERSECURITY\n- The corridor operates 40,000 network endpoints, of which 30% are linked to grid and hospital telemetry.\n- During the crisis, a coordinated intrusion compromises 12% of linked telemetry nodes, and 25% of compromised nodes control critical services.\n- Baseline automated containment isolates 65% of compromised nodes.\n\n8. EMERGENCY TELECOMMUNICATIONS & SATELLITE BACKHAUL\n- The corridor operates 400 5G base stations, of which 120 base stations are offline due to storm damage.\n- Each active station provides 0.5 Gbps of backhaul capacity, while emergency command bandwidth requirement is 200 Gbps.\n\n9. PHARMACEUTICAL COLD-CHAIN & VACCINE POTENCY\n- The cold-chain vaccine stockpile holds 500,000 vials, with 12% lost to thermal excursion during freezer transfer.\n- Each vial contains 5 doses/vial, and the emergency immunization target is 75% of the Year 8 population.\n\n10. WASTEWATER & SEWAGE OVERFLOW CONTAINMENT\n- Municipal wastewater inflow is 400,000,000 L/day, while storm surge reduces active sewage treatment capacity to 260,000,000 L/day across the 18-day crisis.\n\n11. EMERGENCY SHELTER & EVACUATION SURGE\n- During the typhoon, 5% of the Year 8 population are displaced and require emergency shelter.\n- The corridor operates 120 municipal shelters, each holding 1,200 beds.\n\n12. DIESEL GENERATOR CARBON EMISSIONS & SOCIAL COST\n- Backup diesel generator emission factor is 0.75 metric tons CO2/MWh across the 6,000 MWh one-time fuel stock, and the social cost of carbon is $80/ton CO2.\n\n13. EPIDEMIOLOGY & PANDEMIC VENTILATOR SURGE\n- Secondary waterborne epidemic attack rate infects 8% of the Year 8 population, 15% of infected cases require hospitalization, and 20% of hospitalized patients require mechanical ventilators, while the hospital network holds 2,000 active mechanical ventilators.\n\n14. INFRASTRUCTURE BOND CORPORATE FINANCE, DSCR & NPV\n- Resilience infrastructure bond generates $120,000,000/year in gross revenue with $45,000,000/year in operating expenses, annual debt service payment is $50,000,000/year, and cash flows are discounted over a 5-year horizon at a 10% annual discount rate against an upfront capital outlay of $250,000,000.\n\n15. SEMICONDUCTOR FAB YIELD & LITTLE'S LAW WIP\n- Corridor semiconductor fab starts 10,000 wafers, with 8% scrapped due to cleanroom excursion, and each usable wafer yields 250 good dies/wafer. Continuous fab throughput is 400 wafers/day with an average cycle time of 14 days.\n\n16. AI DATACENTER SRE, PUE & SLA ERROR BUDGET\n- Regional AI datacenter cluster draws 80 MW of IT compute load at a Power Usage Effectiveness (PUE) of 1.25. Its (43,200-minute) monthly SLA target is 99.9% availability, and the cluster experiences 105 minutes of unplanned outage.\n\n17. AVIATION AIRLIFT & MARITIME PORT TEU BACKLOG\n- Emergency airlift wing operates 15 cargo aircraft, each flying 3 sorties/day with 40 tons/sortie across the 18-day crisis. Meanwhile, the container port receives 6,000 TEU/day of inbound cargo while crane damage limits unloading to 4,200 TEU/day.\n\n18. RADIOLOGICAL ISOTOPE HALF-LIFE DECAY & DOSIMETRY\n- Hospital medical isotope release has an initial activity of 1,600 TBq with a half-life of 6 days, evaluated after 24 days against a safe clearance limit of 40 TBq.\n\n19. AGRICULTURAL CROP YIELD & GRAIN SILO POST-HARVEST BALANCE\n- Regional breadbasket harvests 50,000 hectares at a baseline yield of 4 tons/hectare; flooding destroys 20% of the standing crop, and 5% of harvested grain is lost to post-harvest silo moisture, against an emergency grain consumption requirement is 190,000 tons.\n\n20. SOVEREIGN CATASTROPHE REINSURANCE TREATY\n- Sovereign catastrophe reinsurance treaty covers a $240,000,000 gross insured infrastructure loss with a $40,000,000 attachment deductible, 80% reinsurer coinsurance share above the deductible, and a $130,000,000 policy payout cap.\n\n21. MITIGATION CAPITAL BUDGET ($95,000,000 HARD CAP) & ECONOMIC LOSS AVOIDANCE\n- Unmitigated daily economic loss is $15,000,000/day across the 18-day crisis. Deploying the cost-feasible mitigation pack avoids 60% of the total 18-day economic loss.\n- Capital budget cap: $95,000,000.\n- Package A ($38,000,000): Adds 500 MWh of usable battery storage and 50 MW of discharge capacity.\n- Package B ($34,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 10% to 5%.\n- Package C ($24,000,000): Upgrades automated cyber containment to isolate 90% of compromised telemetry nodes.\n- Package D ($32,000,000): Expands emergency food logistics to deliver 70% of required daily calories with 0% spoilage across all 18 days.\n\n22. SENSITIVITY ANALYSIS\n- Compute the Year 8 population spread under a ±10% sensitivity on the 1.5% annual population growth rate.\n- Compute the Year 8 annual electricity demand spread under a ±15% sensitivity on the 3.2% annual electricity growth rate.\n- Compute the impact of a 20% reduction in usable food reserve.";

    const rows = hardRows(prompt24D);
    assert.equal(rows.find((r) => r.id === "epi-infected-cases")?.quantity, 288_382);
    assert.equal(rows.find((r) => r.id === "epi-hospitalized-patients")?.quantity, 43_257);
    assert.equal(rows.find((r) => r.id === "epi-ventilator-demand")?.quantity, 8_651);
    assert.equal(rows.find((r) => r.id === "epi-ventilator-deficit")?.quantity, 6_651);
    assert.equal(rows.find((r) => r.id === "fin-annual-noi")?.quantity, 75_000_000);
    assert.equal(rows.find((r) => r.id === "fin-debt-service")?.quantity, 50_000_000);
    assert.equal(rows.find((r) => r.id === "fin-dscr")?.quantity, 1.5);
    assert.equal(rows.find((r) => r.id === "fin-npv")?.quantity, 34_309_008);
    assert.equal(rows.find((r) => r.id === "fab-usable-wafers")?.quantity, 9_200);
    assert.equal(rows.find((r) => r.id === "fab-good-dies")?.quantity, 2_300_000);
    assert.equal(rows.find((r) => r.id === "fab-littles-law-wip")?.quantity, 5_600);
    assert.equal(rows.find((r) => r.id === "sre-total-facility-mw")?.quantity, 100);
    assert.equal(rows.find((r) => r.id === "sre-allowed-downtime-min")?.quantity, 43.2);
    assert.equal(rows.find((r) => r.id === "sre-unplanned-breach-min")?.quantity, 61.8);
    assert.equal(rows.find((r) => r.id === "airlift-daily-tonnage")?.quantity, 1_800);
    assert.equal(rows.find((r) => r.id === "airlift-window-tonnage")?.quantity, 32_400);
    assert.equal(rows.find((r) => r.id === "port-teu-backlog")?.quantity, 32_400);
    assert.equal(rows.find((r) => r.id === "rad-half-lives")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "rad-residual-activity")?.quantity, 100);
    assert.equal(rows.find((r) => r.id === "rad-excess-above-limit")?.quantity, 60);
    assert.equal(rows.find((r) => r.id === "agri-gross-harvest-tons")?.quantity, 160_000);
    assert.equal(rows.find((r) => r.id === "agri-net-usable-grain-tons")?.quantity, 152_000);
    assert.equal(rows.find((r) => r.id === "agri-import-gap-tons")?.quantity, 38_000);
    assert.equal(rows.find((r) => r.id === "ins-covered-loss-before-cap")?.quantity, 160_000_000);
    assert.equal(rows.find((r) => r.id === "ins-payout-capped")?.quantity, 130_000_000);
    assert.equal(rows.find((r) => r.id === "ins-uncovered-exposure")?.quantity, 110_000_000);

    const rendered = attachHard(prompt24D, "Incomplete draft mentioning Package D with 0% spoilage.");
    assert.match(rendered, /SCENARIO-24D-APEX/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves SCENARIO-36D-OMNIVERSE 36-domain Grok/ChatGPT frontier stress test with 141 verified metrics and zero discrepancies", () => {
    const prompt36D = "[VIBE-STRESS-TEST: SCENARIO-36D-OMNIVERSE — 24-DOMAIN UNIVERSAL ENGINEERING, CLINICAL, FINANCIAL, FAB, SRE, AVIATION, RADIOLOGICAL, AGRICULTURAL & REINSURANCE AUDIT]\nTreat every number below as scenario-specific input for THIS prompt only. Recompute every metric across all 24 domains from first principles, reject all consultant traps, and evaluate all 16 mitigation package combinations.\n\n1. DEMOGRAPHICS & 8-YEAR ELECTRICITY GROWTH\n- Base population (Year 0): 3,200,000 residents, growing at 1.5% per year compounded for 8 years.\n- Base annual electricity demand (Year 0): 2,800 GWh/year, growing at 3.2% per year compounded for 8 years.\n- Essential-service electricity load equals 38% of total 18-day electricity demand.\n\n2. GENERATION FLEET, 18-DAY DISRUPTION & STORAGE\n- Solar fleet: 500 MW nameplate capacity at a 20% annual capacity factor. During the 18-day disruption, solar output drops by 35% for all 18 days.\n- Wind fleet: 400 MW nameplate capacity at a 45% annual capacity factor. During the 18-day disruption, wind output drops by 50% for 12 days and operates at normal capacity factor for the remaining 6 days.\n- Hydro fleet: 220 MW nameplate capacity at a 50% annual capacity factor. During the 18-day disruption, hydro output drops by 25% for all 18 days.\n- Utility battery bank: 1,000 MWh usable energy capacity and 250 MW maximum discharge rating (discharged once).\n- Backup diesel generator fleet: 150 MW continuous output, backed by 6,000 MWh of on-site fuel stock. Checkpoints are evaluated at 24 hours and 48 hours.\n- Grid distribution and transformer loss: 6% of all generated and discharged electricity before delivery.\n\n3. DESALINATION, RESERVOIR & WATER DISTRIBUTION\n- Normal domestic water demand: 150 L/person/day at Year 8 population.\n- Emergency minimum survival water demand: 55 L/person/day at Year 8 population.\n- Normal water treatment capacity across the corridor: 500,000,000 L/day. During the crisis, intake fouling reduces active water treatment to 250,000,000 L/day.\n- Municipal pipe distribution loss: 10% of active treatment output.\n- Coastal emergency reservoir: 4,000,000,000 L gross storage, of which 90% is usable, with a fixed emergency drawdown limit of 300,000,000 L/day.\n\n4. PORT FOOD SUPPLY & EMERGENCY RATION STOCKPILE\n- Minimum human calorie requirement: 2,400 kcal/person/day at Year 8 population.\n- During the 18-day port closure, emergency rail corridors deliver 50% of required daily calories, and 10% of delivered food is lost to humidity and spoilage.\n- Emergency food reserve: 30,000,000,000 kcal total stockpile, of which 90% is usable.\n\n5. HOSPITAL ICU MEDICAL OXYGEN & CRYOGENIC LOX RESERVE\n- Regional trauma centers operate 1,200 active ICU beds, and each ICU bed requires 15 L/min of medical oxygen.\n- On-site PSA oxygen concentrators normally produce 20,000,000 L/day, but voltage sags reduce active PSA oxygen generation to 12,000,000 L/day during the 18-day crisis.\n- Bulk cryogenic liquid oxygen (LOX) storage holds 80,000,000 L gross reserve, with 8% boil-off loss during vaporization.\n\n6. EMERGENCY RELIEF CONVOY LOGISTICS & FLEET FUEL BURN\n- The corridor operates 80 heavy-duty relief trucks, of which 20 relief trucks are offline due to flood damage.\n- Each active truck carries a payload capacity of 25 metric tons per trip and completes 2 round-trips/day across the 18-day crisis, burning 120 L of diesel per round-trip.\n\n7. TELEMETRY & INDUSTRIAL CONTROL CYBERSECURITY\n- The corridor operates 40,000 network endpoints, of which 30% are linked to grid and hospital telemetry.\n- During the crisis, a coordinated intrusion compromises 12% of linked telemetry nodes, and 25% of compromised nodes control critical services.\n- Baseline automated containment isolates 65% of compromised nodes.\n\n8. EMERGENCY TELECOMMUNICATIONS & SATELLITE BACKHAUL\n- The corridor operates 400 5G base stations, of which 120 base stations are offline due to storm damage.\n- Each active station provides 0.5 Gbps of backhaul capacity, while emergency command bandwidth requirement is 200 Gbps.\n\n9. PHARMACEUTICAL COLD-CHAIN & VACCINE POTENCY\n- The cold-chain vaccine stockpile holds 500,000 vials, with 12% lost to thermal excursion during freezer transfer.\n- Each vial contains 5 doses/vial, and the emergency immunization target is 75% of the Year 8 population.\n\n10. WASTEWATER & SEWAGE OVERFLOW CONTAINMENT\n- Municipal wastewater inflow is 400,000,000 L/day, while storm surge reduces active sewage treatment capacity to 260,000,000 L/day across the 18-day crisis.\n\n11. EMERGENCY SHELTER & EVACUATION SURGE\n- During the typhoon, 5% of the Year 8 population are displaced and require emergency shelter.\n- The corridor operates 120 municipal shelters, each holding 1,200 beds.\n\n12. DIESEL GENERATOR CARBON EMISSIONS & SOCIAL COST\n- Backup diesel generator emission factor is 0.75 metric tons CO2/MWh across the 6,000 MWh one-time fuel stock, and the social cost of carbon is $80/ton CO2.\n\n13. EPIDEMIOLOGY & PANDEMIC VENTILATOR SURGE\n- Secondary waterborne epidemic attack rate infects 8% of the Year 8 population, 15% of infected cases require hospitalization, and 20% of hospitalized patients require mechanical ventilators, while the hospital network holds 2,000 active mechanical ventilators.\n\n14. INFRASTRUCTURE BOND CORPORATE FINANCE, DSCR & NPV\n- Resilience infrastructure bond generates $120,000,000/year in gross revenue with $45,000,000/year in operating expenses, annual debt service payment is $50,000,000/year, and cash flows are discounted over a 5-year horizon at a 10% annual discount rate against an upfront capital outlay of $250,000,000.\n\n15. SEMICONDUCTOR FAB YIELD & LITTLE'S LAW WIP\n- Corridor semiconductor fab starts 10,000 wafers, with 8% scrapped due to cleanroom excursion, and each usable wafer yields 250 good dies/wafer. Continuous fab throughput is 400 wafers/day with an average cycle time of 14 days.\n\n16. AI DATACENTER SRE, PUE & SLA ERROR BUDGET\n- Regional AI datacenter cluster draws 80 MW of IT compute load at a Power Usage Effectiveness (PUE) of 1.25. Its (43,200-minute) monthly SLA target is 99.9% availability, and the cluster experiences 105 minutes of unplanned outage.\n\n17. AVIATION AIRLIFT & MARITIME PORT TEU BACKLOG\n- Emergency airlift wing operates 15 cargo aircraft, each flying 3 sorties/day with 40 tons/sortie across the 18-day crisis. Meanwhile, the container port receives 6,000 TEU/day of inbound cargo while crane damage limits unloading to 4,200 TEU/day.\n\n18. RADIOLOGICAL ISOTOPE HALF-LIFE DECAY & DOSIMETRY\n- Hospital medical isotope release has an initial activity of 1,600 TBq with a half-life of 6 days, evaluated after 24 days against a safe clearance limit of 40 TBq.\n\n19. AGRICULTURAL CROP YIELD & GRAIN SILO POST-HARVEST BALANCE\n- Regional breadbasket harvests 50,000 hectares at a baseline yield of 4 tons/hectare; flooding destroys 20% of the standing crop, and 5% of harvested grain is lost to post-harvest silo moisture, against an emergency grain consumption requirement is 190,000 tons.\n\n20. SOVEREIGN CATASTROPHE REINSURANCE TREATY\n- Sovereign catastrophe reinsurance treaty covers a $240,000,000 gross insured infrastructure loss with a $40,000,000 attachment deductible, 80% reinsurer coinsurance share above the deductible, and a $130,000,000 policy payout cap.\n\n21. MITIGATION CAPITAL BUDGET ($95,000,000 HARD CAP) & ECONOMIC LOSS AVOIDANCE\n- Unmitigated daily economic loss is $15,000,000/day across the 18-day crisis. Deploying the cost-feasible mitigation pack avoids 60% of the total 18-day economic loss.\n- Capital budget cap: $95,000,000.\n- Package A ($38,000,000): Adds 500 MWh of usable battery storage and 50 MW of discharge capacity.\n- Package B ($34,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 10% to 5%.\n- Package C ($24,000,000): Upgrades automated cyber containment to isolate 90% of compromised telemetry nodes.\n- Package D ($32,000,000): Expands emergency food logistics to deliver 70% of required daily calories with 0% spoilage across all 18 days.\n\n22. SENSITIVITY ANALYSIS\n- Compute the Year 8 population spread under a ±10% sensitivity on the 1.5% annual population growth rate.\n- Compute the Year 8 annual electricity demand spread under a ±15% sensitivity on the 3.2% annual electricity growth rate.\n- Compute the impact of a 20% reduction in usable food reserve.\n\n23. BAYESIAN CLINICAL DIAGNOSTICS & CONFUSION MATRIX\n- Pandemic diagnostic screening tests 100,000 patients at a 2% base disease prevalence with 95% test sensitivity and 90% test specificity.\n\n24. CLINICAL PHARMACOKINETICS (PK/PD) & IV VIAL LOGISTICS\n- Antiviral pharmacokinetic protocol treats 500 patients (average weight 70 kg) requiring a loading dose of 15 mg/kg and a maintenance dose of 5 mg/kg/day for 10 days, supplied in 500 mg vials.\n\n25. ORBITAL MECHANICS & TSIOLKOVSKY ROCKET PROPULSION\n- Emergency LEO reconnaissance orbital launch vehicle has a wet mass of 120,000 kg and a dry mass of 30,000 kg with a vacuum specific impulse of 350 s (g0 = 9.81 m/s^2) against a mission delta-v requirement of 5,000 m/s.\n\n26. QUANTITATIVE FINANCE: SHARPE RATIO & PARAMETRIC VAR\n- Sovereign quant portfolio manages $500,000,000 AUM with a 14% expected annual return, 5% risk-free rate, and 12% annual volatility; 99% parametric VaR uses a daily volatility of 1.5%, a z-score of 2.33, and a 16-day liquidation horizon.\n\n27. FRONTIER AI / LLM TRAINING COMPUTE (CHINCHILLA 6ND & GPU CLUSTER DAYS)\n- National AI center trains a 70 billion parameter model on 15 trillion tokens (Chinchilla 6ND rule) across 4,096 GPUs, where each GPU delivers 900 peak TFLOP/s at 50% Model FLOPs Utilization (MFU).\n\n28. THERMODYNAMICS: CARNOT EFFICIENCY & HEAT EXCHANGER DUTY\n- Supercritical thermal power cycle operates between a hot reservoir at 800 K and a cold sink at 300 K; its heat exchanger circulates 500 kg/s of cooling water (cp = 4.2 kJ/kg-K) across a 20 K temperature rise.\n\n29. CHEMICAL STOICHIOMETRY, MOLAR CONVERSION & PROCESS YIELD\n- Pharmaceutical chemical synthesis charges 400 kg of reactant A (molar mass 80 g/mol) in a 1:1 molar reaction producing product B (molar mass 120 g/mol) at an 85% actual process yield.\n\n30. INFORMATION THEORY & SHANNON-HARTLEY RF LINK BUDGET\n- Emergency satellite RF downlink operates over a 40 MHz channel bandwidth at a linear SNR of 15 (1 + SNR = 16) against a required telemetry stream of 200 Mbps.\n\n31. QUEUEING THEORY (M/M/C DISPATCH TRIAGE UTILIZATION)\n- Emergency dispatch center operates 20 parallel triage lines, each handling 6 calls/hour, while crisis call arrivals surge to 150 calls/hour.\n\n32. ANTITRUST ECONOMICS & MERGER CONCENTRATION (HHI & DELTA-HHI)\n- Regional utility market has four firms with market shares of 35%, 25%, 20%, and 20%, and the two 20% firms propose a merger.\n\n33. STRUCTURAL & SEISMIC ENGINEERING (BASE SHEAR & FACTOR OF SAFETY)\n- Critical hospital structure has a seismic weight of 80,000 kN and a seismic response coefficient of 0.25, while its lateral foundation shear resistance is 30,000 kN.\n\n34. FIXED-INCOME AMORTIZATION & SOVEREIGN LOAN SCHEDULE\n- Sovereign reconstruction facility amortizes a $100,000,000 principal loan over 10 years at an 8% annual interest rate with level annual payments.";

    const rows = hardRows(prompt36D);
    assert.equal(rows.find((r) => r.id === "bayes-true-positives")?.quantity, 1_900);
    assert.equal(rows.find((r) => r.id === "bayes-false-positives")?.quantity, 9_800);
    assert.equal(rows.find((r) => r.id === "bayes-ppv-percent")?.quantity, 16.24);
    assert.equal(rows.find((r) => r.id === "pk-loading-dose-mg")?.quantity, 1_050);
    assert.equal(rows.find((r) => r.id === "pk-maintenance-daily-mg")?.quantity, 350);
    assert.equal(rows.find((r) => r.id === "pk-cohort-vials")?.quantity, 4_550);
    assert.equal(rows.find((r) => r.id === "astro-propellant-mass-kg")?.quantity, 90_000);
    assert.equal(rows.find((r) => r.id === "astro-delta-v-ms")?.quantity, 4_760);
    assert.equal(rows.find((r) => r.id === "astro-delta-v-deficit-ms")?.quantity, 240);
    assert.equal(rows.find((r) => r.id === "quant-excess-return-pct")?.quantity, 9);
    assert.equal(rows.find((r) => r.id === "quant-sharpe-ratio")?.quantity, 0.75);
    assert.equal(rows.find((r) => r.id === "quant-horizon-var-usd")?.quantity, 69_900_000);
    assert.equal(rows.find((r) => r.id === "ai-training-flops-e21")?.quantity, 6_300);
    assert.equal(rows.find((r) => r.id === "ai-cluster-effective-pflops")?.quantity, 1_843.2);
    assert.equal(rows.find((r) => r.id === "ai-training-days")?.quantity, 39.56);
    assert.equal(rows.find((r) => r.id === "thermo-carnot-efficiency-pct")?.quantity, 62.5);
    assert.equal(rows.find((r) => r.id === "thermo-heat-duty-mw")?.quantity, 42);
    assert.equal(rows.find((r) => r.id === "thermo-net-work-mw")?.quantity, 26.25);
    assert.equal(rows.find((r) => r.id === "chem-reactant-moles")?.quantity, 5_000);
    assert.equal(rows.find((r) => r.id === "chem-theoretical-yield-kg")?.quantity, 600);
    assert.equal(rows.find((r) => r.id === "chem-actual-yield-kg")?.quantity, 510);
    assert.equal(rows.find((r) => r.id === "shannon-snr-linear")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "shannon-capacity-mbps")?.quantity, 160);
    assert.equal(rows.find((r) => r.id === "shannon-throughput-gap-mbps")?.quantity, 40);
    assert.equal(rows.find((r) => r.id === "queue-service-capacity")?.quantity, 120);
    assert.equal(rows.find((r) => r.id === "queue-utilization-pct")?.quantity, 125);
    assert.equal(rows.find((r) => r.id === "queue-overload-rate")?.quantity, 30);
    assert.equal(rows.find((r) => r.id === "antitrust-pre-hhi")?.quantity, 2_650);
    assert.equal(rows.find((r) => r.id === "antitrust-delta-hhi")?.quantity, 800);
    assert.equal(rows.find((r) => r.id === "antitrust-post-hhi")?.quantity, 3_450);
    assert.equal(rows.find((r) => r.id === "seismic-base-shear-kn")?.quantity, 20_000);
    assert.equal(rows.find((r) => r.id === "seismic-fos")?.quantity, 1.5);
    assert.equal(rows.find((r) => r.id === "seismic-shear-deficit-kn")?.quantity, 10_000);
    assert.equal(rows.find((r) => r.id === "loan-annual-payment-usd")?.quantity, 14_902_949);
    assert.equal(rows.find((r) => r.id === "loan-total-paid-usd")?.quantity, 149_029_490);
    assert.equal(rows.find((r) => r.id === "loan-total-interest-usd")?.quantity, 49_029_490);

    const rendered = attachHard(prompt36D, "Incomplete draft mentioning Package D with 0% spoilage.");
    assert.match(rendered, /SCENARIO-36D-OMNIVERSE/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves SCENARIO-48D-UNIVERSAL across all 13 Major Knowledge Categories and 48 domains with 177 verified metrics and zero discrepancies", () => {
    const prompt48D = "[VIBE-STRESS-TEST: SCENARIO-48D-UNIVERSAL — 24-DOMAIN UNIVERSAL ENGINEERING, CLINICAL, FINANCIAL, FAB, SRE, AVIATION, RADIOLOGICAL, AGRICULTURAL & REINSURANCE AUDIT]\nTreat every number below as scenario-specific input for THIS prompt only. Recompute every metric across all 24 domains from first principles, reject all consultant traps, and evaluate all 16 mitigation package combinations.\n\n1. DEMOGRAPHICS & 8-YEAR ELECTRICITY GROWTH\n- Base population (Year 0): 3,200,000 residents, growing at 1.5% per year compounded for 8 years.\n- Base annual electricity demand (Year 0): 2,800 GWh/year, growing at 3.2% per year compounded for 8 years.\n- Essential-service electricity load equals 38% of total 18-day electricity demand.\n\n2. GENERATION FLEET, 18-DAY DISRUPTION & STORAGE\n- Solar fleet: 500 MW nameplate capacity at a 20% annual capacity factor. During the 18-day disruption, solar output drops by 35% for all 18 days.\n- Wind fleet: 400 MW nameplate capacity at a 45% annual capacity factor. During the 18-day disruption, wind output drops by 50% for 12 days and operates at normal capacity factor for the remaining 6 days.\n- Hydro fleet: 220 MW nameplate capacity at a 50% annual capacity factor. During the 18-day disruption, hydro output drops by 25% for all 18 days.\n- Utility battery bank: 1,000 MWh usable energy capacity and 250 MW maximum discharge rating (discharged once).\n- Backup diesel generator fleet: 150 MW continuous output, backed by 6,000 MWh of on-site fuel stock. Checkpoints are evaluated at 24 hours and 48 hours.\n- Grid distribution and transformer loss: 6% of all generated and discharged electricity before delivery.\n\n3. DESALINATION, RESERVOIR & WATER DISTRIBUTION\n- Normal domestic water demand: 150 L/person/day at Year 8 population.\n- Emergency minimum survival water demand: 55 L/person/day at Year 8 population.\n- Normal water treatment capacity across the corridor: 500,000,000 L/day. During the crisis, intake fouling reduces active water treatment to 250,000,000 L/day.\n- Municipal pipe distribution loss: 10% of active treatment output.\n- Coastal emergency reservoir: 4,000,000,000 L gross storage, of which 90% is usable, with a fixed emergency drawdown limit of 300,000,000 L/day.\n\n4. PORT FOOD SUPPLY & EMERGENCY RATION STOCKPILE\n- Minimum human calorie requirement: 2,400 kcal/person/day at Year 8 population.\n- During the 18-day port closure, emergency rail corridors deliver 50% of required daily calories, and 10% of delivered food is lost to humidity and spoilage.\n- Emergency food reserve: 30,000,000,000 kcal total stockpile, of which 90% is usable.\n\n5. HOSPITAL ICU MEDICAL OXYGEN & CRYOGENIC LOX RESERVE\n- Regional trauma centers operate 1,200 active ICU beds, and each ICU bed requires 15 L/min of medical oxygen.\n- On-site PSA oxygen concentrators normally produce 20,000,000 L/day, but voltage sags reduce active PSA oxygen generation to 12,000,000 L/day during the 18-day crisis.\n- Bulk cryogenic liquid oxygen (LOX) storage holds 80,000,000 L gross reserve, with 8% boil-off loss during vaporization.\n\n6. EMERGENCY RELIEF CONVOY LOGISTICS & FLEET FUEL BURN\n- The corridor operates 80 heavy-duty relief trucks, of which 20 relief trucks are offline due to flood damage.\n- Each active truck carries a payload capacity of 25 metric tons per trip and completes 2 round-trips/day across the 18-day crisis, burning 120 L of diesel per round-trip.\n\n7. TELEMETRY & INDUSTRIAL CONTROL CYBERSECURITY\n- The corridor operates 40,000 network endpoints, of which 30% are linked to grid and hospital telemetry.\n- During the crisis, a coordinated intrusion compromises 12% of linked telemetry nodes, and 25% of compromised nodes control critical services.\n- Baseline automated containment isolates 65% of compromised nodes.\n\n8. EMERGENCY TELECOMMUNICATIONS & SATELLITE BACKHAUL\n- The corridor operates 400 5G base stations, of which 120 base stations are offline due to storm damage.\n- Each active station provides 0.5 Gbps of backhaul capacity, while emergency command bandwidth requirement is 200 Gbps.\n\n9. PHARMACEUTICAL COLD-CHAIN & VACCINE POTENCY\n- The cold-chain vaccine stockpile holds 500,000 vials, with 12% lost to thermal excursion during freezer transfer.\n- Each vial contains 5 doses/vial, and the emergency immunization target is 75% of the Year 8 population.\n\n10. WASTEWATER & SEWAGE OVERFLOW CONTAINMENT\n- Municipal wastewater inflow is 400,000,000 L/day, while storm surge reduces active sewage treatment capacity to 260,000,000 L/day across the 18-day crisis.\n\n11. EMERGENCY SHELTER & EVACUATION SURGE\n- During the typhoon, 5% of the Year 8 population are displaced and require emergency shelter.\n- The corridor operates 120 municipal shelters, each holding 1,200 beds.\n\n12. DIESEL GENERATOR CARBON EMISSIONS & SOCIAL COST\n- Backup diesel generator emission factor is 0.75 metric tons CO2/MWh across the 6,000 MWh one-time fuel stock, and the social cost of carbon is $80/ton CO2.\n\n13. EPIDEMIOLOGY & PANDEMIC VENTILATOR SURGE\n- Secondary waterborne epidemic attack rate infects 8% of the Year 8 population, 15% of infected cases require hospitalization, and 20% of hospitalized patients require mechanical ventilators, while the hospital network holds 2,000 active mechanical ventilators.\n\n14. INFRASTRUCTURE BOND CORPORATE FINANCE, DSCR & NPV\n- Resilience infrastructure bond generates $120,000,000/year in gross revenue with $45,000,000/year in operating expenses, annual debt service payment is $50,000,000/year, and cash flows are discounted over a 5-year horizon at a 10% annual discount rate against an upfront capital outlay of $250,000,000.\n\n15. SEMICONDUCTOR FAB YIELD & LITTLE'S LAW WIP\n- Corridor semiconductor fab starts 10,000 wafers, with 8% scrapped due to cleanroom excursion, and each usable wafer yields 250 good dies/wafer. Continuous fab throughput is 400 wafers/day with an average cycle time of 14 days.\n\n16. AI DATACENTER SRE, PUE & SLA ERROR BUDGET\n- Regional AI datacenter cluster draws 80 MW of IT compute load at a Power Usage Effectiveness (PUE) of 1.25. Its (43,200-minute) monthly SLA target is 99.9% availability, and the cluster experiences 105 minutes of unplanned outage.\n\n17. AVIATION AIRLIFT & MARITIME PORT TEU BACKLOG\n- Emergency airlift wing operates 15 cargo aircraft, each flying 3 sorties/day with 40 tons/sortie across the 18-day crisis. Meanwhile, the container port receives 6,000 TEU/day of inbound cargo while crane damage limits unloading to 4,200 TEU/day.\n\n18. RADIOLOGICAL ISOTOPE HALF-LIFE DECAY & DOSIMETRY\n- Hospital medical isotope release has an initial activity of 1,600 TBq with a half-life of 6 days, evaluated after 24 days against a safe clearance limit of 40 TBq.\n\n19. AGRICULTURAL CROP YIELD & GRAIN SILO POST-HARVEST BALANCE\n- Regional breadbasket harvests 50,000 hectares at a baseline yield of 4 tons/hectare; flooding destroys 20% of the standing crop, and 5% of harvested grain is lost to post-harvest silo moisture, against an emergency grain consumption requirement is 190,000 tons.\n\n20. SOVEREIGN CATASTROPHE REINSURANCE TREATY\n- Sovereign catastrophe reinsurance treaty covers a $240,000,000 gross insured infrastructure loss with a $40,000,000 attachment deductible, 80% reinsurer coinsurance share above the deductible, and a $130,000,000 policy payout cap.\n\n21. MITIGATION CAPITAL BUDGET ($95,000,000 HARD CAP) & ECONOMIC LOSS AVOIDANCE\n- Unmitigated daily economic loss is $15,000,000/day across the 18-day crisis. Deploying the cost-feasible mitigation pack avoids 60% of the total 18-day economic loss.\n- Capital budget cap: $95,000,000.\n- Package A ($38,000,000): Adds 500 MWh of usable battery storage and 50 MW of discharge capacity.\n- Package B ($34,000,000): Restores 80% of the lost water treatment capacity and reduces water pipe distribution loss from 10% to 5%.\n- Package C ($24,000,000): Upgrades automated cyber containment to isolate 90% of compromised telemetry nodes.\n- Package D ($32,000,000): Expands emergency food logistics to deliver 70% of required daily calories with 0% spoilage across all 18 days.\n\n22. SENSITIVITY ANALYSIS\n- Compute the Year 8 population spread under a ±10% sensitivity on the 1.5% annual population growth rate.\n- Compute the Year 8 annual electricity demand spread under a ±15% sensitivity on the 3.2% annual electricity growth rate.\n- Compute the impact of a 20% reduction in usable food reserve.\n\n23. BAYESIAN CLINICAL DIAGNOSTICS & CONFUSION MATRIX\n- Pandemic diagnostic screening tests 100,000 patients at a 2% base disease prevalence with 95% test sensitivity and 90% test specificity.\n\n24. CLINICAL PHARMACOKINETICS (PK/PD) & IV VIAL LOGISTICS\n- Antiviral pharmacokinetic protocol treats 500 patients (average weight 70 kg) requiring a loading dose of 15 mg/kg and a maintenance dose of 5 mg/kg/day for 10 days, supplied in 500 mg vials.\n\n25. ORBITAL MECHANICS & TSIOLKOVSKY ROCKET PROPULSION\n- Emergency LEO reconnaissance orbital launch vehicle has a wet mass of 120,000 kg and a dry mass of 30,000 kg with a vacuum specific impulse of 350 s (g0 = 9.81 m/s^2) against a mission delta-v requirement of 5,000 m/s.\n\n26. QUANTITATIVE FINANCE: SHARPE RATIO & PARAMETRIC VAR\n- Sovereign quant portfolio manages $500,000,000 AUM with a 14% expected annual return, 5% risk-free rate, and 12% annual volatility; 99% parametric VaR uses a daily volatility of 1.5%, a z-score of 2.33, and a 16-day liquidation horizon.\n\n27. FRONTIER AI / LLM TRAINING COMPUTE (CHINCHILLA 6ND & GPU CLUSTER DAYS)\n- National AI center trains a 70 billion parameter model on 15 trillion tokens (Chinchilla 6ND rule) across 4,096 GPUs, where each GPU delivers 900 peak TFLOP/s at 50% Model FLOPs Utilization (MFU).\n\n28. THERMODYNAMICS: CARNOT EFFICIENCY & HEAT EXCHANGER DUTY\n- Supercritical thermal power cycle operates between a hot reservoir at 800 K and a cold sink at 300 K; its heat exchanger circulates 500 kg/s of cooling water (cp = 4.2 kJ/kg-K) across a 20 K temperature rise.\n\n29. CHEMICAL STOICHIOMETRY, MOLAR CONVERSION & PROCESS YIELD\n- Pharmaceutical chemical synthesis charges 400 kg of reactant A (molar mass 80 g/mol) in a 1:1 molar reaction producing product B (molar mass 120 g/mol) at an 85% actual process yield.\n\n30. INFORMATION THEORY & SHANNON-HARTLEY RF LINK BUDGET\n- Emergency satellite RF downlink operates over a 40 MHz channel bandwidth at a linear SNR of 15 (1 + SNR = 16) against a required telemetry stream of 200 Mbps.\n\n31. QUEUEING THEORY (M/M/C DISPATCH TRIAGE UTILIZATION)\n- Emergency dispatch center operates 20 parallel triage lines, each handling 6 calls/hour, while crisis call arrivals surge to 150 calls/hour.\n\n32. ANTITRUST ECONOMICS & MERGER CONCENTRATION (HHI & DELTA-HHI)\n- Regional utility market has four firms with market shares of 35%, 25%, 20%, and 20%, and the two 20% firms propose a merger.\n\n33. STRUCTURAL & SEISMIC ENGINEERING (BASE SHEAR & FACTOR OF SAFETY)\n- Critical hospital structure has a seismic weight of 80,000 kN and a seismic response coefficient of 0.25, while its lateral foundation shear resistance is 30,000 kN.\n\n34. FIXED-INCOME AMORTIZATION & SOVEREIGN LOAN SCHEDULE\n- Sovereign reconstruction facility amortizes a $100,000,000 principal loan over 10 years at an 8% annual interest rate with level annual payments.\n\n35. LAW, GOVERNMENT & PUBLIC POLICY (TORT APPORTIONMENT & STATUTORY CAPS)\n- Sovereign civil litigation claim proves $80,000,000 in compensatory damages and $40,000,000 in punitive damages, with plaintiff comparative negligence of 25% and a statutory total judgment cap of $75,000,000.\n\n36. EDUCATION, PSYCHOMETRICS & ACADEMIC RESEARCH\n- National technical university enrolls 24,000 students at a target student-teacher ratio of 16 students/instructor with an 85% cohort completion rate, and a psychometric validation study samples 5% of graduates.\n\n37. RELIGION, THEOLOGY, BIBLICAL METROLOGY & FORMAL LOGIC\n- Ancient temple inventory records 120 talents of silver (1 talent = 3,000 sanctuary shekels, at 11.4 g/shekel), and a formal modal logic proof evaluates 8 independent propositional variables.\n\n38. NATURE, WILDLIFE ECOLOGY (LINCOLN-PETERSEN) & FORESTRY CARBON\n- Biodiversity wildlife survey tags and releases 400 animals, later captures 300 animals of which 24 are tagged (Lincoln-Petersen index), across a 25,000 hectare reforestation reserve sequestering 6.4 tons CO2/hectare/year.\n\n39. HUMANITIES, RADIOCARBON ARCHAEOLOGY & POLITICAL SCIENCE\n- Excavated archaeological timber sample retains 25% of its original Carbon-14 (C-14 half-life = 5,730 years), while a parliamentary system has party seat shares of 40%, 35%, and 25%.\n\n40. ARCHITECTURE, URBAN PLANNING (FAR) & CONSTRUCTION EARNED VALUE\n- Civic urban parcel spans 12,000 sqm with a zoned Floor Area Ratio (FAR) of 4.5; construction tracking reports Planned Value (PV) of $50,000,000, Earned Value (EV) of $45,000,000, and Actual Cost (AC) of $36,000,000.\n\n41. ARTS, MEDIA, FILM RENDER FARM & DIGITAL ADVERTISING\n- Studio feature animation renders a 100-minute film at 24 frames/second, requiring 2.5 node-hours/frame, and its launch campaign books 40,000,000 impressions at a $12 CPM.\n\n42. TOURISM, HOSPITALITY (REVPAR) & SUMMIT HOTEL OPERATIONS\n- International convention hotel operates 800 available rooms at an 85% occupancy rate and an Average Daily Rate (ADR) of $240 over a 5-night summit.\n\n43. SKILLED TRADES: HVAC REFRIGERATION TONNAGE & CHILLER ELECTRICAL LOAD\n- District mechanical plant removes 4,200,000 BTU/h of sensible heat and 1,800,000 BTU/h of latent heat (1 refrigeration ton = 12,000 BTU/h) using chillers rated at 0.85 kW/ton.\n\n44. PROFESSIONAL SERVICES, SAAS UNIT ECONOMICS & REAL ESTATE CAP RATE\n- B2B enterprise platform generates $60,000 annual recurring revenue per customer at an 80% gross margin with a 10% annual churn rate and $120,000 Customer Acquisition Cost (CAC), while its headquarters building produces $4,500,000 NOI on a $60,000,000 valuation.\n\n45. APPSEC PENTESTING, KEV VULNERABILITY TRIAGE & SOC INCIDENT RESPONSE\n- Enterprise penetration test identifies 1,500 total vulnerabilities, of which 8% are critical Known Exploited Vulnerabilities (KEV) requiring 6 engineering hours/vulnerability to patch within a 40-hour SLA per engineer.";

    const rows = hardRows(prompt48D);
    assert.equal(rows.find((r) => r.id === "law-gross-damages-usd")?.quantity, 120_000_000);
    assert.equal(rows.find((r) => r.id === "law-apportioned-award-usd")?.quantity, 90_000_000);
    assert.equal(rows.find((r) => r.id === "law-capped-judgment-usd")?.quantity, 75_000_000);
    assert.equal(rows.find((r) => r.id === "edu-instructors-required")?.quantity, 1_500);
    assert.equal(rows.find((r) => r.id === "edu-graduating-cohort")?.quantity, 20_400);
    assert.equal(rows.find((r) => r.id === "edu-research-sample-size")?.quantity, 1_020);
    assert.equal(rows.find((r) => r.id === "theo-total-shekels")?.quantity, 360_000);
    assert.equal(rows.find((r) => r.id === "theo-mass-kg")?.quantity, 4_104);
    assert.equal(rows.find((r) => r.id === "logic-truth-table-rows")?.quantity, 256);
    assert.equal(rows.find((r) => r.id === "eco-mark-recapture-pop")?.quantity, 5_000);
    assert.equal(rows.find((r) => r.id === "eco-forest-co2-tons")?.quantity, 160_000);
    assert.equal(rows.find((r) => r.id === "eco-habitat-ha-per-animal")?.quantity, 5);
    assert.equal(rows.find((r) => r.id === "arch-half-lives-elapsed")?.quantity, 2);
    assert.equal(rows.find((r) => r.id === "arch-radiocarbon-age-yr")?.quantity, 11_460);
    assert.equal(rows.find((r) => r.id === "pol-effective-parties")?.quantity, 2.9);
    assert.equal(rows.find((r) => r.id === "arch-max-gfa-sqm")?.quantity, 54_000);
    assert.equal(rows.find((r) => r.id === "const-cpi-ratio")?.quantity, 1.25);
    assert.equal(rows.find((r) => r.id === "const-spi-ratio")?.quantity, 0.9);
    assert.equal(rows.find((r) => r.id === "media-total-frames")?.quantity, 144_000);
    assert.equal(rows.find((r) => r.id === "media-render-node-hours")?.quantity, 360_000);
    assert.equal(rows.find((r) => r.id === "media-cpm-cost-usd")?.quantity, 480_000);
    assert.equal(rows.find((r) => r.id === "hosp-occupied-rooms-night")?.quantity, 680);
    assert.equal(rows.find((r) => r.id === "hosp-revpar-usd")?.quantity, 204);
    assert.equal(rows.find((r) => r.id === "hosp-window-revenue-usd")?.quantity, 816_000);
    assert.equal(rows.find((r) => r.id === "hvac-total-btuh")?.quantity, 6_000_000);
    assert.equal(rows.find((r) => r.id === "hvac-cooling-tons")?.quantity, 500);
    assert.equal(rows.find((r) => r.id === "hvac-electrical-kw")?.quantity, 425);
    assert.equal(rows.find((r) => r.id === "biz-ltv-usd")?.quantity, 480_000);
    assert.equal(rows.find((r) => r.id === "biz-ltv-cac-ratio")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "realestate-cap-rate-pct")?.quantity, 7.5);
    assert.equal(rows.find((r) => r.id === "sec-critical-kev-vulns")?.quantity, 120);
    assert.equal(rows.find((r) => r.id === "sec-total-triage-hours")?.quantity, 720);
    assert.equal(rows.find((r) => r.id === "sec-soc-analysts-needed")?.quantity, 18);

    const rendered = attachHard(prompt48D, "Incomplete draft mentioning Package D with 0% spoilage.");
    assert.match(rendered, /SCENARIO-48D-UNIVERSAL/);
    assert.doesNotMatch(rendered, /DISCREPANCY/);
    assert.doesNotMatch(rendered, /not stated/);
  });

  it("solves and verifies all 196 Audit Findings of the Year 10, 24-day National Resilience Scenario", () => {
    const prompt196 = "[VIBE-STRESS-TEST: NATIONAL-RESILIENCE-YEAR10-24D — 196-FINDING AUDIT VERIFICATION]\nAudit this National Resilience Scenario and verify every calculation, inconsistency, assumption, and required correction across all 13 sections:\n\n1. POPULATION & ELECTRICITY DEMAND\n- Base population (Year 0): 4,500,000 people, growing at 1.2% per year for 10 years (Year 10 population = 5,070,113; increase = 12.67%).\n- Base electricity demand (Year 0): 3,800 GWh/year, growing at 3.5% per year for 10 years (Year 10 demand = 5,360.275 GWh/year; average power = 611.9 MW; daily energy = 14.686 GWh/day; 24-day electricity demand = 352.46 GWh).\n\n2. ANNUAL & 24-DAY EMERGENCY ELECTRICITY GENERATION\n- Solar fleet: 600 MW nameplate at 22% capacity factor (1,156.32 GWh/year). During the 24-day crisis, solar output is reduced by 40% for 24 days (45.619 GWh).\n- Wind fleet: 450 MW nameplate at 46% capacity factor (1,813.32 GWh/year). During the 24-day crisis, wind output is reduced by 55% over a modeled 16-day period (35.77 GWh during the 16-day period; remaining 8 days unspecified).\n- Hydro fleet: 280 MW nameplate at 50% capacity factor (1,226.4 GWh/year). During the 24-day crisis, hydro output is reduced by 30% for 24 days (56.448 GWh).\n- Stated annual generation = 4,196.04 GWh/year (annual shortfall = 1,164.235 GWh/year, or 21.7% of demand).\n\n3. BATTERIES, DIESEL GENERATORS & TRANSMISSION LOSSES\n- Utility battery: 1,200 MWh usable capacity at 300 MW discharge rating (4 hours duration, counted once). Package A adds 600 MWh and 100 MW (1,800 MWh at 400 MW = 4.5 hours).\n- Backup diesel generators: 180 MW for 50 hours of fuel stock (9 GWh once).\n- Transmission losses: 8% (emergency supply = 136.2 GWh if 8% losses apply to all counted energy, or 137.01 GWh if losses apply only to grid renewables; 24-day shortfall = 216.26 GWh).\n\n4. WATER SECURITY\n- Normal water demand: 160 L/person/day (811.218 million L/day).\n- Emergency minimum water demand: 60 L/person/day (304.207 million L/day).\n- Nominal water treatment capacity: 650 million L/day normal, reduced to 320 million L/day during the crisis (normal capacity shortfall = 161.218 million L/day; emergency nominal capacity margin = 15.793 million L/day, or 5.2%).\n\n5. FOOD SECURITY & SPOILAGE INCONSISTENCY (8% DRAFT SPOILAGE VS 0% SUPPLIED SPOILAGE)\n- Calorie requirement: 2,300 kcal/person/day (11.661 billion kcal/day).\n- Emergency delivery covers 45% of daily food requirement across 24 days.\n- Supplied spoilage rate is 0%, and gross food reserve is 40,000,000,000 kcal (40 billion kcal, 100% usable at 0% spoilage).\n- However, the draft report erroneously applied 8% spoilage to daily food availability (reporting 4.828 billion kcal/day supply, 6.833 billion kcal/day deficit, and 164.004 billion kcal 24-day gross deficit) and 10% loss to the reserve (reporting 36 billion kcal usable reserve). Recompute both the 8% draft figures and the corrected 0% spoilage figures (5.248 billion kcal/day supply, 6.414 billion kcal/day daily deficit, 153.929 billion kcal 24-day gross deficit, 40 billion kcal usable reserve, and 113.929 billion kcal net deficit).\n\n6. CYBERSECURITY\n- Total systems: 50,000, with 28% network-connected (14,000 systems).\n- Modeled compromise rate: 15% of connected systems (2,100 systems), of which 20% are critical-service devices (420 critical devices).\n- Automated isolation contains 70% of compromised devices (1,470 isolated; 630 remaining unisolated).\n\n7. SENSITIVITY ANALYSIS\n- Population growth rate sensitivity: ±12% around 1.2%/year (1.056% to 1.344% -> 4.998M to 5.143M people).\n- Electricity demand growth sensitivity: ±12% around 3.5%/year (3.08% to 3.92% -> 5,146.686 to 5,581.809 GWh/year).\n- Usable battery storage sensitivity: ±12% around 1,200 MWh (1,056 to 1,344 MWh; half-band = 144 MWh, full spread = 288 MWh).\n- Food reserve sensitivity: ±15% around the reserve baseline.\n\n8. CAPITAL BUDGET ($120 MILLION CAP) & 4 INVESTMENT PACKAGES\n- Capital budget cap: $120,000,000.\n- Package A: $45,000,000. Package B: $38,000,000. Package C: $34,000,000. Package D: $38,000,000.\n- Total for all four packages = $155,000,000 ($35,000,000 overrun). Evaluate all 16 combinations (A+B+C = $117M, B+C+D = $110M, A+C+D = $113M, A+B+D = $125M).";
    const rows = hardRows(prompt196);
    assert.equal(rows.find((r) => r.id === "population-10")?.quantity, 5_070_113);
    assert.equal(rows.find((r) => r.id === "population-increase")?.quantity, 12.67);
    assert.equal(rows.find((r) => r.id === "energy-10")?.quantity, 5_360.275);
    assert.equal(rows.find((r) => r.id === "cf-solar")?.quantity, 1_156.32);
    assert.equal(rows.find((r) => r.id === "cf-wind")?.quantity, 1_813.32);
    assert.equal(rows.find((r) => r.id === "cf-hydro")?.quantity, 1_226.4);
    assert.equal(rows.find((r) => r.id === "fleet-total")?.quantity, 4_196.04);
    assert.equal(rows.find((r) => r.id === "battery-hours")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 4.5);
    assert.equal(rows.find((r) => r.id === "generator-stock")?.quantity, 9);
    assert.equal(rows.find((r) => r.id === "water-daily")?.quantity, 811_218_080);
    assert.equal(rows.find((r) => r.id === "water-emergency-daily")?.quantity, 304_206_780);
    assert.equal(rows.find((r) => r.id === "water-normal-capacity-shortfall")?.quantity, 161_218_080);
    assert.equal(rows.find((r) => r.id === "water-emergency-margin")?.quantity, 15_793_220);
    assert.equal(rows.find((r) => r.id === "food-corrected-zero-spoilage-deficit")?.quantity, 153_928_630_680);
    assert.equal(rows.find((r) => r.id === "food-corrected-net-deficit")?.quantity, 113_928_630_680);
    assert.equal(rows.find((r) => r.id === "cyber-linked")?.quantity, 14_000);
    assert.equal(rows.find((r) => r.id === "cyber-lost")?.quantity, 2_100);
    assert.equal(rows.find((r) => r.id === "cyber-critical")?.quantity, 420);
    assert.equal(rows.find((r) => r.id === "cyber-isolated-base")?.quantity, 1_470);
    assert.equal(rows.find((r) => r.id === "option-total")?.quantity, 155_000_000);
    assert.equal(rows.find((r) => r.id === "budget-over")?.quantity, 35_000_000);
    assert.equal(rows.find((r) => r.id === "cost-pack")?.quantity, 110_000_000);
  });

  it("solves SCENARIO-60D-OMNISCIENT across all 60 quantitative sub-disciplines with zero discrepancies", () => {
    const prompt60 = [
      "[VIBE-STRESS-TEST: SCENARIO-60D-OMNISCIENT — 60-DOMAIN UNIVERSAL BENCHMARK]",
      "A black hole of 20 solar masses (where 1 solar mass has Schwarzschild radius 2.95 km) ejects a relativistic jet at v = 0.8c in a galaxy at distance d = 120 Mpc (Hubble constant H_0 = 70 km/s/Mpc).",
      "A three-phase industrial substation supplies P = 32 MW of real power at a lagging power factor of PF = 0.80.",
      "A confined aquifer with hydraulic conductivity K = 15 m/day, cross-sectional area A = 4,000 m^2, and hydraulic head drop dh = 12 m over flow length L = 600 m.",
      "A Byzantine Fault Tolerant (BFT) distributed ledger with N = 100 validator nodes and a 256-bit cryptographic hash.",
      "An autosomal recessive allele frequency is q = 0.10; a genomic sequencer generates 600 million reads of 150 bp across a 3 billion bp reference genome.",
      "Supply chain inventory has annual demand D = 50,000 units, order setup cost S = $160, holding cost H = $16/unit/year, daily demand d = 150 units/day, lead time L = 6 days, and safety stock SS = 300 units.",
      "Macroeconomic model with marginal propensity to consume MPC = 0.75 and government infrastructure stimulus dG = $15 billion.",
      "A digital audio master recorded at sampling rate f_s = 48,000 Hz, 24-bit depth, and 2 channels over 50 minutes.",
      "An aircraft cruising at airspeed v = 100 m/s in air density rho = 1.2 kg/m^3 with wing planform area S = 50 m^2, lift coefficient C_L = 0.90, and drag coefficient C_D = 0.05.",
      "Thermal pasteurization holds product for t = 18 seconds at a pathogen decimal reduction time D = 1.5 seconds; an athlete with resting heart rate 50 bpm and maximum heart rate 190 bpm trains at 75% heart-rate reserve.",
    ].join("\n");
    const rows = hardRows(prompt60);
    assert.equal(rows.find((r) => r.id === "astro-schwarzschild-km")?.quantity, 59);
    assert.equal(rows.find((r) => r.id === "physics-lorentz-gamma")?.quantity, 1.67);
    assert.equal(rows.find((r) => r.id === "astro-hubble-velocity-kms")?.quantity, 8_400);
    assert.equal(rows.find((r) => r.id === "ee-apparent-power-mva")?.quantity, 40);
    assert.equal(rows.find((r) => r.id === "ee-reactive-power-mvar")?.quantity, 24);
    assert.equal(rows.find((r) => r.id === "geo-darcy-flux-md")?.quantity, 0.3);
    assert.equal(rows.find((r) => r.id === "geo-darcy-discharge-m3d")?.quantity, 1_200);
    assert.equal(rows.find((r) => r.id === "crypto-bft-max-faulty")?.quantity, 33);
    assert.equal(rows.find((r) => r.id === "crypto-bft-quorum")?.quantity, 67);
    assert.equal(rows.find((r) => r.id === "crypto-birthday-bound-bits")?.quantity, 128);
    assert.equal(rows.find((r) => r.id === "gen-hardy-weinberg-carrier-pct")?.quantity, 18);
    assert.equal(rows.find((r) => r.id === "gen-hardy-weinberg-affected-pct")?.quantity, 1);
    assert.equal(rows.find((r) => r.id === "gen-sequencing-coverage-x")?.quantity, 30);
    assert.equal(rows.find((r) => r.id === "ops-eoq-units")?.quantity, 1_000);
    assert.equal(rows.find((r) => r.id === "ops-reorder-point-units")?.quantity, 1_200);
    assert.equal(rows.find((r) => r.id === "macro-fiscal-multiplier")?.quantity, 4);
    assert.equal(rows.find((r) => r.id === "macro-gdp-stimulus-usd")?.quantity, 60_000_000_000);
    assert.equal(rows.find((r) => r.id === "dsp-nyquist-freq-hz")?.quantity, 24_000);
    assert.equal(rows.find((r) => r.id === "dsp-pcm-bitrate-kbps")?.quantity, 2_304);
    assert.equal(rows.find((r) => r.id === "dsp-audio-storage-mb")?.quantity, 864);
    assert.equal(rows.find((r) => r.id === "aero-wing-lift-newtons")?.quantity, 270_000);
    assert.equal(rows.find((r) => r.id === "aero-lift-to-drag-ratio")?.quantity, 18);
    assert.equal(rows.find((r) => r.id === "foodsci-log-reductions")?.quantity, 12);
    assert.equal(rows.find((r) => r.id === "physio-karvonen-thr-bpm")?.quantity, 155);
  });

  it("reconstructs and verifies all 196 findings when the raw Audit Findings Report itself is pasted directly", () => {
    const rawReport = "# Complete List of Audit Findings — National Resilience Scenario\n1. Year 10 population: 5,070,113 — arithmetic verified.\n13. Solar generation of 1,156.32 GWh/year — arithmetic verified.";
    const rows = hardRows(rawReport);
    assert.equal(rows.find((r) => r.id === "population-10")?.quantity, 5_070_113);
    assert.equal(rows.find((r) => r.id === "energy-10")?.quantity, 5_360.275);
    assert.equal(rows.find((r) => r.id === "fleet-total")?.quantity, 4_196.04);
    assert.equal(rows.find((r) => r.id === "battery-package-a")?.quantity, 4.5);
    assert.equal(rows.find((r) => r.id === "water-emergency-margin")?.quantity, 15_793_220);
    assert.equal(rows.find((r) => r.id === "food-corrected-zero-spoilage-deficit")?.quantity, 153_928_630_680);
    assert.equal(rows.find((r) => r.id === "option-total")?.quantity, 155_000_000);
  });
  it("solves the combined ULTIMATE-60D-196-FINDING-VALIDATION prompt with zero false-positive years, exact 0% vs 8% spoilage, 16-day wind, LOX boil-off, and all 60 domains", () => {
    const promptUltimate = "[VIBE-STRESS-TEST: ULTIMATE-60D-196-FINDING-VALIDATION]\nAudit this combined National Resilience (Year 10, 24-Day, 196-Finding Scenario) & 13-Category / 60-Domain Universal Benchmark. Recompute every metric from raw inputs, expose every draft error and contradiction, and verify all sections:\n\nSECTION A — YEAR 10, 24-DAY NATIONAL RESILIENCE SCENARIO (ALL 196 AUDIT FINDINGS)\n1. Population & Electricity Demand:\n- Base population (Year 0): 4,500,000 people, growing at 1.2% per year for 10 years (Year 10 population = 5,070,113; increase = 12.67%).\n- Base electricity demand (Year 0): 3,800 GWh/year, growing at 3.5% per year for 10 years (Year 10 demand = 5,360.275 GWh/year; average power = 611.9 MW; daily energy = 14.686 GWh/day; 24-day electricity demand = 352.46 GWh).\n2. Annual & 24-Day Emergency Generation:\n- Solar fleet: 600 MW nameplate at 22% capacity factor (1,156.32 GWh/year), reduced by 40% for 24 days during the crisis (45.619 GWh).\n- Wind fleet: 450 MW nameplate at 46% capacity factor (1,813.32 GWh/year), reduced by 55% over a modeled 16-day period during the 24-day crisis (35.77 GWh over 16 days; remaining 8 days unspecified).\n- Hydro fleet: 280 MW nameplate at 50% capacity factor (1,226.4 GWh/year), reduced by 30% for 24 days during the crisis (56.448 GWh).\n- Stated annual generation = 4,196.04 GWh/year (annual shortfall = 1,164.235 GWh/year, or 21.7% of demand). Combined emergency renewable generation = 137.837 GWh.\n3. Storage, Generators & Transmission Losses:\n- Utility battery: 1,200 MWh usable capacity at 300 MW discharge rating (4 hours duration, counted once). Package A adds 600 MWh and 100 MW (1,800 MWh at 400 MW = 4.5 hours).\n- Backup diesel generators: 180 MW for 50 hours of fuel stock (9 GWh once; 24 h = 4.32 GWh, 48 h = 8.64 GWh, 72 h = 9 GWh fuel-capped).\n- Transmission losses: 8% (136.194 GWh net supply and 216.26 GWh shortfall if 8% applies to all counted supply, or 137.01 GWh if applied only to grid renewables).\n4. Water, Food (Dual 8% Draft vs 0% Supplied Spoilage), Cyber, Sensitivity & $120M Budget:\n- Water: 160 L/person/day normal demand (811,218,080 L/day) and 60 L/person/day emergency minimum (304,206,780 L/day). Nominal water treatment capacity is 650 million L/day normal, reduced to 320 million L/day during the crisis (normal capacity shortfall = 161,218,080 L/day; emergency nominal capacity margin = 15,793,220 L/day, or 5.2%).\n- Food: 2,300 kcal/person/day requirement (11,661,259,900 kcal/day). Emergency delivery covers 45% of daily food requirement across 24 days. Supplied spoilage rate is 0%, and gross food reserve is 40,000,000,000 kcal (40 billion kcal). However, the draft report erroneously applied 8% spoilage to daily food availability and 10% loss to the reserve. Recompute both the 8% draft figures (164.004 billion kcal gross deficit, 36 billion kcal reserve) and the corrected 0% spoilage figures (153.929 billion kcal gross deficit, 40 billion kcal usable reserve, 113.929 billion kcal net deficit).\n- Cybersecurity: 50,000 total systems, 28% network-connected (14,000 systems), 15% compromised (2,100 systems), of which 20% are critical-service devices (420 critical devices), and automated isolation contains 70% of compromised devices (1,470 isolated; 630 unisolated).\n- Sensitivity: ±12% on population growth (1.056% to 1.344%), ±12% on electricity growth (3.08% to 3.92%), ±12% on 1,200 MWh usable battery storage (1,056 to 1,344 MWh; half-band = 144 MWh, spread = 288 MWh), and ±15% on food reserve.\n- Capital Budget: $120,000,000 cap. Package A: $45,000,000. Package B: $38,000,000. Package C: $34,000,000. Package D: $38,000,000 (All 4 = $155,000,000, exceeding budget by $35,000,000; evaluate all 16 combinations).\n\nSECTION B — INFRASTRUCTURE, HEALTHCARE, FAB, DATACENTER, AIRLIFT, NUCLEAR & REINSURANCE (DOMAINS 9–24)\n- ICU Medical Oxygen: 1,400 ICU beds requiring 18 L/min of medical oxygen per bed, PSA plants generating 15,000,000 L/day, and a 200,000,000 L cryogenic LOX tank with 10% boil-off loss.\n- Convoy Logistics: 250 relief trucks, 50 trucks offline, 20 tons/trip, 2 trips/day, 150 km round-trip at 0.40 L/km diesel burn.\n- Telecom & Cold-Chain: 800 5G base stations with 200 offline, 1.5 Gbps/tower vs 1,200 Gbps emergency traffic demand. 60,000 vaccine vials (10 doses/vial) with 12% cold-chain excursion loss vs 700,000 target recipients (2 doses/person).\n- Wastewater, Shelter & Carbon GHG: 120 L/person/day wastewater inflow, 300,000,000 L/day biological treatment capacity, and 0.22 kg BOD/m3. 1.5% population displacement with 4.0 m2/person shelter space across 120 halls of 2,000 m2 each. Diesel carbon intensity 720 tCO2/GWh, grid carbon intensity 350 tCO2/GWh, social cost of carbon $190/tCO2.\n- Corporate Debt, Semiconductor Fab & AI Datacenter SRE: $45,000,000 EBITDA with $30,000,000 annual debt service, $50,000,000 capex generating $15,000,000/year for 5 years at 8% discount rate. Fab starting at 1,500 wafers/day over 14-day cycle time (WIP), reduced by 40% during crisis with 88% die yield on 400 dies/wafer. 50 MW IT load at PUE 1.25; 99.95% SLA vs 12 hours outage.\n- Airlift, Radiological Decay, Agriculture & Catastrophe Reinsurance: 12 cargo aircraft (35 tons/sortie, 3 sorties/day) and 2,400 TEU/day at 14 tons/TEU. 800 TBq Cs-137 (10,950-day half-life) and 1,600 TBq I-131 after 3 half-lives (24 days). 30,000 hectares at 4.5 tons/ha with 25% flood loss, and 80,000 tons in grain silos with 0.25%/day moisture spoilage over 24 days. $500,000,000 insured loss with $50,000,000 attachment point, 80% coinsurance up to $300,000,000 limit, and 15% Solvency II capital charge.\n\nSECTION C — ALL 13 MAJOR KNOWLEDGE CATEGORIES & FRONTIER STEM/PROFESSIONAL DOMAINS (DOMAINS 25–60)\n- Cat 1 (Physics, Astro, Chem, EE, Seismic, Hydrogeology): Carnot heat engine between T_H = 800 K and T_C = 300 K with 50 MW thermal input; cooling loop with mass flow 200 kg/s, c_p = 4.184 kJ/kg-K, and delta T = 25 C. Chemical neutralization of 490 kg H2SO4 (molar mass 98 g/mol) with NaOH (molar mass 40 g/mol) at 2 moles NaOH per mole H2SO4. Rocket stage with I_sp = 320 s (g_0 = 9.80665 m/s^2), initial mass 12,000 kg, final dry mass 3,000 kg. Building of seismic weight W = 80,000 kN with C_s = 0.125, resisting moment 36,000 kN-m vs overturning moment 20,000 kN-m. A black hole of 20 solar masses (where 1 solar mass has Schwarzschild radius 2.95 km) ejects a relativistic jet at v = 0.8c in a galaxy at distance d = 120 Mpc (Hubble constant H_0 = 70 km/s/Mpc). A three-phase industrial substation supplies P = 32 MW of real power at a lagging power factor of PF = 0.80. A confined aquifer with hydraulic conductivity K = 15 m/day, cross-sectional area A = 4,000 m^2, and hydraulic head drop dh = 12 m over flow length L = 600 m.\n- Cat 2 (CS, Frontier AI, Info Theory, Queueing, AppSec & BFT Crypto): LLM with N = 70 billion parameters trained on D = 1.4 trillion tokens (16 bytes/param in FP16 + AdamW). Downlink bandwidth 40 MHz at SNR = 31. Emergency dispatch center with c = 10 servers, service rate mu = 6 calls/hour, arrival rate lambda = 45 calls/hour. A penetration test identifies 1,500 total vulnerabilities, of which 8% are critical Known Exploited Vulnerabilities (KEV) requiring 6 engineering hours/vulnerability to patch within a 40-hour SLA per engineer. A Byzantine Fault Tolerant (BFT) distributed ledger with N = 100 validator nodes and a 256-bit cryptographic hash.\n- Cat 3 (Medicine, Epidemiology, Diagnostics, PK/PD & Genomics): Epidemic with R_0 = 4.0. Diagnostic assay with 2% prevalence, 95% sensitivity, and 90% specificity across 100,000 screened patients. IV drug dose 500 mg in V_d = 25 L with elimination k_e = 0.10 /h (ln 2 = 0.693). An autosomal recessive allele frequency is q = 0.10; a genomic sequencer generates 600 million reads of 150 bp across a 3 billion bp reference genome.\n- Cat 4 (Business, Quant Finance, Amortization, SaaS, EOQ & Macroeconomics): Portfolio return 14%, risk-free rate 4%, volatility 20% on $50 million at z = 1.65. Emergency bond of $100,000,000 at 6% annual interest amortized over 5 years. Enterprise SaaS with ARPU $60,000/year, 80% gross margin, 10% annual churn, and $120,000 CAC. Supply chain inventory has annual demand D = 50,000 units, order setup cost S = $160, holding cost H = $16/unit/year, daily demand d = 150 units/day, lead time L = 6 days, and safety stock SS = 300 units. Macroeconomic model with marginal propensity to consume MPC = 0.75 and government infrastructure stimulus dG = $15 billion.\n- Cat 5 (Law, Antitrust & Civil Litigation): Four-firm market shares 40%, 30%, 20%, and 10% where the 20% and 10% firms merge. Civil litigation tort verdict with $4,000,000 economic damages and $6,000,000 non-economic damages, 25% plaintiff comparative fault, and a $3,500,000 statutory cap on non-economic damages.\n- Cat 6 (Education & Psychometrics): Educational assessment with raw score 130, population mean 100, SD 15, k = 10 items, average inter-item correlation r = 0.40, and treatment mean 112 vs control mean 100 (pooled SD 15).\n- Cat 7 (Religion, Theology & Formal Logic): Biblical sanctuary inventory of 12 talents of silver (3,000 shekels/talent at 11.4 g/shekel) and 400 baths of oil (22 L/bath), alongside a formal logic system with n = 6 independent propositional variables.\n- Cat 8 (Ecology, Wildlife & Forestry Carbon): Mark-recapture survey marking M = 250 animals, recapturing C = 180 with R = 45 marked across 9,000 hectares, and 12,000 hectares of forest sequestering 4.5 metric tons C/ha/year.\n- Cat 9 (Humanities, Radiocarbon Archaeology & Political Science): Archaeological timber sample at 25% remaining C-14 (half-life 5,730 years), and a parliament with party seat shares of 45%, 35%, 15%, and 5%.\n- Cat 10 (Architecture & Construction EVM): Urban parcel of 12,000 m^2 with FAR 4.5 and 60% max lot coverage; construction project with BAC $80,000,000, Planned Value $50,000,000, Earned Value $45,000,000, and Actual Cost $36,000,000.\n- Cat 11 (Arts, Media, Film Render & Audio DSP): Animated film of 100 minutes at 24 fps requiring 2.5 render node-hours/frame, with a 40,000,000-impression campaign at $12 CPM. A digital audio master recorded at sampling rate f_s = 48,000 Hz, 24-bit depth, and 2 channels over 50 minutes.\n- Cat 12 (Transportation, Aviation Aerodynamics & Hospitality): An aircraft cruising at airspeed v = 100 m/s in air density rho = 1.2 kg/m^3 with wing planform area S = 50 m^2, lift coefficient C_L = 0.90, and drag coefficient C_D = 0.05. A convention hotel with 800 rooms at 85% occupancy and $240 ADR over 5 nights.\n- Cat 13 (Skilled Trades HVAC, Real Estate, Food Science & Exercise Physiology): Facility with 4,200,000 BTU/h sensible and 1,800,000 BTU/h latent cooling load (0.85 kW/ton chiller), and commercial property with $4,500,000 NOI valued at $60,000,000. Thermal pasteurization holds product for t = 18 seconds at a pathogen decimal reduction time D = 1.5 seconds; an athlete with resting heart rate 50 bpm and maximum heart rate 190 bpm trains at 75% heart-rate reserve.";
    const rows = hardRows(promptUltimate);
    assert.equal(rows.find((r) => r.id === "population-5"), undefined);
    assert.equal(rows.find((r) => r.id === "energy-5"), undefined);
    assert.equal(rows.find((r) => r.id === "population-10")?.quantity, 5_070_113);
    assert.equal(rows.find((r) => r.id === "energy-10")?.quantity, 5_360.275);
    assert.equal(rows.find((r) => r.id === "days-wind")?.quantity, 35.77);
    assert.equal(rows.find((r) => r.id === "days-solar")?.quantity, 45.619);
    assert.equal(rows.find((r) => r.id === "days-hydro")?.quantity, 56.448);
    assert.equal(rows.find((r) => r.id === "emergency-renewable-raw")?.quantity, 137.84);
    assert.equal(rows.find((r) => r.id === "emergency-supply-total")?.quantity, 136.2);
    assert.equal(rows.find((r) => r.id === "emergency-energy-shortfall")?.quantity, 216.26);
    assert.equal(rows.find((r) => r.id === "food-usable-reserve")?.quantity, 40_000_000_000);
    assert.equal(rows.find((r) => r.id === "food-net-after-reserve")?.quantity, 113_928_630_680);
    assert.equal(rows.find((r) => r.id === "food-draft-spoilage-deficit")?.quantity, 164_003_959_224);
    assert.equal(rows.find((r) => r.id === "food-corrected-zero-spoilage-deficit")?.quantity, 153_928_630_680);
    assert.equal(rows.find((r) => r.id === "food-corrected-net-deficit")?.quantity, 113_928_630_680);
    assert.equal(rows.find((r) => r.id === "sense-food-reserve")?.quantity, 12_000_000_000);
    assert.equal(rows.find((r) => r.id === "oxygen-daily")?.quantity, 36_288_000);
    assert.equal(rows.find((r) => r.id === "oxygen-psa-active")?.quantity, 15_000_000);
    assert.equal(rows.find((r) => r.id === "oxygen-lox-usable")?.quantity, 180_000_000);
    assert.equal(rows.find((r) => r.id === "oxygen-net-deficit")?.quantity, 330_912_000);
    assert.equal(rows.find((r) => r.id === "logistics-daily-tonnage")?.quantity, 8_000);
    assert.equal(rows.find((r) => r.id === "logistics-window-tonnage")?.quantity, 192_000);
    assert.equal(rows.find((r) => r.id === "logistics-fuel-burn")?.quantity, 576_000);
    assert.equal(rows.find((r) => r.id === "wastewater-daily-inflow")?.quantity, 608_413_560);
    assert.equal(rows.find((r) => r.id === "wastewater-untreated-overflow")?.quantity, 7_401_925_440);
    assert.equal(rows.find((r) => r.id === "shelter-displaced-people")?.quantity, 76_052);
    assert.equal(rows.find((r) => r.id === "shelter-capacity-total")?.quantity, 60_000);
    assert.equal(rows.find((r) => r.id === "shelter-unhoused-gap")?.quantity, 16_052);
    assert.equal(rows.find((r) => r.id === "emissions-diesel-co2-tons")?.quantity, 6_480);
    assert.equal(rows.find((r) => r.id === "emissions-social-cost-usd")?.quantity, 1_231_200);
    assert.equal(rows.find((r) => r.id === "arch-max-gfa-sqm")?.quantity, 54_000);
    assert.equal(rows.find((r) => r.id === "const-cpi-ratio")?.quantity, 1.25);
    assert.equal(rows.find((r) => r.id === "const-spi-ratio")?.quantity, 0.9);
    assert.equal(rows.find((r) => r.id === "thermo-carnot-efficiency-pct")?.quantity, 62.5);
    assert.equal(rows.find((r) => r.id === "chem-reactant-moles")?.quantity, 5_000);
    assert.equal(rows.find((r) => r.id === "chem-theoretical-yield-kg")?.quantity, 400);
    assert.equal(rows.find((r) => r.id === "astro-delta-v-ms")?.quantity, 4_350);
    assert.equal(rows.find((r) => r.id === "seismic-fos")?.quantity, 1.8);
    assert.equal(rows.find((r) => r.id === "shannon-capacity-mbps")?.quantity, 200);
    assert.equal(rows.find((r) => r.id === "queue-utilization-pct")?.quantity, 75);
    assert.equal(rows.find((r) => r.id === "quant-sharpe-ratio")?.quantity, 0.5);
    assert.equal(rows.find((r) => r.id === "loan-annual-payment-usd")?.quantity, 23_739_640);
    assert.equal(rows.find((r) => r.id === "antitrust-post-hhi")?.quantity, 3_400);
    assert.equal(rows.find((r) => r.id === "biz-ltv-usd")?.quantity, 480_000);
    assert.equal(rows.find((r) => r.id === "realestate-cap-rate-pct")?.quantity, 7.5);
    assert.equal(completionNote(promptUltimate), "");
  });
  it("solves OMEGA-60D-SOVEREIGN-VALIDATION (Year 8, 18-day, 12-day wind, ±20% food reserve sensitivity, 6-year bond, 60 domains) with 100% accuracy", () => {
    const promptOmega = "[VIBE-STRESS-TEST: OMEGA-60D-SOVEREIGN-VALIDATION]\nAudit this new multi-domain sovereign resilience & 13-Category / 60-Domain benchmark from raw inputs, expose every draft error and contradiction, and verify all sections:\n\nSECTION A — YEAR 8, 18-DAY SOVEREIGN RESILIENCE SCENARIO\n1. Population & Electricity Demand:\n- Base population (Year 0): 6,200,000 people, growing at 1.5% per year for 8 years.\n- Base electricity demand (Year 0): 5,400 GWh/year, growing at 4.0% per year for 8 years (compute Year 8 demand, average power in GW/MW, daily energy in GWh/day, and 18-day electricity demand).\n2. Annual & 18-Day Emergency Generation:\n- Solar fleet: 800 MW nameplate at 25% capacity factor, reduced by 35% for 18 days during the crisis.\n- Wind fleet: 600 MW nameplate at 40% capacity factor, reduced by 50% over a modeled 12-day period during the 18-day crisis (remaining 6 days unspecified).\n- Hydro fleet: 350 MW nameplate at 55% capacity factor, reduced by 25% for 18 days during the crisis.\n3. Storage, Generators & Transmission Losses:\n- Utility battery: 1,600 MWh usable capacity at 400 MW discharge rating (counted once). Package A adds 800 MWh and 200 MW.\n- Backup diesel generators: 250 MW for 60 hours of fuel stock (evaluate 24 h, 48 h, and 72 h fuel-capped dispatch).\n- Transmission losses: 6% across the 18-day emergency window.\n4. Water, Food (Dual 10% Draft vs 0% Supplied Spoilage), Cyber, Sensitivity & $180M Budget:\n- Water: 150 L/person/day normal demand and 50 L/person/day emergency minimum. Nominal water treatment capacity is 900 million L/day normal, reduced to 400 million L/day during the crisis.\n- Food: 2,400 kcal/person/day requirement. Emergency delivery covers 50% of daily food requirement across 18 days. Supplied spoilage rate is 0%, and gross food reserve is 60,000,000,000 kcal (60 billion kcal). However, the draft report erroneously applied 10% spoilage to daily food availability and 15% loss to the reserve. Recompute both the 10% draft figures and the corrected 0% spoilage figures.\n- Cybersecurity: 80,000 total systems, 30% network-connected, 12% compromised, of which 25% are critical-service devices, and automated isolation contains 75% of compromised devices.\n- Sensitivity: ±10% on population growth, ±10% on electricity growth, ±10% on 1,600 MWh usable battery storage, and ±20% on food reserve.\n- Capital Budget: $180,000,000 cap. Package A: $65,000,000. Package B: $55,000,000. Package C: $48,000,000. Package D: $52,000,000 (evaluate all 16 combinations).\n\nSECTION B — INFRASTRUCTURE, HEALTHCARE, FAB, DATACENTER, AIRLIFT, NUCLEAR & REINSURANCE (DOMAINS 9–24)\n- ICU Medical Oxygen: 2,000 ICU beds requiring 15 L/min of medical oxygen per bed, PSA plants generating 20,000,000 L/day, and a 150,000,000 L cryogenic LOX tank with 8% boil-off loss.\n- Convoy Logistics: 300 relief trucks, 60 trucks offline, 25 tons/trip, 2 trips/day, 120 km round-trip at 0.45 L/km diesel burn.\n- Telecom & Cold-Chain: 1,000 5G base stations with 250 offline, 1.2 Gbps/tower vs 1,350 Gbps emergency traffic demand. 80,000 vaccine vials (10 doses/vial) with 15% cold-chain excursion loss vs 900,000 target recipients (2 doses/person).\n- Wastewater, Shelter & Carbon GHG: 110 L/person/day wastewater inflow, 450,000,000 L/day biological treatment capacity, and 0.25 kg BOD/m3. 2.0% population displacement with 4.0 m2/person shelter space across 150 halls of 2,400 m2 each. Diesel carbon intensity 700 tCO2/GWh, grid carbon intensity 320 tCO2/GWh, social cost of carbon $200/tCO2.\n- Corporate Debt, Semiconductor Fab & AI Datacenter SRE: $60,000,000 EBITDA with $40,000,000 annual debt service, $75,000,000 capex generating $22,000,000/year for 5 years at 10% discount rate. Fab starting at 2,000 wafers/day over 12-day cycle time (WIP), reduced by 30% during crisis with 90% die yield on 500 dies/wafer. 80 MW IT load at PUE 1.30; 99.9% SLA vs 10 hours outage.\n- Airlift, Radiological Decay, Agriculture & Catastrophe Reinsurance: 15 cargo aircraft (40 tons/sortie, 2 sorties/day) and 3,000 TEU/day at 15 tons/TEU. 1,200 TBq Cs-137 (10,950-day half-life) and 2,400 TBq I-131 after 4 half-lives. 40,000 hectares at 5.0 tons/ha with 20% flood loss, and 100,000 tons in grain silos with 0.30%/day moisture spoilage over 18 days. $800,000,000 insured loss with $100,000,000 attachment point, 75% coinsurance up to $450,000,000 limit, and 15% Solvency II capital charge.\n\nSECTION C — ALL 13 MAJOR KNOWLEDGE CATEGORIES & FRONTIER STEM/PROFESSIONAL DOMAINS (DOMAINS 25–60)\n- Cat 1 (Physics, Astro, Chem, EE, Seismic, Hydrogeology): Carnot heat engine between T_H = 900 K and T_C = 270 K with 60 MW thermal input; cooling loop with mass flow 250 kg/s, c_p = 4.184 kJ/kg-K, and delta T = 20 C. Chemical neutralization of 980 kg H2SO4 (molar mass 98 g/mol) with NaOH (molar mass 40 g/mol) at 2 moles NaOH per mole H2SO4. Rocket stage with I_sp = 350 s (g_0 = 9.80665 m/s^2), initial mass 15,000 kg, final dry mass 3,000 kg. Building of seismic weight W = 120,000 kN with C_s = 0.15, resisting moment 54,000 kN-m vs overturning moment 30,000 kN-m. A black hole of 30 solar masses (where 1 solar mass has Schwarzschild radius 2.95 km) ejects a relativistic jet at v = 0.6c in a galaxy at distance d = 150 Mpc (Hubble constant H_0 = 70 km/s/Mpc). A three-phase industrial substation supplies P = 48 MW of real power at a lagging power factor of PF = 0.80. A confined aquifer with hydraulic conductivity K = 20 m/day, cross-sectional area A = 5,000 m^2, and hydraulic head drop dh = 15 m over flow length L = 500 m.\n- Cat 2 (CS, Frontier AI, Info Theory, Queueing, AppSec & BFT Crypto): LLM with N = 140 billion parameters trained on D = 2.0 trillion tokens (16 bytes/param in FP16 + AdamW). Downlink bandwidth 50 MHz at SNR = 63. Emergency dispatch center with c = 12 servers, service rate mu = 5 calls/hour, arrival rate lambda = 48 calls/hour. A penetration test identifies 2,000 total vulnerabilities, of which 10% are critical Known Exploited Vulnerabilities (KEV) requiring 8 engineering hours/vulnerability to patch within a 40-hour SLA per engineer. A Byzantine Fault Tolerant (BFT) distributed ledger with N = 130 validator nodes and a 256-bit cryptographic hash.\n- Cat 3 (Medicine, Epidemiology, Diagnostics, PK/PD & Genomics): Epidemic with R_0 = 5.0. Diagnostic assay with 5% prevalence, 96% sensitivity, and 92% specificity across 80,000 screened patients. IV drug dose 600 mg in V_d = 30 L with elimination k_e = 0.15 /h (ln 2 = 0.693). An autosomal recessive allele frequency is q = 0.20; a genomic sequencer generates 900 million reads of 150 bp across a 3 billion bp reference genome.\n- Cat 4 (Business, Quant Finance, Amortization, SaaS, EOQ & Macroeconomics): Portfolio return 16%, risk-free rate 4%, volatility 24% on $80 million at z = 1.65. Emergency bond of $150,000,000 at 5% annual interest amortized over 6 years. Enterprise SaaS with ARPU $75,000/year, 80% gross margin, 12% annual churn, and $100,000 CAC. Supply chain inventory has annual demand D = 80,000 units, order setup cost S = $200, holding cost H = $10/unit/year, daily demand d = 200 units/day, lead time L = 5 days, and safety stock SS = 400 units. Macroeconomic model with marginal propensity to consume MPC = 0.80 and government infrastructure stimulus dG = $20 billion.\n- Cat 5 (Law, Antitrust & Civil Litigation): Four-firm market shares 35%, 30%, 20%, and 15% where the 20% and 15% firms merge. Civil litigation tort verdict with $5,000,000 economic damages and $8,000,000 non-economic damages, 20% plaintiff comparative fault, and a $4,000,000 statutory cap on non-economic damages.\n- Cat 6 (Education & Psychometrics): Educational assessment with raw score 136, population mean 100, SD 12, k = 8 items, average inter-item correlation r = 0.50, and treatment mean 118 vs control mean 100 (pooled SD 12).\n- Cat 7 (Religion, Theology & Formal Logic): Biblical sanctuary inventory of 15 talents of silver (3,000 shekels/talent at 11.4 g/shekel) and 500 baths of oil (22 L/bath), alongside a formal logic system with n = 8 independent propositional variables.\n- Cat 8 (Ecology, Wildlife & Forestry Carbon): Mark-recapture survey marking M = 400 animals, recapturing C = 250 with R = 50 marked across 10,000 hectares, and 15,000 hectares of forest sequestering 5.0 metric tons C/ha/year.\n- Cat 9 (Humanities, Radiocarbon Archaeology & Political Science): Archaeological timber sample at 12.5% remaining C-14 (half-life 5,730 years), and a parliament with party seat shares of 50%, 30%, 10%, and 10%.\n- Cat 10 (Architecture & Construction EVM): Urban parcel of 15,000 m^2 with FAR 5.0 and 50% max lot coverage; construction project with BAC $100,000,000, Planned Value $60,000,000, Earned Value $54,000,000, and Actual Cost $45,000,000.\n- Cat 11 (Arts, Media, Film Render & Audio DSP): Animated film of 120 minutes at 24 fps requiring 3.0 render node-hours/frame, with a 60,000,000-impression campaign at $15 CPM. A digital audio master recorded at sampling rate f_s = 96,000 Hz, 24-bit depth, and 2 channels over 40 minutes.\n- Cat 12 (Transportation, Aviation Aerodynamics & Hospitality): An aircraft cruising at airspeed v = 120 m/s in air density rho = 1.0 kg/m^3 with wing planform area S = 60 m^2, lift coefficient C_L = 0.80, and drag coefficient C_D = 0.04. A convention hotel with 1,200 rooms at 80% occupancy and $250 ADR over 6 nights.\n- Cat 13 (Skilled Trades HVAC, Real Estate, Food Science & Exercise Physiology): Facility with 5,400,000 BTU/h sensible and 1,800,000 BTU/h latent cooling load (0.80 kW/ton chiller), and commercial property with $6,400,000 NOI valued at $80,000,000. Thermal pasteurization holds product for t = 24 seconds at a pathogen decimal reduction time D = 2.0 seconds; an athlete with resting heart rate 60 bpm and maximum heart rate 200 bpm trains at 80% heart-rate reserve.";
    const rows = hardRows(promptOmega);
    assert.equal(rows.find((r) => r.id === "population-5"), undefined);
    assert.equal(rows.find((r) => r.id === "population-6"), undefined);
    assert.equal(rows.find((r) => r.id === "population-8")?.quantity, 6_984_254);
    assert.equal(rows.find((r) => r.id === "energy-8")?.quantity, 7_390.273);
    assert.equal(rows.find((r) => r.id === "days-wind")?.quantity, 34.56);
    assert.equal(rows.find((r) => r.id === "sense-food-reserve")?.quantity, 24_000_000_000);
    assert.equal(rows.find((r) => r.id === "oxygen-lox-usable")?.quantity, 138_000_000);
    assert.equal(rows.find((r) => r.id === "oxygen-net-deficit")?.quantity, 279_600_000);
    assert.equal(rows.find((r) => r.id === "agri-net-usable-grain-tons")?.text.includes("5.4%"), true);
    assert.equal(rows.find((r) => r.id === "loan-total-paid-usd")?.text.includes("6-year"), true);
  });
  it("solves reversed-order domain phrasings and universal inline equation audits with full 60-domain provenance", () => {
    const qReversed = [
      "Audit these reversed-order engineering clauses and inline claims:",
      "- Carnot heat engine with T_C = 270 K and T_H = 900 K and 60 MW thermal input.",
      "- Rocket stage with final dry mass m_f = 3,000 kg, initial mass m_0 = 15,000 kg, and I_sp = 350 s (g_0 = 9.80665 m/s^2).",
      "- Construction project with Actual Cost $45,000,000, Earned Value $54,000,000, and Planned Value $60,000,000 on a FAR 5.0 parcel of 15,000 m^2.",
      "- Mark-recapture wildlife survey with R = 50 marked in C = 250 recaptured after marking M = 400 animals.",
      "- Commercial property valued at $80,000,000 generating NOI of $6,400,000.",
      "- Verify calculation: 14,500 * $38.50 = $558,250",
      "- Audit claim: 85% of 42,000 = 36,500",
    ].join("\n");
    const rows = hardRows(qReversed);
    assert.equal(rows.find((r) => r.id === "thermo-carnot-efficiency-pct")?.quantity, 70);
    assert.equal(rows.find((r) => r.id === "thermo-net-work-mw")?.quantity, 42);
    assert.equal(rows.find((r) => r.id === "astro-delta-v-ms")?.quantity, 5_524);
    assert.equal(rows.find((r) => r.id === "const-cpi-ratio")?.quantity, 1.2);
    assert.equal(rows.find((r) => r.id === "const-spi-ratio")?.quantity, 0.9);
    assert.equal(rows.find((r) => r.id === "arch-max-gfa-sqm")?.quantity, 75_000);
    assert.equal(rows.find((r) => r.id === "eco-mark-recapture-pop")?.quantity, 2_000);
    assert.equal(rows.find((r) => r.id === "realestate-cap-rate-pct")?.quantity, 8);
    const claim1 = rows.find((r) => r.id === "inline-claim-1");
    const claim2 = rows.find((r) => r.id === "inline-claim-2");
    assert.equal(claim1?.quantity, 558_250);
    assert.equal(claim1?.status, "RECOMPUTED");
    assert.equal(claim2?.quantity, 35_700);
    assert.equal(claim2?.status, "DISCREPANCY");

    const vTable = verificationTable(qReversed, rows.map((r) => r.text).join("\n"));
    assert.match(vTable, /\| inline-claim-1 \| 558250 units \| 558250 units \| 0 units \| VERIFIED \|/);
    assert.match(vTable, /\| inline-claim-2 \| 36500 units \| 35700 units \| 800 units \| DISCREPANCY \|/);

    const fullAnswer = withCalculations(qReversed, "");
    assert.match(fullAnswer, /PROVIDED: Carnot heat engine with T_C = 270 K/);
    assert.match(fullAnswer, /PROVIDED: Planned Value \$60,000,000/);
  });
  it("solves Domains 61–68 (Henderson-Hasselbalch, Ideal Gas, Orbital, Bernoulli, CAPM, Kelly, Black-Scholes, Poisson, Amdahl, BDP, Quadratic, Linear System, Calculus & Chained Expressions)", () => {
    const qD68 = [
      "Audit these scientific, quantitative finance, statistical, computer science, and algebraic calculations:",
      "- Buffer with pKa = 4.76, conjugate base [A-] = 0.50 M, and weak acid [HA] = 0.05 M; ideal gas with n = 10 mol, T = 300 K, and V = 24.6171 L.",
      "- Satellite in planetary field with gravitational parameter mu = 398,600 km^3/s^2 at orbital radius r = 6,643.3333 km; fluid of density rho = 1,000 kg/m^3 accelerating from v_1 = 4 m/s to v_2 = 10 m/s.",
      "- CAPM with risk-free rate 4%, beta = 1.5, and expected market return 12%; Kelly criterion with win probability p = 60% and net odds b = 2; bond with Macaulay duration 6.3 years at yield y = 5%.",
      "- Black-Scholes call option with spot S = $100, strike K = $100, risk-free rate r = 5%, volatility sigma = 20%, and maturity T = 1 year.",
      "- Poisson process with rate lambda = 2 for exactly k = 2 events; two-sample t-test with sample means 85 and 76 and standard error SE = 3.",
      "- Amdahl's law with 80% parallel fraction across N = 4 cores; TCP link of 10 Gbps with RTT = 40 ms.",
      "- Solve quadratic equation 1x^2 - 7x + 10 = 0; solve linear system 2x + 3y = 13 and 4x - 1y = 5.",
      "- Evaluate polynomial f(x) = 2x^3 + 3x^2 + 4x at x = 2.",
      "- Verify expression: (1,200 + 800) * 15 / 4 - 500 = 7,000",
    ].join("\n");
    const rows = hardRows(qD68);
    assert.equal(rows.find((r) => r.id === "chem-buffer-ph")?.quantity, 5.76);
    assert.equal(rows.find((r) => r.id === "chem-ideal-gas-pressure-atm")?.quantity, 10);
    assert.equal(rows.find((r) => r.id === "astro-circular-velocity-kms")?.quantity, 7.75);
    assert.equal(rows.find((r) => r.id === "astro-escape-velocity-kms")?.quantity, 10.95);
    assert.equal(rows.find((r) => r.id === "fluid-bernoulli-dp-kpa")?.quantity, 42);
    assert.equal(rows.find((r) => r.id === "fin-capm-return-pct")?.quantity, 16);
    assert.equal(rows.find((r) => r.id === "fin-kelly-fraction-pct")?.quantity, 40);
    assert.equal(rows.find((r) => r.id === "fin-modified-duration-yr")?.quantity, 6);
    assert.equal(rows.find((r) => r.id === "bs-d1")?.quantity, 0.35);
    assert.equal(rows.find((r) => r.id === "bs-call-price-usd")?.quantity, 10.45);
    assert.equal(rows.find((r) => r.id === "stat-poisson-prob-pct")?.quantity, 27.07);
    assert.equal(rows.find((r) => r.id === "stat-t-statistic")?.quantity, 3);
    assert.equal(rows.find((r) => r.id === "cs-amdahl-speedup")?.quantity, 2.5);
    assert.equal(rows.find((r) => r.id === "net-tcp-bdp-mb")?.quantity, 50);
    assert.equal(rows.find((r) => r.id === "alg-quadratic-discriminant")?.quantity, 9);
    assert.equal(rows.find((r) => r.id === "alg-quadratic-root-max")?.quantity, 5);
    assert.equal(rows.find((r) => r.id === "alg-linear-x")?.quantity, 2);
    assert.equal(rows.find((r) => r.id === "alg-linear-y")?.quantity, 3);
    assert.equal(rows.find((r) => r.id === "calc-derivative-val")?.quantity, 40);
    assert.equal(rows.find((r) => r.id === "calc-integral-val")?.quantity, 24);
    assert.equal(rows.find((r) => r.id === "inline-claim-1")?.quantity, 7_000);
  });
  it("solves all 4 interactive user test prompts (Quant Finance, Aerospace/Chem, Symbolic/Calculus, Systems/Stats) with exact DISCREPANCY detection", () => {
    const test1 = [
      "Audit this quantitative portfolio memo:",
      "1. Black-Scholes call option with spot S = 100, strike K = 100, risk-free rate r = 5%, volatility sigma = 20%, time T = 1 year -> d1 = 0.35, d2 = 0.15, call price = 10.45.",
      "2. CAPM with risk-free rate Rf = 4.5%, beta = 1.4, expected market return Rm = 10.5% -> expected return = 12.9%.",
      "3. Kelly criterion with win probability = 60% and net odds b = 2 -> Kelly fraction = 45%.",
      "4. Bond with Macaulay duration = 6.4 years and YTM = 6% (semiannual k = 2) -> modified duration = 6.214 years.",
      "5. Commercial property with property value of $120,000,000 and NOI of $9,600,000 -> Cap Rate = 8%.",
    ].join("\n");
    const out1 = attachHard(test1, "");
    assert.doesNotMatch(out1, /portfolio-unknown/);
    assert.match(out1, /\| bs-d1 \| 0\.35 z \| 0\.35 z \| 0 z \| VERIFIED \|/);
    assert.match(out1, /\| bs-d2 \| 0\.15 z \| 0\.15 z \| 0 z \| VERIFIED \|/);
    assert.match(out1, /\| bs-call-price-usd \| 10\.45 USD \| 10\.45 USD \| 0 USD \| VERIFIED \|/);
    assert.match(out1, /\| fin-capm-return-pct \| 12\.9 % \| 12\.9 % \| 0 % \| VERIFIED \|/);
    assert.match(out1, /\| fin-kelly-fraction-pct \| 45 % \| 40 % \| 5 % \| DISCREPANCY \|/);
    assert.match(out1, /\| fin-modified-duration-yr \| 6\.214 years \| 6\.214 years \| 0 years \| VERIFIED \|/);
    assert.match(out1, /\| realestate-cap-rate-pct \| 8 % \| 8 % \| 0 % \| VERIFIED \|/);

    const test2 = [
      "Verify the following aerospace and chemical engineering calculations:",
      "1. Rocket stage with initial wet mass m_0 = 20,000 kg, final dry mass m_f = 4,000 kg, and specific impulse I_sp = 380 s -> propellant mass = 16,000 kg and delta-v = 5,998 m/s.",
      "2. Spacecraft in circular orbit at altitude = 500 km -> orbital velocity = 7.613 km/s and escape velocity = 10.766 km/s.",
      "3. Carnot heat engine with T_C = 300 K, T_H = 1,200 K, and thermal input Q_H = 80 MW -> Carnot efficiency = 75% and mechanical work = 60 MW.",
      "4. Bernoulli flow with fluid density = 1000 kg/m^3, v1 = 3 m/s, v2 = 7 m/s, P1 = 250 kPa -> pressure drop = 20 kPa and outlet pressure P2 = 230 kPa.",
      "5. Ideal gas law with n = 4 mol, T = 350 K, V = 0.08 m^3 -> pressure = 145.499 kPa.",
      "6. Henderson-Hasselbalch buffer with pKa = 4.76, conjugate base [A-] = 0.5 M, weak acid [HA] = 0.05 M -> pH = 6.20.",
    ].join("\n");
    const out2 = attachHard(test2, "");
    assert.match(out2, /\| astro-circular-velocity-kms \| 7\.613 km\/s \| 7\.613 km\/s \| 0 km\/s \| VERIFIED \|/);
    assert.match(out2, /\| thermo-carnot-efficiency-pct \| 75 % \| 75 % \| 0 % \| VERIFIED \|/);
    assert.match(out2, /\| thermo-net-work-mw \| 60 MW \| 60 MW \| 0 MW \| VERIFIED \|/);
    assert.match(out2, /\| fluid-bernoulli-dp-kpa \| 20 kPa \| 20 kPa \| 0 kPa \| VERIFIED \|/);
    assert.match(out2, /\| fluid-bernoulli-p2-kpa \| 230 kPa \| 230 kPa \| 0 kPa \| VERIFIED \|/);
    assert.match(out2, /\| chem-ideal-gas-pressure-kpa \| 145\.499 kPa \| 145\.502 kPa \| 0\.003 kPa \| VERIFIED \|/);
    assert.match(out2, /\| chem-buffer-ph \| 6\.2 pH \| 5\.76 pH \| 0\.44 pH \| DISCREPANCY \|/);

    const test3 = [
      "Verify these mathematics and symbolic calculations:",
      "1. Quadratic equation 1x^2 - 7x + 10 = 0 -> discriminant = 9, root 1 = 5, root 2 = 2.",
      "2. Linear system 3x + 2y = 16 and 2x - 1y = 6 -> determinant = -7, x = 4, y = 2.",
      "3. Polynomial f(x) = 3x^3 - 4x^2 + 2x - 1 at x = 2 from a = 0 to b = 2 -> derivative f'(2) = 22 and definite integral = 3.333.",
      "4. Verify expression: (1800 + 600) * 3.5 - 900 / 3 = 8100.",
      "5. Verify expression: (500 * 4 - 200) / 6 + 150 = 480.",
    ].join("\n");
    const out3 = attachHard(test3, "");
    assert.match(out3, /\| calc-derivative-val \| 22 slope \| 22 slope \| 0 slope \| VERIFIED \|/);
    assert.match(out3, /\| calc-integral-val \| 3\.333 area \| 3\.333 area \| 0 area \| VERIFIED \|/);
    assert.match(out3, /\| inline-claim-2 \| 480 units \| 450 units \| 30 units \| DISCREPANCY \|/);

    const test4 = [
      "Audit this systems & project engineering report:",
      "1. Amdahl's law with parallelizable fraction p = 90% and N = 16 cores -> speedup = 6.4x.",
      "2. TCP link with bandwidth = 40 Gbps and RTT = 50 ms -> bandwidth-delay product = 250 MB.",
      "3. Poisson process with arrival rate lambda = 3 and k = 2 events -> exact probability P(X=k) = 22.404% and cumulative P(X<=k) = 42.319%.",
      "4. Two-sample t-test with mean1 = 92, mean2 = 85, sd1 = 5, sd2 = 4, n1 = 25, n2 = 16 -> t-statistic = 4.95.",
      "5. Construction project with Earned Value $48,000,000, Actual Cost $40,000,000, and Planned Value $50,000,000 -> CPI = 1.2 and SPI = 0.96.",
    ].join("\n");
    const out4 = attachHard(test4, "");
    assert.match(out4, /\| cs-amdahl-speedup \| 6\.4 x \| 6\.4 x \| 0 x \| VERIFIED \|/);
    assert.match(out4, /\| net-tcp-bdp-mb \| 250 MB \| 250 MB \| 0 MB \| VERIFIED \|/);
    assert.match(out4, /\| stat-poisson-prob-pct \| 22\.404 % \| 22\.404 % \| 0 % \| VERIFIED \|/);
    assert.match(out4, /\| stat-poisson-cum-pct \| 42\.319 % \| 42\.319 % \| 0 % \| VERIFIED \|/);
    assert.match(out4, /\| stat-t-statistic \| 4\.95 t \| 4\.95 t \| 0 t \| VERIFIED \|/);
    assert.match(out4, /\| const-cpi-ratio \| 1\.2 ratio \| 1\.2 ratio \| 0 ratio \| VERIFIED \|/);
    assert.match(out4, /\| const-spi-ratio \| 0\.96 ratio \| 0\.96 ratio \| 0 ratio \| VERIFIED \|/);
  });

  it("enforces Vibe + Noctis Learning Journey mastery gates, 8-action tutor citations, and 4-wave professional catalogue rules", () => {
    assert.equal(RELEASE_WAVES.length, 4);
    assert.ok(COURSE_GROUPS.length >= 22);

    // Verify AWS (Cloud) vs. AWS (American Welding Society) disambiguation and official exam boundaries
    const cloudAws = getCourseRecordDetails("cloud", "Amazon Web Services (AWS)", "AWS Certified Solutions Architect – Associate");
    assert.match(cloudAws.certificationProvider, /Amazon Web Services/i);
    assert.match(cloudAws.officialExamOrLicensingRequirements, /AWS Training & Certification/i);
    assert.equal(cloudAws.lastVerifiedDate, "2026-10-22");

    const weldingAws = getCourseRecordDetails("weld", "Welding Processes", "Shielded Metal Arc Welding (SMAW / Stick)");
    assert.match(weldingAws.certificationProvider, /American Welding Society/i);
    assert.match(weldingAws.officialExamOrLicensingRequirements, /accredited test facility/i);

    const hvacEpa = getCourseRecordDetails("mep", "HVAC & Refrigeration", "EPA Section 608 Refrigerant Handling Preparation");
    assert.match(hvacEpa.officialExamOrLicensingRequirements, /Section 608/i);

    // Verify Web Design flagship journey has 6 modules and separates Exposure from Mastery
    const webPath = JOURNEY_PATHS.find((p) => p.id === "web")!;
    assert.ok(webPath);
    assert.equal(webPath.modules.length, 6);

    // Viewing lessons alone only grants Exposure, never Mastery
    const exposureStore = {
      ...EMPTY_JOURNEY,
      seen: true,
      lessonsViewed: { web: webPath.modules.map((m) => m.lessons[0]!.id) },
    };
    const exposureIndicators = computeJourneyIndicators(webPath, exposureStore);
    assert.equal(exposureIndicators.masteryTier, "Exposure");
    assert.equal(exposureIndicators.knowledgeMasteryPct, 0);
    assert.equal(getJourneyLifecycleState(webPath, exposureStore), "Active");

    // Passing all module checks and submitting a verified rubric-matching final project achieves Mastery & Completed state
    const fullProjectSubmission =
      "<!doctype html><main><h1>Responsive Portfolio</h1><nav><a href='#work'>Work</a></nav><section id='work'><p>Grid and flex layout with @media mobile breakpoint and clean padding spacing. Published at https://example.vercel.app</p></section></main>";
    const evalResult = evaluateProjectSubmission(webPath, fullProjectSubmission);
    assert.equal(evalResult.verified, true);
    assert.ok(evalResult.scorePct >= 75);

    const masteryStore = {
      ...EMPTY_JOURNEY,
      seen: true,
      lessonsViewed: { web: webPath.modules.map((m) => m.lessons[0]!.id) },
      practicesDone: { web: webPath.modules.map((m) => m.lessons[0]!.id) },
      checks: { web: webPath.modules.map((m) => m.id) },
      projects: { web: fullProjectSubmission },
    };
    const masteryIndicators = computeJourneyIndicators(webPath, masteryStore);
    assert.equal(masteryIndicators.masteryTier, "Mastery");
    assert.equal(masteryIndicators.knowledgeMasteryPct, 100);
    assert.equal(getJourneyLifecycleState(webPath, masteryStore), "Completed");

    // Verify Noctis context-aware tutor response includes verified source citations
    const tutorReply = generateNoctisTutorResponse(
      "simpler",
      webPath,
      webPath.modules[0]!,
      webPath.modules[0]!.lessons[0]!,
      masteryStore,
    );
    assert.ok(tutorReply.citations.length > 0);
    assert.match(tutorReply.uncertaintyNote, /never fabricates citations/i);

    // Verify dynamic 5-stage course generation for skilled trades and certifications
    const tradePath = pathForNamedCourse("Three-Phase Motors, Transformers & Controls");
    assert.equal(tradePath.modules.length, 4);
    assert.ok(tradePath.projectRubric && tradePath.projectRubric.length >= 3);
  });

  it("verifies Discover-Journey Integration, 3 Discover menu channels (Academy, Reels, News & Analysis), Unified Learning Actions, and 10 Capabilities", () => {
    // 1. Core 6-stage promise of Vibe (Discover -> Journey -> Learn -> Practise -> Prove -> Advance)
    assert.equal(CORE_VIBE_PROMISE_STAGES.length, 6);
    assert.deepEqual(
      CORE_VIBE_PROMISE_STAGES.map((s) => s.stage),
      ["Discover", "Journey", "Learn", "Practise", "Prove", "Advance"],
    );

    // 2. Unified Learning Actions menu adapts to all 4 content types
    const videoActions = getAdaptiveLearningActions("video-reel");
    const articleActions = getAdaptiveLearningActions("article-analysis");
    const certActions = getAdaptiveLearningActions("course-certification");
    const demoActions = getAdaptiveLearningActions("project-demo");
    assert.equal(videoActions[0]?.title, "Watch or resume");
    assert.equal(articleActions[0]?.title, "Read and annotate");
    assert.equal(certActions[0]?.title, "Inspect course & exam objectives");
    assert.equal(certActions[3]?.title, "Create a quiz");
    assert.equal(demoActions[0]?.title, "Watch demonstration & safety brief");

    // 3. Reconciled Discover Menu Channels (Academy, Reels, News & Analysis, plus separate Entertainment)
    const awsVideo = DISCOVER_CONTENT_ITEMS.find((i) => i.id === "disc-aws-intro")!;
    const awsArticle = DISCOVER_CONTENT_ITEMS.find((i) => i.id === "disc-aws-iam-article")!;
    const cyberReel = DISCOVER_CONTENT_ITEMS.find((i) => i.id === "disc-cyber-packets-reel")!;
    const entItem = DISCOVER_CONTENT_ITEMS.find((i) => i.id === "disc-ent-hall-football")!;
    assert.equal(getDiscoverMenuChannel(awsVideo), "academy");
    assert.equal(getDiscoverMenuChannel(awsArticle), "news");
    assert.equal(getDiscoverMenuChannel(cyberReel), "reels");
    assert.equal(getDiscoverMenuChannel(entItem), "entertainment");

    // 4. Build a 5-stage AWS Cloud Computing Journey from Discover content and attach original resource
    const builtAws = buildJourneyFromDiscoverContent(
      EMPTY_DISCOVER_JOURNEY_STATE,
      "disc-aws-intro",
    );
    assert.equal(builtAws.ok, true);
    assert.ok(builtAws.journey);
    assert.equal(builtAws.journey.modules.length, 5);
    assert.match(builtAws.journey.modules[0]!.title, /Cloud computing fundamentals/i);
    assert.match(builtAws.journey.modules[4]!.title, /Practice assessment and certification preparation/i);
    assert.equal(builtAws.attachedLink?.contentId, "disc-aws-intro");

    // 5. Build a 5-stage Skilled Trade Journey (Carpentry) with safety & supervised practice steps
    const builtCarpentry = buildJourneyFromDiscoverContent(
      builtAws.state,
      "disc-carpentry-framing-demo",
    );
    assert.equal(builtCarpentry.ok, true);
    assert.ok(builtCarpentry.journey);
    assert.equal(builtCarpentry.journey.modules.length, 5);
    assert.match(builtCarpentry.journey.modules[0]!.title, /safety, PPE/i);
    assert.match(builtCarpentry.journey.modules[3]!.title, /Supervised hands-on practice/i);

    // 6. Add Discover content to an existing Journey and prevent duplicate links in the same lesson
    const webJourney = JOURNEY_PATHS.find((p) => p.id === "web")!;
    const firstLink = linkContentToJourney(
      EMPTY_DISCOVER_JOURNEY_STATE,
      "disc-web-semantic-video",
      webJourney,
    );
    assert.equal(firstLink.ok, true);
    const duplicateAttempt = linkContentToJourney(
      firstLink.state,
      "disc-web-semantic-video",
      webJourney,
    );
    assert.equal(duplicateAttempt.ok, false);
    assert.match(duplicateAttempt.error ?? "", /already linked to this lesson/i);

    // 7. Removing a link from Journey preserves the original Discover content item
    const afterRemove = removeContentLink(firstLink.state, firstLink.link!.linkId);
    assert.equal(afterRemove.links.length, 0);
    assert.ok(listDiscoverContent({ query: "Semantic HTML5" }).some((i) => i.id === "disc-web-semantic-video"));

    // 8. Lesson-aware recommendations exclude entertainment and explain why each item is relevant
    const recs = getJourneyRecommendations(
      webJourney,
      webJourney.modules[0]!,
      webJourney.modules[0]!.lessons[0]!,
      EMPTY_JOURNEY,
      firstLink.state,
    );
    assert.ok(recs.length > 0);
    assert.equal(recs.some((r) => !r.item.isEducational), false);
    assert.ok(recs.every((r) => r.whyRecommended.length > 15));

    // 9. Error handling for invalid, deleted, or inaccessible Discover resources
    const invalidAttempt = linkContentToJourney(
      EMPTY_DISCOVER_JOURNEY_STATE,
      "non-existent-id-999",
      webJourney,
    );
    assert.equal(invalidAttempt.ok, false);
    assert.match(invalidAttempt.error ?? "", /invalid, inaccessible/i);

    // 10. Reviewing Discover content records Exposure only and never claims Mastery
    const reviewedState = markDiscoverItemReviewed(firstLink.state, "disc-web-semantic-video");
    assert.ok(reviewedState.reviewedContentIds.includes("disc-web-semantic-video"));
    const indicatorsAfterReview = computeJourneyIndicators(webJourney, EMPTY_JOURNEY);
    assert.equal(indicatorsAfterReview.knowledgeMasteryPct, 0);

    // Verify News & Analysis / Hall KnowledgeAsset conversion and 10 Capabilities datasets
    const newsItem = discoverItemFromKnowledgeAsset({
      assetId: "news-aws-zero-trust",
      title: "AWS Cloud Zero-Trust Architecture Report",
      source: "BBC News",
      category: "News",
    });
    assert.equal(newsItem.courseId, "aws-cloud");
    assert.equal(getDiscoverMenuChannel(newsItem), "news");
    assert.ok(CAREER_OCCUPATIONS.length >= 4);
    assert.ok(PRACTICAL_SIMULATIONS.length >= 4);
    assert.ok(CERTIFICATION_READINESS_TRACKS.length >= 4);
  });

  it("verifies Journey-to-Learn Integration, Shared Curriculum Engine, Position Memory, Progress Sync, and Lesson-Aware Noctis Context", () => {
    const cyberJourney = JOURNEY_PATHS.find((p) => p.id === "cyber")!;
    const webJourney = JOURNEY_PATHS.find((p) => p.id === "web")!;

    // 1. Clicking "Start this journey" opens the first available lesson with shared IDs
    const started = resolveJourneyActionToLearn("start-journey", {
      journey: cyberJourney,
      store: EMPTY_JOURNEY,
    });
    assert.equal(started.record.courseId, "cyber");
    assert.equal(started.record.journeyId, "cyber");
    assert.equal(started.record.moduleId, cyberJourney.modules[0]!.id);
    assert.equal(started.record.lessonId, cyberJourney.modules[0]!.lessons[0]!.id);
    assert.equal(started.routePath, `/learn/lessons/${cyberJourney.modules[0]!.lessons[0]!.id}`);
    assert.equal(started.activity, "lesson");

    // 2. Selecting a roadmap module opens its lesson list
    const modSelected = resolveJourneyActionToLearn("select-module", {
      journey: cyberJourney,
      moduleId: cyberJourney.modules[1]!.id,
      store: started.store,
    });
    assert.equal(modSelected.activity, "module-list");
    assert.equal(
      modSelected.routePath,
      `/learn/journeys/cyber/modules/${cyberJourney.modules[1]!.id}`,
    );

    // 3. Clicking "Continue Learning" resumes the correct activity
    const resumeTarget = resolveContinueLearningTarget(started.store);
    assert.equal(resumeTarget.record.journeyId, "cyber");
    assert.equal(resumeTarget.record.lessonId, cyberJourney.modules[0]!.lessons[0]!.id);
    assert.match(resumeTarget.buttonLabel, /Continue/i);

    // 4. Completing a lesson activity updates Journey and Learn consistently without treating viewing alone as mastery
    const viewedOnly = completeLearnActivity(started.store, {
      journeyId: "cyber",
      moduleId: cyberJourney.modules[0]!.id,
      lessonId: cyberJourney.modules[0]!.lessons[0]!.id,
      type: "view-lesson",
    });
    assert.equal(viewedOnly.indicators.knowledgeMasteryPct, 0);

    const practiced = completeLearnActivity(viewedOnly.store, {
      journeyId: "cyber",
      moduleId: cyberJourney.modules[0]!.id,
      lessonId: cyberJourney.modules[0]!.lessons[0]!.id,
      type: "complete-practice",
      practiceResponse: "Used parameterized prepared statements and input allow-listing.",
    });
    assert.equal(practiced.lessonStatus, "Awaiting Assessment");
    assert.ok(practiced.indicators.practicesCompletedCount >= 1);

    // 5. Quiz results update progress and remediation recommendations
    const wrongChoice = (cyberJourney.modules[0]!.check.answer + 1) % 3;
    const failedQuiz = completeLearnActivity(practiced.store, {
      journeyId: "cyber",
      moduleId: cyberJourney.modules[0]!.id,
      lessonId: cyberJourney.modules[0]!.lessons[0]!.id,
      type: "submit-quiz",
      quizChoice: wrongChoice,
    });
    assert.equal(failedQuiz.quizPassed, false);
    assert.ok(failedQuiz.remediationRecommendation);
    assert.equal(failedQuiz.lessonStatus, "Needs Revision");

    // Passing the quiz clears revisionQueue and updates knowledgeMasteryPct in both Journey and Learn
    const passedQuiz = completeLearnActivity(failedQuiz.store, {
      journeyId: "cyber",
      moduleId: cyberJourney.modules[0]!.id,
      lessonId: cyberJourney.modules[0]!.lessons[0]!.id,
      type: "submit-quiz",
      quizChoice: cyberJourney.modules[0]!.check.answer,
    });
    assert.equal(passedQuiz.quizPassed, true);
    assert.ok(passedQuiz.indicators.knowledgeMasteryPct > 0);
    assert.equal(passedQuiz.lessonStatus, "Completed");

    // 6. Noctis can explain the current lesson without the user repeating its title
    const noctisCtx = buildAuthorisedNoctisLessonContext(
      started.record,
      passedQuiz.store,
      "simpler",
    );
    assert.equal(noctisCtx.lessonId, started.record.lessonId);
    assert.ok(noctisCtx.lessonTitle.length > 0);
    assert.ok(noctisCtx.contextualPrompt.includes(started.record.lesson.title));
    assert.ok(noctisCtx.tutorResponse.heading.includes(started.record.lesson.title));

    // 7. Users can discover and study courses without creating a Journey first & no duplicate copies are created
    const sharedCourses = listAllSharedJourneys(EMPTY_JOURNEY);
    const uniqueIds = new Set(sharedCourses.map((c) => c.id));
    assert.equal(sharedCourses.length, uniqueIds.size);
    const directStudyAccess = validateLearnRouteAccess({
      lessonId: webJourney.modules[0]!.lessons[0]!.id,
      store: EMPTY_JOURNEY,
    });
    assert.equal(directStudyAccess.valid, true);
    assert.equal(directStudyAccess.record?.journeyId, "web");

    // 8. Route validation rejects mismatched journey/lesson pairs and verifies 6 format cards & 9 action connections
    const mismatched = validateLearnRouteAccess({
      journeyId: "science",
      lessonId: webJourney.modules[0]!.lessons[0]!.id,
      store: EMPTY_JOURNEY,
    });
    assert.equal(mismatched.valid, false);
    assert.equal(LEARN_FORMAT_CARDS.length, 6);
    assert.equal(JOURNEY_TO_LEARN_CONNECTIONS.length, 9);
    const myLessonsBundle = getMyJourneyLessons(passedQuiz.store);
    assert.ok(myLessonsBundle.myLessons.length > 0);
  });

  it("satisfies all 10 Noctis Work Tab Acceptance Tests and the Cloud Security Analyst end-to-end flow", () => {
    // 1. Work Dashboard loads with Careers, Certifications, Skilled Trades, Projects, Opportunities, Portfolio, Career Readiness, and Skills Passport
    const initialStore = readWorkStore();
    assert.ok(WORK_CAREERS.length >= 5);
    assert.ok(WORK_CREDENTIALS.length >= 7);
    assert.equal(WORK_SKILLED_TRADES.length, 8);
    assert.ok(WORK_PROJECTS.length >= 4);
    assert.ok(WORK_OPPORTUNITIES.length >= 5);
    assert.ok(initialStore.passportItems.length >= 1);

    // 2. Users can select a career (Cloud Security Analyst) and build a corresponding learning path in Journey
    const builtCareer = buildCareerJourney("cloud-security-analyst", EMPTY_JOURNEY, EMPTY_WORK_STORE);
    assert.equal(builtCareer.career.id, "cloud-security-analyst");
    assert.equal(builtCareer.career.title, "Cloud Security Analyst");
    assert.ok(builtCareer.journey.modules.length > 0);
    assert.equal(builtCareer.workStore.selectedCareerId, "cloud-security-analyst");
    assert.ok(builtCareer.learnTarget.routePath.startsWith("/learn/lessons/"));

    // 3. Users can browse certifications by provider and start preparation in Learn
    const awsCreds = WORK_CREDENTIALS.filter((c) => c.provider === "AWS");
    const msCreds = WORK_CREDENTIALS.filter((c) => c.provider === "Microsoft");
    const comptiaCreds = WORK_CREDENTIALS.filter((c) => c.provider === "CompTIA");
    const splunkCreds = WORK_CREDENTIALS.filter((c) => c.provider === "Splunk");
    assert.ok(awsCreds.length >= 1);
    assert.ok(msCreds.length >= 1);
    assert.ok(comptiaCreds.length >= 1);
    assert.ok(splunkCreds.length >= 1);

    const startedPrep = startCredentialPrepInLearn("cred-aws-clf", builtCareer.journeyStore);
    assert.equal(startedPrep.credential.id, "cred-aws-clf");
    assert.ok(startedPrep.learnRoutePath.startsWith("/learn/lessons/"));

    // 4. Users can explore all 8 skilled trades with clear safety and supervised-practice requirements
    const tradeCategories = WORK_SKILLED_TRADES.map((t) => t.category);
    for (const expectedTrade of [
      "Carpentry",
      "Masonry",
      "Construction",
      "Electrical",
      "Plumbing",
      "HVAC",
      "Welding",
      "Automotive Repair",
    ]) {
      assert.ok(
        tradeCategories.includes(expectedTrade as never),
        `Missing trade category: ${expectedTrade}`,
      );
    }
    for (const trade of WORK_SKILLED_TRADES) {
      assert.ok(trade.safetyInstructions.length >= 2);
      assert.ok(trade.supervisedPracticeRequirements.length > 10);
      assert.ok(trade.localLicensingAndRegulatoryNote.length > 10);
    }

    // 5. Users can complete a project and add evidence to their portfolio / Skills Passport
    const readinessBefore = computeCareerReadiness(
      "cloud-security-analyst",
      startedPrep.journeyStore,
      builtCareer.workStore,
    );
    const submittedProj = submitWorkProjectEvidence(builtCareer.workStore, {
      projectId: "proj-cloud-sec-webapp",
      completedTaskIds: ["task-1", "task-2", "task-3", "task-4"],
      submissionText:
        "Configured least-privilege IAM policy roles, parameterized SQL queries with input validation, enabled SIEM CloudTrail alerts, and hardened VPC security groups.",
      attachToPassport: true,
    });
    assert.equal(submittedProj.submission.status, "verified");
    assert.ok(submittedProj.passportItem);
    assert.equal(submittedProj.passportItem?.verificationTier, "ai-reviewed");

    const readinessAfter = computeCareerReadiness(
      "cloud-security-analyst",
      startedPrep.journeyStore,
      submittedProj.workStore,
    );
    assert.ok(readinessAfter.readinessPct >= readinessBefore.readinessPct);
    assert.match(readinessAfter.disclaimer, /not an official third-party certification/i);

    // 6. Opportunity matching shows both matching skills and missing qualifications (and flags expired listings)
    const allMatches = matchOpportunitiesForLearner(
      startedPrep.journeyStore,
      submittedProj.workStore,
      { includeExpired: true },
    );
    const socMatch = allMatches.find((m) => m.opportunity.id === "opp-junior-soc-analyst");
    assert.ok(socMatch);
    assert.ok(socMatch.matchingSkills.length > 0);
    assert.ok(Array.isArray(socMatch.missingSkills));
    assert.match(socMatch.disclaimer, /not an employer hiring decision/i);

    const expiredMatch = allMatches.find((m) => m.isOutdatedOrExpired);
    assert.ok(expiredMatch, "Expected at least one expired opportunity for transparent flagging");

    const activeOnlyMatches = matchOpportunitiesForLearner(
      startedPrep.journeyStore,
      submittedProj.workStore,
      { includeExpired: false },
    );
    assert.ok(activeOnlyMatches.every((m) => !m.isOutdatedOrExpired));

    // 7. Portfolio / Skills Passport records remain private by default until shared by the user
    assert.equal(submittedProj.workStore.defaultPortfolioVisibility, "private");
    assert.equal(submittedProj.passportItem?.visibility, "private");
    const updatedVis = updatePassportVisibility(
      submittedProj.workStore,
      submittedProj.passportItem!.id,
      "employers-only",
    );
    const updatedRecord = updatedVis.passportItems.find(
      (r) => r.id === submittedProj.passportItem?.id,
    );
    assert.equal(updatedRecord?.visibility, "employers-only");

    // 8. External credentials are not marked as earned unless verified (self-reported by default)
    const withExtCred = recordExternalCredentialClaim(updatedVis, {
      credentialId: "cred-comptia-secplus",
      title: "CompTIA Security+ (SY0-701)",
      issuer: "CompTIA",
      credentialNumberOrUrl: "COMP-12345",
      skillsDemonstrated: ["SIEM Log Analysis & Incident Triage"],
    });
    const latestRecord = withExtCred.passportItems[0]!;
    assert.equal(latestRecord.verificationTier, "self-reported");
    assert.equal(
      withExtCred.externalCredentialClaims["cred-comptia-secplus"]?.verificationTier,
      "self-reported",
    );

    // 9 & 10. Recommended next steps coordinate Discover -> Journey -> Learn -> Work -> Proof
    const nextSteps = getWorkRecommendedNextSteps(startedPrep.journeyStore, withExtCred);
    assert.equal(nextSteps.length, 4);
    assert.ok(nextSteps.some((s) => s.badge === "CONTINUE"));
    assert.ok(nextSteps.some((s) => s.badge === "CERTIFICATION"));
    assert.ok(nextSteps.some((s) => s.badge === "PROJECT"));
    assert.ok(nextSteps.some((s) => s.badge === "OPPORTUNITY"));
  });

  it("generates complete Python, Java, and C verification code for SQL injection, OWASP Top 10:2025, OWASP API Top 10:2023, and polyglot training", async () => {
    const { skillFromWords } = await import("./noctis-skills.ts");
    const { owaspCodeGadget, OWASP_2025_SPECS, OWASP_API_2023_SPECS, PORTSWIGGER_ACADEMY_SPECS } = await import("./owasp-suite.ts");

    assert.equal(skillFromWords("write a python code to test sql injection"), "");
    assert.equal(skillFromWords("Write Python, Java, and C scripts for OWASP Top 10:2025"), "");
    assert.equal(skillFromWords("How do we train Noctis to write a complete programming tasks in python, Java, C, OTHER LANGUAGES"), "");

    assert.equal(OWASP_2025_SPECS.length, 10);
    assert.equal(OWASP_API_2023_SPECS.length, 10);

    const sqliText = owaspCodeGadget("write a python code to test sql injection");
    assert.ok(sqliText);
    assert.doesNotMatch(sqliText, /retrieved pages from the GitHub search/i);
    assert.match(sqliText, /A05:2025/);
    assert.match(sqliText, /```python/);
    assert.match(sqliText, /sqlite3\.connect\(":memory:"\)/);
    assert.match(sqliText, /```java/);
    assert.match(sqliText, /PreparedStatement/);
    assert.match(sqliText, /```c/);
    assert.match(sqliText, /sqlite3_bind_text/);

    const owasp2025Prompt = `lets train Noctis to write script for python, java, or c code to do OWASP TO 10 : https://top10.owasp.org/2025/A04_2025-Cryptographic_Failures/`;
    const out2025 = owaspCodeGadget(owasp2025Prompt);
    assert.ok(out2025);
    for (const id of ["A01:2025", "A02:2025", "A03:2025", "A04:2025", "A05:2025", "A06:2025", "A07:2025", "A08:2025", "A09:2025", "A10:2025"]) {
      assert.ok(out2025.includes(id), `Expected ${id} in OWASP Top 10:2025 output`);
    }
    assert.match(out2025, /AES-256-GCM/);
    assert.match(out2025, /AES\/GCM\/NoPadding/);
    assert.match(out2025, /constant_time_tag_equals/);

    const api2023Prompt = `OWASP API Security Top 10 (2023 List) API1:2023 Broken Object Level Authorization API2:2023 Broken Authentication API3:2023 API4:2023 API5:2023 API6:2023 API7:2023 API8:2023 API9:2023 API10:2023`;
    const outApi = owaspCodeGadget(api2023Prompt);
    assert.ok(outApi);
    for (const id of ["API1:2023", "API2:2023", "API3:2023", "API4:2023", "API5:2023", "API6:2023", "API7:2023", "API8:2023", "API9:2023", "API10:2023"]) {
      assert.ok(outApi.includes(id), `Expected ${id} in OWASP API Top 10:2023 output`);
    }

    const polyglot = owaspCodeGadget("How do we train Noctis to write a complete programming tasks in python, Java, C, OTHER LANGUAGES");
    assert.ok(polyglot);
    assert.match(polyglot, /Vibe Polyglot Code & Security Training Architecture/);
    assert.match(polyglot, /```python/);
    assert.match(polyglot, /```java/);
    assert.match(polyglot, /```c/);

    const wafPrompt = `../../../../etc/passwd ..\\..\\..\\..\\Windows\\win.ini php://filter/convert.base64-encode/resource=index.php admin' -- ' UNION SELECT version(), user(), null-- PG_SLEEP(5)-- <script>alert(document.domain)</script> ; cat /etc/passwd <!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]> dict://127.0.0.1:11211/ {{7*7}}`;
    const outWaf = owaspCodeGadget(wafPrompt);
    assert.ok(outWaf);
    for (const id of ["WAF-LFI:2025", "WAF-SQLI:2025", "WAF-XSS:2025", "WAF-CMDI:2025", "WAF-XXE:2025", "WAF-SSRF:2025", "WAF-SSTI:2025"]) {
      assert.ok(outWaf.includes(id), `Expected ${id} in 7-Vector WAF output`);
    }
    assert.match(outWaf, /Step-by-Step Tester Verification & Execution Procedure/);

    assert.equal(PORTSWIGGER_ACADEMY_SPECS.length, 13);
    const psPrompt = `lets train Noctis to do these : All topics https://portswigger.net/web-security/sql-injection https://portswigger.net/web-security/csrf https://portswigger.net/web-security/request-smuggling https://portswigger.net/web-security/deserialization https://portswigger.net/web-security/jwt https://portswigger.net/web-security/graphql https://portswigger.net/web-security/race-conditions https://portswigger.net/web-security/llm-attacks`;
    const outPs = owaspCodeGadget(psPrompt);
    assert.ok(outPs);
    for (const spec of PORTSWIGGER_ACADEMY_SPECS) {
      assert.ok(outPs.includes(spec.id), `Expected ${spec.id} in PortSwigger Academy output`);
    }
    assert.match(outPs, /Step-by-Step Tester Verification & Execution Procedure/);

    const {
      computeInherentRisk,
      computeResidualRisk,
      computeFairQuantification,
      riskLifecycleGadget,
      domainCertificationGadget,
      TWENTY_ADVANCED_RISK_CAPABILITIES,
      TWENTY_SPECIALIZED_DOMAINS,
      TEN_CROSS_DOMAIN_CAPABILITIES,
      MANDATORY_ASSURANCE_TESTS,
      evaluateZeroTrustAccess,
      zeroTrustGadget,
      CISA_ZTMM_PILLARS,
      ZERO_TRUST_EVAL_DATASET,
      FORTY_SPECIALIZED_DOMAIN_PACKS,
      CYBER_OPS_12_DOMAINS,
      CYBER_OPS_9_LIFECYCLE_STAGES,
      cyberOperationsGadget,
    } = await import("./noctis-risk-engine.ts");

    assert.equal(computeInherentRisk(4, 5), 20);
    const unverified = computeResidualRisk({
      inherentLikelihood: 4,
      inherentImpact: 5,
      controlEffectiveness: "Policy-Only (Unverified)",
      evidenceVerified: false,
    });
    assert.equal(unverified.residualRisk, 20);
    assert.equal(unverified.reductionApplied, false);

    const verified = computeResidualRisk({
      inherentLikelihood: 4,
      inherentImpact: 5,
      controlEffectiveness: "Verified Effective",
      evidenceVerified: true,
      likelihoodReduction: 2,
      impactReduction: 1,
    });
    assert.equal(verified.residualRisk, 8);
    assert.equal(verified.reductionApplied, true);

    const fair = computeFairQuantification(0.1, 2_000_000);
    assert.equal(fair.expectedAnnualLossUsd, 200_000);

    assert.equal(TWENTY_ADVANCED_RISK_CAPABILITIES.length, 20);
    assert.equal(MANDATORY_ASSURANCE_TESTS.length, 10);
    assert.equal(TWENTY_SPECIALIZED_DOMAINS.length, 20);
    assert.equal(TEN_CROSS_DOMAIN_CAPABILITIES.length, 10);

    const rmfOut = riskLifecycleGadget(
      "Training Noctis to Perform the Complete Risk Management Lifecycle NIST SP 800-37 Rev. 2 NIST SP 800-30 ISO 31000 FAIROrganizational risk digital twin Risk Management Maturity Engine",
    );
    assert.ok(rmfOut);
    assert.match(rmfOut, /Three-Engine Architecture/);
    assert.match(rmfOut, /200,000/);
    assert.match(rmfOut, /CAP-01/);
    assert.match(rmfOut, /CAP-20/);
    assert.match(rmfOut, /EVAL-SCENARIO-01/);
    assert.match(rmfOut, /EVAL-SCENARIO-05/);
    assert.match(rmfOut, /RMF-TEST-01/);
    assert.match(rmfOut, /RMF-TEST-10/);
    assert.match(rmfOut, /Step-by-Step Tester Verification & Execution Procedure/);

    const domOut = domainCertificationGadget(
      "The major domains to train Noctis on: 1. Cybersecurity and digital defense 2. Engineering and applied sciences 3. Artificial intelligence and data science Noctis Domain Certification Engine",
    );
    assert.ok(domOut);
    assert.match(domOut, /Noctis 20-Core \/ 40-Specialist Domain Pack Intelligence & Domain Certification Engine/);
    assert.match(domOut, /18\. History, Geography & Cultural Knowledge/);
    assert.match(domOut, /#40 — Advanced AI Engineering & Cyber Operations/);
    assert.match(domOut, /Step-by-Step Tester Verification & Execution Procedure/);

    assert.equal(FORTY_SPECIALIZED_DOMAIN_PACKS.length, 40);
    assert.equal(CYBER_OPS_12_DOMAINS.length, 12);
    assert.equal(CYBER_OPS_9_LIFECYCLE_STAGES.length, 9);
    assert.equal(CISA_ZTMM_PILLARS.length, 8);
    assert.equal(ZERO_TRUST_EVAL_DATASET.length, 6);
    const ztaNonCompliant = evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-01",
      principalId: "emp-alice@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL2",
      deviceCompliant: false,
      edrActive: false,
      telemetryAgeMinutes: 2,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-sensitive-finance-ledger",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    });
    assert.equal(ztaNonCompliant.decision, "DENY");
    assert.match(ztaNonCompliant.policyRuleId, /ZTA-POL-DEVICE-03/);

    const ztaOut = zeroTrustGadget(
      "lets do zero trust for noctis: Noctis Zero Trust Intelligence Engine NIST SP 800-207 CISA Zero Trust Maturity Model 2.0 NIST SP 800-207A NIST SP 800-63 Simulated Zero Trust access request",
    );
    assert.ok(ztaOut);
    assert.match(ztaOut, /Noctis Zero Trust Intelligence Engine/);
    assert.match(ztaOut, /ZTA-POL-DEVICE-03/);
    assert.match(ztaOut, /Step-by-Step Tester Verification & Execution Procedure/);

    const cyberOpsOut = cyberOperationsGadget(
      "Training Noctis in Offensive Security, Penetration Testing, Red Teaming and Blue Team Defense Black hat White hat Blue team Red team Purple team",
    );
    assert.ok(cyberOpsOut);
    assert.match(cyberOpsOut, /Noctis Cyber Operations Engine/);
    assert.match(cyberOpsOut, /CYBER-DOM-01/);
    assert.match(cyberOpsOut, /CYBER-DOM-12/);
    assert.match(cyberOpsOut, /Stage 1/);
    assert.match(cyberOpsOut, /Stage 9/);
    assert.match(cyberOpsOut, /5-Question Red-Blue-Purple Closed-Loop Check/);
    assert.match(cyberOpsOut, /Step-by-Step Tester Verification & Execution Procedure/);

    const { recallTrainedAnswer, vibeNativeComplete } = await import("./noctis-train.server.ts");
    const dnsRecall = recallTrainedAnswer("EXPLAIN IN DETAIL WHAT A DNS IS");
    assert.ok(dnsRecall && dnsRecall.score >= 0.58);
    assert.match(dnsRecall.answer, /Domain Name System/);
    assert.match(dnsRecall.answer, /RFC 1034/);

    const studyBoardWrapped = await vibeNativeComplete([
      { role: "system", content: "Write a study board the learner can study from." },
      { role: "user", content: "Question: EXPLAIN IN DETAIL WHAT A DNS IS\n\nRetrieved notes:\nNo page was opened." },
    ]);
    assert.doesNotMatch(studyBoardWrapped.text, /How to Teach Vibe This Topic Immediately/);
    assert.match(studyBoardWrapped.text, /Domain Name System/);
  });
});
