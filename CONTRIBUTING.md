# תרומה לפרויקט

## תהליך עבודה

1. פותחים ענף מ-`main` לפי סוג השינוי: `feature/...`, `fix/...`, `chore/...`.
2. עובדים בקומיטים קטנים עם הודעות ברורות לפי [Conventional Commits](https://www.conventionalcommits.org/):
   `feat: add seat legend`, `fix: release expired holds on checkout`.
3. לפני פתיחת Pull Request מריצים:
   ```bash
   npm run format && npm run lint && npm run typecheck && npm test
   ```
4. פותחים Pull Request ל-`main`. ה-CI מריץ את כל הבדיקות ואת הבנייה, וצריך לעבור לפני מיזוג.

## סטנדרטים

- **שפה בקוד:** שמות משתנים, פונקציות והערות באנגלית. טקסט שמוצג למשתמש בעברית.
- **שכבות:** לוגיקה עסקית טהורה נכנסת ל-`src/domain`, גישה למסד הנתונים ל-`src/server`. רכיבי UI לא ניגשים ל-Prisma.
- **שינויים במודל הנתונים:** עורכים את `prisma/schema.prisma` ומריצים `npx prisma migrate dev --name <שם>`. לא עורכים migrations שכבר מוזגו.
- **כסף:** תמיד באגורות כמספר שלם (`priceAgorot`), ומציגים עם `formatILS`.
- **בדיקות:** כל חוק עסקי חדש (מגבלות, זמינות, תשלום) מקבל בדיקה ב-`tests/integration`.
- **מבנה האצטדיון:** כל שינוי בגושים נעשה ב-`src/domain/stadium/sections.ts` בלבד. ה-seed והמפה קוראים משם.
