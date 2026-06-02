import { mkdir, writeFile } from "node:fs/promises";

const fields = [
  {
    id: "molecular",
    words: ["gene", "genome editing", "transcription", "flowering", "root", "development", "hormone", "auxin", "cell"],
  },
  {
    id: "crop",
    words: ["crop", "rice", "wheat", "maize", "soybean", "yield", "breeding", "domestication", "trait"],
  },
  {
    id: "ecology",
    words: ["climate", "drought", "ecosystem", "forest", "biodiversity", "carbon", "warming", "adaptation"],
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

const plantTerms = [
  "plant",
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
  "arabidopsis",
  "forest",
  "phytology",
];

const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);
const query = encodeURIComponent("plant biology botany crop ecology microbiome photosynthesis");
const endpoint = `https://api.crossref.org/works?query=${query}&filter=type:journal-article,from-pub-date:${fromDate}&sort=published&order=desc&rows=50`;

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
const papers = items
  .map(normalizeCrossref)
  .filter((paper) => paper.title && isPlantRelevant(paper))
  .slice(0, 24);

if (!papers.length) {
  throw new Error("No plant science papers found");
}

const output = {
  generatedAt: new Date().toISOString(),
  source: "Crossref",
  query: "plant biology botany crop ecology microbiome photosynthesis",
  papers,
};

await mkdir("data", { recursive: true });
await writeFile("data/papers.json", `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${papers.length} papers to data/papers.json`);

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
  const field = classifyPaper(`${title} ${abstract}`);
  return { title, journal, date, doi, url, abstract, field };
}

function classifyPaper(text) {
  const lower = text.toLowerCase();
  const scores = fields.map((field) => ({
    id: field.id,
    score: field.words.reduce((sum, word) => sum + (lower.includes(word) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].id : "general";
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
