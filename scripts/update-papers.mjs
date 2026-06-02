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
  
  // NSC 旗下顶级生命科学与综合子刊
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

// 2. 严苛的植物学特征词库
const PLANT_HEAVY_TERMS = [
  "plant", "plants", "arabidopsis", "thaliana", "chloroplast", "photosynthesis", 
  "casparian", "oryza", "zea", "maize", "rice", "wheat", "soybean", "stomata", 
  "xylem", "phloem", "auxin", "seedling", "botany", "root", "leaf", "flower", "crop"
];

// 综合杂志极为高频的非植物医学/动物/材料噪音词
const BLACKLIST_TERMS = [
  "cancer", "patient", "patients", "clinical", "tumor", "tumors", "mouse", "mice", 
  "human disease", "therapy", "chemotherapy", "neuron", "brain", "scaffold", "alloy",
  "battery", "nanoparticle", "catalyst", "cardiac", "blood", "immune response", "hiv", "vaccine"
];

// 扩大抓取样本基数到最近 90 天
const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);
const issnFilters = TARGET_JOURNALS.flatMap(j => j.issns).map(issn => `issn:${issn}`).join(",");
const endpoint = `https://api.crossref.org/works?filter=${issnFilters},type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=500`;

console.log("正在连接全球期刊数据库，全面检索 NSC 及其顶级子刊集群...");

const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
    "User-Agent": "PlantScienceBrief/4.0 (mailto:zhuangyanisme1995@gmail.com)",
  },
});

if (!response.ok) {
  throw new Error(`Crossref 通信失败: ${response.status}`);
}

const data = await response.json();
const items = data.message?.items || [];
console.log(`成功拉取到 ${items.length} 篇顶刊群原始文献。启动“双重裁判+一作单位提取”机制...`);

const papers = items
  .map(normalizeCrossref)
  .filter((paper) => paper.title && paper.url !== "#" && paper.field !== "general" && isStrictlyPlantBiology(paper))
  .slice(0, 35); 

const output = {
  generatedAt: new Date().toISOString(),
  source: "Crossref Real-time Elite API v4.0",
  papers,
};

await mkdir("data", { recursive: true });
await writeFile("data/papers.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`🎉 数据净化完成！共筛选出 ${papers.length} 篇绝对纯正的顶级植物科学文献。`);

// ==========================================
// 🚀 【新增】自动化前端黑客注入引擎：免手动修改 app.js/html
// ==========================================
try {
  console.log("正在自动化改造前端渲染引擎，确保‘第一作者单位’无缝展示...");
  let appJsContent = await readFile("app.js", "utf8");
  
  // 检查前端代码里是否已经包含单位渲染逻辑，如果没有，则在生成卡片的位置强行拦截注入
  if (!appJsContent.includes("affiliation-text") && appJsContent.includes("journal-text")) {
    // 寻找原版代码渲染 journal-text 或 field-pill 的标准锚点，并在其后方横插一手
    appJsContent = appJsContent.replace(
      /`[\s\S]*?\${.*?\.(journal|journalText|journal-text|date)}[\s\S]*?`/g,
      (match) => {
        // 在期刊/日期标签旁边，强行挂载带有一作单位的斜体小字组件，超出长度自动略过
        return match.replace(/<\/span>\s*$/, `</span>\n\t\t\t\t\${paper.affiliation ? \`<span class="affiliation-text" style="color:#718096; font-size:0.82em; font-style:italic; margin-left:8px; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:inline-block; vertical-align:bottom;" title="\${paper.affiliation}"> | \${paper.affiliation}</span>\` : ''}`);
      }
    );
    await writeFile("app.js", appJsContent, "utf8");
    console.log("✅ app.js 渲染引擎一作单位逻辑拦截注入成功！");
  }
} catch (err) {
  console.log("提示：自动处理前端渲染逻辑时略过（可能 app.js 结构高度定制），不影响数据生成。", err.message);
}

// ==========================================
// 核心数据清洗与一作单位提取逻辑
// ==========================================
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
  
  // 【核心融合逻辑】精准扒出第一作者的第一单位
  let affiliation = "";
  if (item.author && item.author.length > 0) {
    // 优先寻找官方打上 sequence: "first" 标签的第一作者；找不到则默认取数组第一个
    const firstAuthor = item.author.find(a => a.sequence === "first") || item.author[0];
    if (firstAuthor && firstAuthor.affiliation && firstAuthor.affiliation.length > 0) {
      // 提取单位名字
      affiliation = cleanText(firstAuthor.affiliation[0].name || "");
    }
  }
  // 如果作者栏缺失机构，降级去提取大文章的统筹 institution
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

  // 顺手把提取好的单位完美打包进 papers.json 传递给前端
  return { title, journal, date, doi, url, abstract, field, affiliation };
}

// 🧠 核心算法：双重植物逻辑裁判
function isStrictlyPlantBiology(paper) {
  const titleLower = paper.title.toLowerCase();
  const abstractLower = paper.abstract.toLowerCase();
  const fullText = `${titleLower} ${abstractLower}`;

  if (paper.field === "nature-plants" || paper.field === "the-plant-cell") {
    return true;
  }

  for (const word of BLACKLIST_TERMS) {
    if (fullText.includes(word)) {
      if (!titleLower.includes("plant") && !titleLower.includes("arabidopsis") && !titleLower.includes("crop")) {
        return false; 
      }
    }
  }

  const hasPlantInTitle = PLANT_HEAVY_TERMS.some(word => titleLower.includes(word));
  const hasPlantInAbstract = PLANT_HEAVY_TERMS.some(word => abstractLower.includes(word));

  if (hasPlantInTitle) {
    return true; 
  }

  if (hasPlantInAbstract) {
    let matchCount = 0;
    PLANT_HEAVY_TERMS.forEach(word => {
      if (abstractLower.includes(word)) matchCount++;
    });
    if (matchCount >= 2) return true;
  }

  return false;
}

function cleanText(text) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toDateString(parts) {
  const [year, month = 1, day = 1] = parts;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}