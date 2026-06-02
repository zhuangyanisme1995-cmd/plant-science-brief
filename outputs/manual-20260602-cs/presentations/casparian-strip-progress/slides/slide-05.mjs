import { C, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "CHEMISTRY",
    title: "需要分清两个屏障：凯氏带偏“木质素带”，栓质层偏“脂质化内壁”。",
    page: 5,
  });
  card(slide, ctx, 80, 175, 500, 380, { fill: "#FFF8EA" });
  label(slide, ctx, "Casparian strip", 118, 205, 320, 32, { size: 28, bold: true, color: C.lignin });
  ctx.addShape(slide, { x: 130, y: 308, w: 360, h: 34, fill: C.lignin });
  label(slide, ctx, "径向/横向细胞壁中的局部木质素沉积", 130, 260, 380, 30, { size: 18, color: C.ink });
  label(slide, ctx, "主要角色", 130, 388, 130, 26, { size: 18, bold: true, color: C.muted });
  label(slide, ctx, "CASP · PER64 · ESB1 · RBOHF · MYB36", 130, 424, 380, 48, { size: 20, color: C.ink });
  card(slide, ctx, 700, 175, 500, 380, { fill: "#F1F7EB" });
  label(slide, ctx, "Suberin lamellae", 738, 205, 360, 32, { size: 28, bold: true, color: C.suberin });
  ctx.addShape(slide, { x: 760, y: 285, w: 34, h: 140, fill: C.suberin });
  ctx.addShape(slide, { x: 818, y: 285, w: 34, h: 140, fill: C.suberin });
  ctx.addShape(slide, { x: 876, y: 285, w: 34, h: 140, fill: C.suberin });
  label(slide, ctx, "内皮层后期或胁迫诱导的脂质化沉积", 738, 260, 380, 30, { size: 18, color: C.ink });
  label(slide, ctx, "主要角色", 738, 388, 130, 26, { size: 18, bold: true, color: C.muted });
  label(slide, ctx, "ABCG/GPAT/CYP86 · MYB41/92 · ABA/营养信号", 738, 424, 400, 52, { size: 19, color: C.ink });
  label(slide, ctx, "讲稿提示：很多教材把凯氏带简单说成“suberin”，但拟南芥凯氏带功能性屏障主要依赖木质素；栓质层是另一个阶段。", 150, 600, 980, 42, {
    size: 18,
    color: C.clay,
    align: "center",
  });
  foot(slide, ctx);
  return slide;
}
