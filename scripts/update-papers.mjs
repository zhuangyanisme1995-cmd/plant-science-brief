import { mkdir, writeFile } from "node:fs/promises";

// 1. 精准锁定的顶级期刊及其 ISSN
const TARGET_JOURNALS = [
  { id: "nature", name: "Nature", issns: ["0028-0836", "1476-4687"] },
  { id: "science", name: "Science", issns: ["0036-8075", "1095-9203"] },
  { id: "cell", name: "Cell", issns: ["0092-8674", "1097-4172"] },
  { id: "nature-plants", name: "Nature Plants", issns: ["2055-026X"] },
  { id: "nature-communications", name: "Nature Communications", issns: ["2041-1723"] },
  { id: "science-advances", name: "Science Advances", issns: ["2375-2548"] },
  { id: "cell-reports", name: "Cell Reports", issns: ["2211-1247"] },
  { id: "the-plant-cell", name: "The Plant Cell", issns: ["1040-4651", "1532-298X"] }
];

const issnToJournalId = {};
TARGET_JOURNALS.forEach(j => {
  j.issns.forEach(issn => {
    issnToJournalId[issn] = j.id;
  });
});

// 2. 分级植物学关键词评分系统
const WEIGHTED_TERMS = {
  // 核心硬核词：只要出现就极大概率是植物分子论文（+5分）
  core: ["arabidopsis", "thaliana", "chloroplast", "photosynthesis", "casparian", "oryza", "zea", "nicotiana", "phytochrome", "thylakoid", "stomata"],
  // 高频植物词：（+2分）
  high: ["plant", "plants", "botany", "crop", "crops", "auxin", "gibberellin", "cytokinin", "angiosperm", "gymnosperm", "xylem", "phloem", "seedling", "rice", "wheat", "maize", "soybean"],
  // 通用或易混淆词：（+1分）
  low: ["root", "roots", "leaf", "leaves", "flower", "flowering", "grain", "seed", "seeds", "forest"]
};

// 一票否决词：混入顶刊医学、动物、材料论文的罪魁祸首
const BLACKLIST_TERMS = ["cancer", "patient", "patients", "clinical", "tumor", "tumors", "mouse", "mice", "human disease", "patient", "therapy"];

// 扩大检索天数到 90 天，因为加了黑名单过滤后，需要更广的样本池来筛选纯金子
const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);
const issnFilters = TARGET_JOURNALS.flatMap(j => j.issns).map(issn => `issn:${issn}`).join(",");
const endpoint = `https://api.crossref.org/works?filter=${issnFilters},type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=350`;

console.log("正在连接云端期刊数据库，检索最新文献真实详情...");

const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
    "User-Agent": "PlantScienceBrief/2.0 (mailto:zhuangyanisme1995@gmail.com)",
  },
});

if (!response.ok) {
  throw new Error(`Crossref 数据库通信失败，状态码: ${response.status}`);
}

const data = await response.json();
const items = data.message?.items || [];
console.log(`成功拉取到原始论文 ${items.length} 篇，正在进入【智能计分与黑名单】重度精筛...`);

const papers = items
  .map(normalizeCrossref)
  .filter((paper) => paper.title && paper.url !== "#" && paper.field !== "general" && calculatePlantScore(paper) >= 3)
  .slice(0, 30); 

const output = {
  generatedAt: new Date().toISOString(),
  source: "Crossref Real-time Elite API v2.0",
  papers,
};

await mkdir("data", { recursive: true });
await writeFile("data/papers.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`🎉 净化完成！共有 ${papers.length} 篇纯正的植物科学论文通过了严苛筛选。`);

function normalizeCrossref(item) {
  const title = cleanText(item.title?.[0] || "");
  const abstract = cleanText(item.abstract || "");
  const journal = item["container-title"]?.[0] || "Unknown Journal";
  
  const dateParts =
    item.published?.["date-parts"]?.[0] ||
    item["published-print"]?.["date-parts"]?.[0] ||
    item["published-online"]?.["date-parts"]?.[0];
  const date = dateParts ? toDateString(dateParts) : new Date().toISOString().slice(0, 10);
  
  let url = "#";
  if (item.DOI) {
    url = `https://doi.org/${item.DOI}`;
  } else if (item.URL) {
    url = item.URL;
  }
  
  const doi = item.DOI || "";
  const issns = item.ISSN || [];
  let field = "general"; 
  for (const issn of issns) {
    if (issnToJournalId[issn]) {
      field = issnToJournalId[issn];
      break;
    }
  }

  return { title, journal, date, doi, url, abstract, field };
}

// 核心：智能计分函数
function calculatePlantScore(paper) {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  
  // 1. 检查黑名单（一票否决）
  for (const black of BLACKLIST_TERMS) {
    if (text.includes(black)) {
      // 排除特别情况：除非题目明确有 plant/arabidopsis 这种强势词对抗
      if (!text.includes("plant") && !text.includes("arabidopsis")) {
        return 0; // 只要包含医学/癌症高频词，且没有强植物词，直接归 0 排除
      }
    }
  }

  // 2. 累加计分
  let score = 0;
  
  // 如果是 Nature Plants 或者 The Plant Cell 这两本纯植物杂志，天然直接无条件 +10 分加满
  if (paper.field === "nature-plants" || paper.field === "the-plant-cell") {
    score += 10;
  }

  WEIGHTED_TERMS.core.forEach(word => { if (text.includes(word)) score += 5; });
  WEIGHTED_TERMS.high.forEach(word => { if (text.includes(word)) score += 2; });
  WEIGHTED_TERMS.low.forEach(word => { if (text.includes(word)) score += 1; });

  return score;
}

function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDateString(parts) {
  const [year, month = 1, day = 1] = parts;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}