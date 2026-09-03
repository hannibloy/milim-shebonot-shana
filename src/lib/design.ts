// מנוע העיצוב: מבקש מג'ימיני (מודל התמונות) רקע אמנותי ייחודי לגלויה.
// אם השירות לא זמין — מחזיר null והגלויה נופלת ברכות לעיצוב המקומי נגזר-השם.

export interface DesignPayload {
  themeId: string;
  decorations: string[];
  density: "minimal" | "normal" | "rich";
  freeText: string;
  stampId: string;
}

export async function designBackground(payload: DesignPayload): Promise<string | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25000);
    const res = await fetch("/api/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; image?: string };
    if (data.ok && data.image && data.image.startsWith("data:image")) return data.image;
    return null;
  } catch {
    return null;
  }
}
