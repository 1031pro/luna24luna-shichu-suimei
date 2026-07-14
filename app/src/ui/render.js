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

const STEM_ELEMENT = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

const BRANCH_ELEMENT = {
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  辰: "earth",
  戌: "earth",
  丑: "earth",
  未: "earth",
  申: "metal",
  酉: "metal",
  子: "water",
  亥: "water",
};

function elementClass(value) {
  const text = String(value);
  for (const char of text) {
    if (STEM_ELEMENT[char]) return `element-${STEM_ELEMENT[char]}`;
    if (BRANCH_ELEMENT[char]) return `element-${BRANCH_ELEMENT[char]}`;
  }
  return "";
}

function coloredCell(value, className = elementClass(value)) {
  return `<td class="${className}">${escapeHtml(value)}</td>`;
}

function renderPillarTable(chart, title = "命式表") {
  const displayOrder = ["time", "day", "month", "year"];
  const pillars = displayOrder.map((key) => chart.pillarMap[key]).filter(Boolean);
  const header = pillars
    .map((pillar) => `<th class="pillar-head pillar-${escapeHtml(pillar.key)}">${escapeHtml(pillar.pillarLabel)}</th>`)
    .join("");
  const row = (label, selector, classSelector = (value) => elementClass(value)) => `
    <tr>
      <th class="row-head">${escapeHtml(label)}</th>
      ${pillars
        .map((pillar) => {
          const value = selector(pillar);
          return coloredCell(value, classSelector(value, pillar));
        })
        .join("")}
    </tr>
  `;

  return `
    <section class="result-block chart-block">
      <div class="section-title">
        <h2>${escapeHtml(title)}</h2>
      </div>
      <div class="table-wrap">
        <table class="meishiki-table">
          <thead>
            <tr><th></th>${header}</tr>
          </thead>
          <tbody>
            ${row("天干", (pillar) => `${pillar.stem}（${pillar.stemElement}/${pillar.stemYinYang}）`)}
            ${row("地支", (pillar) => `${pillar.branch}（${pillar.branchElement}）`)}
            ${row("干支", (pillar) => pillar.kanshiLabel)}
            ${row("蔵干", (pillar) => pillar.hiddenStems.join("・"))}
            ${row("主蔵干", (pillar) => pillar.mainHiddenStem)}
            ${row("通変星", (pillar) => pillar.tenGod, () => "")}
            ${row("蔵干通変", (pillar) => pillar.hiddenTenGod, () => "")}
            ${row("十二運", (pillar) => pillar.twelveStage, () => "")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderElementBalance(chart) {
  const entries = Object.entries(chart.fiveElementBalance);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  const elementMeta = {
    木: { className: "wood" },
    火: { className: "fire" },
    土: { className: "earth" },
    金: { className: "metal" },
    水: { className: "water" },
  };

  return `
    <section class="result-block balance-block">
      <div class="section-title">
        <h2>五行バランス</h2>
      </div>
      <div class="balance-list">
        ${entries
          .map(
            ([element, count]) => {
              const meta = elementMeta[element] || { className: "neutral", icon: "" };
              return `
              <div class="balance-row balance-${meta.className}">
                <strong>${escapeHtml(element)}</strong>
                <div class="balance-meter" aria-label="${escapeHtml(element)} ${count}">
                  <i style="width:${(count / max) * 100}%"></i>
                </div>
                <span>${count}</span>
              </div>
            `;
            },
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderInterpretation(interpretation) {
  return `
    <section id="interpretation-section" class="result-block interpretation-block">
      <div class="section-title">
        <h2>鑑定文</h2>
      </div>
      <div class="interpretation-list">
        ${interpretation
          .map(
            (item) => `
              <article>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.body)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderMajorLuck(luck) {
  return `
    <section id="major-luck-section" class="result-block luck-block major-luck-block">
      <div class="section-title">
        <h2>大運</h2>
        <span>${escapeHtml(luck.direction.label)}・開始 ${luck.start.age}歳</span>
      </div>
      <p class="subnote">
        立運: 節入日より${luck.start.dayNumber}日目生まれ。${escapeHtml(luck.start.formula)}を切り上げて算出
      </p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>年齢</th>
              <th>期間</th>
              <th>干支</th>
              <th>通変星</th>
              <th>十二運</th>
            </tr>
          </thead>
          <tbody>
            ${luck.rows
              .map(
                (row) => `
                  <tr class="${row.active ? "is-active" : ""}">
                    <td>${row.ageStart}-${row.ageEnd}歳</td>
                    <td>${row.yearStart}-${row.yearEnd}年</td>
                    <td>${escapeHtml(row.pillar.label)}</td>
                    <td>${escapeHtml(row.pillar.tenGod)}</td>
                    <td>${escapeHtml(row.pillar.twelveStage)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnnualLuck(rows) {
  return `
    <section id="annual-luck-section" class="result-block luck-block annual-luck-block">
      <div class="section-title">
        <h2>年運</h2>
        <span>0歳-100歳</span>
      </div>
      <div class="table-wrap compact">
        <table>
          <thead>
            <tr>
              <th>年</th>
              <th>年齢</th>
              <th>干支</th>
              <th>通変星</th>
              <th>十二運</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr class="${row.active ? "is-active" : ""}">
                    <td>${row.year}</td>
                    <td>${row.age}歳</td>
                    <td>${escapeHtml(row.pillar.label)}</td>
                    <td>${escapeHtml(row.pillar.tenGod)}</td>
                    <td>${escapeHtml(row.pillar.twelveStage)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPeriodLuck({ id, title, subtitle, rows, firstColumnLabel, firstColumn }) {
  return `
    <section id="${escapeHtml(id)}" class="result-block luck-block period-luck-block">
      <div class="section-title">
        <h2>${escapeHtml(title)}</h2>
        <span>${escapeHtml(subtitle)}</span>
      </div>
      <div class="table-wrap compact">
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(firstColumnLabel)}</th>
              <th>干支</th>
              <th>通変星</th>
              <th>十二運</th>
              <th>鑑定文</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr class="${row.active ? "is-active" : ""}">
                    <td data-label="${escapeHtml(firstColumnLabel)}">${escapeHtml(firstColumn(row))}</td>
                    <td data-label="干支">${escapeHtml(row.pillar.label)}</td>
                    <td data-label="通変星">${escapeHtml(row.pillar.tenGod)}</td>
                    <td data-label="十二運">${escapeHtml(row.pillar.twelveStage)}</td>
                    <td data-label="鑑定文" class="reading-cell">${escapeHtml(row.reading)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderMonthlyLuck(rows) {
  const first = rows[0];
  const last = rows.at(-1);
  return renderPeriodLuck({
    id: "monthly-luck-section",
    title: "月運",
    subtitle: `${first.year}年${first.month}月-${last.year}年${last.month}月`,
    rows,
    firstColumnLabel: "年月",
    firstColumn: (row) => `${row.year}年${row.month}月`,
  });
}

function renderDailyLuck(rows) {
  const first = rows[0];
  return renderPeriodLuck({
    id: "daily-luck-section",
    title: "日運",
    subtitle: `${first.year}年${first.month}月`,
    rows,
    firstColumnLabel: "日",
    firstColumn: (row) => `${row.day}日（${row.weekday}）`,
  });
}

function relationLabel(relation) {
  return {
    比和: "同じ五行",
    生じる: "あなたが生じる",
    生じられる: "お相手が生じる",
    剋す: "あなたが剋す",
    剋される: "お相手が剋す",
  }[relation] || relation;
}

function formationText(formations) {
  if (!formations.length) return "該当なし";
  return formations
    .map((formation) => {
      const members = formation.members
        .map((member) => `${member.branch}（${member.sources.map((source) => `${source.person}${source.pillar}`).join("・")}）`)
        .join("・");
      return `${formation.label}: ${members}`;
    })
    .join(" / ");
}

function voidOverlapText(overlap) {
  const parts = [
    ...overlap.secondInFirstVoid.map((item) => `${item}があなたの空亡`),
    ...overlap.firstInSecondVoid.map((item) => `${item}がお相手の空亡`),
  ];
  return parts.length ? parts.join(" / ") : "相手の空亡への直接の重なりはなし";
}

function renderCompatibilityInterpretation(readings) {
  return `
    <section class="result-block interpretation-block compatibility-interpretation">
      <div class="section-title"><h2>鑑定文</h2><span>相性の確認項目を文章で読む</span></div>
      <div class="interpretation-list">
        ${readings
          .map(
            (item) => `
              <article>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.body)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCompatibility({ chart, partnerChart, compatibility }) {
  const firstName = chart.input.customerName || "あなた";
  const secondName = partnerChart.input.customerName || "お相手";
  const stemCombinations = compatibility.stemCombinations.length
    ? compatibility.stemCombinations
      .map((item) => `${item.firstLabel}${item.firstPillar.stem} × ${item.secondLabel}${item.secondPillar.stem}`)
      .join(" / ")
    : "該当なし";
  const crossRows = compatibility.crossRelations
    .map((item) => {
      const signals = [
        `五行：${item.stemRelation}`,
        item.stemCombination ? "干合" : "",
        item.branchRelation !== "—" ? `地支：${item.branchRelation}` : "",
      ].filter(Boolean).join(" / ");
      return `<tr>
        <td data-label="${escapeHtml(firstName)}">${escapeHtml(item.firstLabel)}</td>
        <td data-label="干支">${escapeHtml(item.firstPillar.kanshiLabel)}</td>
        <td data-label="${escapeHtml(secondName)}">${escapeHtml(item.secondLabel)}</td>
        <td data-label="干支">${escapeHtml(item.secondPillar.kanshiLabel)}</td>
        <td data-label="照合結果">${escapeHtml(signals)}</td>
      </tr>`;
    })
    .join("");

  return `
    <div id="chart-section" class="app-preview-header">
      <div class="app-mark" aria-hidden="true">◇</div>
      <strong>四柱推命 相性診断</strong>
      <button type="button" class="date-edit-button" data-edit-input>入力を変更</button>
    </div>
    <div class="result-summary compatibility-summary">
      <div>
        <p class="eyebrow">相性確認</p>
        <h1>${escapeHtml(firstName)} × ${escapeHtml(secondName)}</h1>
        <p>${formatDate(chart.date)} ／ ${formatDate(partnerChart.date)}</p>
      </div>
    </div>
    <section class="compatibility-chart-grid" aria-label="二人の命式表">
      ${renderPillarTable(chart, `${firstName}の命式表`)}
      ${renderPillarTable(partnerChart, `${secondName}の命式表`)}
    </section>
    <section class="result-block compatibility-checks" aria-label="相性確認項目">
      <div class="section-title"><h2>相性確認項目</h2><span>命式全体をもとに照合</span></div>
      <div class="compatibility-check-grid">
        <article class="compatibility-check-card">
          <h3>空亡</h3>
          <p>${escapeHtml(firstName)}: <strong>${escapeHtml(chart.voidBranches.join("・"))}</strong></p>
          <p>${escapeHtml(secondName)}: <strong>${escapeHtml(partnerChart.voidBranches.join("・"))}</strong></p>
          <p class="compatibility-check-note">重なり: ${escapeHtml(voidOverlapText(compatibility.voidOverlap))}</p>
        </article>
        <article class="compatibility-check-card">
          <h3>日干・日支</h3>
          <p>日干: <strong>${escapeHtml(compatibility.firstDay.stem)} × ${escapeHtml(compatibility.secondDay.stem)}</strong>（${escapeHtml(relationLabel(compatibility.stemRelation))}${compatibility.dayStemCombination ? "・干合" : ""}）</p>
          <p>日支: <strong>${escapeHtml(compatibility.firstDay.branch)} × ${escapeHtml(compatibility.secondDay.branch)}</strong>（${escapeHtml(compatibility.dayBranchRelation)}）</p>
        </article>
        <article class="compatibility-check-card">
          <h3>干合</h3>
          <p>${escapeHtml(stemCombinations)}</p>
        </article>
        <article class="compatibility-check-card">
          <h3>三合会局</h3>
          <p>${escapeHtml(formationText(compatibility.threeHarmonies))}</p>
        </article>
        <article class="compatibility-check-card">
          <h3>方合</h3>
          <p>${escapeHtml(formationText(compatibility.directionalCombinations))}</p>
        </article>
      </div>
    </section>
    ${renderCompatibilityInterpretation(compatibility.readings)}
    <section class="result-block cross-pillar-block">
      <div class="section-title"><h2>年・月・日柱の照合一覧</h2><span>干合・地支関係を含む9通りの比較</span></div>
      <div class="table-wrap cross-pillar-table">
        <table>
          <thead><tr><th>${escapeHtml(firstName)}</th><th>干支</th><th>${escapeHtml(secondName)}</th><th>干支</th><th>照合結果</th></tr></thead>
          <tbody>${crossRows}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderResult(target, { mode = "chart", chart, partnerChart, compatibility, majorLuck, annualLuck, monthlyLuck, dailyLuck, profile, interpretation = [] }) {
  if (mode === "compatibility") {
    target.innerHTML = renderCompatibility({ chart, partnerChart, compatibility });
    return;
  }
  const birthTimeLabel = chart.input.unknownTime
    ? "出生時刻なし"
    : `${String(chart.input.hour).padStart(2, "0")}:${String(chart.input.minute).padStart(2, "0")}`;

  target.innerHTML = `
    <div id="chart-section" class="app-preview-header">
      <div class="app-mark" aria-hidden="true">◇</div>
      <strong>四柱推命ツール</strong>
      <button type="button" class="date-edit-button" data-edit-input>日付を変更</button>
    </div>
    <nav class="app-tabs" aria-label="表示切り替え">
      <button type="button" class="is-active" data-scroll-target="chart-section">命式</button>
      <button type="button" data-scroll-target="major-luck-section">大運</button>
      <button type="button" data-scroll-target="annual-luck-section">年運</button>
      <button type="button" data-scroll-target="monthly-luck-section">月運</button>
      <button type="button" data-scroll-target="daily-luck-section">日運</button>
      <button type="button" data-scroll-target="balance-section">五行</button>
    </nav>
    <div class="result-summary">
      <div>
        <p class="eyebrow">鑑定対象</p>
        <h1>${formatDate(chart.date)} ${escapeHtml(birthTimeLabel)}</h1>
        <p>節入り: ${escapeHtml(chart.monthBoundary.name)} / 節入日より${chart.setsuiriDayInfo.dayNumber}日目 / 空亡: ${escapeHtml(chart.voidBranches.join("・"))}</p>
      </div>
    </div>
    ${renderPillarTable(chart)}
    <div class="luck-grid">
      ${renderMajorLuck(majorLuck)}
      ${renderAnnualLuck(annualLuck)}
      ${renderMonthlyLuck(monthlyLuck)}
      ${renderDailyLuck(dailyLuck)}
    </div>
    <div id="balance-section">${renderElementBalance(chart)}</div>
    ${profile.fortuneText?.enabled ? renderInterpretation(interpretation) : ""}
    ${
      profile.pdfReport?.enabled
        ? `<div class="report-actions">
            <button type="button" class="pdf-button" data-print-report>PDF鑑定書を作成</button>
            <a class="verification-button" data-open-verification href="#" target="_blank" rel="noopener">計算確認表</a>
          </div>`
        : ""
    }
    <nav class="bottom-nav" aria-label="主要表示">
      <button type="button" class="is-active" data-scroll-target="chart-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        命式
      </button>
      <button type="button" data-scroll-target="major-luck-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h14M7 15l5-9 5 9"/></svg>
        大運
      </button>
      <button type="button" data-scroll-target="annual-luck-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v3M17 4v3M5 9h14M6 6h12v14H6z"/></svg>
        年運
      </button>
      <button type="button" data-scroll-target="monthly-luck-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5zM8 9h8M8 13h5"/></svg>
        月運
      </button>
      <button type="button" data-scroll-target="daily-luck-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v4M17 4v4M5 10h14M8 15h3M6 6h12v14H6z"/></svg>
        日運
      </button>
      <button type="button" data-scroll-target="balance-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M4 12h16M6 6l12 12M18 6 6 18"/></svg>
        五行
      </button>
    </nav>
  `;
}
