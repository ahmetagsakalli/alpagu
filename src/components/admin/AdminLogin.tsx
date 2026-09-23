"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminLogin({
  password,
  onPasswordChange,
  onSubmit,
  busy,
  error,
}: {
  password: string;
  onPasswordChange: (password: string) => void;
  onSubmit: (event: FormEvent) => void;
  busy: boolean;
  error: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <main className="adm-login">
      <div className="adm-login-visual">
        <Image
          className="adm-login-photo"
          src="/images/library.webp"
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 46vw"
          loading="eager"
          fetchPriority="high"
          quality={75}
        />
        <a
          className="adm-login-brand"
          href="/"
          aria-label="Alpagu Derneği ana sayfa"
        >
          <Image src="/images/logo.webp" alt="" width={64} height={64} />
          <span>Alpagu Derneği</span>
        </a>
        <div className="adm-login-message">
          <p>
            Çocukların
            <br />
            yarınları için.
          </p>
          <span aria-hidden="true" />
        </div>
      </div>
      <div className="adm-login-panel">
        <form className="adm-login-card" onSubmit={onSubmit}>
          <h1>Yönetim Paneli</h1>
          <div className="adm-field">
            <label htmlFor="admin-login-password">Yönetim şifresi</label>
            <div className="adm-login-password">
              <input
                id="admin-login-password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                required
                maxLength={256}
                disabled={busy}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
              <button
                className="adm-login-reveal"
                type="button"
                aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
                aria-pressed={visible}
                aria-controls="admin-login-password"
                disabled={busy}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && (
            <p className="adm-alert error" role="alert">
              {error}
            </p>
          )}
          <button className="adm-button" type="submit" disabled={busy}>
            {busy ? "Giriş yapılıyor…" : "Giriş yap"}
            <ArrowRight size={20} />
          </button>
          <a href="/" className="adm-return">
            Siteye dön
          </a>
        </form>
      </div>
    </main>
  );
}
