const ELEMENTS = ["木", "火", "土", "金", "水"];
const STEM_COMBINATIONS = new Set(["甲己", "乙庚", "丙辛", "丁壬", "戊癸"]);
const BRANCH_RELATIONS = {
  六合: ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"],
  冲: ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"],
  害: ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"],
};
const THREE_HARMONIES = [
  { label: "三合会局（水局）", branches: ["申", "子", "辰"] },
  { label: "三合会局（木局）", branches: ["亥", "卯", "未"] },
  { label: "三合会局（火局）", branches: ["寅", "午", "戌"] },
  { label: "三合会局（金局）", branches: ["巳", "酉", "丑"] },
];
const DIRECTIONAL_COMBINATIONS = [
  { label: "方合（東方木局）", branches: ["寅", "卯", "辰"] },
  { label: "方合（南方火局）", branches: ["巳", "午", "未"] },
  { label: "方合（西方金局）", branches: ["申", "酉", "戌"] },
  { label: "方合（北方水局）", branches: ["亥", "子", "丑"] },
];
const PILLAR_LABELS = { year: "年柱", month: "月柱", day: "日柱" };

function unorderedPair(first, second) {
  return `${first}${second}`;
}

function hasPair(pairs, first, second) {
  const pair = unorderedPair(first, second);
  return pairs.some((value) => value === pair || value === `${second}${first}`);
}

function hasStemCombination(first, second) {
  return STEM_COMBINATIONS.has(unorderedPair(first, second)) || STEM_COMBINATIONS.has(unorderedPair(second, first));
}

function elementRelation(from, to) {
  const offset = (ELEMENTS.indexOf(to) - ELEMENTS.indexOf(from) + 5) % 5;
  return ["比和", "生じる", "剋す", "生じられる", "剋される"][offset];
}

function getBranchRelation(first, second) {
  return Object.entries(BRANCH_RELATIONS).find(([, pairs]) => hasPair(pairs, first, second))?.[0] || "—";
}

function buildCrossPillarRelations(first, second) {
  const keys = ["year", "month", "day"];
  return keys.flatMap((firstKey) =>
    keys.map((secondKey) => {
      const firstPillar = first.pillarMap[firstKey];
      const secondPillar = second.pillarMap[secondKey];
      return {
        firstKey,
        secondKey,
        firstLabel: PILLAR_LABELS[firstKey],
        secondLabel: PILLAR_LABELS[secondKey],
        firstPillar,
        secondPillar,
        stemRelation: elementRelation(firstPillar.stemElement, secondPillar.stemElement),
        stemCombination: hasStemCombination(firstPillar.stem, secondPillar.stem),
        branchRelation: getBranchRelation(firstPillar.branch, secondPillar.branch),
      };
    }),
  );
}

function branchSources(first, second) {
  return [
    ...["year", "month", "day"].map((key) => ({ person: "あなた", pillar: PILLAR_LABELS[key], branch: first.pillarMap[key].branch })),
    ...["year", "month", "day"].map((key) => ({ person: "お相手", pillar: PILLAR_LABELS[key], branch: second.pillarMap[key].branch })),
  ];
}

function findBranchGroups(groups, sources) {
  return groups
    .filter((group) => group.branches.every((branch) => sources.some((source) => source.branch === branch)))
    .map((group) => ({
      ...group,
      members: group.branches.map((branch) => ({
        branch,
        sources: sources.filter((source) => source.branch === branch),
      })),
    }));
}

function balanceComplement(first, second) {
  const firstWeak = ELEMENTS.filter((element) => first.fiveElementBalance[element] === 0);
  const secondStrong = ELEMENTS.filter((element) => second.fiveElementBalance[element] >= 2);
  const supported = firstWeak.filter((element) => secondStrong.includes(element));
  return supported.length
    ? `${supported.join("・")}は、あなたの命式で少なめな一方、お相手に目立つ五行です。二人の異なる持ち味として読み取れます。`
    : "五行の偏りは大きく補完し合う形ではありませんが、共通する価値観や生活のリズムを土台に関係を整えやすい組み合わせです。";
}

function displayName(chart, fallback) {
  return chart.input.customerName ? `${chart.input.customerName}さん` : fallback;
}

function dayStemReading(relation, firstName, secondName, stemCombination) {
  const relationText = {
    比和: "似た感覚や価値観を共有しやすく、対等な関係を育てやすい組み合わせです。",
    生じる: `${firstName}が${secondName}を後押ししやすい関係です。支える役割が一方通行にならないよう、互いの希望を言葉にすると安定します。`,
    生じられる: `${secondName}から${firstName}が力を受け取りやすい関係です。受け取った気持ちや感謝を言葉にすると、関係の良さが形になりやすくなります。`,
    剋す: "考え方や進め方に違いが出やすい関係です。優劣ではなく得意分野の違いとして扱うと、刺激を強みに変えられます。",
    剋される: "相手の判断やペースが強く感じられる場面があります。期待値や役割を早めにすり合わせると、無理のない距離を作りやすくなります。",
  };
  const combinationText = stemCombination
    ? "日干同士には干合もあり、相手の違いが印象に残りやすい組み合わせです。惹かれ合う気持ちを前提にせず、節目ごとに本音を確認すると関係が安定します。"
    : "日干に干合はありませんが、五行の関係そのものが二人の関わり方を読む軸になります。";
  return `${relationText[relation]} ${combinationText}`;
}

function dayBranchReading(relation, firstDay, secondDay) {
  const label = `${firstDay.branch}と${secondDay.branch}`;
  if (relation === "六合") {
    return `${label}は六合です。日支は日常の距離感や生活面を読む軸になるため、日々の習慣や小さな約束を共有するほど安心感につながりやすい組み合わせです。`;
  }
  if (relation === "冲") {
    return `${label}は冲です。近づく力がないという意味ではなく、互いの常識や生活のペースを動かしやすい関係です。違いを直そうとせず、譲れないことと任せられることを分けると関係の推進力になります。`;
  }
  if (relation === "害") {
    return `${label}は害です。大きな衝突よりも、言葉にしない期待の違いがすれ違いとして残りやすい関係です。予定や連絡頻度など現実的なことほど、先に共有することが助けになります。`;
  }
  return `${label}の間には、六合・冲・害の強い関係は出ていません。日干の関係や命式全体の重なりを手がかりに、二人に合う距離感を作っていく組み合わせです。`;
}

function voidOverlap(first, second) {
  const keys = ["year", "month", "day"];
  const secondInFirstVoid = keys
    .filter((key) => first.voidBranches.includes(second.pillarMap[key].branch))
    .map((key) => `お相手の${PILLAR_LABELS[key]}（${second.pillarMap[key].branch}）`);
  const firstInSecondVoid = keys
    .filter((key) => second.voidBranches.includes(first.pillarMap[key].branch))
    .map((key) => `あなたの${PILLAR_LABELS[key]}（${first.pillarMap[key].branch}）`);
  return { secondInFirstVoid, firstInSecondVoid };
}

function voidReading(overlap, firstName, secondName) {
  const parts = [];
  if (overlap.secondInFirstVoid.length) {
    parts.push(`${overlap.secondInFirstVoid.join("・")}が${firstName}の空亡に重なります`);
  }
  if (overlap.firstInSecondVoid.length) {
    parts.push(`${overlap.firstInSecondVoid.join("・")}が${secondName}の空亡に重なります`);
  }
  if (!parts.length) {
    return "双方の年・月・日支には、相手の空亡へ直接重なる支はありません。空亡だけで相性の良し悪しを決めず、日干・日支や柱全体との重なりを合わせて読む形です。";
  }
  return `${parts.join("。 ")}。空亡の重なりは関係の良し悪しを断定するものではなく、該当する柱のテーマで気持ちや状況が揺れやすい可能性として、ほかの関係と合わせて確認します。`;
}

function combinationReading(stemCombinations) {
  if (!stemCombinations.length) {
    return "年・月・日柱を照合した範囲では干合はありません。干合の有無だけで判断せず、日干の五行関係や日支、命式全体の重なりを中心に読みます。";
  }
  const locations = stemCombinations.map((item) => `${item.firstLabel}×${item.secondLabel}`).join("、");
  return `干合は${locations}にあります。干合は、互いの違いが印象に残りやすく、関係の接点として意識されやすい要素です。実際の関係では、相手を決めつけずに対話を重ねるほど良さを活かしやすくなります。`;
}

function branchGroupReading(threeHarmonies, directionalCombinations) {
  const messages = [];
  if (threeHarmonies.length) {
    messages.push(`${threeHarmonies.map((item) => item.label).join("・")}が二人の命式にそろっています。三合会局は、二人の支が同じテーマに向かって集まりやすい要素として確認します。`);
  }
  if (directionalCombinations.length) {
    messages.push(`${directionalCombinations.map((item) => item.label).join("・")}が二人の命式にそろっています。方合は、同じ方向性や環境を整える力として読み取れる要素です。`);
  }
  if (!messages.length) {
    return "二人の年・月・日支を合わせても、三合会局・方合として三支がそろう組み合わせはありません。個別の干合や日支関係、五行バランスを中心に関係性を確認します。";
  }
  return messages.join(" ");
}

function makeReadings(first, second, compatibility) {
  const firstName = displayName(first, "あなた");
  const secondName = displayName(second, "お相手");
  return [
    {
      title: "日干の関係",
      body: dayStemReading(compatibility.stemRelation, firstName, secondName, compatibility.dayStemCombination),
    },
    {
      title: "日支の関係",
      body: dayBranchReading(compatibility.dayBranchRelation, compatibility.firstDay, compatibility.secondDay),
    },
    {
      title: "空亡の重なり",
      body: voidReading(compatibility.voidOverlap, firstName, secondName),
    },
    {
      title: "干合の確認",
      body: combinationReading(compatibility.stemCombinations),
    },
    {
      title: "三合会局・方合の確認",
      body: branchGroupReading(compatibility.threeHarmonies, compatibility.directionalCombinations),
    },
    {
      title: "五行バランスの補完",
      body: compatibility.balanceText,
    },
  ];
}

export function calculateCompatibility(first, second) {
  const firstDay = first.pillarMap.day;
  const secondDay = second.pillarMap.day;
  const crossRelations = buildCrossPillarRelations(first, second);
  const sources = branchSources(first, second);
  const stemRelation = elementRelation(firstDay.stemElement, secondDay.stemElement);
  const dayStemCombination = hasStemCombination(firstDay.stem, secondDay.stem);
  const dayBranchRelation = getBranchRelation(firstDay.branch, secondDay.branch);
  const compatibility = {
    firstDay,
    secondDay,
    stemRelation,
    dayStemCombination,
    dayBranchRelation,
    crossRelations,
    stemCombinations: crossRelations.filter((item) => item.stemCombination),
    threeHarmonies: findBranchGroups(THREE_HARMONIES, sources),
    directionalCombinations: findBranchGroups(DIRECTIONAL_COMBINATIONS, sources),
    voidOverlap: voidOverlap(first, second),
    balanceText: balanceComplement(first, second),
  };
  return {
    ...compatibility,
    readings: makeReadings(first, second, compatibility),
  };
}
