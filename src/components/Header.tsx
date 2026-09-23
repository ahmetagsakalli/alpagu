"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, X } from "lucide-react";

const links = [
  ["/", "Ana Sayfa"],
  ["/hakkimizda", "Hakkımızda"],
  ["/projeler", "Çalışmalarımız"],
  ["/gonullu-ol", "Gönüllü Ol"],
  ["/iletisim", "İletişim"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header
      className={`site-header ${pathname === "/" ? "site-header-overlay" : ""}`}
    >
      <Link
        className="site-brand"
        href="/"
        onClick={() => setOpen(false)}
        aria-label="Alpagu Derneği ana sayfa"
      >
        <Image
          src="/images/logo.webp"
          width={58}
          height={58}
          alt="Alpagu Derneği logosu"
        />
        <span>
          <strong>Alpagu</strong>
          <small>
            EĞİTİM, ARAŞTIRMA VE
            <br />
            YARDIMLAŞMA DERNEĞİ
          </small>
        </span>
      </Link>
      <nav
        aria-label="Ana menü"
        className={`site-nav ${open ? "is-open" : ""}`}
        id="main-navigation"
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={
              (href === "/" ? pathname === "/" : pathname.startsWith(href))
                ? "page"
                : undefined
            }
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="site-header-actions">
        <Link
          href="/bagis"
          className="site-donate"
          onClick={() => setOpen(false)}
        >
          <Heart size={15} fill="currentColor" /> <span>Destek Ol</span>
        </Link>
        <button
          className="site-menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}
