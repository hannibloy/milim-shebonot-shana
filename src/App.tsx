import { useEffect, useMemo, useRef, useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { BLESSINGS, splitName } from "./data/blessings";
import { THEMES, DECORATIONS, parseDesignText, type Decoration } from "./data/themes";
import { INTENTIONS } from "./data/intentions";
import { STAMPS } from "./data/stamps";
import { designFromName } from "./lib/seed";
import { weaveLetter, type WeaveItem } from "./lib/weave";
import { PersonalCard } from "./components/PersonalCard";
import { TeamCard } from "./components/TeamCard";
import { Facilitator } from "./components/Facilitator";

const PADLET_URL = "https://padlet.com/bloyarava1/padlet-3pl2lhhpefgs5wd6";
const PADLET_EMBED = "https://padlet.com/embed/3pl2lhhpefgs5wd6";

type Choice =
  | { mode: "option"; index: 0 | 1 }
  | { mode: "custom"; word: string; text: string };

interface Deepen {
  word: string | null;
  sentence: string;
}

const STATIONS = ["כוונה", "השם", "המילים", "העמקה", "לצוות", "שיתוף", "עיצוב", "האיגרת"];

export default function App() {
  const [guide, setGuide] = useState(() => window.location.hash === "#guide");
  useEffect(() => {
    const onHash = () => setGuide(window.location.hash === "#guide");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const [step, setStep] = useState(0);
  const [intention, setIntention] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [choices, setChoices] = useState<Record<number, Choice>>({});
  const [openCustom, setOpenCustom] = useState<Record<number, boolean>>({});
  const [deepenOpen, setDeepenOpen] = useState(false);
  const [deepen, setDeepen] = useState<Deepen>({ word: null, sentence: "" });
  const [teamWish, setTeamWish] = useState("");

  // בחירות שיתוף מודעות
  const [showSentenceOnCard, setShowSentenceOnCard] = useState(false);
  const [showTeamOnPersonal, setShowTeamOnPersonal] = useState(false);
  const [showNameOnTeam, setShowNameOnTeam] = useState(false);

  // עיצוב
  const [themeId, setThemeId] = useState("notebook");
  const [decorations, setDecorations] = useState<Set<Decoration>>(new Set(["hearts", "stars"]));
  const [density, setDensity] = useState<"minimal" | "normal" | "rich">("normal");
  const [accentOverride, setAccentOverride] = useState<string | null>(null);
  const [designText, setDesignText] = useState("");
  const [designNotes, setDesignNotes] = useState<string[]>([]);
  const [stampId, setStampId] = useState("star");
  const [signature, setSignature] = useState("");

  // סיום
  const [goldenWord, setGoldenWord] = useState<string | null>(null);
  const [weaving, setWeaving] = useState(false);
  const [wovenText, setWovenText] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<"personal" | "team">("personal");
  const [busy, setBusy] = useState(false);

  const personalRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const letters = useMemo(() => splitName(name), [name]);
  const seeded = useMemo(() => designFromName(name), [name]);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const stamp = STAMPS.find((s) => s.id === stampId) ?? STAMPS[0];

  const allChosen =
    letters.length > 0 &&
    letters.every((_, i) => {
      const c = choices[i];
      if (!c) return false;
      if (c.mode === "custom") return c.word.trim() !== "" && c.text.trim() !== "";
      return true;
    });

  const items: WeaveItem[] = useMemo(
    () =>
      letters.map((letter, i) => {
        const entry = BLESSINGS[letter];
        const c = choices[i];
        if (c?.mode === "custom") return { letter, word: c.word, text: c.text };
        const opt = entry.options[c?.mode === "option" ? c.index : 0];
        return { letter, word: opt.word, text: opt.text };
      }),
    [letters, choices]
  );

  const words = useMemo(() => items.map((i) => i.word), [items]);

  function applyDesignText(text: string) {
    setDesignText(text);
    const parsed = parseDesignText(text);
    if (parsed.decorations && parsed.decorations.size > 0) {
      setDecorations((prev) => new Set([...prev, ...parsed.decorations!]));
    }
    if (parsed.density) setDensity(parsed.density);
    if (parsed.accentOverride !== undefined && parsed.accentOverride !== null) {
      setAccentOverride(parsed.accentOverride);
    }
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

  async function startWeaving(golden: string | null) {
    setGoldenWord(golden);
    setWeaving(true);
    setStep(7);
    const result = await weaveLetter({
      name,
      items,
      goldenWord: golden,
      personalSentence:
        showSentenceOnCard && deepen.sentence.trim() ? deepen.sentence.trim() : null,
    });
    setWovenText(result.text);
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
      a.download = which === "personal" ? `האיגרת-של-${name}.png` : `ברכה-לצוות-${name}.png`;
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
        const file = new File(
          [blob],
          which === "personal" ? `איגרת-${name}.png` : `ברכה-לצוות.png`,
          { type: "image/png" }
        );
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
      // מסלול חלופי: הורדה + פתיחת הקיר
      await downloadCard(which);
      window.open(PADLET_URL, "_blank");
    } catch {
      /* המשתמש ביטל שיתוף — לא שגיאה */
    } finally {
      setBusy(false);
    }
  }

  if (guide) {
    return (
      <div className="app-shell">
        <Facilitator
          onBack={() => {
            window.location.hash = "";
            setGuide(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-shell desk">
      {/* עולם הכתיבה — אלמנטים מרחפים ברקע */}
      <div className="desk-decor" aria-hidden>
        <span className="float-item f1">✉️</span>
        <span className="float-item f2">📮</span>
        <span className="float-item f3">✏️</span>
        <span className="float-item f4">📖</span>
        <span className="float-letter fl1">ש</span>
        <span className="float-letter fl2">נ</span>
        <span className="float-letter fl3">ה</span>
        <span className="float-letter fl4">ט</span>
        <span className="float-letter fl5">ו</span>
        <span className="float-letter fl6">ב</span>
      </div>

      <header className="app-header">
        <img src="/logo.png" alt="חני בלוי — יועצת ומדריכה" className="app-logo" />
        <div>
          <span className="badge">✉️ פעילות פתיחת שנה · מילים בוראות מציאות</span>
        </div>
      </header>

      <nav className="stepper" aria-label="תחנות המסע">
        {STATIONS.map((label, i) => (
          <span key={label} style={{ display: "contents" }}>
            {i > 0 && <span className="line" />}
            <span
              className={`dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
              title={label}
            >
              {i < step ? "✓" : i + 1}
            </span>
          </span>
        ))}
      </nav>

      {/* ===== תחנה 1: סף הדלת — כוונה ===== */}
      {step === 0 && (
        <section className="card sheet">
          <img src="/star.png" alt="" className="hero-img" />
          <h1 className="hero-title">מילים שבוראות שנה</h1>
          <p className="step-sub">
            לפני הכל — רגע אחד של עצירה. גלויה ריקה מחכה לכם, ובסופו של המסע הקצר הזה
            היא תהיה איגרת אישית שלכם לשנה החדשה. בחרו את המשפט שאיתו נכנסים פנימה:
          </p>
          <div className="intention-list">
            {INTENTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`intention-card ${intention === s ? "selected" : ""}`}
                onClick={() => setIntention(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="actions-row">
            <button className="btn btn-primary" disabled={!intention} onClick={() => setStep(1)}>
              נכנסים למסע ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 2: השם ===== */}
      {step === 1 && (
        <section className="card sheet">
          <h2 className="step-title">האותיות של השם שלי</h2>
          <p className="step-sub">
            השם הפרטי שלנו הוא נקודת המוצא — כל אות בו תפתח דלת למילה אחת של כוח.
          </p>
          <label className="field-label" htmlFor="name">מה השם הפרטי שלך?</label>
          <input
            id="name"
            className="name-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: חני"
            autoComplete="given-name"
          />
          {name.trim() !== "" && letters.length === 0 && (
            <p className="step-sub" style={{ marginTop: 10, color: "#b0705e" }}>
              נראה שהשם לא מכיל אותיות עבריות — נסו לכתוב אותו בעברית 💛
            </p>
          )}
          {letters.length > 0 && (
            <div className="letters-fly">
              {letters.map((l, i) => (
                <span key={i} className="fly-letter" style={{ animationDelay: `${i * 0.12}s` }}>
                  {l}
                </span>
              ))}
            </div>
          )}
          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>⬅ חזרה</button>
            <button className="btn btn-primary" disabled={letters.length === 0} onClick={() => setStep(2)}>
              אל מילות הכוח ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 3: מילות הכוח ===== */}
      {step === 2 && (
        <section className="card sheet">
          <h2 className="step-title">המילים של {name} 💫</h2>
          <p className="step-sub">
            לכל אות — בחרו אחת משתי מילות כוח, או כתבו ברכה משלכם. אין בחירה לא נכונה:
            המילה שמושכת אתכם היא כנראה המילה שאתם צריכים.
          </p>

          {letters.map((letter, i) => {
            const entry = BLESSINGS[letter];
            const c = choices[i];
            const customOpen = openCustom[i] || c?.mode === "custom";
            return (
              <div className="letter-block" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
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
                    if (!customOpen) {
                      setChoices((prev) => ({ ...prev, [i]: { mode: "custom", word: "", text: "" } }));
                    }
                  }}
                >
                  ✏️ {customOpen ? "חזרה לאפשרויות המוכנות" : "מעדיפ/ה לכתוב בעצמי"}
                </button>

                {customOpen && (
                  <div className="custom-area">
                    <input
                      placeholder={`מילת הערך שלי לאות ${letter} (למשל: ${entry.options[0].word})`}
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
                      placeholder="הברכה שלי לעצמי..."
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

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>⬅ חזרה</button>
            <button className="btn btn-primary" disabled={!allChosen} onClick={() => setStep(3)}>
              ממשיכים ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 4: העמקה בחירית — רגע של אמת ===== */}
      {step === 3 && (
        <section className="card sheet">
          <h2 className="step-title">רגע של אמת ✨</h2>
          {!deepenOpen ? (
            <>
              <p className="step-sub">
                מי שרוצה — מוזמן/ת לעצור כאן לדקה אחת של העמקה: לחבר מילה אחת שבחרתם
                לרגע אמיתי שמחכה לכם השנה. אפשר גם פשוט להמשיך הלאה.
              </p>
              <div className="actions-row">
                <button className="btn btn-gold" onClick={() => setDeepenOpen(true)}>
                  ⊕ להעמיק — דקה אחת
                </button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>
                  ממשיכים הלאה ⬅
                </button>
              </div>
              <div className="actions-row" style={{ marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>⬅ חזרה</button>
              </div>
            </>
          ) : (
            <>
              <p className="step-sub">
                עצמו לרגע את העיניים ודמיינו רגע אחד מאתגר שכנראה יגיע השנה — שיחה לא
                פשוטה, עומס, רגע של ספק. לא צריך לכתוב אותו. עכשיו:
              </p>
              <p className="panel-label">איזו מהמילים שבחרתם תלווה אתכם ברגע הזה?</p>
              <div className="deco-row">
                {words.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`deco-chip ${deepen.word === w ? "selected" : ""}`}
                    onClick={() => setDeepen((d) => ({ ...d, word: w }))}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="panel-label">השלימו משפט אחד:</p>
              <div className="sentence-row">
                <span className="sentence-prefix">כשיגיע הרגע הזה, אזכיר לעצמי ש...</span>
                <textarea
                  className="team-textarea"
                  rows={2}
                  value={deepen.sentence}
                  onChange={(e) => setDeepen((d) => ({ ...d, sentence: e.target.value }))}
                  placeholder="...יש בי את הכוחות לעבור גם את זה"
                />
              </div>
              <p className="privacy-note">
                🔒 המשפט הזה פרטי — הוא לא יופיע בשום מקום אלא אם תבחרו אחרת בהמשך.
              </p>
              <div className="actions-row">
                <button className="btn btn-ghost" onClick={() => setDeepenOpen(false)}>⬅ חזרה</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>
                  ממשיכים ⬅
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* ===== תחנה 5: ברכה לצוות ===== */}
      {step === 4 && (
        <section className="card sheet">
          <div className="plant-illustration">
            <img src="/sprout.png" alt="" className="plant-img" />
          </div>
          <h2 className="step-title">ברכה לצוות שלנו</h2>
          <p className="step-sub">
            עד עכשיו כתבתם לעצמכם. עכשיו — משפט אחד מהלב לצוות או לכיתה שלכם.
            הברכה הזו תהפוך לגלויה נפרדת, שנועדה לקיר המשותף.
          </p>
          <textarea
            className="team-textarea"
            value={teamWish}
            onChange={(e) => setTeamWish(e.target.value)}
            placeholder="השנה אני מאחל/ת לצוות שלנו..."
          />
          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>⬅ חזרה</button>
            <button className="btn btn-primary" onClick={() => setStep(5)}>
              ממשיכים ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 6: מה משתפים ===== */}
      {step === 5 && (
        <section className="card sheet">
          <h2 className="step-title">מה יופיע — ומה נשאר שלי 🔒</h2>
          <p className="step-sub">
            הסיפור שלכם שייך לכם. סמנו במודע מה ייכנס לכל גלויה — וכל מה שלא תסמנו
            פשוט יישאר אתכם.
          </p>

          <p className="panel-label">על האיגרת האישית שלי:</p>
          <div className="share-list">
            {deepen.sentence.trim() && (
              <label className="share-item">
                <input
                  type="checkbox"
                  checked={showSentenceOnCard}
                  onChange={(e) => setShowSentenceOnCard(e.target.checked)}
                />
                <span>המשפט האישי שלי מ"רגע של אמת" <i>(כרגע: פרטי)</i></span>
              </label>
            )}
            {teamWish.trim() && (
              <label className="share-item">
                <input
                  type="checkbox"
                  checked={showTeamOnPersonal}
                  onChange={(e) => setShowTeamOnPersonal(e.target.checked)}
                />
                <span>גם הברכה לצוות תופיע על האיגרת האישית</span>
              </label>
            )}
          </div>

          {teamWish.trim() && (
            <>
              <p className="panel-label">על גלוית הצוות (לקיר המשותף):</p>
              <div className="share-list">
                <label className="share-item">
                  <input
                    type="checkbox"
                    checked={showNameOnTeam}
                    onChange={(e) => setShowNameOnTeam(e.target.checked)}
                  />
                  <span>השם הפרטי שלי יופיע לצד הברכה <i>(אפשר גם בעילום שם)</i></span>
                </label>
              </div>
            </>
          )}

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(4)}>⬅ חזרה</button>
            <button className="btn btn-primary" onClick={() => setStep(6)}>
              לעיצוב האיגרת ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 7: עיצוב וחתימה ===== */}
      {step === 6 && (
        <section className="card sheet">
          <h2 className="step-title">העיצוב שלי 🎨</h2>
          <p className="step-sub">
            הקומפוזיציה של האיגרת נבראת מאותיות השם שלכם — אין עוד אחת כמוה בעולם.
            עכשיו תנו לה את הטעם האישי שלכם:
          </p>

          <p className="panel-label">🎨 סגנון</p>
          <div className="theme-row">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-chip ${themeId === t.id ? "selected" : ""}`}
                onClick={() => { setThemeId(t.id); setAccentOverride(null); }}
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

          <p className="panel-label">✨ קישוטים</p>
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

          <p className="panel-label">🖌️ ספרו במילים שלכם איך תיראה האיגרת</p>
          <textarea
            className="design-textarea"
            rows={2}
            value={designText}
            onChange={(e) => applyDesignText(e.target.value)}
            placeholder='לדוגמה: "חגיגי עם הרבה פרחים וכוכבים בזהב" או "מינימלי ועדין בסגול"'
          />
          <p className="design-feedback">{designNotes.length > 0 ? `✔ ${designNotes.join(" · ")}` : ""}</p>

          <p className="panel-label">📮 הבול שלי</p>
          <div className="deco-row">
            {STAMPS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`stamp-chip ${stampId === s.id ? "selected" : ""}`}
                onClick={() => setStampId(s.id)}
                title={s.label}
              >
                {s.emoji}
              </button>
            ))}
          </div>

          <p className="panel-label">✒️ החתימה שלי</p>
          <input
            className="name-field signature-field"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={name || "השם שלי"}
          />
          <p className="design-feedback" style={{ textAlign: "center" }}>
            כך תיראה החתימה על האיגרת ↑
          </p>

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(5)}>⬅ חזרה</button>
            <button className="btn btn-primary" onClick={() => setStep(7)}>
              רגע אחרון לפני החתימה ⬅
            </button>
          </div>
        </section>
      )}

      {/* ===== תחנה 8: פרידה, אריגה ושליחה ===== */}
      {step === 7 && (
        <section className="card sheet">
          {wovenText === null && !weaving && (
            <>
              <h2 className="step-title">רגע הפרידה 🌟</h2>
              <p className="step-sub">
                מכל המילים שבחרתם — איזו אחת הכי נחוצה לכם <b>דווקא היום</b>?
                היא תקבל נגיעת זהב על האיגרת.
              </p>
              <div className="deco-row" style={{ justifyContent: "center" }}>
                {words.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`deco-chip golden-chip ${goldenWord === w ? "selected" : ""}`}
                    onClick={() => setGoldenWord(w)}
                  >
                    {goldenWord === w ? "✨ " : ""}{w}
                  </button>
                ))}
              </div>
              <div className="actions-row">
                <button className="btn btn-ghost" onClick={() => setStep(6)}>⬅ חזרה</button>
                <button className="btn btn-ghost" onClick={() => startWeaving(null)}>
                  לדלג
                </button>
                <button className="btn btn-gold" disabled={!goldenWord} onClick={() => startWeaving(goldenWord)}>
                  ✒️ לחתום על האיגרת שלי
                </button>
              </div>
            </>
          )}

          {weaving && (
            <div className="weaving-box">
              <div className="weaving-pen">🖋️</div>
              <h2 className="step-title">האיגרת שלך נכתבת...</h2>
              <p className="step-sub">המילים שבחרת נארגות ברגעים אלה למכתב אחד שלם</p>
            </div>
          )}

          {wovenText !== null && !weaving && (
            <>
              <h2 className="step-title">האיגרת שלך מוכנה 💌</h2>

              {teamWish.trim() && (
                <div className="card-tabs">
                  <button
                    className={`tab-btn ${activeCard === "personal" ? "active" : ""}`}
                    onClick={() => setActiveCard("personal")}
                  >
                    ✉️ האיגרת האישית
                  </button>
                  <button
                    className={`tab-btn ${activeCard === "team" ? "active" : ""}`}
                    onClick={() => setActiveCard("team")}
                  >
                    💌 גלוית הצוות
                  </button>
                </div>
              )}

              <div className="postcard-wrap" style={{ display: activeCard === "personal" ? "flex" : "none" }}>
                <PersonalCard
                  ref={personalRef}
                  name={name}
                  letterText={wovenText}
                  words={words}
                  goldenWord={goldenWord}
                  teamWish={showTeamOnPersonal && teamWish.trim() ? teamWish : null}
                  personalSentence={
                    showSentenceOnCard && deepen.sentence.trim()
                      ? `כשיגיע הרגע — אזכיר לעצמי ש${deepen.sentence.trim()}`
                      : null
                  }
                  theme={theme}
                  seeded={seeded}
                  stampEmoji={stamp.emoji}
                  signature={signature}
                />
              </div>

              {teamWish.trim() && (
                <div className="postcard-wrap" style={{ display: activeCard === "team" ? "flex" : "none" }}>
                  <TeamCard
                    ref={teamRef}
                    teamWish={teamWish}
                    showName={showNameOnTeam}
                    name={name}
                    theme={theme}
                    stampEmoji={stamp.emoji}
                  />
                </div>
              )}

              <div className="actions-row">
                <button className="btn btn-gold" disabled={busy} onClick={() => downloadCard(activeCard)}>
                  📥 הורדה כתמונה
                </button>
                <button className="btn btn-primary" disabled={busy} onClick={() => shareCard(activeCard)}>
                  📤 שיתוף
                </button>
              </div>

              <div className="padlet-section">
                <p className="panel-label">💛 הקיר המשותף שלנו</p>
                <div className="padlet-steps">
                  <span>1️⃣ הורידו את הגלויה</span>
                  <span>2️⃣ פתחו את הקיר ולחצו +</span>
                  <span>3️⃣ צרפו את התמונה למדור המתאים</span>
                </div>
                <div className="actions-row" style={{ marginTop: 8, marginBottom: 14 }}>
                  <a className="btn btn-primary" href={PADLET_URL} target="_blank" rel="noreferrer">
                    📌 פתיחת קיר הצוות
                  </a>
                </div>
                <div className="padlet-frame-wrap">
                  <iframe src={PADLET_EMBED} title="קיר הברכות המשותף" allow="clipboard-write" />
                </div>
              </div>
            </>
          )}
        </section>
      )}

      <footer className="app-footer">
        ✒️ כתיבה וחתימה טובה · שנה טובה ומתוקה 🍯
        <div className="small">
          מילים שבוראות שנה · חני בלוי ·{" "}
          <a href="#guide" className="guide-link">למנחה</a>
        </div>
      </footer>
    </div>
  );
}
