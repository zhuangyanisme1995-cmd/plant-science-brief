import { C, bulletList, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "CORE TAKEAWAY",
    title: "凯氏带不只是“封条”，而是可感知、可修复、可塑的根部屏障系统。",
    page: 2,
  });
  card(slide, ctx, 60, 150, 360, 390, { fill: C.paper });
  label(slide, ctx, "已经比较清楚", 90, 180, 280, 30, { size: 24, bold: true, color: C.green });
  bulletList(
    slide,
    ctx,
    [
      "主要屏障位置是内皮层径向/横向壁",
      "凯氏带核心聚合物以木质素为主",
      "CASP scaffold 限定沉积区域",
      "MYB36 是发育性转录开关",
    ],
    92,
    232,
    286,
    { size: 16, gap: 60 },
  );
  card(slide, ctx, 460, 150, 360, 390, { fill: "#FCF7EB" });
  label(slide, ctx, "近年推进最快", 490, 180, 280, 30, { size: 24, bold: true, color: C.gold });
  bulletList(
    slide,
    ctx,
    [
      "CIF–SGN3–SGN1 监测屏障完整性",
      "缺陷会触发补偿性栓质化",
      "外皮层/exodermis 成为作物根屏障热点",
      "活体成像和细胞类型组学正在重写模型",
    ],
    492,
    232,
    286,
    { size: 16, gap: 60, dot: C.gold },
  );
  card(slide, ctx, 860, 150, 360, 390, { fill: "#F0F6F1" });
  label(slide, ctx, "仍然悬而未决", 890, 180, 280, 30, { size: 24, bold: true, color: C.clay });
  bulletList(
    slide,
    ctx,
    [
      "不同物种的保守性和差异性",
      "木质素、栓质、矿质营养之间如何耦合",
      "屏障增强是否一定提高抗逆",
      "能否精准改造而不牺牲养分吸收",
    ],
    892,
    232,
    286,
    { size: 16, gap: 60, dot: C.clay },
  );
  foot(slide, ctx);
  return slide;
}
