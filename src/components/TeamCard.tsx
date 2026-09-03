import { forwardRef } from "react";
import type { CardTheme } from "../data/themes";

interface Props {
  teamWish: string;
  showName: boolean;
  name: string;
  theme: CardTheme;
  stampSrc: string;
  bgImage: string | null;
}

export const TeamCard = forwardRef<HTMLDivElement, Props>(function TeamCard(
  { teamWish, showName, name, theme, stampSrc, bgImage },
  ref
) {
  const style: React.CSSProperties = { ...(theme.vars as React.CSSProperties) };

  return (
    <div ref={ref} className={`postcard team-card tex-${theme.texture} ${bgImage ? "has-ai-bg" : ""}`} style={style} dir="rtl">
      {bgImage && <img src={bgImage} alt="" className="poster-ai-bg" />}
      <img className="pc-stamp-img" src={stampSrc} alt="" />
      <div className="pc-postmark" aria-hidden>
        <span>שנה טובה</span>
      </div>

      <p className="pc-title">💌 הברכה שלי לצוות שלנו</p>
      <div className="pc-divider" />

      <p className="team-wish-text">"{teamWish}"</p>

      {showName && <p className="team-signed">— {name}</p>}

      <p className="pc-footer">🍯 שנה טובה ומתוקה</p>
      <div className="pc-credit">
        <img src="/logo.png" alt="חני בלוי" className="pc-logo" />
        <span>מילים שבוראות שנה · חני בלוי</span>
      </div>
    </div>
  );
});
