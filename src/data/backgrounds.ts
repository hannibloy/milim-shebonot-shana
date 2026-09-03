// גלריית רקעי הגלויה — אמנות מקורית של חני, מובנית וללא עלות.
// לכל רקע מוצמדת ערכת צבעי הטקסט המתאימה לו (טוקן עיצובי אחיד).

export interface CardBackground {
  id: string;
  label: string;
  img: string;
  themeId: "notebook" | "emerald" | "classic";
}

export const BACKGROUNDS: CardBackground[] = [
  { id: "honey", label: "דבש ודבורים", img: "/backgrounds/honey.jpg", themeId: "classic" },
  { id: "pomegranate", label: "רימונים", img: "/backgrounds/pomegranate.jpg", themeId: "classic" },
  { id: "sprouts", label: "צמיחה", img: "/backgrounds/sprouts.jpg", themeId: "classic" },
  { id: "butterflies", label: "פרפרים ופריחה", img: "/backgrounds/butterflies.jpg", themeId: "notebook" },
  { id: "pastel", label: "פנקס פסטלי", img: "/backgrounds/pastel.jpg", themeId: "notebook" },
  { id: "stars", label: "כוכבים וחלומות", img: "/backgrounds/stars.jpg", themeId: "notebook" },
  { id: "rainbow", label: "קשת ועננים", img: "/backgrounds/rainbow.jpg", themeId: "classic" },
  { id: "emerald", label: "אמרלד וזהב", img: "/backgrounds/emerald.jpg", themeId: "emerald" },
  { id: "clouds", label: "קשת בעננים", img: "/backgrounds/clouds.jpg", themeId: "classic" },
  { id: "paperplane", label: "מטוס נייר בשמיים", img: "/backgrounds/paperplane.jpg", themeId: "notebook" },
  { id: "sprouts2", label: "נבטים באור", img: "/backgrounds/sprouts2.jpg", themeId: "classic" },
];
