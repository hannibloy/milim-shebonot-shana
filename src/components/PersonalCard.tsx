import { forwardRef } from "react";
import type { CardTheme, Decoration } from "../data/themes";
import type { SeededDesign } from "../lib/seed";

interface Props {
  name: string;
  blessing: string; // ברכה קצרה — 2-4 שורות
  rows: { letter: string; icon: string; word: string }[]; // האקרוסטיכון
  goldenWord: string | null;
  personalSentence: string | null; // מוצג רק אם המשתתף בחר במודע
  theme: CardTheme;
  seeded: SeededDesign;
  decorations: Decoration[];
  density: "minimal" | "normal" | "rich";
  stampSrc: string;
  signature: string;
  bgImage: string | null;
}

const DECO_EMOJI: Record<Decoration, string> = {
  hearts: "💗",
  stars: "⭐",
  flowers: "🌸",
  sprouts: "🌱",
  butterflies: "🦋",
  rainbow: "🌈",
};

export const PersonalCard = forwardRef<HTMLDivElement, Props>(function PersonalCard(
  { name, blessing, rows, goldenWord, personalSentence, theme, seeded, decorations, density, stampSrc, signature, bgImage },
  ref
) {
  const style: React.CSSProperties = {
    ...(theme.vars as React.CSSProperties),
    filter: `hue-rotate(${seeded.hueShift}deg)`,
  };

  // קישוטים מרחפים במיקומים שנבראו מאותיות השם
  const decoCount = density === "minimal" ? 0 : density === "rich" ? 8 : 4;
  const decoList = decorations.length ? decorations : (["stars"] as Decoration[]);
  const floats = seeded.blobs
    .concat(seeded.blobs)
    .slice(0, decoCount)
    .map((b, i) => ({
      top: b.top,
      left: b.left,
      emoji: DECO_EMOJI[decoList[i % decoList.length]],
      angle: seeded.decoAngles[i % seeded.decoAngles.length],
    }));

  const blessingLines = blessing.split(/\n+/).filter((l) => l.trim());

  function highlight(line: string) {
    if (!goldenWord || !line.includes(goldenWord)) return line;
    const parts = line.split(goldenWord);
    return parts.flatMap((part, i) =>
      i < parts.length - 1
        ? [part, <span key={i} className="poster-golden">{goldenWord}</span>]
        : [part]
    );
  }

  return (
    <div ref={ref} className={`poster tex-${theme.texture} ${bgImage ? "has-ai-bg" : ""}`} style={style} dir="rtl">
      {bgImage && <img src={bgImage} alt="" className="poster-ai-bg" />}
      {/* כתמי אקוורל שנבראו מאותיות השם */}
      {seeded.blobs.map((b, i) => (
        <span
          key={`b${i}`}
          className="pc-blob"
          style={{
            top: b.top, left: b.left, width: b.size, height: b.size,
            opacity: b.opacity, filter: `hue-rotate(${b.hue}deg) blur(18px)`,
          }}
        />
      ))}
      {floats.map((f, i) => (
        <span
          key={`f${i}`}
          className="poster-float"
          style={{ top: f.top, left: f.left, transform: `rotate(${f.angle}deg)` }}
        >
          {f.emoji}
        </span>
      ))}

      <img className="pc-stamp-img" src={stampSrc} alt="" />
      <div className="pc-postmark" aria-hidden><span>שנה טובה</span></div>

      <div className="poster-head">
        <p className="poster-year">✨ אגרת ברכה לשנה החדשה ✨</p>
        <h2 className="poster-title">שָׁנָה טוֹבָה</h2>
        <p className="poster-to">לְ{name}</p>
        <div className="pc-divider" />
      </div>

      {/* האקרוסטיכון — אותיות השם במרכז הבמה */}
      <div className="poster-acrostic">
        {rows.map((r, i) => (
          <div
            className={`acrostic-row ${goldenWord === r.word ? "golden-row" : ""}`}
            key={i}
            style={{ transform: `rotate(${seeded.decoAngles[i % seeded.decoAngles.length] / 8}deg)` }}
          >
            <span className="acrostic-letter">{r.letter}</span>
            <span className="acrostic-word">
              {r.word}
              {goldenWord === r.word && <span className="acrostic-spark"> ✨</span>}
            </span>
            <span className="acrostic-icon">{r.icon}</span>
          </div>
        ))}
      </div>

      {/* הברכה הקצרה */}
      <div className="poster-blessing" style={{ transform: `rotate(${seeded.linesTilt}deg)` }}>
        {blessingLines.map((l, i) => (
          <p key={i}>{highlight(l)}</p>
        ))}
      </div>

      {personalSentence && (
        <p className="pc-personal-line">🔖 {personalSentence}</p>
      )}

      <div className="pc-sign-row">
        <span className="pc-sign-label">באהבה,</span>
        <span className="pc-signature">{signature || name}</span>
      </div>

      <div className="poster-footer">
        <span>✒️ כתיבה וחתימה טובה · שנה טובה ומתוקה 🍯</span>
        <div className="pc-credit">
          <img src="/logo.png" alt="חני בלוי" className="pc-logo" />
          <span>מילים שבוראות שנה · חני בלוי</span>
        </div>
      </div>
    </div>
  );
});
