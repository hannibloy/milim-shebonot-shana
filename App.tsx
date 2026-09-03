import { useEffect, useMemo, useRef, useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { BLESSINGS, CHANNEL_LABELS, splitName, type ResilienceChannel } from "./data/blessings";
import { THEMES, DECORATIONS, parseDesignText, type Decoration } from "./data/themes";
import { INTENTIONS } from "./data/intentions";
import { STAMPS } from "./data/stamps";
import { designFromName } from "./lib/seed";
import { weaveLetter } from "./lib/weave";
import { designBackground } from "./lib/design";
import { BACKGROUNDS } from "./data/backgrounds";
import { PersonalCard } from "./components/PersonalCard";
import { TeamCard } from "./components/TeamCard";
import { Facilitator } from "./components/Facilitator";

const PADLET_URL = "https://padlet.com/bloyarava1/padlet-3pl2lhhpefgs5wd6";
const PADLET_EMBED = "https://padlet.com/embed/3pl2lhhpefgs5wd6";
// 👇 קישורי Breakout למדורים (פאדלט ← Share ← Breakout links). כשתדביקי אותם כאן,
// כל כפתור יוביל ישירות למדור הנכון בלבד. כל עוד הם ריקים — נפתח הלוח המלא.
const PADLET_TEAM_SECTION = ""; // קישור Breakout למדור "הברכות לצוות"
const PADLET_PERSONAL_SECTION = ""; // קישור Breakout למדור "הגלויות שלנו"

// ===== קיר לכל מנחה =====
// מנחים שקיבלו את הפעילות יכולים להפנות ללוח פאדלט משלהם דרך פרמטרים בקישור:
// ?wall=<קישור הלוח> &team=<Breakout לברכות הצוות> &personal=<Breakout לגלויות>
// מחולל קישורים ידידותי נמצא בדף "מדריך למנחה".
function readWallParams() {
  if (typeof window === "undefined") return { wall: "", team: "", personal: "" };
  const p = new URLSearchParams(window.location.search);
  const safe = (v: string | null) => {
    if (!v) return "";
    try {
      const u = new URL(v);
      return u.protocol === "https:" ? u.toString() : "";
    } catch {
      return "";
    }
  };
  return { wall: safe(p.get("wall")), team: safe(p.get("team")), personal: safe(p.get("personal")) };
}
const WALL = readWallParams();

// גזירת קישור embed מקישור פאדלט רגיל (המזהה הוא הרכיב האחרון בכתובת)
function padletEmbedFrom(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("padlet.com")) return null;
    const lastSeg = u.pathname.split("/").filter(Boolean).pop() ?? "";
    const id = lastSeg.split("-").pop() ?? "";
    if (id.length >= 8) return `https://padlet.com/embed/${id}`;
  } catch {
    /* לא פאדלט — פשוט לא נציג iframe */
  }
  return null;
}

const TEAM_WALL_URL = WALL.team || WALL.wall || PADLET_TEAM_SECTION || PADLET_URL;
const PERSONAL_WALL_URL = WALL.personal || WALL.wall || PADLET_PERSONAL_SECTION || PADLET_URL;
const ACTIVE_WALL_URL = WALL.wall || PADLET_URL;
const ACTIVE_EMBED = WALL.wall ? padletEmbedFrom(WALL.wall) : PADLET_EMBED;

type Choice =
  | { mode: "option"; index: 0 | 1 }
  | { mode: "custom"; word: string; text: string };

// המסע: פתיחה ← המילים שלי ← עיצוב ← הגלויה שלי ← ברכה לצוות
const STEPS = ["פתיחה", "המילים שלי", "עיצוב", "הגלויה שלי", "לצוות שלנו"] as const;

const IS_MOBILE_SHARE =
  typeof navigator !== "undefined" &&
  "share" in navigator &&
  /Android|iPhone|iPad/i.test(navigator.userAgent);

export default function App() {
  const [guide, setGuide] = useState(() => window.location.hash === "#guide");
  useEffect(() => {
    const onHash = () => setGuide(window.location.hash === "#guide");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMaxStep((m) => Math.max(m, step));
  }, [step]);

  // תחנה 1: כוונה + שם
  const [intention, setIntention] = useState<string | null>(null);
  const [name, setName] = useState("");

  // תחנה 2: המילים
  const [choices, setChoices] = useState<Record<number, Choice>>({});
  const [openCustom, setOpenCustom] = useState<Record<number, boolean>>({});
  const [deepenOpen, setDeepenOpen] = useState(false);
  const [deepenWord, setDeepenWord] = useState<string | null>(null);
  const [deepenText, setDeepenText] = useState("");

  // תחנה 3: עיצוב
  const [goldenWord, setGoldenWord] = useState<string | null>(null);
  const [themeId, setThemeId] = useState("notebook");
  const [decorations, setDecorations] = useState<Set<Decoration>>(new Set(["hearts", "stars"]));
  const [density, setDensity] = useState<"minimal" | "normal" | "rich">("normal");
  const [designText, setDesignText] = useState("");
  const [designNotes, setDesignNotes] = useState<string[]>([]);
  const [signature, setSignature] = useState("");
  const [showSentenceOnCard, setShowSentenceOnCard] = useState(false);

  // תחנה 4: הגלויה
  const [weaving, setWeaving] = useState(false);
  const [blessing, setBlessing] = useState<string>("");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgChoice, setBgChoice] = useState<string>("honey");

  // תחנה 5: הצוות
  const [teamWish, setTeamWish] = useState("");
  const [stampId, setStampId] = useState("star");
  const [showNameOnTeam, setShowNameOnTeam] = useState(true);
  const [teamReady, setTeamReady] = useState(false);

  const [busy, setBusy] = useState(false);

  const personalRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const letters = useMemo(() => splitName(name), [name]);
  const seeded = useMemo(() => designFromName(name), [name]);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const allChosen =
    letters.length > 0 &&
    letters.every((_, i) => {
      const c = choices[i];
      if (!c) return false;
      if (c.mode === "custom") return c.word.trim() !== "";
      return true;
    });

  const chosenCount = letters.filter((_, i) => {
    const c = choices[i];
    return c && (c.mode !== "custom" || c.word.trim() !== "");
  }).length;

  const resolved = useMemo(
    () =>
      letters.map((letter, i) => {
        const entry = BLESSINGS[letter];
        const c = choices[i];
        if (c?.mode === "custom") {
          return {
            letter,
            icon: entry.icon,
            word: c.word.trim(),
            text: c.text.trim() || c.word.trim(),
            channel: null as ResilienceChannel | null,
          };
        }
        const opt = entry.options[c?.mode === "option" ? c.index : 0];
        return { letter, icon: entry.icon, word: opt.word, text: opt.text, channel: opt.channel as ResilienceChannel | null };
      }),
    [letters, choices]
  );

  const words = resolved.map((r) => r.word);

  // "הידעת?" — שיקוף ערוצי החוסן (BASIC Ph, מולי להד).
  // מוצג במסגרת מעוצבת מחוץ לגלויה, לאחר סיום כתיבתה. תמיד חיובי ומחזק.
  const CHANNEL_PRAISE: Record<ResilienceChannel, string> = {
    belief: "אנשים שנשענים על ערוץ זה שואבים כוח מערכים, מאמונה וממשמעות — עוגן יציב גם בימים סוערים.",
    affect: "הלב הפתוח שלך הוא משאב: היכולת להרגיש, להתחבר ולתת מקום לרגש היא כוח של ממש.",
    social: "הכוח שלך צומח מתוך קשרים — נתינה, שייכות וחברות. סביבך נבנית רשת שמחזיקה אותך ואת האחרים.",
    imagination: "דמיון ויצירתיות פותחים לך דלתות במקומות שאחרים רואים בהם קיר — זו מתנה נדירה.",
    cognition: "חשיבה בהירה, סקרנות ותבונה מלוות את הבחירות שלך — כוח שקט שמאיר את הדרך.",
    physiology: "עשייה, התמדה וכוח פנימי — את/ה מסוג האנשים שהופכים כוונה למציאות.",
  };
  const reflection = useMemo(() => {
    const counts = new Map<ResilienceChannel, number>();
    for (const r of resolved) if (r.channel) counts.set(r.channel, (counts.get(r.channel) ?? 0) + 1);
    const customCount = resolved.filter((r) => !r.channel).length;
    if (counts.size === 0)
      return {
        channels: [] as string[],
        text: "כל המילים בגלויה שלך הן מילים שכתבת בעצמך — וזה כוח בפני עצמו: קול אישי, מקורי ואמיץ. בחירה במילים משלך מעידה על חיבור עמוק לעולם הפנימי שלך.",
      };
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 2);
    const channels = top.map(([ch]) => CHANNEL_LABELS[ch]);
    const praise = top.map(([ch]) => CHANNEL_PRAISE[ch]).join(" ");
    const extra =
      customCount > 0
        ? " ולצד אלה, הוספת גם מילים משלך — סימן לקול אישי וייחודי."
        : sorted.length > 2
        ? " ובעצם, המילים שלך נוגעות במגוון רחב של ערוצים — עושר פנימי אמיתי."
        : "";
    return { channels, text: praise + extra };
  }, [resolved]);

  async function startWeaving() {
    setStep(3);
    setWeaving(true);
    // אריגת הברכה ועיצוב הרקע ב-AI — במקביל, כל אחד עם רשת ביטחון משלו
    const [letterResult, bg] = await Promise.all([
      weaveLetter({
        name,
        items: resolved.map((r) => ({ letter: r.letter, word: r.word, text: r.text })),
        goldenWord,
        personalSentence: showSentenceOnCard && deepenText.trim() ? deepenText.trim() : null,
        intention,
        anchorWord: deepenWord,
      }),
      bgChoice === "ai"
        ? designBackground({
            themeId,
            decorations: [...decorations],
            density,
            freeText: designText.trim(),
            stampId,
          })
        : Promise.resolve(BACKGROUNDS.find((b) => b.id === bgChoice)?.img ?? null),
    ]);
    setBlessing(letterResult.text);
    setBgImage(bg);
    setWeaving(false);
  }

  async function downloadCard(which: "personal" | "team") {
    const ref = which === "personal" ? personalRef : teamRef;
    if (!ref.current) return;
    setBusy(true);
    try {
      await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = which === "personal" ? `שנה-טובה-${name}.png` : `ברכה-לצוות-${name}.png`;
      a.click();
    } catch {
      alert("משהו השתבש בהורדה — נסו שוב.");
    } finally {
      setBusy(false);
    }
  }

  async function shareCard(which: "personal" | "team") {
    const ref = which === "personal" ? personalRef : teamRef;
    if (!ref.current) return;
    setBusy(true);
    try {
      await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
      const blob = await toBlob(ref.current, { pixelRatio: 2, cacheBust: true });
      if (blob) {
        const file = new File([blob], which === "personal" ? `שנה-טובה-${name}.png` : `ברכה-לצוות.png`, {
          type: "image/png",
        });
        const nav = navigator as Navigator & {
          canShare?: (d: { files: File[] }) => boolean;
          share?: (d: { files: File[]; title: string }) => Promise<void>;
        };
        if (nav.canShare?.({ files: [file] })) {
          await nav.share!({ files: [file], title: "מילים שבוראות שנה" });
          setBusy(false);
          return;
        }
      }
      await downloadCard(which);
      window.open(which === "personal" ? PERSONAL_WALL_URL : TEAM_WALL_URL, "_blank");
    } catch {
      /* המשתמש ביטל — לא שגיאה */
    } finally {
      setBusy(false);
    }
  }

  function applyDesignText(text: string) {
    setDesignText(text);
    const parsed = parseDesignText(text);
    if (parsed.decorations && parsed.decorations.size > 0)
      setDecorations((prev) => new Set([...prev, ...parsed.decorations!]));
    if (parsed.density) setDensity(parsed.density);
    if (parsed.themeHint) setThemeId(parsed.themeHint);
    setDesignNotes(parsed.notes);
  }

  function toggleDecoration(id: Decoration) {
    setDecorations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (guide) {
    return (
      <div className="app-shell">
        <Facilitator onBack={() => { window.location.hash = ""; }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="/logo.png" alt="חני בלוי" className="app-logo" />
        <div>
          <a className="guide-btn" href="#guide">🧭 מדריך למנחה — לסדנה קבוצתית</a>
        </div>
      </header>

      <nav className="stepper" aria-label="שלבי המסע">
        {STEPS.map((label, i) => {
          const reachable = i <= maxStep;
          return (
            <span key={label} style={{ display: "contents" }}>
              {i > 0 && <span className="line" />}
              <button
                type="button"
                className={`dot ${i === step ? "active" : ""} ${i < step ? "done" : ""} ${reachable ? "clickable" : ""}`}
                title={reachable ? `מעבר אל: ${label}` : label}
                disabled={!reachable}
                onClick={() => reachable && setStep(i)}
                aria-label={`${label}${reachable ? " — לחיצה תעביר לתחנה זו" : ""}`}
              >
                {i < step ? "✓" : i + 1}
              </button>
            </span>
          );
        })}
      </nav>
      {maxStep > 0 && <p className="stepper-hint">אפשר ללחוץ על העיגולים כדי לחזור אחורה או להתקדם 🧭</p>}

      {/* ===== תחנה 1: פתיחה — כוונה ושם ===== */}
      {step === 0 && (
        <section className="card journey-card">
          <h1 className="hero-title big">מילים שבוראות שנה</h1>
          <p className="hero-tagline">מסע קצר של מילים טובות — מהשם שלך אל השנה החדשה</p>
          <img src="/envelope.jpg" alt="" className="hero-blend" />
          <p className="step-sub">
            רגע לפני שהשנה מתחילה — עצירה קטנה, כולה שלך.
            נבחר יחד מילים טובות מתוך אותיות השם שלך, ונהפוך אותן לאגרת ברכה יפהפייה.
          </p>

          <p className="panel-label center"><span className="apple-honey">🍎🍯</span> עם איזו כוונה שבלב נצא לדרך? בחרו את המשפט שהכי מדבר אליכם:</p>
          <div className="intent-list">
            {INTENTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`intent-chip ${intention === s ? "selected" : ""}`}
                onClick={() => setIntention(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="name" style={{ marginTop: 22 }}>
            ומה השם הפרטי שלך?
          </label>
          <input
            id="name"
            className="name-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: חני"
            autoComplete="given-name"
          />
          {name.trim() !== "" && letters.length === 0 && (
            <p className="step-sub warn">נראה שהשם לא בעברית — נסו לכתוב אותו באותיות עבריות 💛</p>
          )}

          <div className="actions-row">
            <button
              className="btn btn-primary"
              disabled={letters.length === 0 || !intention}
              onClick={() => setStep(1)}
            >
              נכנסים פנימה ⬅
            </button>
            {maxStep > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(1)}>קדימה ⬅</button>
            )}
          </div>
        </section>
      )}

      {/* ===== תחנה 2: המילים שלי ===== */}
      {step === 1 && (
        <section className="card journey-card">
          <img src="/letters.jpg" alt="" className="step-banner" />
          <h2 className="step-title">המילים של {name} 💫</h2>
          <p className="step-sub">
            כל אות בשם שלך פותחת שער למילות כוח. בחרו את זו שמדברת אליכם —
            או כתבו מילה משלכם. <b>{chosenCount}/{letters.length}</b> אותיות נבחרו {chosenCount === letters.length && letters.length > 0 ? "✨" : ""}
          </p>

          {letters.map((letter, i) => {
            const entry = BLESSINGS[letter];
            const c = choices[i];
            const customOpen = openCustom[i] || c?.mode === "custom";
            return (
              <div className="letter-block" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="letter-head">
                  <span className="letter-circle">{letter}</span>
                  <span className="letter-icon">{entry.icon}</span>
                  <span className="letter-hint">איזו מילה תלווה אותך השנה?</span>
                </div>

                <div className="option-grid">
                  {entry.options.map((opt, oi) => {
                    const selected = c?.mode === "option" && c.index === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={`option-card ${selected ? "selected" : ""}`}
                        onClick={() => {
                          setChoices((prev) => ({ ...prev, [i]: { mode: "option", index: oi as 0 | 1 } }));
                          setOpenCustom((prev) => ({ ...prev, [i]: false }));
                        }}
                      >
                        <span className="option-word">{opt.word}</span>
                        <p className="option-text">{opt.text}</p>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="custom-toggle"
                  onClick={() => {
                    setOpenCustom((prev) => ({ ...prev, [i]: !customOpen }));
                    if (!customOpen) setChoices((prev) => ({ ...prev, [i]: { mode: "custom", word: "", text: "" } }));
                  }}
                >
                  ✏️ {customOpen ? "חזרה לאפשרויות המוכנות" : "מעדיפ/ה מילה משלי"}
                </button>

                {customOpen && (
                  <div className="custom-area">
                    <input
                      placeholder={`המילה שלי לאות ${letter} (למשל: ${entry.options[0].word})`}
                      value={c?.mode === "custom" ? c.word : ""}
                      onChange={(e) =>
                        setChoices((prev) => ({
                          ...prev,
                          [i]: {
                            mode: "custom",
                            word: e.target.value,
                            text: prev[i]?.mode === "custom" ? (prev[i] as { text: string }).text : "",
                          },
                        }))
                      }
                    />
                    <textarea
                      rows={2}
                      placeholder="ואם רוצים — משפט קטן שמסביר אותה (לא חובה)"
                      value={c?.mode === "custom" ? c.text : ""}
                      onChange={(e) =>
                        setChoices((prev) => ({
                          ...prev,
                          [i]: {
                            mode: "custom",
                            word: prev[i]?.mode === "custom" ? (prev[i] as { word: string }).word : "",
                            text: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* להעמיק — רגע של אמת (בחירי, פרטי) */}
          {allChosen && (
            <div className="deepen-box">
              {!deepenOpen ? (
                <button type="button" className="custom-toggle big" onClick={() => setDeepenOpen(true)}>
                  ⊕ רוצה להעמיק לרגע? (דקה אחת, רק בשבילך)
                </button>
              ) : (
                <div className="deepen-inner">
                  <p className="deepen-title">🌿 רגע של אמת — פרטי לגמרי</p>
                  <p className="deepen-text">
                    עצמו לרגע את העיניים ודמיינו רגע אחד מאתגר שכנראה יגיע השנה.
                    לא צריך לכתוב אותו — רק לראות אותו. ועכשיו: איזו מהמילים שבחרתם תלווה אתכם ברגע הזה?
                  </p>
                  <div className="deco-row">
                    {words.map((w) => (
                      <button
                        key={w}
                        type="button"
                        className={`deco-chip ${deepenWord === w ? "selected" : ""}`}
                        onClick={() => setDeepenWord(w)}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  {deepenWord && (
                    <div className="custom-area" style={{ marginTop: 10 }}>
                      <textarea
                        rows={2}
                        placeholder={`כשיגיע הרגע הזה, אזכיר לעצמי ש...`}
                        value={deepenText}
                        onChange={(e) => setDeepenText(e.target.value)}
                      />
                      <p className="privacy-note">🔒 המשפט הזה שלך בלבד. בשלב העיצוב תוכלו לבחור אם הוא יופיע על הגלויה.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>⬅ חזרה</button>
            {maxStep > step && (
              <button className="btn btn-ghost" onClick={() => setStep(step + 1)}>קדימה ⬅</button>
            )}
            <button className="btn btn-primary" disabled={!allChosen} onClick={() => setStep(2)}>
              ממשיכים לעיצוב ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 3: עיצוב ===== */}
      {step === 2 && (
        <section className="card journey-card">
          <h2 className="step-title">עכשיו נעצב את הגלויה שלך 🎨</h2>
          <p className="step-sub">היא תיוולד מאותיות השם שלך — ותהיה שונה מכל גלויה אחרת בעולם.</p>

          <p className="panel-label">✨ מכל המילים שבחרת — איזו אחת הכי נחוצה לך דווקא היום?</p>
          <p className="panel-hint">היא תקבל נגיעת זהב על הגלויה.</p>
          <div className="deco-row">
            {words.map((w) => (
              <button
                key={w}
                type="button"
                className={`deco-chip golden-chip ${goldenWord === w ? "selected" : ""}`}
                onClick={() => setGoldenWord(goldenWord === w ? null : w)}
              >
                {goldenWord === w ? "✨ " : ""}{w}
              </button>
            ))}
          </div>

          <p className="panel-label">🖼️ רקע הגלויה — האמנות שתעטוף את המילים שלך</p>
          <div className="bg-gallery">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`bg-chip ${bgChoice === b.id ? "selected" : ""}`}
                onClick={() => { setBgChoice(b.id); setThemeId(b.themeId); }}
                title={b.label}
              >
                <img src={b.img.replace("/backgrounds/", "/backgrounds/thumbs/")} alt={b.label} loading="lazy" />
                <span>{b.label}</span>
              </button>
            ))}
            <button
              type="button"
              className={`bg-chip ai-chip ${bgChoice === "ai" ? "selected" : ""}`}
              onClick={() => setBgChoice("ai")}
              title="רקע ייחודי שנוצר במיוחד בשבילך"
            >
              <div className="ai-thumb">✨</div>
              <span>הפתעה מה-AI</span>
            </button>
          </div>

          <p className="panel-label">🎨 גוון הטקסט</p>
          <div className="theme-row">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-chip ${themeId === t.id ? "selected" : ""}`}
                onClick={() => setThemeId(t.id)}
              >
                <div
                  className="theme-swatch"
                  style={{
                    background: `linear-gradient(90deg, ${t.vars["--card-bg"]} 40%, ${t.vars["--card-title"]} 40% 70%, ${t.vars["--card-gold"]} 70%)`,
                  }}
                />
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-desc">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <p className="panel-label">💌 הבול שלך</p>
          <div className="stamp-row">
            {STAMPS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`stamp-chip ${stampId === s.id ? "selected" : ""}`}
                onClick={() => setStampId(s.id)}
                title={s.label}
              >
                <img src={s.img} alt={s.label} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <p className="panel-label">🌸 קישוטים</p>
          <div className="deco-row">
            {DECORATIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`deco-chip ${decorations.has(d.id) ? "selected" : ""}`}
                onClick={() => toggleDecoration(d.id)}
              >
                {d.emoji} {d.label}
              </button>
            ))}
            <button
              type="button"
              className={`deco-chip ${density === "minimal" ? "selected" : ""}`}
              onClick={() => setDensity(density === "minimal" ? "normal" : "minimal")}
            >
              🤍 מינימלי
            </button>
            <button
              type="button"
              className={`deco-chip ${density === "rich" ? "selected" : ""}`}
              onClick={() => setDensity(density === "rich" ? "normal" : "rich")}
            >
              🎉 עשיר
            </button>
          </div>

          <p className="panel-label">🖌️ ספרו במילים שלכם איך תיראה הגלויה</p>
          <textarea
            className="design-textarea"
            rows={2}
            value={designText}
            onChange={(e) => applyDesignText(e.target.value)}
            placeholder='לדוגמה: "חגיגי עם הרבה פרחים וכוכבים" או "מינימלי ועדין"'
          />
          <p className="design-feedback">{designNotes.length > 0 ? `✔ ${designNotes.join(" · ")}` : ""}</p>

          <p className="panel-label">✍️ ואיך תיחתם הגלויה?</p>
          <input
            className="name-field signature-input"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={name}
          />

          {deepenText.trim() !== "" && (
            <label className="share-check">
              <input
                type="checkbox"
                checked={showSentenceOnCard}
                onChange={(e) => setShowSentenceOnCard(e.target.checked)}
              />
              <span>להוסיף לגלויה גם את המשפט הפרטי שכתבתי ב"רגע של אמת" (ברירת המחדל: נשאר רק שלי 🔒)</span>
            </label>
          )}

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>⬅ חזרה</button>
            {maxStep > 2 && blessing && (
              <button className="btn btn-ghost" onClick={() => setStep(3)}>קדימה בלי שינוי ⬅</button>
            )}
            <button className="btn btn-primary" onClick={startWeaving}>
              ✨ בוראים את הגלויה שלי
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 4: הגלויה שלי ===== */}
      {step === 3 && (
        <section className="card journey-card">
          {weaving ? (
            <div className="weaving-box">
              <img src="/pencil.jpg" alt="" className="weaving-banner" />
              <p className="weaving-text">✏️ הגלויה שלך נבראת ומצוירת ממש עכשיו... (כ-10 שניות של קסם)</p>
            </div>
          ) : (
            <>
              <h2 className="step-title">הנה היא — הגלויה של {name} 💛</h2>

              <div className="postcard-wrap">
                <PersonalCard
                  ref={personalRef}
                  name={name}
                  blessing={blessing}
                  rows={resolved.map((r) => ({ letter: r.letter, icon: r.icon, word: r.word }))}
                  chosenWords={words}
                  goldenWord={goldenWord}
                  personalSentence={showSentenceOnCard && deepenText.trim() ? deepenText.trim() : null}
                  theme={theme}
                  seeded={seeded}
                  decorations={[...decorations]}
                  density={density}
                  stampSrc={STAMPS.find((s) => s.id === stampId)?.img ?? "/stamps/star.jpg"}
                  signature={signature}
                  bgImage={bgImage}
                />
              </div>

              {/* הידעת? — שיקוף ערוצי החוסן, במסגרת מעוצבת מחוץ לגלויה */}
              <aside className="didyouknow-box" aria-label="שיקוף ערוצי החוזק">
                <p className="dyk-title">💡 הידעת? המילים שבחרת מספרות עליך משהו יפה</p>
                {reflection.channels.length > 0 && (
                  <div className="dyk-channels">
                    <span className="dyk-label">ערוצי החוזק שלך:</span>
                    {reflection.channels.map((c) => (
                      <span key={c} className="dyk-chip">✨ {c}</span>
                    ))}
                  </div>
                )}
                <p className="dyk-text">{reflection.text}</p>
                <p className="dyk-footnote">מבוסס על מודל ערוצי החוסן גשר מאח"ד (BASIC Ph) של פרופ' מולי להד — כל בחירה היא בחירה טובה 💛</p>
              </aside>

              <div className="actions-row">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>⬅ לעיצוב</button>
                <button className="btn btn-gold" disabled={busy} onClick={() => downloadCard("personal")}>
                  📥 שמירה כתמונה
                </button>
                <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ הדפסה</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>ממשיכים ⬅</button>
              </div>
              <p className="panel-hint center">הגלויה הזו שלך — היא לא עולה לשום מקום אלא אם תבחרו לשתף אותה.</p>
            </>
          )}
        </section>
      )}

      {/* ===== תחנה 5: לצוות שלנו ===== */}
      {step === 4 && (
        <section className="card journey-card">
          <img src="/mailbox.jpg" alt="" className="step-banner" />
          <h2 className="step-title">ולפני שנפרדים — משהו קטן לצוות 💚</h2>
          <p className="step-sub">
            אחרי שהסתכלנו פנימה, מפנים את המבט החוצה: מה משפט האיחול שלך לצוות / לכיתה שלנו לשנה החדשה?
            הוא יהפוך לגלוית ברכה קטנה שנעלה יחד לקיר המשותף.
          </p>

          <textarea
            className="team-textarea"
            value={teamWish}
            onChange={(e) => { setTeamWish(e.target.value); setTeamReady(false); }}
            placeholder="השנה אני מאחל/ת ל..."
          />

          <label className="share-check">
            <input type="checkbox" checked={showNameOnTeam} onChange={(e) => setShowNameOnTeam(e.target.checked)} />
            <span>להציג את השם שלי על גלוית הצוות</span>
          </label>

          {teamWish.trim() !== "" && (
            <>
              <div className="postcard-wrap">
                <TeamCard
                  ref={teamRef}
                  teamWish={teamWish.trim()}
                  showName={showNameOnTeam}
                  name={name}
                  theme={theme}
                  stampSrc={STAMPS.find((s) => s.id === stampId)?.img ?? "/stamps/star.jpg"}
                  bgImage={bgChoice === "ai" ? bgImage : BACKGROUNDS.find((b) => b.id === bgChoice)?.img ?? null}
                />
              </div>

              <div className="actions-row">
                <button className="btn btn-gold" disabled={busy} onClick={() => { downloadCard("team"); setTeamReady(true); }}>
                  📥 שמירת גלוית הצוות
                </button>
                <a
                  className="btn btn-primary"
                  href={TEAM_WALL_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setTeamReady(true)}
                >
                  📌 פתיחת מדור "הברכות לצוות"
                </a>

              </div>

              {teamReady && (
                <div className="padlet-steps">
                  <p className="panel-label">כך מעלים לקיר ב-3 צעדים:</p>
                  <ol>
                    <li>בקיר (כאן למטה, או בכפתור שפותח אותו במסך מלא) לוחצים על <b>+</b> בעמודת "הברכות לצוות"</li>
                    <li>מצרפים את התמונה ששמרתם — וזהו! 🎉</li>
                  </ol>
                </div>
              )}
            </>
          )}

          <div className="padlet-section">
            <p className="panel-label">💛 הקיר המשותף שלנו</p>
            {ACTIVE_EMBED ? (
              <div className="padlet-frame-wrap">
                <iframe src={ACTIVE_EMBED} title="קיר הברכות המשותף" allow="clipboard-write" />
              </div>
            ) : (
              <a className="btn btn-primary" href={ACTIVE_WALL_URL} target="_blank" rel="noreferrer">
                📌 פתיחת הקיר המשותף
              </a>
            )}
          </div>

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>⬅ לגלויה שלי</button>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <span className="footer-blessing">✒️ כְּתִיבָה וַחֲתִימָה טוֹבָה</span>
        <span className="footer-sweet">שנה טובה ומתוקה 🍯</span>
        <div className="small">
          מילים שבוראות שנה · חני בלוי · <a href="#guide" className="guide-link">למנחה</a>
        </div>
      </footer>
    </div>
  );
}
