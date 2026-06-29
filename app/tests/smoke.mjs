import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { calculateChart } from "../src/engine/chart.js";
import { calculateAnnualLuck, calculateMajorLuck } from "../src/engine/luck.js";

const input = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  unknownTime: true,
  sex: "male",
};

const chart = calculateChart(input, setsuiri);
const majorLuck = calculateMajorLuck(chart, setsuiri, 2026);
const annualLuck = calculateAnnualLuck(chart, 2026, 100);

if (chart.pillars.length !== 3) throw new Error("unknownTime should hide the time pillar");
if (majorLuck.rows.length !== 10) throw new Error("major luck rows should be 10");
if (annualLuck.length !== 101) throw new Error("annual luck rows should be 101");
if (annualLuck[0].age !== 0 || annualLuck.at(-1).age !== 100) {
  throw new Error("annual luck should cover ages 0 to 100");
}

console.log(chart.pillars.map((pillar) => `${pillar.pillarLabel}:${pillar.stem}${pillar.branch}`).join(", "));
console.log(`majorLuck=${majorLuck.rows.length}, annualLuck=${annualLuck.length}`);
