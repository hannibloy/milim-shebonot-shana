// עיצוב נגזר-שם: אותיות השם הופכות לזרע מתמטי שקובע את הקומפוזיציה.
// כך הגלויה של כל משתתף/ת ייחודית באמת — נבראת מאותיות השם.

function hashName(name: string): number {
  let h = 2166136261;
  for (const ch of name) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WBlob {
  top: string; left: string; size: number; hue: number; opacity: number;
}

export interface SeededDesign {
  blobs: WBlob[];
  hueShift: number;
  decoAngles: number[];
  linesTilt: number;
}

export function designFromName(name: string): SeededDesign {
  const rnd = mulberry32(hashName(name.trim() || "שנה"));
  const blobs: WBlob[] = [];
  const count = 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < count; i++) {
    blobs.push({
      top: `${Math.round(rnd() * 86)}%`,
      left: `${Math.round(rnd() * 86)}%`,
      size: 70 + Math.round(rnd() * 120),
      hue: Math.round(rnd() * 60 - 30),
      opacity: 0.10 + rnd() * 0.12,
    });
  }
  const decoAngles = Array.from({ length: 10 }, () => Math.round(rnd() * 24 - 12));
  return {
    blobs,
    hueShift: Math.round(rnd() * 14 - 7),
    decoAngles,
    linesTilt: +(rnd() * 1.2 - 0.6).toFixed(2),
  };
}
