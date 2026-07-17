import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { defaultProfile } from "./data/profile.js";
import { calculateChart } from "./engine/chart.js";
import { calculateCompatibility } from "./engine/compatibility.js";
import { calculateAnnualLuck, calculateDailyLuck, calculateMajorLuck, calculateMonthlyLuck } from "./engine/luck.js";
import { generateInterpretation } from "./interpretation/generate.js";
import { printReport } from "./report/print.js";
import { createVerificationSheetUrl } from "./report/verification-sheet.js";
import { renderResult } from "./ui/render.js";

const form = document.querySelector("#birth-form");
const resultPanel = document.querySelector("#results");
const yearSelect = document.querySelector("#birth-year");
const monthSelect = document.querySelector("#birth-month");
const daySelect = document.querySelector("#birth-day");
const hourSelect = document.querySelector("#birth-hour");
const minuteSelect = document.querySelector("#birth-minute");
const unknownTime = document.querySelector("#unknown-time");
const currentYearInput = document.querySelector("#current-year");
const customerNameInput = document.querySelector("#customer-name");
const monthlyLuckYearSelect = document.querySelector("#monthly-luck-year");
const monthlyLuckMonthSelect = document.querySelector("#monthly-luck-month");
const dailyLuckYearSelect = document.querySelector("#daily-luck-year");
const dailyLuckMonthSelect = document.querySelector("#daily-luck-month");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const partnerBirthField = document.querySelector("#partner-birth-field");
const partnerNameInput = document.querySelector("#partner-name");
const partnerYearSelect = document.querySelector("#partner-year");
const partnerMonthSelect = document.querySelector("#partner-month");
const partnerDaySelect = document.querySelector("#partner-day");
const partnerHourSelect = document.querySelector("#partner-hour");
const partnerMinuteSelect = document.querySelector("#partner-minute");
const partnerUnknownTime = document.querySelector("#partner-unknown-time");
const submitButton = document.querySelector("#submit-button");

let currentReport = null;

function option(value, label = value) {
  const element = document.createElement("option");
  element.value = String(value);
  element.textContent = String(label);
  return element;
}

function fillSelect(select, values, selected) {
  select.replaceChildren(...values.map((value) => option(value)));
  select.value = String(selected);
}

function updateDays() {
  const year = Number(yearSelect.value);
  const month = Number(monthSelect.value);
  const days = new Date(year, month, 0).getDate();
  const currentDay = Math.min(Number(daySelect.value || 1), days);
  fillSelect(daySelect, Array.from({ length: days }, (_, i) => i + 1), currentDay);
}

function updatePartnerDays() {
  const year = Number(partnerYearSelect.value);
  const month = Number(partnerMonthSelect.value);
  const days = new Date(year, month, 0).getDate();
  const currentDay = Math.min(Number(partnerDaySelect.value || 1), days);
  fillSelect(partnerDaySelect, Array.from({ length: days }, (_, i) => i + 1), currentDay);
}

function selectedMode() {
  return document.querySelector('input[name="mode"]:checked')?.value || "chart";
}

function setModeState() {
  const compatibility = selectedMode() === "compatibility";
  document.querySelectorAll(".chart-only").forEach((element) => {
    element.hidden = compatibility;
  });
  partnerBirthField.hidden = !compatibility;
  submitButton.textContent = compatibility ? "相性を表示" : "命式を表示";
}

function setTimeControlsState() {
  hourSelect.disabled = unknownTime.checked;
  minuteSelect.disabled = unknownTime.checked;
  partnerHourSelect.disabled = partnerUnknownTime.checked;
  partnerMinuteSelect.disabled = partnerUnknownTime.checked;
}

function readInput() {
  const data = new FormData(form);
  return {
    customerName: String(data.get("customerName") || "").trim(),
    year: Number(data.get("birthYear")),
    month: Number(data.get("birthMonth")),
    day: Number(data.get("birthDay")),
    hour: Number(data.get("birthHour") || 12),
    minute: Number(data.get("birthMinute") || 0),
    unknownTime: data.get("unknownTime") === "on",
    sex: data.get("sex") || "male",
    currentYear: Number(data.get("currentYear")),
    monthlyLuckYear: Number(data.get("monthlyLuckYear")),
    monthlyLuckMonth: Number(data.get("monthlyLuckMonth")),
    dailyLuckYear: Number(data.get("dailyLuckYear")),
    dailyLuckMonth: Number(data.get("dailyLuckMonth")),
  };
}

function readPartnerInput() {
  const data = new FormData(form);
  return {
    customerName: String(data.get("partnerName") || "").trim(),
    year: Number(data.get("partnerYear")),
    month: Number(data.get("partnerMonth")),
    day: Number(data.get("partnerDay")),
    hour: Number(data.get("partnerHour") || 12),
    minute: Number(data.get("partnerMinute") || 0),
    unknownTime: data.get("partnerUnknownTime") === "on",
    sex: data.get("partnerSex") || "male",
    currentYear: Number(data.get("currentYear")),
  };
}

function calculateAndRender() {
  const input = readInput();
  const compatibilityMode = selectedMode() === "compatibility";
  const chart = calculateChart(input, setsuiri);
  if (compatibilityMode) {
    const partnerInput = readPartnerInput();
    const partnerChart = calculateChart(partnerInput, setsuiri);
    const compatibility = calculateCompatibility(chart, partnerChart);
    const majorLuck = calculateMajorLuck(chart, setsuiri, input.currentYear);
    const partnerMajorLuck = calculateMajorLuck(partnerChart, setsuiri, partnerInput.currentYear);
    currentReport = null;
    renderResult(resultPanel, { mode: "compatibility", chart, partnerChart, compatibility, majorLuck, partnerMajorLuck });
    resultPanel.hidden = false;
    document.body.classList.add("result-mode");
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  const majorLuck = calculateMajorLuck(chart, setsuiri, input.currentYear);
  const annualLuck = calculateAnnualLuck(chart, input.currentYear, defaultProfile.annualLuck?.maxDisplayAge || 100);
  const monthlyLuck = calculateMonthlyLuck(chart, input.monthlyLuckYear, input.monthlyLuckMonth, 12);
  const dailyLuck = calculateDailyLuck(chart, input.dailyLuckYear, input.dailyLuckMonth);
  const interpretation = defaultProfile.fortuneText.enabled
    ? generateInterpretation({ chart, majorLuck, annualLuck })
    : [];
  currentReport = {
    chart,
    majorLuck,
    annualLuck,
    monthlyLuck,
    dailyLuck,
    interpretation,
    profile: defaultProfile,
    customerName: input.customerName,
  };
  renderResult(resultPanel, {
    chart,
    majorLuck,
    annualLuck,
    monthlyLuck,
    dailyLuck,
    interpretation,
    profile: defaultProfile,
  });
  const verificationLink = resultPanel.querySelector("[data-open-verification]");
  if (verificationLink) {
    verificationLink.href = createVerificationSheetUrl(currentReport);
  }
  resultPanel.hidden = false;
  document.body.classList.add("result-mode");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function initForm() {
  const today = new Date();
  fillSelect(yearSelect, Array.from({ length: 161 }, (_, i) => 1900 + i), 1990);
  fillSelect(monthSelect, Array.from({ length: 12 }, (_, i) => i + 1), 1);
  fillSelect(hourSelect, Array.from({ length: 24 }, (_, i) => i), 12);
  fillSelect(minuteSelect, Array.from({ length: 60 }, (_, i) => i), 0);
  fillSelect(monthlyLuckYearSelect, Array.from({ length: 301 }, (_, i) => 1900 + i), today.getFullYear());
  fillSelect(monthlyLuckMonthSelect, Array.from({ length: 12 }, (_, i) => i + 1), today.getMonth() + 1);
  fillSelect(dailyLuckYearSelect, Array.from({ length: 301 }, (_, i) => 1900 + i), today.getFullYear());
  fillSelect(dailyLuckMonthSelect, Array.from({ length: 12 }, (_, i) => i + 1), today.getMonth() + 1);
  fillSelect(partnerYearSelect, Array.from({ length: 301 }, (_, i) => 1900 + i), 1990);
  fillSelect(partnerMonthSelect, Array.from({ length: 12 }, (_, i) => i + 1), 1);
  fillSelect(partnerHourSelect, Array.from({ length: 24 }, (_, i) => i), 12);
  fillSelect(partnerMinuteSelect, Array.from({ length: 60 }, (_, i) => i), 0);
  currentYearInput.value = today.getFullYear();
  customerNameInput.value = "";
  updateDays();
  updatePartnerDays();
  setTimeControlsState();
  setModeState();
}

yearSelect.addEventListener("change", updateDays);
monthSelect.addEventListener("change", updateDays);
partnerYearSelect.addEventListener("change", updatePartnerDays);
partnerMonthSelect.addEventListener("change", updatePartnerDays);
unknownTime.addEventListener("change", setTimeControlsState);
partnerUnknownTime.addEventListener("change", setTimeControlsState);
modeInputs.forEach((input) => input.addEventListener("change", setModeState));
form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

resultPanel.addEventListener("click", (event) => {
  const printButton = event.target.closest("[data-print-report]");
  if (printButton && currentReport) {
    printReport(currentReport);
    return;
  }

  const editButton = event.target.closest("[data-edit-input]");
  if (editButton) {
    document.body.classList.remove("result-mode");
    resultPanel.hidden = true;
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  const button = event.target.closest("[data-scroll-target]");
  if (!button) return;

  const target = document.querySelector(`#${button.dataset.scrollTarget}`);
  if (!target) return;

  resultPanel.querySelectorAll("[data-scroll-target]").forEach((navButton) => {
    navButton.classList.toggle("is-active", navButton.dataset.scrollTarget === button.dataset.scrollTarget);
  });

  if (button.dataset.scrollTarget === "chart-section") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
});

initForm();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}
