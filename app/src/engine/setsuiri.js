export const SETSU_MONTH_BRANCH = {
  1: "丑",
  2: "寅",
  3: "卯",
  4: "辰",
  5: "巳",
  6: "午",
  7: "未",
  8: "申",
  9: "酉",
  10: "戌",
  11: "亥",
  12: "子",
};

export const SETSU_NAMES = {
  1: "小寒",
  2: "立春",
  3: "啓蟄",
  4: "清明",
  5: "立夏",
  6: "芒種",
  7: "小暑",
  8: "立秋",
  9: "白露",
  10: "寒露",
  11: "立冬",
  12: "大雪",
};

export function toDateTime(row) {
  const [year, month, day, hour, minute] = row;
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function getSetsuiriEvent(setsuiri, year, month) {
  return setsuiri.find((row) => row[0] === year && row[1] === month);
}

export function getRisshun(setsuiri, year) {
  const row = getSetsuiriEvent(setsuiri, year, 2);
  if (!row) throw new Error(`立春データが見つかりません: ${year}`);
  return toDateTime(row);
}

export function getSurroundingSetsuiri(setsuiri, date) {
  const candidates = setsuiri
    .filter((row) => row[0] >= date.getFullYear() - 1 && row[0] <= date.getFullYear() + 1)
    .map((row) => ({
      row,
      name: SETSU_NAMES[row[1]],
      branch: SETSU_MONTH_BRANCH[row[1]],
      date: toDateTime(row),
    }))
    .sort((a, b) => a.date - b.date);

  let previous = candidates[0];
  let next = candidates[candidates.length - 1];

  for (const event of candidates) {
    if (event.date <= date) previous = event;
    if (event.date > date) {
      next = event;
      break;
    }
  }

  return { previous, next };
}

export function getMonthBoundary(setsuiri, date) {
  return getSurroundingSetsuiri(setsuiri, date).previous;
}
