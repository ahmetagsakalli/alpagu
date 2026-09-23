import Instagram from "@/components/InstagramIcon";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { organization } from "@/lib/content";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.main}>
          <div className={styles.about}>
            <Link
              href="/"
              className={styles.brand}
              aria-label="Alpagu Derneği ana sayfa"
            >
              <Image src="/images/logo.webp" width={64} height={64} alt="" />
              <span>
                <strong>ALPAGU</strong>
                <small>
                  EĞİTİM, ARAŞTIRMA VE
                  <br />
                  YARDIMLAŞMA DERNEĞİ
                </small>
              </span>
            </Link>
            <p>
              Şehit Kütüphaneleri, eğitim desteği ve gönüllülük çalışmaları.
            </p>
            <a
              href={organization.instagram}
              className={styles.social}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={18} /> @alpagudernegi{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <nav className={styles.navigation} aria-label="Alt menü">
            <div className={styles.column}>
              <h3>Derneğimiz</h3>
              <ul>
                <li>
                  <Link href="/hakkimizda">Hakkımızda</Link>
                </li>
                <li>
                  <Link href="/projeler">Çalışmalarımız</Link>
                </li>
                <li>
                  <Link href="/projeler/sehit-kutuphaneleri">
                    Şehit Kütüphaneleri
                  </Link>
                </li>
              </ul>
            </div>
            <div className={styles.column}>
              <h3>Katkıda bulunun</h3>
              <ul>
                <li>
                  <Link href="/bagis">Bağış ve Destek</Link>
                </li>
                <li>
                  <Link href="/gonullu-ol">Gönüllü Ol</Link>
                </li>
                <li>
                  <Link href="/iletisim">Bize Ulaşın</Link>
                </li>
              </ul>
            </div>
          </nav>
          <div className={styles.contact}>
            <h3>İletişim</h3>
            <address>
              <a href={organization.phoneHref} className={styles.phone}>
                <Phone size={18} aria-hidden="true" />
                {organization.phone}
              </a>
              <a href={`mailto:${organization.email}`}>
                <Mail size={17} aria-hidden="true" />
                <span>{organization.email}</span>
              </a>
              <span className={styles.location}>
                <MapPin size={17} aria-hidden="true" />
                İzmir, Türkiye
              </span>
            </address>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} Alpagu Derneği. Tüm hakları saklıdır.
          </span>
          <span className={styles.credit}>
            <span>Web Tasarım, Uygulama ve Geliştirme:</span>{" "}
            <a
              href="https://kocyigityazilim.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              kocyigityazilim.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
