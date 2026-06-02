import { C, arrow, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "SURVEILLANCE",
    title: "SGN3/CIF 通路把凯氏带变成一个会被“验收”的屏障。",
    page: 8,
  });
  card(slide, ctx, 86, 165, 1090, 410, { fill: C.paper });
  label(slide, ctx, "屏障缺口", 150, 246, 130, 28, { size: 22, bold: true, color: C.clay });
  ctx.addShape(slide, { x: 120, y: 306, w: 200, h: 26, fill: C.lignin });
  ctx.addShape(slide, { x: 204, y: 306, w: 32, h: 26, fill: "#FFFFFF" });
  label(slide, ctx, "CIF1/2 peptide", 390, 220, 180, 30, { size: 22, bold: true, color: C.blue });
  ctx.addShape(slide, { geometry: "ellipse", x: 425, y: 295, w: 20, h: 20, fill: C.blue });
  ctx.addShape(slide, { geometry: "ellipse", x: 462, y: 295, w: 20, h: 20, fill: C.blue });
  ctx.addShape(slide, { geometry: "ellipse", x: 499, y: 295, w: 20, h: 20, fill: C.blue });
  label(slide, ctx, "SGN3/GSO1\n受体激酶", 648, 236, 170, 56, { size: 22, bold: true, color: C.green, align: "center" });
  ctx.addShape(slide, { x: 690, y: 308, w: 86, h: 34, fill: C.paleGreen, line: { style: "solid", fill: C.green, width: 2 } });
  label(slide, ctx, "SGN1/PBL15\n下游定位", 900, 236, 190, 56, { size: 22, bold: true, color: C.gold, align: "center" });
  ctx.addShape(slide, { x: 950, y: 312, w: 80, h: 26, fill: C.paleGold, line: { style: "solid", fill: C.gold, width: 2 } });
  arrow(slide, ctx, 326, 318, 420, 318, C.blue);
  arrow(slide, ctx, 535, 318, 682, 318, C.green);
  arrow(slide, ctx, 785, 318, 942, 318, C.gold);
  label(slide, ctx, "如果屏障不连续，来自中柱侧的 CIF 肽更容易接触 SGN3，触发定位修复和补偿性栓质化。", 170, 442, 900, 54, {
    size: 22,
    color: C.ink,
    align: "center",
  });
  foot(slide, ctx, "Key sources: Pfister et al. 2014; Doblas et al. 2017; SGN1 Nature Plants 2016");
  return slide;
}
