import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section container not-found">
      <h1>Bu sayfaya ulaşamadık.</h1>
      <p>
        Aradığınız içerik taşınmış olabilir. İyilik yolculuğumuza ana sayfadan
        devam edebilirsiniz.
      </p>
      <Link href="/" className="button">
        Ana Sayfaya Dön
      </Link>
    </section>
  );
}
