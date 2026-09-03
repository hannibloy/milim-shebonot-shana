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

  const prompt = `אתה כותב ברכות קצרות ופיוטיות לשנה החדשה בעברית, בסגנון גלוית ברכה.
כתוב ברכה אישית אחת קצרה עבור ${name}, שאורגת בתוכה את מילות הערך שבחר/ה מתוך אותיות שמו/ה.

מילות הערך שנבחרו: ${items.map((it) => `"${it.word}"`).join(", ")}
רוח הברכות שמאחורי המילים (להשראה בלבד, לא לציטוט):
${blessingsList}
${goldenWord ? `המילה החשובה ביותר עבורו/ה היום: "${goldenWord}" — תן לה את מקום הכבוד בברכה.` : ""}
${personalSentence ? `משפט אישי שכתב/ה, לשילוב ברוח הברכה: "${personalSentence}"` : ""}

חוקים מחייבים:
1. אורך: 20–40 מילים בלבד. שתיים עד ארבע שורות קצרות. זו גלויה, לא מכתב.
2. כל מילות הערך חייבות להופיע במפורש, כלשונן, בתוך הברכה.
3. אל תמציא ערכים או איחולים שאינם נובעים מהמילים שסופקו.
4. פנה ישירות בגוף שני ("שתהיה לך", "שתדע/י") או נסח באופן שעוקף מגדר. אל תפתח ב"לְ${name}" — השם כבר מופיע על הגלויה.
5. סגנון: חם, פיוטי, ראוי להיתלות על המקרר. בלי קלישאות ריקות.
6. ללא אימוג'ים, ללא כותרות. החזר את טקסט הברכה בלבד.`;

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
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
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
