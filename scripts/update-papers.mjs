import { mkdir, writeFile } from "node:fs/promises";

// 1. 精准锁定的顶级期刊及其 ISSN，这决定了分类的名称
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

// 创建 ISSN 到 期刊ID 的映射表，方便快速归类
const issnToJournalId = {};
TARGET_JOURNALS.forEach(j => {
  j.issns.forEach(issn => {
    issnToJournalId[issn] = j.id;
  });
});

// 2. 植物分子生物学及通用植物关键词
const plantTerms = [
  "plant",
  "plants",
  "arabidopsis",
  "thaliana",
  "botany",
  "crop",
  "rice",
  "wheat",
  "maize",
  "soybean",
  "root",
  "leaf",
  "flower",
  "photosynthesis",
  "xylem",
  "phloem",
  "stomata",
  "chloroplast",
  "casparian",
  "oryza",
  "zea",
  "stamen",
  "pistil",
  "trichome"
];

// 扩大搜索范围到最近 90 天，捞取更多潜在文献
const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);
const query = encodeURIComponent("plant biology botany crop photosynthesis arabidopsis");

// 获取最新的 200 条数据供我们在本地精筛
const endpoint = `https://api.crossref.org/works?query=${query}&filter=type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=200`;

const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
    "User-Agent": "PlantScienceBrief/0.1 (mailto:zhuangyanisme1995@gmail.com)",
  },
});

if (!response.ok) {
  throw new Error(`Crossref request failed: ${response.status}`);
}

const data = await response.json();
const items = data.message?.items || [];

// 核心过滤：必须属于 8 本神刊，且必须包含植物关键词
const papers = items
  .map(normalizeCrossref)
  .filter((paper) => paper.title && paper.field !== "general" && isPlantRelevant(paper))
  .slice(0, 30); // 顶刊精选，最多保留 30 篇

if (!papers.length) {
  console.log("No new plant science papers found from elite journals today.");
}

const output = {
  generatedAt: new Date().toISOString(),
  source: "Crossref (Elite Journals by Journal Name)",
  query: "plant biology botany crop photosynthesis arabidopsis",
  papers,
};

await mkdir("data", { recursive: true });
await writeFile("data/papers.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${papers.length} elite papers grouped by journal to data/papers.json`);

function normalizeCrossref(item) {
  const title = cleanText(item.title?.[0] || "");
  const abstract = cleanText(item.abstract || "");
  const journal = item["container-title"]?.[0] || "Unknown journal";
  
  const dateParts =
    item.published?.["date-parts"]?.[0] ||
    item["published-print"]?.["date-parts"]?.[0] ||
    item["published-online"]?.["date-parts"]?.[0];
  const date = dateParts ? toDateString(dateParts) : new Date().toISOString().slice(0, 10);
  const url = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : "#");
  const doi = item.DOI || "";
  
  // 【重要修改】通过 ISSN 判断属于哪本期刊，并直接作为 field 分类名称
  const issns = item.ISSN || [];
  let field = "general"; 
  for (const issn of issns) {
    if (issnToJournalId[issn]) {
      field = issnToJournalId[issn]; // 比如直接归类为 "nature", "science", "nature-plants"
      break;
    }
  }

  return { title, journal, date, doi, url, abstract, field };
}

function isPlantRelevant(paper) {
  const text = `${paper.title} ${paper.abstract} ${paper.journal}`.toLowerCase();
  return plantTerms.some((word) => text.includes(word));
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