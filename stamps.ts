// סט הבולים לבחירה — כל גלויה צריכה בול
export interface Stamp { id: string; emoji: string; label: string }
export const STAMPS: Stamp[] = [
  { id: "star", emoji: "⭐", label: "כוכב" },
  { id: "sprout", emoji: "🌱", label: "נבט" },
  { id: "heart", emoji: "💗", label: "לב" },
  { id: "dove", emoji: "🕊️", label: "יונה" },
  { id: "rainbow", emoji: "🌈", label: "קשת" },
  { id: "honey", emoji: "🍯", label: "דבש" },
];
