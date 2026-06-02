import { C, arrow, card, foot, label, slideBase } from "./common.mjs";

export default function addSlide(p, ctx) {
  const slide = slideBase(p, ctx, {
    kicker: "TRANSCRIPTION",
    title: "MYB36 像主开关：把内皮层身份转换成凯氏带施工程序。",
    page: 7,
  });
  const centerY = 332;
  const flow = [
    ["SHR/SCR\n内皮层身份", 96, C.paleBlue, C.blue],
    ["MYB36\n转录开关", 346, C.paleGreen, C.green],
    ["CASP / ESB1\nPER64 等执行因子", 596, C.paleGold, C.gold],
    ["定点木质素\n+ 功能屏障", 892, "#F4DDD4", C.clay],
  ];
  flow.forEach((item) => {
    card(slide, ctx, item[1], 260, 190, 128, { fill: item[2], line: item[3] });
    label(slide, ctx, item[0], item[1] + 16, 292, 158, 62, { size: 22, bold: true, color: item[3], align: "center" });
  });
  arrow(slide, ctx, 292, centerY, 336, centerY, C.green);
  arrow(slide, ctx, 542, centerY, 586, centerY, C.green);
  arrow(slide, ctx, 792, centerY, 882, centerY, C.green);
  card(slide, ctx, 118, 485, 1010, 88, { fill: "#FFFDF7" });
  label(slide, ctx, "遗传证据", 150, 510, 140, 26, { size: 20, bold: true, color: C.green });
  label(slide, ctx, "myb36 突变体中，内皮层细胞间接触位点的木质素沉积显著缺失，PI penetration 等实验显示质外体屏障失效。", 290, 504, 760, 40, {
    size: 20,
    color: C.ink,
  });
  foot(slide, ctx, "Key source: Kamiya et al. 2015, PNAS; Liberman et al. 2015");
  return slide;
}
