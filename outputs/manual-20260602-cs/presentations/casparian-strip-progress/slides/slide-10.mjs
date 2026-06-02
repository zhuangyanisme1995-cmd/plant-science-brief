import { C, bulletList, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "CROP ANGLE",
    title: "从拟南芥走向作物：外皮层和多层屏障是下一轮重点。",
    page: 10,
  });
  card(slide, ctx, 72, 160, 500, 405, { fill: "#FFF8EA" });
  label(slide, ctx, "模型植物给出的框架", 110, 190, 360, 32, { size: 26, bold: true, color: C.green });
  bulletList(
    slide,
    ctx,
    [
      "内皮层凯氏带由发育程序精确定位",
      "SGN 通路监测屏障连续性",
      "屏障缺陷可诱导补偿性栓质化",
      "遗传工具和成像体系成熟",
    ],
    115,
    255,
    390,
    { size: 18, gap: 70 },
  );
  card(slide, ctx, 700, 160, 500, 405, { fill: "#F0F6F1" });
  label(slide, ctx, "作物根系提出的新问题", 738, 190, 360, 32, { size: 26, bold: true, color: C.gold });
  bulletList(
    slide,
    ctx,
    [
      "水稻、玉米等常有外皮层/exodermis",
      "多层屏障影响盐、干旱和养分吸收",
      "根龄、组织位置和环境强烈改变屏障",
      "育种目标需要平衡抗逆与吸收效率",
    ],
    743,
    255,
    390,
    { size: 18, gap: 70, dot: C.gold },
  );
  label(slide, ctx, "应用判断：增强屏障不一定总是好事；更有价值的是让屏障在正确组织、正确时期、正确压力下增强。", 150, 608, 980, 36, {
    size: 21,
    color: C.clay,
    bold: true,
    align: "center",
  });
  foot(slide, ctx, "Key sources: exodermis reviews; crop apoplastic barrier studies");
  return slide;
}
