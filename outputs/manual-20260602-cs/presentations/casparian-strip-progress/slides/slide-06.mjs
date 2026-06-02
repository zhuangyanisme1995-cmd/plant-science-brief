import { C, arrow, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "LOCALIZATION",
    title: "CASP 膜域把木质素聚合机器限制在一条窄带上。",
    page: 6,
  });
  card(slide, ctx, 110, 165, 1040, 390, { fill: C.paper });
  const nodes = [
    ["内皮层分化", 160, 260, C.paleBlue, C.blue],
    ["CASP1–5\n形成膜域", 370, 260, C.paleGreen, C.green],
    ["招募 PER64\n与 RBOHF", 590, 260, C.paleGold, C.gold],
    ["局部氧化\n单体聚合", 810, 260, "#F4DDD4", C.clay],
    ["连续凯氏带", 1010, 260, "#EFE5F6", C.violet],
  ];
  nodes.forEach((node) => {
    ctx.addShape(slide, { x: node[1], y: node[2], w: 140, h: 92, fill: node[3], line: { style: "solid", fill: node[4], width: 1 } });
    label(slide, ctx, node[0], node[1] + 12, node[2] + 20, 116, 52, { size: 18, bold: true, color: node[4], align: "center" });
  });
  for (let i = 0; i < nodes.length - 1; i += 1) {
    arrow(slide, ctx, nodes[i][1] + 148, 306, nodes[i + 1][1] - 10, 306, C.green);
  }
  label(slide, ctx, "定位问题", 160, 405, 180, 26, { size: 20, bold: true, color: C.green });
  label(slide, ctx, "木质素单体并不天然只在一条线聚合；CASP 域像“施工围栏”，把聚合酶和 ROS 生成限制到特定位点。", 160, 440, 870, 56, {
    size: 20,
    color: C.ink,
  });
  foot(slide, ctx, "Key sources: Roppolo et al. 2011; Lee et al. 2013; Kamiya et al. 2015");
  return slide;
}
