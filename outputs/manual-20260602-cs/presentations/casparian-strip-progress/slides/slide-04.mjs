import { C, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "FIELD MAP",
    title: "研究重心从“化学屏障”转向“细胞定位 + 完整性监测 + 环境调节”。",
    page: 4,
  });
  const y = 356;
  ctx.addShape(slide, { x: 100, y, w: 1050, h: 4, fill: C.rule });
  const events = [
    ["1990s", "结构与化学", "凯氏带/栓质层作为质外体屏障被系统描述"],
    ["2011", "CASP scaffold", "CASP 蛋白定义内皮层膜域，限定沉积位置"],
    ["2015", "MYB36", "转录因子 MYB36 被确认为形成开关"],
    ["2016–2017", "SGN pathway", "CIF–SGN3–SGN1 连接屏障缺陷与修复"],
    ["2020s", "可塑性与作物", "养分、盐胁迫、外皮层和作物根屏障成为热点"],
  ];
  events.forEach((event, i) => {
    const x = 110 + i * 250;
    const up = i % 2 === 0;
    ctx.addShape(slide, { geometry: "ellipse", x: x - 9, y: y - 9, w: 22, h: 22, fill: i < 3 ? C.green : C.gold });
    label(slide, ctx, event[0], x - 42, up ? 216 : 398, 96, 24, { size: 17, bold: true, color: C.ink, align: "center" });
    label(slide, ctx, event[1], x - 80, up ? 246 : 428, 170, 28, { size: 20, bold: true, color: i < 3 ? C.green : C.gold, align: "center" });
    label(slide, ctx, event[2], x - 92, up ? 282 : 464, 190, 70, { size: 14, color: C.muted, align: "center" });
    ctx.addShape(slide, { x: x, y: up ? y - 84 : y + 20, w: 2, h: 72, fill: C.rule });
  });
  label(slide, ctx, "结论：凯氏带研究现在更像一个“发育定位 + 屏障质量控制 + 环境响应”的系统问题。", 160, 610, 950, 36, {
    size: 22,
    bold: true,
    color: C.dark,
    align: "center",
  });
  foot(slide, ctx);
  return slide;
}
