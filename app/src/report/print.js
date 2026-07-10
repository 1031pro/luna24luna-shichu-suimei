function escapeHtml(value) {
  return String(value)
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
  if (chart.input.unknownTime) return "出生時刻なし";
  return `${String(chart.input.hour).padStart(2, "0")}:${String(chart.input.minute).padStart(2, "0")}`;
}

function pillarTable(chart) {
  const pillars = ["time", "day", "month", "year"].map((key) => chart.pillarMap[key]).filter(Boolean);
  const header = pillars.map((pillar) => `<th class="pillar-${escapeHtml(pillar.key)}">${escapeHtml(pillar.pillarLabel)}</th>`).join("");
  const row = (label, selector) => `
    <tr>
      <th>${escapeHtml(label)}</th>
      ${pillars.map((pillar) => `<td>${escapeHtml(selector(pillar))}</td>`).join("")}
    </tr>
  `;

  return `
    <table class="chart-table">
      <thead><tr><th></th>${header}</tr></thead>
      <tbody>
        ${row("天干", (pillar) => `${pillar.stem}（${pillar.stemElement}/${pillar.stemYinYang}）`)}
        ${row("地支", (pillar) => `${pillar.branch}（${pillar.branchElement}）`)}
        ${row("干支", (pillar) => pillar.kanshiLabel)}
        ${row("蔵干", (pillar) => pillar.hiddenStems.join("・"))}
        ${row("主蔵干", (pillar) => pillar.mainHiddenStem)}
        ${row("通変星", (pillar) => pillar.tenGod)}
        ${row("蔵干通変", (pillar) => pillar.hiddenTenGod)}
        ${row("十二運", (pillar) => pillar.twelveStage)}
      </tbody>
    </table>
  `;
}

function balanceRows(balance) {
  const max = Math.max(...Object.values(balance), 1);
  const classes = { 木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water" };
  return Object.entries(balance)
    .map(
      ([element, count]) => `
        <div class="balance-row ${classes[element] || ""}">
          <span>${escapeHtml(element)}</span>
          <i><b style="width:${(count / max) * 100}%"></b></i>
          <strong>${count}</strong>
        </div>
      `,
    )
    .join("");
}

function tableRows(rows, limit = rows.length) {
  return rows
    .slice(0, limit)
    .map(
      (row) => `
        <tr class="${row.active ? "active" : ""}">
          <td>${"year" in row ? row.year : `${row.ageStart}-${row.ageEnd}歳`}</td>
          <td>${"year" in row ? `${row.age}歳` : `${row.yearStart}-${row.yearEnd}年`}</td>
          <td>${escapeHtml(row.pillar.label)}</td>
          <td>${escapeHtml(row.pillar.tenGod)}</td>
          <td>${escapeHtml(row.pillar.twelveStage)}</td>
        </tr>
      `,
    )
    .join("");
}

function chunkRows(rows, size) {
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => rows.slice(index * size, index * size + size));
}

function annualLuckTables(rows) {
  return chunkRows(rows, 26)
    .map((chunk) => {
      const first = chunk[0];
      const last = chunk.at(-1);
      return `
        <div class="annual-column">
          <h3>${first.age}歳-${last.age}歳</h3>
          <table class="mini-table annual-table">
            <thead><tr><th>年</th><th>年齢</th><th>干支</th><th>通変星</th><th>十二運</th></tr></thead>
            <tbody>${tableRows(chunk)}</tbody>
          </table>
        </div>
      `;
    })
    .join("");
}

function periodLuckRows(rows, firstCell, { highlightActive = true } = {}) {
  return rows
    .map(
      (row) => `
        <tr class="${highlightActive && row.active ? "active" : ""}">
          <td>${escapeHtml(firstCell(row))}</td>
          <td>${escapeHtml(row.pillar.label)}</td>
          <td>${escapeHtml(row.pillar.tenGod)}</td>
          <td>${escapeHtml(row.pillar.twelveStage)}</td>
          <td class="reading-cell">${escapeHtml(row.reading)}</td>
        </tr>
      `,
    )
    .join("");
}

function monthlyLuckSheet(rows, title) {
  const first = rows[0];
  const last = rows.at(-1);
  return `
    <section class="sheet period-luck-sheet monthly-luck-sheet">
      <div class="content">
        <div class="report-header">
          <strong>月運一覧</strong>
          <span>${first.year}年${first.month}月-${last.year}年${last.month}月</span>
        </div>
        <h2>月運一覧</h2>
        <table class="period-table">
          <thead><tr><th>年月</th><th>干支</th><th>通変星</th><th>十二運</th><th>鑑定文</th></tr></thead>
          <tbody>${periodLuckRows(rows, (row) => `${row.year}年${row.month}月`, { highlightActive: false })}</tbody>
        </table>
      </div>
      <div class="footer">${escapeHtml(title)}　月運</div>
    </section>
  `;
}

function dailyLuckSheets(rows, title) {
  const first = rows[0];
  const chunks = [rows.slice(0, 20), rows.slice(20)].filter((chunk) => chunk.length > 0);
  return chunks
    .map(
      (chunk, index) => `
        <section class="sheet period-luck-sheet daily-luck-sheet">
          <div class="content">
            <div class="report-header">
              <strong>日運一覧</strong>
              <span>${first.year}年${first.month}月 ${index + 1}/${chunks.length}</span>
            </div>
            <h2>日運一覧 ${first.year}年${first.month}月</h2>
            <table class="period-table">
              <thead><tr><th>日</th><th>干支</th><th>通変星</th><th>十二運</th><th>鑑定文</th></tr></thead>
              <tbody>${periodLuckRows(chunk, (row) => `${row.day}日（${row.weekday}）`, { highlightActive: false })}</tbody>
            </table>
          </div>
          <div class="footer">${escapeHtml(title)}　日運 ${index + 1}/${chunks.length}</div>
        </section>
      `,
    )
    .join("");
}

function interpretationBlocks(items) {
  return items
    .map(
      (item) => `
        <article class="text-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `,
    )
    .join("");
}

function splitInterpretation(items) {
  return [items.slice(0, 4), items.slice(4)];
}

function customerLine(name) {
  return name ? `<p class="customer-name">${escapeHtml(name)} 様</p>` : "";
}

function practitionerLine(profile) {
  const name = profile?.pdfReport?.practitionerName;
  return name ? `<p class="practitioner-name">鑑定士　${escapeHtml(name)}</p>` : "";
}

function reportTitle(profile) {
  return profile?.pdfReport?.title || "四柱推命鑑定書";
}

export function printReport({ chart, majorLuck, annualLuck, monthlyLuck, dailyLuck, interpretation, profile, customerName }) {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return;

  const ornamentUrl = new URL("../assets/report/a4-landscape-ornament.png", window.location.href).href;
  const emblemUrl = new URL("../assets/report/shichu-emblem.png", window.location.href).href;
  const currentMajorLuck = majorLuck.rows.find((row) => row.active) || majorLuck.rows[0];
  const currentAnnualLuck = annualLuck.find((row) => row.active) || annualLuck[0];
  const [firstText, secondText] = splitInterpretation(interpretation);
  const title = reportTitle(profile);
  const monthlyLuckSheetHtml = monthlyLuckSheet(monthlyLuck, title);
  const dailyLuckSheetsHtml = dailyLuckSheets(dailyLuck, title);

  reportWindow.document.write(`
    <!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>四柱推命 鑑定書</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #071a35;
            font-family: "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", "Times New Roman", serif;
            background: #efe5cf;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .sheet {
            position: relative;
            width: 297mm;
            min-height: 210mm;
            margin: 0 auto 8mm;
            padding: 10mm;
            overflow: hidden;
            background: #fffaf0;
          }

          .sheet::before {
            position: absolute;
            inset: 0;
            z-index: 0;
            background: url("${ornamentUrl}") center / cover no-repeat;
            opacity: 0.055;
            content: "";
          }

          .sheet::after {
            position: absolute;
            inset: 5mm;
            z-index: 0;
            border: 1px solid rgba(177, 126, 25, 0.58);
            content: "";
          }

          .content {
            position: relative;
            z-index: 1;
          }

          .cover {
            display: grid;
            align-content: center;
            text-align: center;
          }

          .cover .content {
            width: 190mm;
            margin: 0 auto;
            padding: 15mm 16mm 16mm;
            background: rgba(255, 254, 250, 0.88);
            border: 1px solid rgba(177, 126, 25, 0.8);
          }

          .cover-emblem {
            width: 27mm;
            height: 27mm;
            margin: 0 auto 7mm;
            object-fit: contain;
          }

          h1 {
            margin: 0;
            font-size: 30pt;
            letter-spacing: 0.16em;
          }

          .customer-name {
            margin: 5mm 0 8mm;
            color: #8a6418;
            font-size: 15pt;
            font-weight: 700;
          }

          .practitioner-name {
            margin: 8mm 0 0;
            color: #071a35;
            font-size: 10.5pt;
            font-weight: 700;
          }

          .cover-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            border-top: 1px solid #cda44e;
            border-bottom: 1px solid #cda44e;
          }

          .cover-meta div {
            padding: 4mm;
            border-right: 1px solid #e0c98a;
          }

          .cover-meta div:last-child {
            border-right: 0;
          }

          .cover-meta span {
            display: block;
            color: #8a6418;
            font-size: 8pt;
          }

          .cover-meta strong {
            display: block;
            margin-top: 1mm;
            font-size: 12pt;
          }

          .spread {
            display: grid;
            grid-template-columns: 118mm 1fr;
            gap: 8mm;
            height: 190mm;
          }

          .left,
          .right {
            min-width: 0;
          }

          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-bottom: 4mm;
            padding-bottom: 2.5mm;
            border-bottom: 2px solid #b17e19;
          }

          .report-header strong {
            font-size: 15pt;
            letter-spacing: 0.08em;
          }

          .report-header span {
            color: #8a6418;
            font-size: 8pt;
            font-weight: 700;
          }

          h2 {
            margin: 4mm 0 2mm;
            padding-left: 3mm;
            border-left: 3px solid #b17e19;
            font-size: 12pt;
            letter-spacing: 0.04em;
          }

          h3 {
            margin: 0 0 1.8mm;
            color: #071a35;
            font-size: 10.6pt;
            letter-spacing: 0.03em;
          }

          p {
            margin: 0;
            font-size: 9.4pt;
            line-height: 1.82;
          }

          .panel,
          .text-card,
          .summary-card {
            background: rgba(255, 254, 250, 0.97);
            border: 1px solid #d9c58a;
            border-radius: 2.5mm;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2mm;
          }

          .summary-card {
            padding: 2.5mm;
          }

          .summary-card span {
            display: block;
            color: #8a6418;
            font-size: 7pt;
            font-weight: 700;
          }

          .summary-card strong {
            display: block;
            margin-top: 0.5mm;
            font-size: 9.2pt;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            overflow: hidden;
            background: rgba(255, 254, 250, 0.96);
            border: 1px solid #d9c58a;
            border-radius: 2.5mm;
          }

          th,
          td {
            padding: 1.6mm 1.2mm;
            border-right: 1px solid #e6d8ac;
            border-bottom: 1px solid #e6d8ac;
            text-align: center;
            font-size: 7.5pt;
            line-height: 1.35;
          }

          th:last-child,
          td:last-child {
            border-right: 0;
          }

          tr:last-child th,
          tr:last-child td {
            border-bottom: 0;
          }

          th {
            color: #fffaf0;
            background: #071a35;
            font-weight: 800;
          }

          .chart-table .pillar-time {
            background: #0b6150;
          }

          .chart-table .pillar-day {
            background: #c99212;
          }

          .chart-table .pillar-month {
            background: #cf2f3c;
          }

          .chart-table .pillar-year {
            background: #06458f;
          }

          tr.active td {
            background: #fff1bd;
            font-weight: 800;
          }

          .two-tables {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
          }

          .mini-table th,
          .mini-table td {
            padding: 1.05mm 0.8mm;
            font-size: 6.5pt;
          }

          .major-table th,
          .major-table td {
            padding: 1.65mm 1.25mm;
            font-size: 8.1pt;
            line-height: 1.35;
          }

          .annual-sheet .content {
            height: 190mm;
          }

          .annual-sheet .report-header {
            margin-bottom: 3mm;
          }

          .annual-sheet h2 {
            margin-top: 0;
          }

          .annual-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 3mm;
          }

          .annual-column h3 {
            margin: 0 0 1.5mm;
            padding: 1.5mm 2mm;
            color: #fffaf0;
            background: #071a35;
            border-radius: 2mm;
            font-size: 8pt;
            text-align: center;
          }

          .annual-table th,
          .annual-table td {
            padding: 1.08mm 0.46mm;
            font-size: 6.45pt;
            line-height: 1.24;
          }

          .period-luck-sheet .content {
            height: 190mm;
          }

          .period-table {
            table-layout: fixed;
          }

          .period-table th:nth-child(1),
          .period-table td:nth-child(1) {
            width: 24mm;
          }

          .period-table th:nth-child(2),
          .period-table td:nth-child(2) {
            width: 18mm;
          }

          .period-table th:nth-child(3),
          .period-table td:nth-child(3) {
            width: 22mm;
          }

          .period-table th:nth-child(4),
          .period-table td:nth-child(4) {
            width: 18mm;
          }

          .period-table .reading-cell {
            text-align: left;
            font-size: 7.1pt;
            line-height: 1.45;
          }

          .monthly-luck-sheet .period-table th,
          .monthly-luck-sheet .period-table td {
            padding: 1.65mm 1.3mm;
          }

          .daily-luck-sheet .period-table th,
          .daily-luck-sheet .period-table td {
            padding: 1.35mm 1.05mm;
            font-size: 7.35pt;
            line-height: 1.42;
          }

          .daily-luck-sheet .period-table .reading-cell {
            font-size: 7.15pt;
            line-height: 1.46;
          }

          .balance-list {
            display: grid;
            gap: 1.8mm;
            padding: 3mm;
          }

          .balance-row {
            display: grid;
            grid-template-columns: 8mm 1fr 7mm;
            gap: 2mm;
            align-items: center;
          }

          .balance-row span,
          .balance-row strong {
            font-size: 8.4pt;
            font-weight: 800;
          }

          .balance-row i {
            height: 2.4mm;
            overflow: hidden;
            background: #e8eceb;
            border-radius: 999px;
          }

          .balance-row b {
            display: block;
            height: 100%;
            background: #0b6150;
            border-radius: 999px;
          }

          .balance-row.fire b {
            background: #cf2f3c;
          }

          .balance-row.earth b {
            background: #8f6f20;
          }

          .balance-row.metal b {
            background: #6b737b;
          }

          .balance-row.water b {
            background: #075ac2;
          }

          .flow-panel {
            padding: 3mm;
          }

          .text-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
          }

          .text-card {
            padding: 3.2mm;
            break-inside: avoid;
          }

          .text-card.wide {
            grid-column: 1 / -1;
          }

          .text-card p {
            font-size: 8.65pt;
            line-height: 1.72;
          }

          .footer {
            position: absolute;
            right: 12mm;
            bottom: 8mm;
            z-index: 1;
            color: #947b43;
            font-size: 9.5pt;
            font-weight: 700;
            letter-spacing: 0.06em;
          }

          @media print {
            body {
              background: #fff;
            }

            .sheet {
              margin: 0;
              page-break-after: always;
            }

            .sheet:last-child {
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        <main>
          <section class="sheet cover">
            <div class="content">
              <img class="cover-emblem" src="${emblemUrl}" alt="" />
              <h1>${escapeHtml(title)}</h1>
              ${customerLine(customerName)}
              <div class="cover-meta">
                <div><span>生年月日</span><strong>${formatDate(chart.date)}</strong></div>
                <div><span>出生時刻</span><strong>${escapeHtml(formatBirthTime(chart))}</strong></div>
                <div><span>作成日</span><strong>${formatDate(new Date())}</strong></div>
              </div>
              ${practitionerLine(profile)}
            </div>
            <div class="footer">${escapeHtml(title)}</div>
          </section>

          <section class="sheet">
            <div class="content spread">
              <div class="left">
                <div class="report-header">
                  <strong>命式結果</strong>
                  <span>命式・運勢・五行</span>
                </div>
                <div class="summary-grid">
                  <div class="summary-card"><span>日柱</span><strong>${escapeHtml(chart.pillarMap.day.kanshiLabel)}</strong></div>
                  <div class="summary-card"><span>空亡</span><strong>${escapeHtml(chart.voidBranches.join("・"))}</strong></div>
                  <div class="summary-card"><span>大運</span><strong>${escapeHtml(currentMajorLuck.pillar.label)}</strong></div>
                  <div class="summary-card"><span>年運</span><strong>${escapeHtml(currentAnnualLuck.pillar.label)}</strong></div>
                </div>

                <h2>命式表</h2>
                ${pillarTable(chart)}

                <h2>五行バランス</h2>
                <div class="panel balance-list">${balanceRows(chart.fiveElementBalance)}</div>
              </div>

              <div class="right">
                <div class="report-header">
                  <strong>鑑定文</strong>
                  <span>読み解き</span>
                </div>
                <div class="text-grid">
                  ${interpretationBlocks(firstText)}
                </div>
              </div>
            </div>
            <div class="footer">${escapeHtml(title)}　第一頁</div>
          </section>

          <section class="sheet">
            <div class="content spread">
              <div class="left">
                <div class="report-header">
                  <strong>運勢補足</strong>
                  <span>大運・年運</span>
                </div>
                <div class="panel flow-panel">
                  <h3>現在の大運</h3>
                  <p>現在の大運は${currentMajorLuck.ageStart}歳から${currentMajorLuck.ageEnd}歳まで、干支は${escapeHtml(currentMajorLuck.pillar.label)}、通変星は${escapeHtml(currentMajorLuck.pillar.tenGod)}、十二運は${escapeHtml(currentMajorLuck.pillar.twelveStage)}です。立運は節入日より${majorLuck.start.dayNumber}日目生まれとして、${escapeHtml(majorLuck.start.formula)}を切り上げて算出しています。</p>
                </div>
                <h2>大運一覧</h2>
                <table class="mini-table major-table">
                  <thead><tr><th>年齢</th><th>期間</th><th>干支</th><th>通変星</th><th>十二運</th></tr></thead>
                  <tbody>${tableRows(majorLuck.rows)}</tbody>
                </table>
              </div>
              <div class="right">
                <div class="report-header">
                  <strong>鑑定文</strong>
                  <span>詳解</span>
                </div>
                <div class="text-grid">
                  ${interpretationBlocks(secondText)}
                </div>
              </div>
            </div>
            <div class="footer">${escapeHtml(title)}　第二頁</div>
          </section>

          <section class="sheet annual-sheet">
            <div class="content">
              <div class="report-header">
                <strong>年運一覧</strong>
                <span>0歳-100歳</span>
              </div>
              <h2>年運一覧 0歳-100歳</h2>
              <div class="annual-grid">
                ${annualLuckTables(annualLuck)}
              </div>
            </div>
            <div class="footer">${escapeHtml(title)}　年運</div>
          </section>

          ${monthlyLuckSheetHtml}
          ${dailyLuckSheetsHtml}
        </main>
        <script>
          window.addEventListener("load", () => {
            window.print();
          });
        </script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}
