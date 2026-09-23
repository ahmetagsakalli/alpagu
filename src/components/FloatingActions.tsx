import Link from "next/link";
import { Heart, Phone } from "lucide-react";
import { getContent } from "@/lib/cms/content-store";
import { phoneHref, instagramName } from "@/lib/cms/schema";

export default async function FloatingActions() {
  const { organization } = await getContent();
  return (
    <nav aria-label="Hızlı iletişim ve destek">
      <a
        className="floating-action floating-call"
        href={phoneHref(organization.phone)}
        aria-label={`Alpagu Derneğini arayın: ${organization.phone}`}
        title="Bizi arayın"
      >
        <Phone size={24} strokeWidth={2} aria-hidden="true" />
      </a>
      <Link
        className="floating-action floating-support"
        href="/bagis"
        aria-label="Destek olun"
        title="Destek olun"
      >
        <Heart
          size={25}
          fill="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>
    </nav>
  );
}
