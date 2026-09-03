// סט הבולים לבחירה — איורים מקוריים בסגנון חימר רך
export interface Stamp { id: string; img: string; label: string }
export const STAMPS: Stamp[] = [
  { id: "star", img: "/stamps/star.jpg", label: "כוכב" },
  { id: "sprout", img: "/stamps/sprout.jpg", label: "נבט" },
  { id: "heart", img: "/stamps/heart.jpg", label: "לב" },
  { id: "dove", img: "/stamps/dove.jpg", label: "יונה" },
  { id: "rainbow", img: "/stamps/rainbow.jpg", label: "קשת" },
  { id: "honey", img: "/stamps/honey.jpg", label: "דבש" },
];
