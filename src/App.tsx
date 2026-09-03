import { useEffect, useMemo, useRef, useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { BLESSINGS, CHANNEL_LABELS, splitName, type ResilienceChannel } from "./data/blessings";
import { THEMES, DECORATIONS, parseDesignText, type Decoration } from "./data/themes";
import { INTENTIONS } from "./data/intentions";
import { STAMPS } from "./data/stamps";
import { designFromName } from "./lib/seed";
import { weaveLetter } from "./lib/weave";
import { PersonalCard } from "./components/PersonalCard";
import { TeamCard } from "./components/TeamCard";
import { Facilitator } from "./components/Facilitator";

const PADLET_URL = "https://padlet.com/bloyarava1/padlet-3pl2lhhpefgs5wd6";
const PADLET_EMBED = "https://padlet.com/embed/3pl2lhhpefgs5wd6";

type Choice =
  | { mode: "option"; index: 0 | 1 }
  | { mode: "custom"; word: string; text: string };

// המסע: פתיחה ← המילים שלי ← עיצוב ← הגלויה שלי ← ברכה לצוות
const STEPS = ["פתיחה", "המילים שלי", "עיצוב", "הגלויה שלי", "לצוות שלנו"] as const;

export default function App() {
  const [guide, setGuide] = useState(() => window.location.hash === "#guide");
  useEffect(() => {
    const onHash = () => setGuide(window.location.hash === "#guide");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const [step, setStep] = useState(0);

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

  // שיקוף ערוצי החוסן — מוצג על המסך, לא על הגלויה (הגלויה נשארת נקייה)
  const reflection = useMemo(() => {
    const counts = new Map<ResilienceChannel, number>();
    for (const r of resolved) if (r.channel) counts.set(r.channel, (counts.get(r.channel) ?? 0) + 1);
    if (counts.size === 0)
      return "הצופן שלך נכתב כולו במילים שלך — וזה בדיוק הכוח: קול אישי לגמרי.";
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([ch]) => CHANNEL_LABELS[ch]);
    const t = top.length === 2 ? `${top[0]} ו${top[1]}` : top[0];
    return `המילים שבחרת מספרות שהחוסן שלך נשען בעיקר על ${t} — אלו העוגנים שילוו אותך השנה.`;
  }, [resolved]);

  async function startWeaving() {
    setStep(3);
    setWeaving(true);
    const result = await weaveLetter({
      name,
      items: resolved.map((r) => ({ letter: r.letter, word: r.word, text: r.text })),
      goldenWord,
      personalSentence: showSentenceOnCard && deepenText.trim() ? deepenText.trim() : null,
    });
    setBlessing(result.text);
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
      window.open(PADLET_URL, "_blank");
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
      <div className="desk-decor" aria-hidden>
        <span className="desk-float f1">✉️</span>
        <span className="desk-float f2">✏️</span>
        <span className="desk-float f3">📖</span>
        <span className="desk-float f4">א</span>
        <span className="desk-float f5">ש</span>
        <span className="desk-float f6">💌</span>
      </div>

      <header className="app-header">
        <img src="/logo.png" alt="חני בלוי" className="app-logo" />
      </header>

      <nav className="stepper" aria-label="שלבי המסע">
        {STEPS.map((label, i) => (
          <span key={label} style={{ display: "contents" }}>
            {i > 0 && <span className="line" />}
            <span className={`dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} title={label}>
              {i < step ? "✓" : i + 1}
            </span>
          </span>
        ))}
      </nav>

      {/* ===== תחנה 1: פתיחה — כוונה ושם ===== */}
      {step === 0 && (
        <section className="card journey-card">
          <img src="/envelope.jpg" alt="" className="hero-banner" />
          <h1 className="hero-title">מילים שבוראות שנה</h1>
          <p className="step-sub">
            רגע לפני שהשנה מתחילה — עצירה קטנה, כולה שלך.
            נבחר יחד מילים טובות מתוך אותיות השם שלך, ונהפוך אותן לאגרת ברכה יפהפייה.
          </p>

          <p className="panel-label center">🕯️ באיזו כוונה נכנסים? בחרו משפט אחד:</p>
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
          </div>
        </section>
      )}

      {/* ===== תחנה 2: המילים שלי ===== */}
      {step === 1 && (
        <section className="card journey-card">
          <img src="/letters.jpg" alt="" className="step-banner" />
          <h2 className="step-title">המילים של {name} 💫</h2>
          <p className="step-sub">
            כל אות בשם שלך פותחת שער לשתי מילות כוח. בחרו את זו שמדברת אליכם —
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

          <p className="panel-label">🎨 סגנון</p>
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
          <div className="deco-row">
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
              <p className="weaving-text">✏️ הגלויה שלך נבראת מאותיות השם...</p>
            </div>
          ) : (
            <>
              <h2 className="step-title">הנה היא — הגלויה של {name} 💛</h2>
              <p className="step-sub reflection-line">🪞 {reflection}</p>

              <div className="postcard-wrap">
                <PersonalCard
                  ref={personalRef}
                  name={name}
                  blessing={blessing}
                  rows={resolved.map((r) => ({ letter: r.letter, icon: r.icon, word: r.word }))}
                  goldenWord={goldenWord}
                  personalSentence={showSentenceOnCard && deepenText.trim() ? deepenText.trim() : null}
                  theme={theme}
                  seeded={seeded}
                  decorations={[...decorations]}
                  density={density}
                  stampSrc={STAMPS.find((s) => s.id === stampId)?.img ?? "/stamps/star.jpg"}
                  signature={signature}
                />
              </div>

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
            placeholder="השנה אני מאחל/ת לצוות שלנו..."
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
                />
              </div>

              <div className="actions-row">
                <button className="btn btn-gold" disabled={busy} onClick={() => { downloadCard("team"); setTeamReady(true); }}>
                  📥 שמירת גלוית הצוות
                </button>
                <button className="btn btn-primary" disabled={busy} onClick={() => { shareCard("team"); setTeamReady(true); }}>
                  📌 שיתוף בקיר שלנו
                </button>
              </div>

              {teamReady && (
                <div className="padlet-steps">
                  <p className="panel-label">כך מעלים לקיר ב-3 צעדים:</p>
                  <ol>
                    <li>נכנסים לקיר (הכפתור למעלה פותח אותו)</li>
                    <li>לוחצים על <b>+</b> בעמודת "הברכות לצוות"</li>
                    <li>מצרפים את התמונה ששמרתם — וזהו! 🎉</li>
                  </ol>
                </div>
              )}
            </>
          )}

          <div className="padlet-section">
            <p className="panel-label">💛 הקיר המשותף שלנו</p>
            <div className="padlet-frame-wrap">
              <iframe src={PADLET_EMBED} title="קיר הברכות המשותף" allow="clipboard-write" />
            </div>
          </div>

          <div className="actions-row">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>⬅ לגלויה שלי</button>
          </div>
        </section>
      )}

      <footer className="app-footer">
        ✒️ כתיבה וחתימה טובה · שנה טובה ומתוקה 🍯
        <div className="small">
          מילים שבוראות שנה · חני בלוי · <a href="#guide" className="guide-link">למנחה</a>
        </div>
      </footer>
    </div>
  );
}
