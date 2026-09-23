"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="adm-loading">
      <h1>Panel yüklenemedi.</h1>
      <p>Lütfen yeniden deneyin.</p>
      <button className="adm-button" onClick={reset}>
        Yeniden dene
      </button>
    </div>
  );
}
