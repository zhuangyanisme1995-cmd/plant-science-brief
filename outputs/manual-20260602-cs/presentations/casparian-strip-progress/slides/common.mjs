export const C = {
  bg: "#F6F2E8",
  paper: "#FFFDF7",
  ink: "#1D2A23",
  muted: "#6F7B70",
  rule: "#D8D1BF",
  green: "#2F6F4E",
  green2: "#77A365",
  gold: "#C99B45",
  clay: "#B7654B",
  blue: "#3E708D",
  violet: "#7763A8",
  lignin: "#B9782E",
  suberin: "#6F8F3D",
  paleGreen: "#E6EFE2",
  paleGold: "#F3E6C8",
  paleBlue: "#E2ECF1",
  dark: "#183027",
};

export function slideBase(p, ctx, opts = {}) {
  const slide = p.slides.add();
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: opts.bg || C.bg });
  ctx.addShape(slide, { x: 40, y: 34, w: 6, h: 34, fill: opts.accent || C.green });
  if (opts.kicker) {
    ctx.addText(slide, {
      text: opts.kicker,
      x: 58,
      y: 34,
      w: 360,
      h: 24,
      size: 13,
      bold: true,
      color: opts.accent || C.green,
      face: "Aptos",
    });
  }
  if (opts.title) {
    ctx.addText(slide, {
      text: opts.title,
      x: 58,
      y: 58,
      w: 850,
      h: 82,
      size: 34,
      bold: true,
      color: C.ink,
      face: "Microsoft YaHei",
    });
  }
  if (opts.page) {
    ctx.addText(slide, {
      text: String(opts.page).padStart(2, "0"),
      x: 1160,
      y: 42,
      w: 70,
      h: 24,
      size: 13,
      color: C.muted,
      align: "right",
      face: "Aptos",
    });
  }
  return slide;
}

export function foot(slide, ctx, text = "Casparian strip research progress | draft for discussion") {
  ctx.addShape(slide, { x: 40, y: 680, w: 1200, h: 1, fill: C.rule });
  ctx.addText(slide, {
    text,
    x: 40,
    y: 688,
    w: 880,
    h: 18,
    size: 10,
    color: C.muted,
    face: "Aptos",
  });
}

export function label(slide, ctx, text, x, y, w, h, opts = {}) {
  return ctx.addText(slide, {
    text,
    x,
    y,
    w,
    h,
    size: opts.size || 16,
    bold: Boolean(opts.bold),
    color: opts.color || C.ink,
    face: opts.face || "Microsoft YaHei",
    align: opts.align || "left",
    valign: opts.valign || "top",
    fill: opts.fill || "#00000000",
    line: opts.line || ctx.line(),
    insets: opts.insets || { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function pill(slide, ctx, text, x, y, w, color, fill) {
  ctx.addShape(slide, {
    x,
    y,
    w,
    h: 34,
    fill,
    line: { style: "solid", fill: color, width: 1 },
  });
  label(slide, ctx, text, x + 12, y + 7, w - 24, 20, { size: 13, bold: true, color });
}

export function card(slide, ctx, x, y, w, h, opts = {}) {
  ctx.addShape(slide, {
    x,
    y,
    w,
    h,
    fill: opts.fill || C.paper,
    line: { style: "solid", fill: opts.line || C.rule, width: 1 },
  });
}

export function bulletList(slide, ctx, items, x, y, w, opts = {}) {
  const gap = opts.gap || 34;
  items.forEach((item, i) => {
    const yy = y + i * gap;
    ctx.addShape(slide, { x, y: yy + 8, w: 8, h: 8, geometry: "ellipse", fill: opts.dot || C.green });
    label(slide, ctx, item, x + 20, yy, w - 20, gap + 4, { size: opts.size || 18, color: opts.color || C.ink });
  });
}

export function arrow(slide, ctx, x1, y1, x2, y2, color = C.green) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const angle = Math.atan2(dy, dx);
  const thickness = 3;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const shaft = ctx.addShape(slide, {
    x: cx - length / 2,
    y: cy - thickness / 2,
    w: length - 12,
    h: thickness,
    fill: color,
  });
  shaft.rotation = (angle * 180) / Math.PI;
  const head = ctx.addShape(slide, {
    geometry: "triangle",
    x: x2 - 13,
    y: y2 - 8,
    w: 16,
    h: 16,
    fill: color,
  });
  head.rotation = (angle * 180) / Math.PI + 90;
}

export function miniRoot(slide, ctx, x, y, scale = 1) {
  const cx = x + 145 * scale;
  const cy = y + 145 * scale;
  const rings = [
    { r: 140, fill: "#F1DEB7", label: "表皮/皮层" },
    { r: 106, fill: "#D7E6C9", label: "内皮层" },
    { r: 72, fill: "#DDEBF1", label: "中柱" },
  ];
  rings.forEach((ring) => {
    ctx.addShape(slide, {
      geometry: "ellipse",
      x: cx - ring.r * scale,
      y: cy - ring.r * scale,
      w: ring.r * 2 * scale,
      h: ring.r * 2 * scale,
      fill: ring.fill,
      line: { style: "solid", fill: "#FFFFFF", width: 3 },
    });
  });
  ctx.addShape(slide, {
    geometry: "ellipse",
    x: cx - 109 * scale,
    y: cy - 109 * scale,
    w: 218 * scale,
    h: 218 * scale,
    fill: "#00000000",
    line: { style: "solid", fill: C.lignin, width: 7 },
  });
  label(slide, ctx, "凯氏带", cx - 42 * scale, cy - 132 * scale, 84, 28, { size: 15, bold: true, color: C.lignin, align: "center" });
}
