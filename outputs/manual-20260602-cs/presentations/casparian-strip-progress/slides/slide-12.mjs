import { C, bulletList, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "OPEN QUESTIONS",
    title: "下一步关键问题：机制保守性、屏障代价，以及可工程化边界。",
    page: 12,
  });
  card(slide, ctx, 70, 160, 545, 400, { fill: C.paper });
  label(slide, ctx, "可作为讨论结尾的 5 个问题", 105, 195, 390, 32, { size: 25, bold: true, color: C.green });
  bulletList(
    slide,
    ctx,
    [
      "CASP/MYB36/SGN 轴在作物中是否完全保守？",
      "木质素屏障和栓质屏障如何分工、互补或冲突？",
      "屏障增强对不同养分吸收的代价是什么？",
      "外皮层屏障能否成为抗盐/抗旱育种靶点？",
      "能否用细胞类型特异调控实现“低代价屏障增强”？",
    ],
    112,
    255,
    440,
    { size: 17, gap: 66 },
  );
  card(slide, ctx, 675, 160, 525, 400, { fill: "#F9F6EC" });
  label(slide, ctx, "参考文献入口", 710, 195, 300, 32, { size: 25, bold: true, color: C.gold });
  const refs = [
    "Roppolo et al., 2011, Nature: CASP family and CS domain",
    "Lee et al., 2013, Cell: localized lignin deposition machinery",
    "Kamiya et al., 2015, PNAS: MYB36 controls CS formation",
    "Pfister et al., 2014; Doblas et al., 2017: CIF–SGN3 pathway",
    "Barbosa et al., 2019, Science Reports: CS defects induce suberin",
    "Plant Science 2025 review: suberin plasticity under environment",
    "IJBM 2024 review: lignin and Casparian strip barriers",
  ];
  refs.forEach((ref, i) => {
    label(slide, ctx, ref, 710, 250 + i * 36, 430, 30, { size: 13.5, color: C.ink });
  });
  foot(slide, ctx, "Sources: primary papers and recent reviews; update with lab-specific papers before formal presentation");
  return slide;
}
