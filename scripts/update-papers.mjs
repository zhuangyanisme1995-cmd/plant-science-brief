import { mkdir, writeFile } from "node:fs/promises";

// 1. 精准锁定的顶级期刊及其 ISSN 与标准前缀
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

// 建立 ISSN 到 期刊ID 的双向映射
const issnToJournalId = {};
TARGET_JOURNALS.forEach(j => {
  j.issns.forEach(issn => {
    issnToJournalId[issn] = j.id;
  });
});

// 2. 精准的植物分子生物学核心检索词（涵盖拟南芥、生理、结构、多组学）
const plantTerms = [
  "plant", "plants", "arabidopsis", "thaliana", "botany", "crop", "rice", "wheat", 
  "maize", "soybean", "root", "leaf", "flower", "photosynthesis", "xylem", "phloem", 
  "stomata", "chloroplast", "casparian", "oryza", "zea", "stamen", "pistil", "trichome",
  "grain", "seedling", "angiosperm", "gymnosperm", "moss", "auxin", "gibberellin", "cytokinin"
];

// 构建跨越最近 60 天的过滤条件，直接在 API 端限定期刊范围（这样速度最快、数据最准）
const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString().slice(0, 10);

// 把 8 本期刊的所有 ISSN 拼接到过滤条件里
const issnFilters = TARGET_JOURNALS.flatMap(j => j.issns).map(issn => `issn:${issn}`).join(",");
const endpoint = `https://api.crossref.org/works?filter=${issnFilters},type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=300`;

console.log("正在连接云端期刊数据库，检索最新文献真实详情...");

const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
    "User-Agent": "PlantScienceBrief/1.0 (mailto:zhuangyanisme1995@gmail.com)",
  },
});

if (!response.ok) {
  throw new Error(`Crossref 数据库通信失败，状态码: ${response.status}`);
}

const data = await response.json();
const items = data.message?.items || [];
console.log(`成功拉取到上述顶刊的 ${items.length} 篇最新发表论文，正在进行植物学关键词重度筛选...`);

// 核心精筛：必须有 DOI，必须属于 8 本神刊之一，内容必须包含植物核心词
const papers = items
  .map(normalizeCrossref)
  .filter((paper) => paper.title && paper.url !== "#" && paper.field !== "general" && isPlantRelevant(paper))
  .slice(0, 30); // 保留最新、最相关的 30 篇

const output = {
  generatedAt: new Date().toISOString(),
  source: "Crossref Real-time Elite API",
  papers,
};

await mkdir("data", { recursive: true });
await writeFile("data/papers.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`🎉 筛选完成！共有 ${papers.length} 篇带有真实官网正文链接的植物学论文被写入数据。`);

function normalizeCrossref(item) {
  const title = cleanText(item.title?.[0] || "");
  const abstract = cleanText(item.abstract || "");
  const journal = item["container-title"]?.[0] || "Unknown Journal";
  
  // 提取真实出版日期
  const dateParts =
    item.published?.["date-parts"]?.[0] ||
    item["published-print"]?.["date-parts"]?.[0] ||
    item["published-online"]?.["date-parts"]?.[0];
  const date = dateParts ? toDateString(dateParts) : new Date().toISOString().slice(0, 10);
  
  // 【死磕真实详情链接】优先使用 DOI 生成直达具体论文正文的公网链接
  let url = "#";
  if (item.DOI) {
    url = `https://doi.org/${item.DOI}`;
  } else if (item.URL) {
    url = item.URL;
  }
  
  const doi = item.DOI || "";
  
  // 根据真实 ISSN 分类
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

function isPlantRelevant(paper) {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
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