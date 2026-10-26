import Link from "next/link";

export default function MatchNotFound() {
  return (
    <div className="container page" style={{ textAlign: "center" }}>
      <h1>המשחק לא נמצא</h1>
      <p className="lead" style={{ marginInline: "auto" }}>
        ייתכן שהמכירה הסתיימה או שהקישור שגוי.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/" className="btn">
          לכל המשחקים
        </Link>
      </p>
    </div>
  );
}
