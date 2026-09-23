"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section container not-found">
      <h1>Sayfa yüklenemedi.</h1>
      <p>Geçici bir sorun oluştu. Lütfen yeniden deneyin.</p>
      <button className="button" onClick={reset}>
        Yeniden Dene
      </button>
    </section>
  );
}
