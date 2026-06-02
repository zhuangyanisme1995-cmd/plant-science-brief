import { C, arrow, card, foot, label, miniRoot, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "ANATOMY",
    title: "空间定位决定功能：凯氏带拦截质外体通路，迫使溶质经过膜选择。",
    page: 3,
  });
  miniRoot(slide, ctx, 80, 180, 1.15);
  label(slide, ctx, "根横截面概念图", 105, 485, 320, 28, { size: 18, bold: true, color: C.muted });
  card(slide, ctx, 520, 178, 630, 320, { fill: C.paper });
  label(slide, ctx, "运输路径的分流", 552, 206, 300, 28, { size: 24, bold: true, color: C.green });
  ctx.addShape(slide, { x: 575, y: 300, w: 460, h: 64, fill: "#EAD7B0", line: { style: "solid", fill: "#FFFFFF", width: 2 } });
  ctx.addShape(slide, { x: 820, y: 292, w: 22, h: 80, fill: C.lignin });
  label(slide, ctx, "皮层", 610, 318, 90, 26, { size: 18, bold: true });
  label(slide, ctx, "内皮层", 856, 318, 120, 26, { size: 18, bold: true });
  arrow(slide, ctx, 558, 270, 785, 270, C.blue);
  label(slide, ctx, "质外体流", 620, 234, 150, 24, { size: 16, color: C.blue, bold: true });
  arrow(slide, ctx, 792, 270, 820, 270, C.clay);
  label(slide, ctx, "被阻断", 806, 234, 100, 24, { size: 16, color: C.clay, bold: true });
  arrow(slide, ctx, 830, 420, 1035, 420, C.green);
  label(slide, ctx, "经转运蛋白选择进入中柱", 760, 445, 300, 24, { size: 16, color: C.green, bold: true });
  label(slide, ctx, "功能关键词：选择性吸收、离子稳态、避免旁路泄漏、限制毒性元素进入中柱。", 560, 540, 580, 56, {
    size: 19,
    color: C.ink,
  });
  foot(slide, ctx);
  return slide;
}
