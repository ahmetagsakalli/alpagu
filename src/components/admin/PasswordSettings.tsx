"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";

export type PasswordChange = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function PasswordSettings({
  busy,
  onChange,
}: {
  busy: boolean;
  onChange: (values: PasswordChange) => Promise<boolean>;
}) {
  const [values, setValues] = useState(empty);
  const [visible, setVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onChange(values)) {
      setValues(empty);
      setVisible(false);
    }
  }

  return (
    <form className="adm-card adm-password-form" onSubmit={submit}>
      {[
        {
          name: "currentPassword",
          label: "Mevcut şifre",
          complete: "current-password",
        },
        { name: "newPassword", label: "Yeni şifre", complete: "new-password" },
        {
          name: "confirmPassword",
          label: "Yeni şifre (tekrar)",
          complete: "new-password",
        },
      ].map(({ name, label, complete }) => (
        <label className="adm-field" key={name}>
          <span id={`password-label-${name}`}>{label}</span>
          <input
            name={name}
            aria-labelledby={`password-label-${name}`}
            aria-describedby={
              name === "newPassword" ? "password-help" : undefined
            }
            type={visible ? "text" : "password"}
            autoComplete={complete}
            minLength={name === "currentPassword" ? undefined : 8}
            maxLength={256}
            required
            value={values[name as keyof PasswordChange]}
            onChange={(e) => setValues({ ...values, [name]: e.target.value })}
          />
          {name === "newPassword" && (
            <small id="password-help">En az 8 karakter kullanın.</small>
          )}
        </label>
      ))}
      <label className="adm-password-visibility">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
        />
        Şifreleri göster
      </label>
      <p className="adm-help">
        Şifreniz değiştiğinde diğer cihazlardaki açık oturumlar kapatılır.
      </p>
      <button className="adm-button" type="submit" disabled={busy}>
        <KeyRound size={18} />
        {busy ? "Değiştiriliyor…" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}
