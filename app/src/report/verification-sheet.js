function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatBirthTime(chart) {
  if (chart.input.unknownTime) return "不明";
  return `${String(chart.input.hour).padStart(2, "0")}:${String(chart.input.minute).padStart(2, "0")}`;
}

function sexLabel(value) {
  return value === "female" ? "女" : "男";
}

function getPillar(chart, key) {
  return chart.pillarMap[key] || null;
}

function pillarValue(chart, key, selector) {
  const pillar = getPillar(chart, key);
  return pillar ? selector(pillar) : "";
}

function pillarCell(chart, key, selector) {
  return `<td>${escapeHtml(pillarValue(chart, key, selector))}</td>`;
}

function pillarRows(chart) {
  const keys = ["time", "day", "month", "year"];
  const row = (label, selector) => `
    <tr>
      <th>${escapeHtml(label)}</th>
      ${keys.map((key) => pillarCell(chart, key, selector)).join("")}
    </tr>
  `;

  return `
    ${row("干支", (pillar) => pillar.kanshiLabel)}
    ${row("天干", (pillar) => pillar.stem)}
    ${row("地支", (pillar) => pillar.branch)}
    ${row("蔵干", (pillar) => pillar.mainHiddenStem)}
    ${row("通変星", (pillar) => pillar.tenGod)}
    ${row("蔵干通変", (pillar) => pillar.hiddenTenGod)}
    ${row("十二運", (pillar) => pillar.twelveStage)}
  `;
}

function elementRows(balance) {
  const elements = ["木", "火", "土", "金", "水"];
  return elements
    .map(
      (element) => `
        <tr>
          <th>${element}</th>
          <td>${escapeHtml(balance[element] ?? 0)}</td>
        </tr>
      `,
    )
    .join("");
}

function majorLuckCells(rows) {
  return rows
    .slice(0, 12)
    .map(
      (row) => `
        <td>
          <strong>${escapeHtml(row.pillar.label)}</strong>
          <span>${row.ageStart}-${row.ageEnd}歳</span>
          <small>${escapeHtml(row.pillar.tenGod)}</small>
        </td>
      `,
    )
    .join("");
}

function annualWindow(rows) {
  const activeIndex = rows.findIndex((row) => row.active);
  const startIndex = activeIndex >= 0 ? activeIndex : 0;
  return rows.slice(startIndex, startIndex + 12);
}

function annualLuckCells(rows) {
  return annualWindow(rows)
    .map(
      (row) => `
        <td>
          <strong>${escapeHtml(row.pillar.label)}</strong>
          <span>${row.year}年</span>
          <small>${row.age}歳 / ${escapeHtml(row.pillar.tenGod)}</small>
        </td>
      `,
    )
    .join("");
}

function summaryValue(label, value) {
  return `
    <div class="summary-cell">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

export function buildVerificationSheetHtml({ chart, majorLuck, annualLuck, customerName }) {
  const setsuiri = chart.setsuiriDayInfo;
  const boundaryDate = setsuiri?.boundary?.date ? formatDate(setsuiri.boundary.date) : "";
  const titleName = customerName ? `${customerName} 様` : "確認用";
  const majorLuckRows = majorLuckCells(majorLuck.rows);
  const annualLuckRows = annualLuckCells(annualLuck);

  return `
    <!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>計算確認表</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #111;
            font-family: "Yu Gothic", "Meiryo", sans-serif;
            background: #f4f0e8;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .toolbar {
            position: sticky;
            top: 0;
            z-index: 2;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            padding: 10px;
            background: rgba(244, 240, 232, 0.94);
            border-bottom: 1px solid #bbb;
          }

          button {
            min-height: 34px;
            padding: 6px 12px;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
            background: #fff;
            border: 1px solid #777;
            border-radius: 4px;
          }

          .sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 12px;
            padding: 9mm;
            background: #fff;
            border: 1px solid #444;
          }

          .top-grid {
            display: grid;
            grid-template-columns: 34mm 28mm 32mm 28mm 1fr 34mm;
            border-top: 2px solid #222;
            border-left: 2px solid #222;
          }

          .box,
          .summary-cell {
            min-height: 18mm;
            padding: 2mm;
            border-right: 1px solid #222;
            border-bottom: 1px solid #222;
          }

          .box strong,
          .summary-cell strong {
            display: block;
            margin-top: 2mm;
            font-size: 13pt;
            text-align: center;
          }

          .box span,
          .summary-cell span {
            display: block;
            font-size: 8pt;
            font-weight: 700;
            text-align: center;
          }

          .client-box {
            display: grid;
            gap: 1.5mm;
            align-content: center;
            text-align: center;
          }

          .client-box strong {
            margin: 0;
            font-size: 17pt;
          }

          .client-box small {
            font-size: 10pt;
            font-weight: 700;
          }

          .middle-grid {
            display: grid;
            grid-template-columns: 38mm 1fr 23mm;
            border-left: 2px solid #222;
          }

          .side-table,
          .chart-table,
          .element-table,
          .luck-table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            height: 9mm;
            padding: 1.2mm;
            border: 1px solid #222;
            text-align: center;
            vertical-align: middle;
            font-size: 8.8pt;
          }

          th {
            font-weight: 800;
            background: #f0f0f0;
          }

          .chart-table {
            border-top: 0;
          }

          .chart-table thead th {
            height: 10mm;
            font-size: 11pt;
          }

          .chart-table td {
            font-size: 11pt;
            font-weight: 700;
          }

          .right-vertical {
            display: grid;
            grid-template-rows: 1fr 1fr;
            border-right: 2px solid #222;
          }

          .vertical-label {
            display: grid;
            place-items: center;
            border-bottom: 1px solid #222;
            font-size: 13pt;
            font-weight: 900;
            writing-mode: vertical-rl;
            letter-spacing: 0.2em;
          }

          .section-title {
            margin: 5mm 0 2mm;
            padding: 1.5mm 2mm;
            font-size: 10pt;
            font-weight: 900;
            background: #f0f0f0;
            border: 1px solid #222;
          }

          .luck-table {
            table-layout: fixed;
          }

          .luck-table th {
            width: 15mm;
            font-size: 13pt;
          }

          .luck-table td {
            height: 24mm;
            font-size: 9pt;
          }

          .luck-table strong,
          .luck-table span,
          .luck-table small {
            display: block;
          }

          .luck-table strong {
            font-size: 13pt;
          }

          .luck-table span {
            margin-top: 2mm;
            font-weight: 700;
          }

          .luck-table small {
            margin-top: 1mm;
            font-size: 7.5pt;
          }

          .note {
            margin-top: 4mm;
            padding: 2mm;
            font-size: 8.5pt;
            line-height: 1.6;
            border: 1px solid #777;
          }

          @media print {
            body {
              background: #fff;
            }

            .toolbar {
              display: none;
            }

            .sheet {
              margin: 0;
              border: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button type="button" onclick="window.print()">印刷</button>
          <button type="button" onclick="if (history.length > 1) history.back(); else window.close();">戻る/閉じる</button>
        </div>
        <main class="sheet">
          <div class="top-grid">
            ${summaryValue("立運", `${majorLuck.direction.label} ${majorLuck.start.age}年`)}
            ${summaryValue("節入日より", `${setsuiri.dayNumber}日目生`)}
            ${summaryValue("節入日", `${setsuiri.boundary.name} ${boundaryDate}`)}
            ${summaryValue("空亡", chart.voidBranches.join("・"))}
            <div class="box">
              <span>生年月日</span>
              <strong>${escapeHtml(formatDate(chart.date))}</strong>
              <span>${escapeHtml(formatBirthTime(chart))}</span>
            </div>
            <div class="box client-box">
              <strong>${escapeHtml(titleName)}</strong>
              <small>${sexLabel(chart.input.sex)}</small>
            </div>
          </div>

          <div class="middle-grid">
            <table class="side-table">
              <tbody>
                <tr><th>計算式</th></tr>
                <tr><td>${escapeHtml(majorLuck.start.formula)}</td></tr>
                <tr><th>方合</th></tr>
                <tr><td>確認欄</td></tr>
                <tr><th>三合会局</th></tr>
                <tr><td>確認欄</td></tr>
              </tbody>
            </table>

            <table class="chart-table">
              <thead>
                <tr><th></th><th>時</th><th>日</th><th>月</th><th>年</th></tr>
              </thead>
              <tbody>
                ${pillarRows(chart)}
              </tbody>
            </table>

            <div class="right-vertical">
              <div class="vertical-label">干支</div>
              <table class="element-table">
                <tbody>
                  ${elementRows(chart.fiveElementBalance)}
                </tbody>
              </table>
            </div>
          </div>

          <div class="section-title">大運</div>
          <table class="luck-table">
            <tbody>
              <tr><th>大運</th>${majorLuckRows}</tr>
            </tbody>
          </table>

          <div class="section-title">年運</div>
          <table class="luck-table">
            <tbody>
              <tr><th>年運</th>${annualLuckRows}</tr>
            </tbody>
          </table>

          <div class="note">
            検算用の外部表示です。命式・節入日・立運計算・空亡・大運・年運の途中計算値を確認するための表で、鑑定書PDF本文には含めません。
          </div>
        </main>
      </body>
    </html>
  `;
}

export function createVerificationSheetUrl(report) {
  const html = buildVerificationSheetHtml(report);
  const key = `verification-sheet-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(key, html);

  const url = new URL("./verification.html", window.location.href);
  url.hash = encodeURIComponent(key);
  return url.href;
}

export function openVerificationSheet(report) {
  const url = createVerificationSheetUrl(report);
  const reportWindow = window.open(url, "_blank");
  if (!reportWindow) {
    const key = decodeURIComponent(new URL(url).hash.slice(1));
    localStorage.removeItem(key);
    return;
  }
}
