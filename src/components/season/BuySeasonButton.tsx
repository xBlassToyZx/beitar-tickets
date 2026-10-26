"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";

interface Props {
  planId: string;
  planName: string;
  priceLabel: string;
  disabled: boolean;
  isOwned: boolean;
}

export function BuySeasonButton({ planId, planName, priceLabel, disabled, isOwned }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isOwned) return <span className="pill pill-ok">המנוי שלך</span>;

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/season-tickets", { method: "POST", body: { planId } });
      router.push("/wallet?purchased=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "הרכישה נכשלה. נסה שוב.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button type="button" className="btn" disabled={disabled} onClick={() => setConfirming(true)}>
        רכוש מנוי
      </button>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8, width: "100%" }}>
      <p className="alert alert-ok" style={{ margin: 0 }}>
        מנוי {planName} · {priceLabel}. תשלום דמה, שום כסף לא יחויב.
      </p>
      {error && (
        <p className="alert alert-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={buy} disabled={busy}>
          {busy ? "מעבד…" : "אשר רכישה (דמה)"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setConfirming(false)}
          disabled={busy}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
