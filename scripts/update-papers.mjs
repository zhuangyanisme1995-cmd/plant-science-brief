import { mkdir, writeFile, readFile } from "node:fs/promises";

// 1. 全面扩充的 Nature, Science, Cell 顶级子刊名录及 ISSN
const TARGET_JOURNALS = [
  { id: "nature", name: "Nature", issns: ["0028-0836", "1476-4687"] },
  { id: "science", name: "Science", issns: ["0036-8075", "1095-9203"] },
  { id: "cell", name: "Cell", issns: ["0092-8674", "1097-4172"] },
  { id: "nature-plants", name: "Nature Plants", issns: ["2055-026X"] },
  { id: "the-plant-cell", name: "The Plant Cell", issns: ["1040-4651", "1532-298X"] },
  { id: "nature-communications", name: "Nature Communications", issns: ["2041-1723"] },
  { id: "science-advances", name: "Science Advances", issns: ["2375-2548"] },
  { id: "cell-reports", name: "Cell Reports", issns: ["2211-1247"] },
  { id: "nature-genetics", name: "Nature Genetics", issns: ["1061-4036", "1546-1718"] },
  { id: "nature-cell-biology", name: "Nature Cell Biology", issns: ["1465-7392", "1476-4679"] },
  { id: "nature-biotechnology", name: "Nature Biotechnology", issns: ["1087-0156", "1546-1696"] },
  { id: "nature-methods", name: "Nature Methods", issns: ["1548-7091", "1548-7105"] },
  { id: "cell-host-microbe", name: "Cell Host & Microbe", issns: ["1931-3128", "1934-6069"] },
  { id: "molecular-cell", name: "Molecular Cell", issns: ["1097-2765", "1097-4164"] },
  { id: "pnas", name: "PNAS", issns: ["0027-8424", "1091-6490"] }
];

const issnToJournalId = {};
TARGET_JOURNALS.forEach(j => {
  j.issns.forEach(issn => {
    issnToJournalId[issn] = j.id;
  });
});

// ==========================================
// 🌟 纯主动防御：多维植物学积极特征证据库（剔除黑名单）
// ==========================================
const PLANT_EVIDENCES = {
  // 维度 A：高纯度植物物种与专有生理机制（具备强力指向性，发现一个即给 4 分）
  heavy: [
    "arabidopsis", "thaliana", "chloroplast", "photosynthesis", "photosynthetic",
    "casparian", "oryza", "zea", "maize", "rice", "wheat", "soybean", "tobacco", "nicotiana",
    "phytochrome", "thylakoid", "coleoptile", "plasmodesmata", "auxin", "gibberellin", 
    "cytokinin", "abscisic acid", "salicylic acid", "jasmonate", "brassinosteroid"
  ],
  
  // 维度 B：植物解剖学结构与分子生物学高频词（结合上下文，发现一个给 2 分）
  medium: [
    "plant", "plants", "botany", "stomata", "stomatal", "xylem", "phloem", "apoplast", 
    "cell wall", "seedling", "seedlings", "vacuole", "meristem", "root", "roots", 
    "leaf", "leaves", "flower", "flowering", "crop", "crops", "cultivar"
  ]
};

const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);
const issnFilters = TARGET_JOURNALS.flatMap(j => j.issns).map(issn => `issn:${issn}`).join(",");
const endpoint = `https://api.crossref.org/works?filter=${issnFilters},type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=500`;

console.log("正在连接全球期刊数据库，全面检索 NSC 及其顶级子刊集群...");

const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
    "User-Agent": "PlantScienceBrief/6.0 (mailto:zhuangyanisme1995@gmail.com)",
  },
});

if (!response.ok) {
  throw new Error(`Crossref 通信失败: ${response.status}`);
}

const data = await response.json();
const items = data.message?.items || [];
console.log(`成功拉取到 ${items.length} 篇顶刊群文献。启动【多维主动积极评分】机制...`);

const papers = items
  .map(normalizeCrossref)
  .filter((paper) => paper.title && paper.url !== "#" && paper.field !== "general" && evaluatePlantProbability(paper))
  .slice(0, 35); 

const output = {
  generatedAt: new Date().toISOString(),
  source: "Crossref Real-time Elite API v6.0 (Pure Active Filter)",
  papers,
};

await mkdir("data", { recursive: true });
await writeFile("data/papers.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`🎉 深度净化完成！共筛选出 ${papers.length} 篇通过积极证据验证的顶级植物文献。`);

// 自动化前端黑客注入引擎（免手动修改 app.js）
try {
  let appJsContent = await readFile("app.js", "utf8");
  if (!appJsContent.includes("affiliation-text") && appJsContent.includes("journal-text")) {
    appJsContent = appJsContent.replace(
      /`[\s\S]*?\${.*?\.(journal|journalText|journal-text|date)}[\s\S]*?`/g,
      (match) => {
        return match.replace(/<\/span>\s*$/, `</span>\n\t\t\t\t\${paper.affiliation ? \`<span class="affiliation-text" style="color:#718096; font-size:0.82em; font-style:italic; margin-left:8px; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:inline-block; vertical-align:bottom;" title="\${paper.affiliation}"> | \${paper.affiliation}</span>\` : ''}`);
      }
    );
    await writeFile("app.js", appJsContent, "utf8");
    console.log("✅ 前端一作单位渲染逻辑自动注入成功！");
  }
} catch (err) {
  console.log("自动前端适配跳过:", err.message);
}

function normalizeCrossref(item) {
  const title = cleanText(item.title?.[0] || "");
  const abstract = cleanText(item.abstract || "");
  let journal = item["container-title"]?.[0] || "Unknown Journal";
  
  TARGET_JOURNALS.forEach(j => {
    j.issns.forEach(issn => {
      if (item.ISSN?.includes(issn)) journal = j.name;
    });
  });

  const dateParts = item.published?.["date-parts"]?.[0] || item["published-print"]?.["date-parts"]?.[0] || item["published-online"]?.["date-parts"]?.[0];
  const date = dateParts ? toDateString(dateParts) : new Date().toISOString().slice(0, 10);
  const url = item.DOI ? `https://doi.org/${item.DOI}` : (item.URL || "#");
  const doi = item.DOI || "";
  
  let affiliation = "";
  if (item.author && item.author.length > 0) {
    const firstAuthor = item.author.find(a => a.sequence === "first") || item.author[0];
    if (firstAuthor && firstAuthor.affiliation && firstAuthor.affiliation.length > 0) {
      affiliation = cleanText(firstAuthor.affiliation[0].name || "");
    }
  }
  if (!affiliation && item.institution && item.institution.length > 0) {
    affiliation = cleanText(item.institution[0].name || "");
  }

  const issns = item.ISSN || [];
  let field = "general"; 
  for (const issn of issns) {
    if (issnToJournalId[issn]) {
      field = issnToJournalId[issn];
      break;
    }
  }

  return { title, journal, date, doi, url, abstract, field, affiliation };
}

// 🧠 核心算法：全主动概率证据评判（完全废除黑名单）
function evaluatePlantProbability(paper) {
  const titleLower = paper.title.toLowerCase();
  const abstractLower = paper.abstract.toLowerCase();
  const fullText = `${titleLower} ${abstractLower}`;

  // 1. 无条件信任纯植物双雄（它们本身就是最大的积极证据）
  if (paper.field === "nature-plants" || paper.field === "the-plant-cell") {
    return true;
  }

  let totalScore = 0;

  // 2. 统计维度 A 的权重词（重型核心词，每个+4分）
  PLANT_EVIDENCES.heavy.forEach(word => {
    if (fullText.includes(word)) {
      totalScore += 4;
    }
  });

  // 3. 统计维度 B 的权重词（中型结构词，每个+2分）
  PLANT_EVIDENCES.medium.forEach(word => {
    if (fullText.includes(word)) {
      totalScore += 2;
    }
  });

  // 4. 【额外奖励分】如果题目（Title）直接包含了任何维度的植物词，加重信任（额外奖励 +3 分）
  const hasPlantInTitle = [...PLANT_EVIDENCES.heavy, ...PLANT_EVIDENCES.medium].some(word => titleLower.includes(word));
  if (hasPlantInTitle) {
    totalScore += 3;
  }

  // 🏁 终极裁决：不搞一票否决。只要文章累积的植物学积极证据总分 >= 6 分，
  // 意味着它拥有足够密集的植物学基因，判定为“纯正植物生物学研究”，准予放行！
  return totalScore >= 6;
}

function cleanText(text) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toDateString(parts) {
  const [year, month = 1, day = 1] = parts;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}