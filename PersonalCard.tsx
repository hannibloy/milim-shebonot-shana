import { forwardRef } from "react";
import type { CardTheme } from "../data/themes";
import type { SeededDesign } from "../lib/seed";

interface Props {
  name: string;
  letterText: string;
  words: string[];
  goldenWord: string | null;
  teamWish: string | null; // מוצג רק אם המשתתף בחר במודע
  personalSentence: string | null; // מוצג רק אם המשתתף בחר במודע
  theme: CardTheme;
  seeded: SeededDesign;
  stampEmoji: string;
  signature: string;
}

export const PersonalCard = forwardRef<HTMLDivElement, Props>(function PersonalCard(
  { name, letterText, words, goldenWord, teamWish, personalSentence, theme, seeded, stampEmoji, signature },
  ref
) {
  const style: React.CSSProperties = {
    ...(theme.vars as React.CSSProperties),
    filter: `hue-rotate(${seeded.hueShift}deg)`,
  };

  const paragraphs = letterText.split(/\n+/).filter((p) => p.trim());

  // מילת הזהב מקבלת נגיעת זהב גם בתוך גוף המכתב
  function renderParagraph(p: string) {
    if (!goldenWord || !p.includes(goldenWord)) return p;
    const parts = p.split(goldenWord);
    return parts.flatMap((part, i) =>
      i < parts.length - 1
        ? [part, <span key={i} className="pc-golden-inline">{goldenWord}</span>]
        : [part]
    );
  }

  return (
    <div ref={ref} className={`postcard tex-${theme.texture}`} style={style} dir="rtl">
      {/* כתמי אקוורל שנבראו מאותיות השם */}
      {seeded.blobs.map((b, i) => (
        <span
          key={i}
          className="pc-blob"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            filter: `hue-rotate(${b.hue}deg) blur(18px)`,
          }}
        />
      ))}

      <div className="pc-stamp" title="הבול שלי">{stampEmoji}</div>
      <div className="pc-postmark" aria-hidden>
        <span>שנה טובה</span>
      </div>

      <p className="pc-title">✉️ אגרת לשנה החדשה</p>
      <div className="pc-divider" />

      <div className="pc-letter-body" style={{ transform: `rotate(${seeded.linesTilt}deg)` }}>
        {paragraphs.map((p, i) => (
          <p key={i}>{renderParagraph(p)}</p>
        ))}
      </div>

      {personalSentence && (
        <p className="pc-personal-line">🔖 {personalSentence}</p>
      )}

      <div className="pc-words-row">
        {words.map((w, i) => (
          <span
            key={i}
            className={`pc-word-tag ${goldenWord === w ? "golden" : ""}`}
            style={{ transform: `rotate(${seeded.decoAngles[i % seeded.decoAngles.length] / 3}deg)` }}
          >
            {goldenWord === w ? "✨ " : ""}{w}
          </span>
        ))}
      </div>

      {teamWish && (
        <div className="pc-team">
          <h4>💌 והברכה שלי לצוות שלנו</h4>
          <p>{teamWish}</p>
        </div>
      )}

      <div className="pc-sign-row">
        <span className="pc-sign-label">שלי, באהבה —</span>
        <span className="pc-signature">{signature || name}</span>
      </div>

      <p className="pc-footer">✒️ כתיבה וחתימה טובה · שנה טובה ומתוקה 🍯</p>
      <div className="pc-credit">
        <img src="/logo.png" alt="חני בלוי" className="pc-logo" />
        <span>מילים שבוראות שנה · חני בלוי</span>
      </div>
    </div>
  );
});
