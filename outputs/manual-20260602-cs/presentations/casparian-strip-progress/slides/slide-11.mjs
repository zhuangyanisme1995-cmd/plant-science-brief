import { C, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "METHODS",
    title: "方法进展让凯氏带从“染色观察”变成可定量的细胞生物学系统。",
    page: 11,
  });
  const cols = [
    ["成像", ["PI penetration", "Basic fuchsin / ClearSee", "CASP1::GFP live imaging", "3D confocal / light-sheet"], C.green],
    ["组学", ["单细胞/单核 RNA-seq", "细胞类型特异表达谱", "空间转录组", "蛋白互作与定位组学"], C.blue],
    ["遗传", ["forward screen", "CRISPR 多基因突变", "细胞类型特异 rescue", "报告基因和诱导表达"], C.gold],
    ["化学与功能", ["木质素/栓质单体分析", "离子组/营养元素测定", "水力导度", "胁迫生理表型"], C.clay],
  ];
  cols.forEach((col, i) => {
    const x = 55 + i * 305;
    card(slide, ctx, x, 170, 275, 390, { fill: C.paper, line: col[2] });
    ctx.addShape(slide, { x, y: 170, w: 275, h: 8, fill: col[2] });
    label(slide, ctx, col[0], x + 24, 204, 210, 32, { size: 25, bold: true, color: col[2] });
    col[1].forEach((txt, j) => {
      ctx.addShape(slide, { geometry: "ellipse", x: x + 28, y: 270 + j * 55, w: 8, h: 8, fill: col[2] });
      label(slide, ctx, txt, x + 48, 260 + j * 55, 210, 34, { size: 16, color: C.ink });
    });
  });
  foot(slide, ctx);
  return slide;
}
