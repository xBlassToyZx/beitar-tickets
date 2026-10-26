import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container page" style={{ textAlign: "center" }}>
      <h1>הדף לא נמצא</h1>
      <p className="lead" style={{ marginInline: "auto" }}>
        הקישור שגוי או שהדף הוסר.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/" className="btn">
          לדף הבית
        </Link>
      </p>
    </div>
  );
}
