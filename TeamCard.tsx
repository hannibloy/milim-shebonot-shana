import { forwardRef } from "react";
import type { CardTheme } from "../data/themes";

interface Props {
  teamWish: string;
  showName: boolean;
  name: string;
  theme: CardTheme;
  stampEmoji: string;
}

export const TeamCard = forwardRef<HTMLDivElement, Props>(function TeamCard(
  { teamWish, showName, name, theme, stampEmoji },
  ref
) {
  const style: React.CSSProperties = { ...(theme.vars as React.CSSProperties) };

  return (
    <div ref={ref} className={`postcard team-card tex-${theme.texture}`} style={style} dir="rtl">
      <div className="pc-stamp">{stampEmoji}</div>
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
