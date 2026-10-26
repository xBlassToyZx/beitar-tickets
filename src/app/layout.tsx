import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: 'בית"ר ירושלים | כרטיסים למשחקים', template: '%s · בית"ר ירושלים | כרטיסים' },
  description:
    "בחירת מושב באצטדיון טדי, מנויים עונתיים וכרטיסים דיגיטליים. פרויקט לימודי עם נתוני דמה.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div className="demo-banner" role="note">
          פרויקט לימודי · נתוני דמה · לא אתר רשמי של המועדון ולא מוכר כרטיסים אמיתיים
        </div>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
