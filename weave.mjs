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

  const { name, items, goldenWord, personalSentence, intention, anchorWord } = payload || {};
  if (!name || !Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: "bad-payload" }), { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  const blessingsList = items
    .map((it) => `- האות ${it.letter}, מילת הערך "${it.word}": ${it.text}`)
    .join("\n");

  const prompt = `את/ה כותב/ת מקצועי/ת של איחולים לשנה החדשה בעברית — ברמה של משוררי ברכות. המשתתף/ת סיים/ה זה עתה מסע אישי קצר: בחר/ה כוונה לשנה, בחר/ה מילת כוח לכל אות בשמו/ה, וסימנ/ה את המילה הנחוצה לו/ה ביותר. זו גולת הכותרת של המסע: איחול אחד עמוק שגורם למשתתף/ת להרגיש שעבר/ה תהליך אמיתי ומקבל/ת פידבק אישי ומשמעותי.

שם המשתתף/ת: ${name}
מילות הערך שנבחרו (לפי אותיות השם): ${items.map((it) => `"${it.word}"`).join(", ")}
רוח הברכות שמאחורי המילים (להשראה בלבד, לא לציטוט):
${blessingsList}
${intention ? `הכוונה שבחר/ה לפתיחת השנה: "${intention}" — שהאיחול ידבר ברוחה.` : ""}
${goldenWord ? `מילת הזהב — המילה הנחוצה לו/ה ביותר דווקא עכשיו: "${goldenWord}". בנה/י סביבה את שיא האיחול.` : ""}
${anchorWord ? `המילה שבחר/ה כעוגן לרגעים מאתגרים: "${anchorWord}" — שזור/י רמז עדין לכך שהיא תלווה אותו/ה גם ברגעים הפחות פשוטים.` : ""}
${personalSentence ? `משפט אישי שכתב/ה: "${personalSentence}" — שלב/י את רוחו (לא ציטוט מילולי).` : ""}

חוקים מחייבים:
1. אורך: 40–60 מילים, שלוש עד חמש שורות קצרות. עמוק — אך עדיין גלויה, לא מכתב.
2. כל מילות הערך חייבות להופיע במפורש, כלשונן, בתוך האיחול — ארוגות באופן טבעי, לא כרשימה.
3. האיחול צריך לשקף מסע: פתיחה שרואה את הבחירות, אמצע שמחבר ביניהן לתמונה אחת, ושיא סביב מילת הזהב.
4. אל תמציא/י ערכים או איחולים שאינם נובעים מהמילים שסופקו.
5. פנה/י ישירות בגוף שני או בניסוח עוקף מגדר. אל תפתח/י ב"לְ${name}" — השם כבר מופיע על הגלויה.
6. סגנון: חם, מדויק, מחזק ומלא מסרים חיוביים. שהמשתתף/ת ירגישו שמישהו באמת ראה את הבחירות שלהם. בלי קלישאות ריקות ובלי חנופה.
7. ללא אימוג'ים, ללא כותרות. החזר/י את טקסט האיחול בלבד.`;

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
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
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
