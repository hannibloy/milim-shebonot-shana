// אריגת האיחול: קודם ניסיון AI (פונקציית השרת), ואם לא זמין — תבנית מקומית.
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
  intention: string | null; // משפט הכוונה שנבחר בפתיחה
  anchorWord: string | null; // המילה שנבחרה ב"רגע של אמת"
}

export interface WeaveResult {
  text: string;
  source: "ai" | "template";
}

export function templateWeave({ items, goldenWord, anchorWord }: WeavePayload): string {
  const words = items.map((i) => i.word);
  const wordsLine =
    words.length > 1
      ? words.slice(0, -1).join(", ") + " ו" + words[words.length - 1]
      : words[0] || "";

  const lines = [
    `שתהיה לך שנה מלאה ב${wordsLine} —`,
    goldenWord
      ? `שנה שבה ${goldenWord} הולכת איתך לכל מקום ומאירה את הדרך,`
      : "שנה שבה המילים הטובות הולכות איתך לכל מקום,",
    anchorWord && anchorWord !== goldenWord
      ? `וברגעים המאתגרים — ${anchorWord} תזכיר לך כמה כוח יש בך.`
      : "והלב יודע: המילים שבחרנו בוראות את המציאות שלנו.",
  ];

  return lines.join("\n");
}

export async function weaveLetter(payload: WeavePayload): Promise<WeaveResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch("/api/weave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as { text?: string };
      if (data.text && data.text.trim().length > 20) {
        return { text: data.text.trim(), source: "ai" };
      }
    }
  } catch {
    /* רשת הביטחון נכנסת */
  }
  return { text: templateWeave(payload), source: "template" };
}
