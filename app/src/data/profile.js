export const defaultProfile = {
  id: "general-default",
  name: "一般標準プロファイル",
  basis: {
    tenGodStandard: "dayStem",
    monthBoundary: "setsuiri",
    birthTime: "optional",
    unknownTime: "hideTimePillar",
    luckDirection: "yearStemYinYangAndSex",
    luckStartAge: "daysToNearestSetsuiriDividedByThree",
  },
  display: {
    pillars: ["year", "month", "day", "time"],
    showHiddenStems: true,
    showTenGods: true,
    showTwelveStages: true,
    showFiveElementBalance: true,
    showVoidBranches: true,
    showMajorLuck: true,
    showAnnualLuck: true,
  },
  annualLuck: {
    maxDisplayAge: 100,
  },
  fortuneText: {
    enabled: true,
  },
  pdfReport: {
    enabled: true,
    title: "四柱推命鑑定書",
    practitionerName: "",
  },
};
