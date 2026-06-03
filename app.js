const fields = [
  { id: "all", label: "全部领域" },
  { id: "molecular", label: "分子与发育" },
  { id: "crop", label: "作物与育种" },
  { id: "microbe", label: "植物-微生物" },
  { id: "omics", label: "组学与技术" },
  { id: "general", label: "综合植物学" },
];

const fieldRules = [
  {
    id: "molecular",
    words: ["gene", "genome editing", "transcription", "flowering", "root", "development", "hormone", "auxin", "cell"],
  },
  {
    id: "crop",
    words: ["crop", "rice", "wheat", "maize", "soybean", "yield", "breeding", "domestication", "trait"],
  },
  {
    id: "microbe",
    words: ["microbiome", "microbe", "fungal", "pathogen", "rhizosphere", "symbiosis", "mycorrhizal", "disease"],
  },
  {
    id: "omics",
    words: ["single-cell", "transcriptome", "proteome", "metabolome", "sequencing", "atlas", "spatial", "omics"],
  },
];

const fallbackPapers = [
  {
    title: "Single-cell atlas reveals root cell-state transitions under drought stress",
    journal: "Nature Plants",
    date: "2026-05-21",
    doi: "10.0000/example.root-atlas",
    url: "https://www.nature.com/nplants/",
    abstract:
      "A single-cell transcriptomic study maps how root tissues alter hormone signaling, cell wall remodeling, and stress-response programs during progressive drought.",
  },
  {
    title: "A domestication allele improves nitrogen-use efficiency in modern rice",
    journal: "The Plant Cell",
    date: "2026-05-18",
    doi: "10.0000/example.rice-nitrogen",
    url: "https://academic.oup.com/plcell",
    abstract:
      "Genetic analysis links a selected rice allele to stronger nitrogen uptake, improved yield stability, and altered root architecture across field environments.",
  },
  {
    title: "Rhizosphere microbiome assembly protects plants from soil-borne pathogens",
    journal: "Molecular Plant",
    date: "2026-05-09",
    doi: "10.0000/example.rhizosphere",
    url: "https://www.cell.com/molecular-plant/home",
    abstract:
      "Synthetic community experiments identify microbial consortia that suppress pathogen growth and activate host immune priming in roots.",
  },
  {
    title: "Spatial metabolomics identifies defense gradients in infected leaves",
    journal: "Plant Physiology",
    date: "2026-05-04",
    doi: "10.0000/example.spatial-metabolomics",
    url: "https://academic.oup.com/plphys",
    abstract:
      "A spatial metabolomics workflow resolves leaf defense chemistry at tissue scale and links metabolite gradients to pathogen invasion fronts.",
  },
];

let papers = [];
let activeField = "all";
let searchTerm = "";
let sortMode = "date";

const paperList = document.querySelector("#paperList");
const paperTemplate = document.querySelector("#paperTemplate");
const fieldTabs = document.querySelector("#fieldTabs");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const refreshButton = document.querySelector("#refreshButton");
const freshnessText = document.querySelector("#freshnessText");
const totalCount = document.querySelector("#totalCount");
const todayCount = document.querySelector("#todayCount");
const sourceCount = document.querySelector("#sourceCount");
const fieldSummary = document.querySelector("#fieldSummary");

function buildTabs() {
  fieldTabs.innerHTML = fields
    .map((field) => `<button type="button" data-field="${field.id}">${field.label}</button>`)
    .join("");
  fieldTabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-field]");
    if (!button) return;
    activeField = button.dataset.field;
    render();
  });
}

async function loadPapers() {
  refreshButton.disabled = true;
  freshnessText.textContent = "正在读取";

  try {
    const stored = await loadStoredPapers();
    papers = stored.papers;
    freshnessText.textContent = stored.generatedAt
      ? `更新于 ${formatDateTime(stored.generatedAt)}`
      : "已读取数据";
  } catch (error) {
    try {
      papers = await fetchLivePapers();
      freshnessText.textContent = `实时刷新 ${new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch (liveError) {
      papers = fallbackPapers.map(enrichPaper);
      freshnessText.textContent = "显示示例数据";
    }
  }

  refreshButton.disabled = false;
  render();
}

async function loadStoredPapers() {
  const response = await fetch(`data/papers.json?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Stored data not found");
  const data = await response.json();
  const storedPapers = Array.isArray(data.papers) ? data.papers : [];
  if (!storedPapers.length) throw new Error("Stored data is empty");
  return {
    generatedAt: data.generatedAt,
    papers: storedPapers.map((paper) => enrichPaper(paper)),
  };
}

async function fetchLivePapers() {
  const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);
  const query = encodeURIComponent("plant biology botany crop microbiome");
  const endpoint = `https://api.crossref.org/works?query=${query}&filter=type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=24`;
  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Crossref request failed");
  const data = await response.json();
  const items = data.message.items || [];
  const livePapers = normalizeCrossref(items);
  if (livePapers.length < 4) throw new Error("Not enough live plant papers");
  return livePapers;
}

function normalizeCrossref(items) {
  return items
    .map((item) => {
      const title = cleanText(item.title?.[0] || "");
      const abstract = cleanText(item.abstract || "");
      const journal = item["container-title"]?.[0] || "Unknown journal";
      const dateParts =
        item.published?.["date-parts"]?.[0] ||
        item["published-print"]?.["date-parts"]?.[0] ||
        item["published-online"]?.["date-parts"]?.[0];
      const date = dateParts ? toDateString(dateParts) : new Date().toISOString().slice(0, 10);
      const url = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : "#");
      return enrichPaper({ title, abstract, journal, date, doi: item.DOI || "", url });
    })
    .filter((paper) => paper.title && isPlantRelevant(paper));
}

function enrichPaper(paper) {
  const field = classifyPaper(paper);
  return {
    ...paper,
    field,
    summary: summarizePaper(paper, field),
    takeaways: buildTakeaways(paper, field),
    recencyScore: recencyScore(paper.date),
  };
}

function classifyPaper(paper) {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  const scores = fieldRules.map((rule) => ({
    id: rule.id,
    score: rule.words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].id : "general";
}

function summarizePaper(paper, field) {
  const fieldLabel = getFieldLabel(field);
  const abstract = paper.abstract || "";
  const firstSentence = abstract.split(/[.!?。！？]/).find((part) => part.trim().length > 36);
  if (firstSentence) return `${fieldLabel}方向：${firstSentence.trim()}。`;
  return `${fieldLabel}方向的新近论文，题名显示其关注 ${extractKeywords(paper.title).join("、") || "植物科学关键问题"}。`;
}

function buildTakeaways(paper, field) {
  const keywords = extractKeywords(`${paper.title} ${paper.abstract}`).slice(0, 3);
  const label = getFieldLabel(field);
  return [
    `领域归类：${label}`,
    `核心线索：${keywords.join("、") || "植物响应、机制解析、应用潜力"}`,
    `跟进价值：适合纳入${label}方向的每周论文追踪`,
  ];
}

function extractKeywords(text) {
  const candidates = [
    "root",
    "rice",
    "wheat",
    "maize",
    "microbiome",
    "pathogen",
    "single-cell",
    "transcriptome",
    "yield",
    "flowering",
    "hormone",
    "genome",
    "stress",
  ];
  const lower = text.toLowerCase();
  return candidates.filter((word) => lower.includes(word)).map(translateKeyword);
}

function translateKeyword(word) {
  const map = {
    root: "根系",
    rice: "水稻",
    wheat: "小麦",
    maize: "玉米",
    microbiome: "微生物组",
    pathogen: "病原",
    "single-cell": "单细胞",
    transcriptome: "转录组",
    yield: "产量",
    flowering: "开花",
    hormone: "激素",
    genome: "基因组",
    stress: "逆境",
  };
  return map[word] || word;
}

function render() {
  document.querySelectorAll("#fieldTabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.field === activeField);
  });

  const filtered = papers
    .filter((paper) => activeField === "all" || paper.field === activeField)
    .filter((paper) => {
      const haystack = `${paper.title} ${paper.journal} ${paper.summary}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    })
    .sort(sortPapers);

  renderStats(filtered);
  renderPapers(filtered);
  renderSummary();
}

function sortPapers(a, b) {
  if (sortMode === "impact") return journalRank(a.journal) - journalRank(b.journal);
  if (sortMode === "field") return a.field.localeCompare(b.field);
  return new Date(b.date) - new Date(a.date);
}

function renderStats(list) {
  totalCount.textContent = list.length;
  todayCount.textContent = list.filter((paper) => recencyScore(paper.date) <= 7).length;
  sourceCount.textContent = new Set(list.map((paper) => paper.journal)).size;
}

function renderPapers(list) {
  paperList.innerHTML = "";
  if (!list.length) {
    paperList.innerHTML = `<div class="empty-state">没有匹配结果</div>`;
    return;
  }

  list.forEach((paper) => {
    const node = paperTemplate.content.cloneNode(true);
    const card = node.querySelector(".paper-card");
    const pill = node.querySelector(".field-pill");
    pill.textContent = getFieldLabel(paper.field);
    pill.classList.add(paper.field);
    card.querySelector("h4").textContent = paper.title;
    card.querySelector(".summary").textContent = paper.summary;
    card.querySelector(".date-text").textContent = formatDate(paper.date);
    card.querySelector(".journal-text").textContent = paper.journal;
    card.querySelector(".recency").textContent = recencyText(paper.date);
    
    // 💡 融合一作科研单位渲染引擎（限宽截断防溢出，悬停看全称）
    if (paper.affiliation) {
      const affSpan = document.createElement("span");
      affSpan.className = "affiliation-text";
      affSpan.style.cssText = "color:#718096; font-size:0.85em; font-style:italic; margin-left:8px; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:inline-block; vertical-align:bottom;";
      affSpan.textContent = ` | ${paper.affiliation}`;
      affSpan.title = paper.affiliation;
      card.querySelector(".paper-meta").appendChild(affSpan);
    }

    const link = card.querySelector("a");
    link.href = paper.url;
    card.querySelector(".takeaways").innerHTML = paper.takeaways
      .map((text, index) => `<div class="takeaway"><span>${index + 1}</span><div>${text}</div></div>`)
      .join("");
    paperList.appendChild(node);
  });
}

function renderSummary() {
  const counts = fields
    .filter((field) => field.id !== "all")
    .map((field) => ({
      ...field,
      count: papers.filter((paper) => paper.field === field.id).length,
    }));
  const max = Math.max(...counts.map((item) => item.count), 1);
  fieldSummary.innerHTML = counts
    .map(
      (item) => `
      <div class="field-row">
        <div class="field-row-head">
          <span>${item.label}</span>
          <span>${item.count}</span>
        </div>
        <div class="bar-track"><div class="bar" style="width:${(item.count / max) * 100}%"></div></div>
      </div>
    `,
    )
    .join("");
}

function getFieldLabel(id) {
  return fields.find((field) => field.id === id)?.label || "综合植物学";
}

function recencyScore(date) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24 * 10)));
}

function recencyText(date) {
  const days = recencyScore(date);
  if (days === 0) return "今日发布";
  if (days <= 7) return `${days} 天内发布`;
  return `${days} 天前发布`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(date) {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateString(parts) {
  const [year, month = 1, day = 1] = parts;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function cleanText(text) {
  const element = document.createElement("div");
  element.innerHTML = text;
  return element.textContent.replace(/\s+/g, " ").trim();
}

function isPlantRelevant(paper) {
  const text = `${paper.title} ${paper.abstract} ${paper.journal}`.toLowerCase();
  return [
    "plant",
    "botany",
    "crop",
    "rice",
    "wheat",
    "maize",
    "root",
    "leaf",
    "flower",
    "photosynthesis",
    "arabidopsis",
  ].some((word) => text.includes(word));
}

function journalRank(journal) {
  const watchlist = [
    "Nature Plants",
    "The Plant Cell",
    "New Phytologist",
    "Molecular Plant",
    "Plant Physiology",
    "Trends in Plant Science",
  ];
  const index = watchlist.findIndex((name) => journal.toLowerCase().includes(name.toLowerCase()));
  return index === -1 ? 99 : index;
}

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  render();
});

sortSelect.addEventListener("change", (event) => {
  sortMode = event.target.value;
  render();
});

refreshButton.addEventListener("click", loadPapers);

buildTabs();
loadPapers();