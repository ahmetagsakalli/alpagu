"use client";
import { useState } from "react";
import { Check, Copy, Landmark, ArrowUpRight } from "lucide-react";
import type { Organization } from "@/lib/cms/schema";
export default function Donation({
  organization,
  note,
}: {
  organization: Organization;
  note: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        organization.iban.replaceAll(" ", ""),
      );
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }
  return (
    <div className="donation-card">
      <div className="donation-card-heading">
        <span className="icon-box">
          <Landmark size={24} />
        </span>
        <div>
          <h2>Banka hesabıyla destek olun</h2>
        </div>
      </div>
      <div className="bank-details">
        <div>
          <span>Banka</span>
          <strong>{organization.bank}</strong>
        </div>
        <div>
          <span>Alıcı adı</span>
          <strong>{organization.accountName}</strong>
        </div>
        <div>
          <span>IBAN</span>
          <strong className="iban">{organization.iban}</strong>
        </div>
      </div>
      <button className="button copy-button" onClick={copy}>
        {copied ? <Check size={18} /> : <Copy size={18} />}{" "}
        {copied ? "IBAN kopyalandı" : "IBAN’ı kopyala"}
      </button>
      <p role="status" className="copy-status">
        {failed
          ? "Kopyalama yapılamadı. IBAN metnini seçerek kopyalayabilirsiniz."
          : copied
            ? "IBAN panonuza kopyalandı. Bankanızın uygulamasında kullanabilirsiniz."
            : ""}
      </p>
      <p className="donation-note">{note}</p>
      <a
        className="text-link"
        href={organization.donationSource}
        target="_blank"
        rel="noopener noreferrer"
      >
        Derneğin bağış duyurusunu görüntüle <ArrowUpRight size={17} />
      </a>
    </div>
  );
}
