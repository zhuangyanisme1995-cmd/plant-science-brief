import { C, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "PLASTICITY",
    title: "环境信号主要通过栓质化和屏障成熟节律来调节根部通透性。",
    page: 9,
  });
  const items = [
    ["盐胁迫 / 干旱", "增强栓质沉积，降低水分和离子旁路泄漏", C.blue],
    ["营养状态", "N、Fe、P 等影响内皮层屏障成熟与选择性吸收", C.green],
    ["激素", "ABA、乙烯和细胞分裂素参与调控屏障可塑性", C.gold],
    ["病原与免疫", "屏障重塑限制入侵，也可能影响根际互作", C.clay],
  ];
  items.forEach((item, i) => {
    const x = 90 + (i % 2) * 580;
    const y = 178 + Math.floor(i / 2) * 190;
    card(slide, ctx, x, y, 500, 145, { fill: C.paper, line: item[2] });
    ctx.addShape(slide, { x: x + 22, y: y + 24, w: 10, h: 92, fill: item[2] });
    label(slide, ctx, item[0], x + 52, y + 26, 380, 30, { size: 24, bold: true, color: item[2] });
    label(slide, ctx, item[1], x + 52, y + 72, 380, 50, { size: 18, color: C.ink });
  });
  label(slide, ctx, "研究趋势：不再只问“有没有凯氏带”，而是问屏障何时形成、在哪里加强、是否可逆，以及代价是什么。", 140, 590, 1000, 42, {
    size: 21,
    bold: true,
    color: C.dark,
    align: "center",
  });
  foot(slide, ctx, "Key sources: suberin plasticity reviews; SGN3/GSO1 signaling studies");
  return slide;
}
