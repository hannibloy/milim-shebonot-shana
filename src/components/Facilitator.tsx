import { useMemo, useState } from "react";

interface Props {
  onBack: () => void;
}

// מחולל קישור אישי — כל מנחה מפנה ללוח פאדלט משלו
function WallLinkBuilder() {
  const [wall, setWall] = useState("");
  const [team, setTeam] = useState("");
  const [personal, setPersonal] = useState("");
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    const w = wall.trim();
    if (!w) return "";
    try {
      const u = new URL(w);
      if (u.protocol !== "https:") return "";
    } catch {
      return "";
    }
    const base = `${window.location.origin}${window.location.pathname}`;
    const p = new URLSearchParams();
    p.set("wall", w);
    if (team.trim()) p.set("team", team.trim());
    if (personal.trim()) p.set("personal", personal.trim());
    return `${base}?${p.toString()}`;
  }, [wall, team, personal]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* אפשר גם לסמן ולהעתיק ידנית */
    }
  }

  return (
    <div className="wall-builder">
      <h3 className="fac-h">🔗 קישור אישי עם הלוח שלכם</h3>
      <p className="fac-p">
        הפעילות יכולה לעבוד עם <b>לוח פאדלט משלכם</b> — כך שהברכות של הקבוצה שלכם יעלו לקיר
        שלכם, ולא לקיר של מנחה אחרת. פתחו לוח פאדלט חינמי (padlet.com), העתיקו את הקישור שלו
        לכאן — וקבלו קישור מוכן לשליחה למשתתפים:
      </p>
      <label className="field-label">קישור לוח הפאדלט שלכם (חובה):</label>
      <input
        className="name-field"
        dir="ltr"
        value={wall}
        onChange={(e) => setWall(e.target.value)}
        placeholder="https://padlet.com/..."
      />
      <label className="field-label">קישור Breakout למדור "הברכות לצוות" (לא חובה):</label>
      <input className="name-field" dir="ltr" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="https://padlet.com/..." />
      <label className="field-label">קישור Breakout למדור "הגלויות שלנו" (לא חובה):</label>
      <input className="name-field" dir="ltr" value={personal} onChange={(e) => setPersonal(e.target.value)} placeholder="https://padlet.com/..." />
      {link && (
        <div className="wall-link-result">
          <p className="fac-p"><b>הקישור האישי שלכם — שלחו אותו למשתתפים:</b></p>
          <textarea className="wall-link-box" dir="ltr" readOnly value={link} rows={3} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="btn btn-gold" onClick={copy}>
            {copied ? "✓ הועתק!" : "📋 העתקת הקישור"}
          </button>
        </div>
      )}
      <p className="fac-p small-note">
        💡 טיפ: בלוח שלכם הגדירו Share ← Visitors — <b>Writer</b>, כדי שמשתתפים יוכלו לפרסם
        בלי חשבון. אם תוסיפו גם קישורי Breakout — כל כפתור באפליקציה יוביל ישירות למדור הנכון.
      </p>
    </div>
  );
}

export function Facilitator({ onBack }: Props) {
  return (
    <div className="facilitator card" dir="rtl">
      <h1 className="step-title">🗂️ למנחה — "מילים שבוראות שנה"</h1>
      <p className="step-sub">
        מדריך הפעלה לסדנת פתיחת שנה לצוותי חינוך · 30–45 דקות · מתאים גם לקבוצות גדולות
      </p>

      <h3 className="fac-h">רציונל בקצרה</h3>
      <p className="fac-p">
        הפעילות מזמינה כל משתתף/ת לעצור, לבחור מילות כוח מתוך אותיות השם הפרטי, ולהפוך אותן
        לאיחול אישי אחד שלם. המילים הן כלי ההתבוננות — התוצר הוא איגרת אישית. לצידה נוצרת
        ברכה קצרה לצוות, שעולה לקיר המשותף ובונה את התמונה הקבוצתית.
      </p>

      <h3 className="fac-h">מהלך מוצע (40 דק')</h3>
      <table className="fac-table">
        <tbody>
          <tr>
            <td>5 דק'</td>
            <td><b>פתיחה במליאה</b> — "למילים שאנחנו אומרים לעצמנו יש כוח לעצב את השנה. היום כל אחד ואחת יכתבו לעצמם איגרת לשנה החדשה." שולחים את הקישור לקבוצה.</td>
          </tr>
          <tr>
            <td>15 דק'</td>
            <td><b>עבודה אישית שקטה</b> — כל משתתף/ת עובר/ת את המסע בטלפון. מוזיקה שקטה ברקע מומלצת. עברו בין המשתתפים, עודדו את מי שמתלבט/ת: "אין בחירה לא נכונה".</td>
          </tr>
          <tr>
            <td>8 דק'</td>
            <td><b>שיתוף בזוגות</b> — "בחרו מילה אחת / משפט אחד מהאיגרת שלכם וספרו לבן/בת הזוג למה דווקא היא." חשיפה נמוכה, חיבור גבוה.</td>
          </tr>
          <tr>
            <td>7 דק'</td>
            <td><b>הקיר המשותף</b> — המשתתפים מעלים את גלוית הצוות (ומי שרוצה — גם את האישית) לקיר. מקרינים את הקיר ומקריאים כמה ברכות בקול.</td>
          </tr>
          <tr>
            <td>5 דק'</td>
            <td><b>סגירה</b> — סבב מילה אחת: "המילה שאני לוקח/ת מהיום". איחול מסכם שלכם לצוות.</td>
          </tr>
        </tbody>
      </table>

      <h3 className="fac-h">הכנות מראש</h3>
      <ul className="fac-list">
        <li>ודאו שבלוח הפאדלט קיימים שני מדורים: <b>"הגלויות שלנו"</b> ו<b>"הברכות לצוות"</b>, ושבהגדרות הלוח מבקרים רשאים לפרסם (Visitors — Writer).</li>
        <li><b>קישור נפרד לכל מדור:</b> בפאדלט פתחו Share ← <b>Breakout links</b> — תקבלו קישור ייעודי לכל מדור, שמציג למשתתף רק אותו. העתיקו את שני הקישורים והדביקו אותם בקובץ App.tsx במשתנים המסומנים בראש הקובץ.</li>
        <li>בדקו את המסע בעצמכם מקצה לקצה ביום שלפני — כולל הורדת גלויה והעלאה לקיר.</li>
        <li>הכינו מקרן/מסך להצגת הקיר המשותף בסיום.</li>
        <li>ודאו חיבור אינטרנט סביר בחדר; המסע עובד גם ברשת סלולרית.</li>
      </ul>

      <WallLinkBuilder />

      <h3 className="fac-h">רגישויות שכדאי להכיר</h3>
      <ul className="fac-list">
        <li><b>שלב ההעמקה ("רגע של אמת")</b> נוגע באתגר אישי צפוי. הוא בחירי, והמשפט שנכתב בו פרטי כברירת מחדל. אל תבקשו לשתף אותו במליאה.</li>
        <li>משתתפים ששמם קצר (2–3 אותיות) מסיימים מהר — הזמינו אותם להוסיף ברכה בכתיבה חופשית או להעמיק.</li>
        <li>בקבוצות שאינן מכירות היטב — שיתוף בזוגות עדיף על מליאה.</li>
        <li>איגרת אישית שנשארת פרטית היא הצלחה מלאה של הפעילות, לא כישלון שיתוף.</li>
      </ul>

      <h3 className="fac-h">שקיפות טכנולוגית</h3>
      <p className="fac-p">
        ברכת הגלויה נארגת בעזרת בינה מלאכותית מתוך המילים שהמשתתף/ת בחר/ה בלבד — היא אינה
        ממציאה תוכן. לצורך האריגה, השם והמילים שנבחרו נשלחים לשירות העיבוד. שום מידע אינו
        נשמר באתר עצמו. אם השירות אינו זמין, נוצרת ברכה מנוסחת מקומית — ללא הפרעה למשתתפים.
      </p>

      <details className="theory-box">
        <summary>🎓 הבסיס התיאורטי של הפעילות — למה זה עובד</summary>
        <div className="theory-inner">
          <p className="fac-p">
            הפעילות נראית קלילה ומהנה — אך כל תחנה בה נשענת על עקרון מבוסס-מחקר מעולמות
            הפסיכולוגיה החיובית, הטיפול הקוגניטיבי-התנהגותי (CBT) וחקר החוסן:
          </p>
          <ul className="fac-list">
            <li>
              <b>זיהוי חוזקות (פסיכולוגיה חיובית):</b> בחירת מילות הכוח מאותיות השם היא תרגיל
              זיהוי חוזקות אישיות. מחקרי מודל ה-VIA מצאו שזיהוי והמשגת חוזקות מעלים רווחה
              נפשית ותחושת מסוגלות — עוד לפני כל שינוי התנהגותי.
              <br /><span className="fac-source">מקור: Peterson, C. &amp; Seligman, M. E. P. (2004). <i>Character Strengths and Virtues: A Handbook and Classification</i>. Oxford University Press / APA.</span>
            </li>
            <li>
              <b>שפה בוראת מציאות (הבניה קוגניטיבית — CBT):</b> עקרון היסוד של הטיפול
              הקוגניטיבי-התנהגותי: האופן שבו אנו מנסחים את המציאות מעצב את הרגש וההתנהגות.
              ניסוח ברכה חיובית בגוף ראשון הוא תרגול של שיח עצמי מיטיב — החלפת "מבקר פנימי"
              ב"מלווה פנימי".
              <br /><span className="fac-source">מקורות: Beck, A. T. (1976). <i>Cognitive Therapy and the Emotional Disorders</i>. International Universities Press; Ellis, A. (1962). <i>Reason and Emotion in Psychotherapy</i>. Lyle Stuart.</span>
            </li>
            <li>
              <b>שיקוף ערוצי החוסן (גשר מאח"ד / BASIC Ph):</b> כל ברכה במאגר ממופה לערוץ חוסן
              (אמונה, רגש, חברה, דמיון, קוגניציה, עשייה). השיקוף בסוף המסע מראה למשתתף על אילו
              ערוצים הוא נשען באופן טבעי — מודעות שהיא צעד ראשון להרחבת הרפרטואר.
              <br /><span className="fac-source">מקור: Lahad, M., Shacham, M. &amp; Ayalon, O. (2013). <i>The "BASIC Ph" Model of Coping and Resiliency</i>. Jessica Kingsley Publishers; פותח במרכז משאבים, מכללת תל-חי.</span>
            </li>
            <li>
              <b>שייכות וביטחון פסיכולוגי:</b> ברכת הצוות והקיר המשותף ממירים את החוויה האישית
              לרגע קבוצתי של הכרה הדדית — הרכיב ה"שייכותי" שמנבא רווחה ותפקוד צוותי לאורך זמן.
              <br /><span className="fac-source">מקורות: Seligman, M. E. P. (2011). <i>Flourish</i> (מודל PERMA). Free Press; Edmondson, A. (1999). Psychological Safety and Learning Behavior in Work Teams. <i>Administrative Science Quarterly</i>, 44(2), 350–383.</span>
            </li>
          </ul>
          <p className="fac-p">
            <b>בקצרה לכם המנחים:</b> 30 דקות שמייצרות לכל איש צוות מפת חוזקות אישית, כלי התמודדות
            מנוסח מראש לרגעי עומס, ותוצר קבוצתי של לכידות — בעטיפה חווייתית שלא מרגישה "עוד הרצאה".
          </p>
        </div>
      </details>

      <details className="theory-box">
        <summary>🕯️ אור מן המקורות — ההשראה היהודית-חסידית שמאחורי המסע</summary>
        <div className="theory-inner">
          <ul className="fac-list">
            <li>
              <b>מילים בוראות מציאות:</b> "בעשרה מאמרות נברא העולם" (אבות ה, א) — העולם נברא
              בדיבור, ובחסידות (תניא, שער היחוד והאמונה) האותיות מהוות ומחיות את הבריאה בכל רגע
              ממש. וכדברי שלמה המלך: "מוות וחיים ביד הלשון" (משלי יח, כא). הבחירה במילים היא
              לעולם בחירה במציאות.
            </li>
            <li>
              <b>אותיות השם:</b> על פי תורת החסידות, שמו של אדם איננו מקרה — הוא צינור חיותו
              וניצוץ ממהות נשמתו, וההורים זוכים להארה מיוחדת בשעת קריאת השם. לבנות ברכה מתוך
              אותיות השם הפרטי פירושו לשאוב את הכוחות מהמקום הכי עצמי שיש.
            </li>
            <li>
              <b>"רגע של אמת":</b> "טראכט גוט — וועט זיין גוט" (חשוב טוב, יהיה טוב — אמרת
              הצמח-צדק): המחשבה הטובה איננה רק תיאור, היא כלי הפועל במציאות. ורבי נחמן מוסיף:
              "אין שום ייאוש בעולם כלל" — הכנת מילה מלווה לרגע קשה היא בדיוק הצידה הזו לדרך.
            </li>
            <li>
              <b>כתיבה וחתימה:</b> בראש השנה אנו מבקשים "כתבנו בספר החיים" — והפעילות הופכת את
              המשתתף משואל לשותף: אדם כותב וחותם בעצמו על השנה שהוא מבקש לברוא, ברוח "צדיקים —
              מלאכתם נעשית על ידי עצמם".
            </li>
            <li>
              <b>ברכת הצוות והקיר המשותף:</b> "כל ישראל ערבים זה בזה" (סנהדרין כז), ו"ואהבת
              לרעך כמוך — זה כלל גדול בתורה" (רבי עקיבא). וסגולה ידועה: המברך את חברו — מתברך
              בעצמו תחילה. הקיר המשותף הוא מעגל ברכות שמזין את כולו.
            </li>
          </ul>
        </div>
      </details>

      <div className="actions-row no-print">
        <button className="btn btn-gold" onClick={() => window.print()}>🖨️ הדפסת המדריך</button>
        <button className="btn btn-primary" onClick={onBack}>⬅ חזרה לפעילות</button>
      </div>
    </div>
  );
}
