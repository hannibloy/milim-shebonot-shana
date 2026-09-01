// אריגת המכתב: קודם ניסיון AI (פונקציית השרת), ואם לא זמין — תבנית מקומית.
// המשתתף לעולם לא רואה שגיאה.

export interface WeaveItem {
  letter: string;
  word: string;
  text: string;
}

export interface WeavePayload {
  name: string;
  items: WeaveItem[];
  goldenWord: string | null;
  personalSentence: string | null;
}

export interface WeaveResult {
  text: string;
  source: "ai" | "template";
}

export function templateWeave({ name, items, goldenWord, personalSentence }: WeavePayload): string {
  const words = items.map((i) => i.word);
  const wordsLine =
    words.length > 1
      ? words.slice(0, -1).join(", ") + " ו" + words[words.length - 1]
      : words[0] || "";

  const body = items.map((i) => i.text).join(" ");

  const parts = [
    `לְ${name},`,
    `שנה חדשה נפתחת, ומתוך אותיות השם שלי בחרתי את המילים שילוו אותי בה: ${wordsLine}.`,
    body,
    personalSentence ? `וברגעי האתגר — ${personalSentence}` : "",
    goldenWord
      ? `ומכל המילים, המילה שאני לוקח/ת איתי דווקא היום היא "${goldenWord}".`
      : "",
    "שתהיה זו שנה שבה המילים הטובות שבחרתי הופכות, צעד אחר צעד, למציאות.",
  ];

  return parts.filter(Boolean).join("\n\n");
}

export async function weaveLetter(payload: WeavePayload): Promise<WeaveResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 11000);
    const res = await fetch("/api/weave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as { text?: string };
      if (data.text && data.text.trim().length > 40) {
        return { text: data.text.trim(), source: "ai" };
      }
    }
  } catch {
    /* רשת הביטחון נכנסת */
  }
  return { text: templateWeave(payload), source: "template" };
}
