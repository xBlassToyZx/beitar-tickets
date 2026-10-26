"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container page" style={{ textAlign: "center" }}>
      <h1>משהו השתבש</h1>
      <p className="lead" style={{ marginInline: "auto" }}>
        לא הצלחנו לטעון את הדף. נסה שוב בעוד רגע.
      </p>
      <p style={{ marginTop: 24 }}>
        <button type="button" className="btn" onClick={reset}>
          נסה שוב
        </button>
      </p>
    </div>
  );
}
