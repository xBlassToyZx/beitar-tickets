import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { TicketCard } from "@/components/wallet/TicketCard";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { getWallet } from "@/server/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "הכרטיסים שלי" };

type Props = { searchParams: Promise<{ purchased?: string }> };

export default async function WalletPage({ searchParams }: Props) {
  const [tickets, { purchased }] = await Promise.all([
    getWallet(db, await getBuyerId()),
    searchParams,
  ]);
  const withQr = await Promise.all(
    tickets.map(async (t) => ({
      ticket: t,
      qr: await QRCode.toString(`BT-DEMO|${t.kind}|${t.code}`, {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
        color: { dark: "#1d1d1f", light: "#ffffff" },
      }),
    })),
  );

  return (
    <div className="container page">
      <div className="eyebrow">ארנק</div>
      <h1>הכרטיסים שלי</h1>
      <p className="lead">הצג את קוד ה-QR בשער הכניסה.</p>

      {purchased && tickets.length > 0 && (
        <p className="alert alert-ok" style={{ marginTop: 24 }} role="status">
          הרכישה הושלמה. הכרטיסים נוספו לארנק.
        </p>
      )}

      {tickets.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            marginTop: 28,
            textAlign: "center",
            display: "grid",
            gap: 10,
            justifyItems: "center",
          }}
        >
          <h3>אין עדיין כרטיסים</h3>
          <p className="note" style={{ margin: 0 }}>
            כרטיסים שתרכוש יופיעו כאן עם קוד QR לכניסה.
          </p>
          <Link href="/" className="btn">
            למשחקים הקרובים
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
            gap: 20,
            marginTop: 32,
          }}
        >
          {withQr.map(({ ticket, qr }) => (
            <TicketCard key={ticket.id} ticket={ticket} qrSvg={qr} />
          ))}
        </div>
      )}
    </div>
  );
}
