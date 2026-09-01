// מאגר מילות הכוח והאיחולים — א' עד ת'
// לכל אות: אייקון רך, ושתי אפשרויות. לכל אפשרות: מילת ערך, נוסח ברכה, וערוץ חוסן (גשר מאח"ד / BASIC Ph)

export type ResilienceChannel = "belief" | "affect" | "social" | "imagination" | "cognition" | "physiology";

export const CHANNEL_LABELS: Record<ResilienceChannel, string> = {
  belief: "אמונה, ערכים ומשמעות",
  affect: "רגש וחיבור לבבי",
  social: "שייכות וקשרים",
  imagination: "דמיון ויצירתיות",
  cognition: "חשיבה ותבונה",
  physiology: "עשייה וכוח פנימי",
};

export interface BlessingOption {
  word: string; // מילת הערך
  text: string; // נוסח הברכה
  channel: ResilienceChannel;
}

export interface LetterEntry {
  letter: string;
  icon: string;
  options: [BlessingOption, BlessingOption];
}

// מיפוי אותיות סופיות לאות רגילה
export const FINAL_LETTERS: Record<string, string> = {
  "ם": "מ",
  "ן": "נ",
  "ץ": "צ",
  "ף": "פ",
  "ך": "כ",
};

export const BLESSINGS: Record<string, LetterEntry> = {
  "א": {
    letter: "א", icon: "❤️",
    options: [
      { word: "אהבה", channel: "affect", text: "שאוביל את העשייה החינוכית מתוך חיבור רגשי, אכפתיות גדולה ולב פתוח." },
      { word: "אופטימיות", channel: "belief", text: "שאדע לראות את האור בכל התחלה, ואשמור על אמונה עמוקה בכוחות שלי ושל סובביי." },
    ],
  },
  "ב": {
    letter: "ב", icon: "🛡️",
    options: [
      { word: "ביטחון", channel: "belief", text: "שארגיש יציבות, חוסן פנימי וביטחון בדרך המקצועית שלי לאורך כל השנה." },
      { word: "בריאות", channel: "physiology", text: "שאשמור על איזון גופני ונפשי, ואטפח מרחב בטוח ומאפשר עבור תלמידיי וצוותי." },
    ],
  },
  "ג": {
    letter: "ג", icon: "🦋",
    options: [
      { word: "גמישות", channel: "cognition", text: "שאדע להתאים את עצמי לרוחות המשתנות ברכות, כמו עץ צעיר, מבלי לאבד את השורשים." },
      { word: "גדילה", channel: "belief", text: "שאצמיח הזדמנויות חדשות מתוך אתגרים, ואאפשר לעצמי להתפתח וללמוד ללא חשש." },
    ],
  },
  "ד": {
    letter: "ד", icon: "💡",
    options: [
      { word: "דמיון", channel: "imagination", text: "שארשה לעצמי לחלום, ליצור ולחשוב מחוץ לקופסה גם כשהשגרה מאתגרת." },
      { word: "דרך־ארץ", channel: "social", text: "שאבסס את כל עשייתי על כבוד הדדי, סובלנות ורוך אנושי בסיסי." },
    ],
  },
  "ה": {
    letter: "ה", icon: "⭐",
    options: [
      { word: "הקשבה", channel: "affect", text: "שאצליח לפנות שקט פנימי להקשבה עמוקה – קודם כל לעצמי, ואחר כך לאחרים." },
      { word: "השראה", channel: "imagination", text: "שאוכל להוות מקור של השראה, אור ותקווה בעבור כל מי שחוצה את דרכי." },
    ],
  },
  "ו": {
    letter: "ו", icon: "🧭",
    options: [
      { word: "ודאות", channel: "cognition", text: "שאמצא איים יציבים של ודאות, רוגע וביטחון בתוך מציאות משתנה." },
      { word: "ותק ועשייה", channel: "physiology", text: "שאכיר בערך הניסיון שלי ואתעל אותו ליצירת עשייה משמעותית ומדויקת." },
    ],
  },
  "ז": {
    letter: "ז", icon: "✨",
    options: [
      { word: "זרימה", channel: "affect", text: "שאחווה רגעים רבים של זרימה פנימית, מיקוד והנאה צרופה מהדרך." },
      { word: "זוהר", channel: "imagination", text: "שהניצוץ והאור הייחודיים שלי ימשיכו לזהור ולהאיר את המרחב החינוכי." },
    ],
  },
  "ח": {
    letter: "ח", icon: "🤗",
    options: [
      { word: "חמלה", channel: "affect", text: "שאדע לעטוף את עצמי ואת הסובבים אותי בחמלה, בסלחנות ובקבלה של חוסר השלמות." },
      { word: "חוסן", channel: "belief", text: "שאבנה ואחזק את משאבי החוסן שלי, כדי שאוכל להישען עליהם בעת הצורך." },
    ],
  },
  "ט": {
    letter: "ט", icon: "💛",
    options: [
      { word: "טוב־לב", channel: "social", text: "שהטוב שבי יהדהד החוצה, יגע בלבבות וייצור אדוות של חסד בצוות ובכיתה." },
      { word: "טוהר", channel: "belief", text: "שאפעל מתוך כוונות טהורות, יושר פנימי וראיית הטוב שבכל אדם." },
    ],
  },
  "י": {
    letter: "י", icon: "🚀",
    options: [
      { word: "יצירתיות", channel: "imagination", text: "שאביא לידי ביטוי את הקול הייחודי והיצירתי שלי בכל פרויקט חינוכי." },
      { word: "יוזמה", channel: "physiology", text: "שאלך תמיד צעד אחד קדימה באומץ, איזום חידושים ואעורר השראה סביבי." },
    ],
  },
  "כ": {
    letter: "כ", icon: "💪",
    options: [
      { word: "כוחות", channel: "physiology", text: "שאדע לזהות את מאגרי הכוח הפנימיים שלי, להטעין אותם ולהישען עליהם בעת עומס." },
      { word: "כבוד", channel: "social", text: "שאקפיד על מתן כבוד הדדי, הערכה ומקום ראוי לכל קול בצוות." },
    ],
  },
  "ל": {
    letter: "ל", icon: "📚",
    options: [
      { word: "למידה", channel: "cognition", text: "שאשאר סקרנ/ית, פתוח/ה תמיד להתחדשות ולצמיחה מתוך סקרנות אינסופית." },
      { word: "לב פתוח", channel: "affect", text: "שאנהל את המרחב החינוכי מתוך לב פתוח, רגישות ואמפתיה אמיתית." },
    ],
  },
  "מ": {
    letter: "מ", icon: "🌸",
    options: [
      { word: "משמעות", channel: "belief", text: "שהעשייה היומיומית שלי תהיה טעונה בתחושת שליחות ומשמעות עמוקה לנפש." },
      { word: "מנהיגות", channel: "social", text: "שאנהיג ברגישות, בחוכמה ובסמכות רגשית המעצימה את כל הסובבים אותי." },
    ],
  },
  "נ": {
    letter: "נ", icon: "🫶",
    options: [
      { word: "נתינה", channel: "social", text: "שאדע להעניק מתוכי בנדיבות, תוך שמירה על גבולות בריאים והזנת הנפש שלי." },
      { word: "נוכחות", channel: "affect", text: "שאנוכח/ת באופן מלא ומודע כאן ועכשיו, ברגעים הקטנים והגדולים." },
    ],
  },
  "ס": {
    letter: "ס", icon: "⏳",
    options: [
      { word: "סבלנות", channel: "cognition", text: "שאנשום עמוק אל תוך תהליכים מורכבים, ואאמין בזרעים שאני זורע/ת לאורך זמן." },
      { word: "סובלנות", channel: "social", text: "שאדע להכיל מגוון דעות, קולות וצרכים מתוך מרחב מכיל ומקבל." },
    ],
  },
  "ע": {
    letter: "ע", icon: "👑",
    options: [
      { word: "עוגן", channel: "belief", text: "שאהיה עוגן של שקט, יציבות ובטחון עבור עצמי, משפחתי ותלמידיי." },
      { word: "עוצמה", channel: "physiology", text: "שאגלה את האון והעוצמה הפנימית שבי להתמודד בהצלחה עם כל אתגר." },
    ],
  },
  "פ": {
    letter: "פ", icon: "🌷",
    options: [
      { word: "פליאה", channel: "affect", text: "שלא אאבד לעולם את היכולת להתפעל, להתרגש ולשמוח מהדברים הקטנים שבשגרה." },
      { word: "פרגון", channel: "social", text: "שאקפיד לפרגן, לחזק ולהרים לאחרים, מתוך אמונה שההצלחה של חברי היא גם שלי." },
    ],
  },
  "צ": {
    letter: "צ", icon: "🌱",
    options: [
      { word: "צמיחה", channel: "belief", text: "שאראה בכל קושי או משבר פתחון פה לצמיחה אישית, מקצועית וצוותית." },
      { word: "צדק", channel: "belief", text: "שאפעל תמיד מתוך יושרה, הוגנות וחתירה לצדק חינוכי וחברתי." },
    ],
  },
  "ק": {
    letter: "ק", icon: "🕊️",
    options: [
      { word: "קבלה", channel: "affect", text: "שאקבל באהבה את מה שאין ביכולתי לשנות, ואתמקד במה שבידי להשפיע." },
      { word: "קהילתיות", channel: "social", text: "שאחווה שייכות עמוקה ואמצא בקהילה שלי מעטפת חמה, תומכת ומפרה." },
    ],
  },
  "ר": {
    letter: "ר", icon: "🍃",
    options: [
      { word: "רוגע", channel: "physiology", text: "שאמצא רגעים קדושים של שקט, איזון ונשימה עמוקה בתוך שאון השגרה." },
      { word: "רגישות", channel: "affect", text: "שאשמור על רגישות מדויקת לצרכים של האחר מבלי לאבד את הגבולות שלי." },
    ],
  },
  "ש": {
    letter: "ש", icon: "🤝",
    options: [
      { word: "שייכות", channel: "social", text: "שארגיש חלק בלתי נפרד ממרחב משפחתי וצוותי שמחבק, מעריך ומאמין בי." },
      { word: "שמחה", channel: "affect", text: "שאכניס שמחה, חיוך ואנרגיה טובה לכל מפגש ולכל אתגר שאפגוש בדרך." },
    ],
  },
  "ת": {
    letter: "ת", icon: "🌈",
    options: [
      { word: "תקווה", channel: "belief", text: "שתמיד תפעם בי תקווה חסרת פשרות, ואדע לצייר תמונת עתיד מיטיבה ומאירה." },
      { word: "תבונה", channel: "cognition", text: "שאפעל מתוך תבונה רגשית, ראיית הנולד ובחירות שקולות ומטיבות." },
    ],
  },
};

// פירוק שם לאותיות עבריות בלבד, כולל מיפוי אותיות סופיות
export function splitName(name: string): string[] {
  return [...name.trim()]
    .map((ch) => FINAL_LETTERS[ch] ?? ch)
    .filter((ch) => BLESSINGS[ch] !== undefined);
}
