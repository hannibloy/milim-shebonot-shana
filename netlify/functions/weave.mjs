// פונקציית שרת: אורגת את הברכות שנבחרו למכתב אישי זורם באמצעות Gemini.
// המפתח נשמר במשתנה סביבה GEMINI_API_KEY בהגדרות נטליפיי — לעולם לא בקוד.

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "no-key" }), { status: 503 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad-json" }), { status: 400 });
  }

  const { name, items, goldenWord, personalSentence } = payload || {};
  if (!name || !Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: "bad-payload" }), { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  const blessingsList = items
    .map((it) => `- האות ${it.letter}, מילת הערך "${it.word}": ${it.text}`)
    .join("\n");

  const prompt = `אתה כותב מכתבי ברכה אישיים לשנה החדשה בעברית.
ארוג את הברכות הבאות למכתב אחד זורם, חם וכן, בגוף ראשון.

השם: ${name}
הברכות שנבחרו (כל אחת שייכת לאות משמו/ה):
${blessingsList}
${goldenWord ? `המילה החשובה ביותר עבורו/ה היום: "${goldenWord}" — תן לה נוכחות מיוחדת במכתב.` : ""}
${personalSentence ? `משפט אישי שכתב/ה ושחשוב לשלב ברוח המכתב: "${personalSentence}"` : ""}

חוקים מחייבים:
1. אל תמציא תוכן, ערכים או איחולים חדשים — ארוג אך ורק את הרעיונות מהברכות שסופקו.
2. אורך: 90–140 מילים.
3. פתח בשורה "לְ${name},"
4. כתוב בלשון ניטרלית מגדרית (למשל "אני מאחל/ת", "בוחר/ת") או נסח באופן שעוקף מגדר.
5. סיים במשפט תקווה קצר אחד הצופה אל השנה החדשה.
6. ללא אימוג'ים, ללא כותרות, ללא רשימות — פסקאות זורמות בלבד.
7. החזר את טקסט המכתב בלבד, ללא הקדמות והסברים.`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "upstream", status: res.status }), { status: 502 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!text) {
      return new Response(JSON.stringify({ error: "empty" }), { status: 502 });
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "failed" }), { status: 502 });
  }
};

export const config = { path: "/api/weave" };
