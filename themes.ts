// ערכות עיצוב לגלויה + מנוע פירוש תיאור חופשי בעברית

export interface CardTheme {
  id: string;
  name: string;
  desc: string;
  vars: Record<string, string>; // משתני CSS
  texture: "notebook" | "emerald" | "classic";
}

export const THEMES: CardTheme[] = [
  {
    id: "notebook",
    name: "פנקס אקוורל",
    desc: "פסטל רך, מדבקות ופרחי אקוורל",
    texture: "notebook",
    vars: {
      "--card-bg": "#FDF9F3",
      "--card-ink": "#6B5B7A",
      "--card-title": "#D97A8E",
      "--card-accent": "#C9B8D8",
      "--card-accent2": "#BFD8C2",
      "--card-gold": "#D9B36A",
      "--card-chip-bg": "#F7EFE6",
      "--card-border": "#E8D9E4",
    },
  },
  {
    id: "emerald",
    name: "אמרלד וזהב",
    desc: "ירוק עמוק, זהב חגיגי ונגיעות ורוד",
    texture: "emerald",
    vars: {
      "--card-bg": "#10382F",
      "--card-ink": "#F6EFE3",
      "--card-title": "#E9C46A",
      "--card-accent": "#D4AF37",
      "--card-accent2": "#E88CA0",
      "--card-gold": "#D4AF37",
      "--card-chip-bg": "#1B4A3F",
      "--card-border": "#2E6155",
    },
  },
  {
    id: "classic",
    name: "שמנת ומרווה",
    desc: "שמנת חמה, ירוק מרווה ובורדו עדין",
    texture: "classic",
    vars: {
      "--card-bg": "#FAF8F5",
      "--card-ink": "#4A4238",
      "--card-title": "#7A3B4A",
      "--card-accent": "#A3B19A",
      "--card-accent2": "#7A3B4A",
      "--card-gold": "#C9A227",
      "--card-chip-bg": "#F1EDE4",
      "--card-border": "#DDD5C7",
    },
  },
];

export type Decoration = "hearts" | "stars" | "flowers" | "sprouts" | "butterflies" | "rainbow";

export const DECORATIONS: { id: Decoration; label: string; emoji: string }[] = [
  { id: "hearts", label: "לבבות", emoji: "💗" },
  { id: "stars", label: "כוכבים", emoji: "⭐" },
  { id: "flowers", label: "פרחים", emoji: "🌸" },
  { id: "sprouts", label: "נבטים", emoji: "🌱" },
  { id: "butterflies", label: "פרפרים", emoji: "🦋" },
  { id: "rainbow", label: "קשת", emoji: "🌈" },
];

export interface DesignTweaks {
  decorations: Set<Decoration>;
  density: "minimal" | "normal" | "rich";
  accentOverride: string | null; // צבע הדגשה שנקלט מהטקסט
  themeHint: string | null; // רמז לערכה מהטקסט
  notes: string[]; // מה המנוע הבין — משוב למשתתף
}

// מנוע פירוש: הופך תיאור חופשי בעברית להחלטות עיצוב
export function parseDesignText(text: string): Partial<DesignTweaks> & { notes: string[] } {
  const t = text.toLowerCase();
  const decorations = new Set<Decoration>();
  const notes: string[] = [];
  let density: DesignTweaks["density"] | undefined;
  let accentOverride: string | null = null;
  let themeHint: string | null = null;

  const has = (...words: string[]) => words.some((w) => t.includes(w));

  if (has("לב", "אהבה")) { decorations.add("hearts"); notes.push("הוספתי לבבות"); }
  if (has("כוכב", "נצנצ", "זוהר")) { decorations.add("stars"); notes.push("הוספתי כוכבים"); }
  if (has("פרח", "פריחה", "ורדים", "לבנדר")) { decorations.add("flowers"); notes.push("הוספתי פרחים"); }
  if (has("נבט", "צמיחה", "עלים", "עציץ", "טבע")) { decorations.add("sprouts"); notes.push("הוספתי נבטי צמיחה"); }
  if (has("פרפר")) { decorations.add("butterflies"); notes.push("הוספתי פרפרים"); }
  if (has("קשת")) { decorations.add("rainbow"); notes.push("הוספתי קשת"); }

  if (has("מינימל", "נקי", "פשוט", "עדין")) { density = "minimal"; notes.push("עיצוב מינימלי ונקי"); }
  if (has("עשיר", "מלא", "חגיגי", "מפואר")) { density = "rich"; notes.push("עיצוב עשיר וחגיגי"); }

  if (has("ורוד")) { accentOverride = "#E8909F"; notes.push("הדגשות בוורוד"); }
  else if (has("סגול", "לילך", "לבנדר")) { accentOverride = "#A98BC4"; notes.push("הדגשות בסגול־לילך"); }
  else if (has("תכלת", "כחול")) { accentOverride = "#7FA8C9"; notes.push("הדגשות בתכלת"); }
  else if (has("זהב", "מוזהב")) { accentOverride = "#C9A227"; notes.push("הדגשות בזהב"); }
  else if (has("ירוק")) { accentOverride = "#8FA98A"; notes.push("הדגשות בירוק"); }
  else if (has("בורדו", "יין")) { accentOverride = "#7A3B4A"; notes.push("הדגשות בבורדו"); }

  if (has("כהה", "לילה", "ירוק כהה", "אמרלד")) { themeHint = "emerald"; notes.push("עברתי לערכה הכהה־חגיגית"); }
  else if (has("פנקס", "אקוורל", "מחברת", "פסטל")) { themeHint = "notebook"; notes.push("עברתי לערכת הפנקס"); }
  else if (has("קלאסי", "שמנת", "מרווה")) { themeHint = "classic"; notes.push("עברתי לערכה הקלאסית"); }

  return { decorations, density, accentOverride, themeHint, notes };
}
