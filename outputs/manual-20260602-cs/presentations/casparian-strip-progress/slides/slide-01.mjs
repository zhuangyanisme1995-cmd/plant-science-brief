import { C, foot, label, miniRoot, pill } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = p.slides.add();
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: C.dark });
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: 720, fill: "#00000000" });
  miniRoot(slide, ctx, 820, 170, 1.2);
  ctx.addShape(slide, { x: 56, y: 68, w: 8, h: 72, fill: C.gold });
  label(slide, ctx, "凯氏带研究进展", 84, 70, 620, 78, {
    size: 46,
    bold: true,
    color: "#FFF7E8",
  });
  label(slide, ctx, "从内皮层屏障、局部木质素沉积到环境可塑性", 88, 158, 720, 38, {
    size: 22,
    color: "#D9E6D3",
  });
  pill(slide, ctx, "Casparian strip", 90, 248, 170, C.gold, "#392F22");
  pill(slide, ctx, "Endodermis", 276, 248, 150, "#9BCF8B", "#263D2F");
  pill(slide, ctx, "Apoplastic barrier", 442, 248, 190, "#9FD0E0", "#233945");
  label(slide, ctx, "汇报初稿 · 可继续补充具体物种和实验数据", 90, 612, 640, 28, {
    size: 16,
    color: "#C8D5C7",
  });
  foot(slide, ctx, "Prepared draft | sources summarized in final slides");
  return slide;
}
