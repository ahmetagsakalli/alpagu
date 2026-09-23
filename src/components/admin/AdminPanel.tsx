"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Heart,
  HelpCircle,
  History,
  Home,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import {
  uniqueSlug,
  type ContentRecord,
  type SiteContent,
  type PageKey,
  type Snapshot,
} from "@/lib/cms/schema";
import MediaPicker, { previewUrl } from "./MediaPicker";
import PasswordSettings, { type PasswordChange } from "./PasswordSettings";
type HistoryItem = Omit<Snapshot, "content">;
type RecordResponse = Omit<ContentRecord, "history"> & {
  history: HistoryItem[];
  csrf?: string;
};
const navigation = [
  { id: "dashboard", label: "Genel bakış", icon: LayoutDashboard },
  { id: "home", label: "Ana sayfa", icon: Home },
  { id: "pages", label: "Sayfalar", icon: FileText },
  { id: "projects", label: "Çalışmalar", icon: BookOpen },
  { id: "news", label: "Haberler", icon: Newspaper },
  { id: "faqs", label: "Sık sorulan sorular", icon: HelpCircle },
  { id: "media", label: "Görsel kitaplığı", icon: ImageIcon },
  { id: "organization", label: "Site bilgileri", icon: Settings },
  { id: "history", label: "Kayıt geçmişi", icon: History },
  { id: "password", label: "Şifre değiştir", icon: KeyRound },
];
const pageLabels: Record<PageKey, string> = {
  hakkimizda: "Hakkımızda",
  bagis: "Bağış ve Destek",
  "gonullu-ol": "Gönüllü Ol",
  iletisim: "İletişim",
  gizlilik: "Gizlilik",
  projeler: "Çalışmalar sayfası",
};
function valueAt(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, k) =>
        v && typeof v === "object"
          ? (v as Record<string, unknown>)[k]
          : undefined,
      obj,
    );
}
function setAt(obj: SiteContent, path: string, value: unknown) {
  const keys = path.split(".");
  let target = obj as unknown as Record<string, unknown>;
  for (const k of keys.slice(0, -1))
    target = target[k] as Record<string, unknown>;
  target[keys.at(-1)!] = value;
}
function readableDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
export default function AdminPanel() {
  const [phase, setPhase] = useState<"loading" | "login" | "ready">("loading"),
    [draft, setDraft] = useState<SiteContent | null>(null),
    [record, setRecord] = useState<RecordResponse | null>(null),
    [csrf, setCsrf] = useState("");
  const [section, setSection] = useState("dashboard"),
    [page, setPage] = useState<PageKey>("hakkimizda"),
    [selectedProject, setSelectedProject] = useState(""),
    [selectedNews, setSelectedNews] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [menu, setMenu] = useState(false),
    [password, setPassword] = useState(""),
    [mediaPath, setMediaPath] = useState<string | null>(null),
    [libraryOpen, setLibraryOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const dirty = Boolean(
    draft && record && JSON.stringify(draft) !== JSON.stringify(record.content),
  );
  useEffect(() => {
    let active = true;
    fetch("/api/admin/content", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          if (active) setPhase("login");
          return;
        }
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (active) {
          setRecord(d);
          setDraft(structuredClone(d.content));
          setCsrf(d.csrf);
          setPhase("ready");
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setPhase("login");
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);
  async function api(url: string, payload?: unknown) {
    const r = await fetch(`/api/admin/${url}`, {
      method: payload === undefined ? "GET" : "POST",
      headers:
        payload === undefined
          ? {}
          : { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      cache: "no-store",
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "İşlem tamamlanamadı.");
    return d;
  }
  function accept(data: RecordResponse) {
    setRecord(data);
    setDraft(structuredClone(data.content));
    if (data.csrf) setCsrf(data.csrf);
  }
  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await api("login", { password });
      setCsrf(session.csrf);
      setPassword("");
      accept(await api("content"));
      setPhase("ready");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!draft || !record) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const d = await api("content", {
        content: draft,
        revision: record.revision,
        label: `${navigation.find((n) => n.id === section)?.label || "İçerik"} güncellendi`,
      });
      accept(d);
      setNotice("Değişiklikler kaydedildi ve sitede yayımlandı.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function restore(item: HistoryItem) {
    if (
      !record ||
      !window.confirm(
        `${readableDate(item.updatedAt)} tarihindeki tüm içerikler geri yüklenecek ve sitede yayımlanacak. Devam edilsin mi?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      accept(
        await api("restore", {
          revision: record.revision,
          targetRevision: item.revision,
        }),
      );
      setNotice("Seçilen sürüm geri yüklendi ve yayımlandı.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    if (
      dirty &&
      !window.confirm("Kaydedilmemiş değişiklikleriniz var. Çıkış yapılsın mı?")
    )
      return;
    setBusy(true);
    try {
      await api("logout", {});
      setDraft(null);
      setRecord(null);
      setCsrf("");
      setNotice("");
      setError("");
      setPhase("login");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updatePassword(values: PasswordChange) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api("password", values);
      setCsrf(result.csrf);
      setNotice("Şifreniz değiştirildi. Diğer açık oturumlar kapatıldı.");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function update(path: string, value: unknown) {
    setDraft((old) => {
      if (!old) return old;
      const next = structuredClone(old);
      setAt(next, path, value);
      return next;
    });
    setNotice("");
  }
  function navigate(id: string) {
    if (id === "media") {
      setLibraryOpen(true);
      setMenu(false);
      return;
    }
    setSection(id);
    setMenu(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => heading.current?.focus(), 0);
  }
  function move(path: string, index: number, delta: number) {
    const items = [...(valueAt(draft, path) as unknown[])];
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    [items[index], items[to]] = [items[to], items[index]];
    update(path, items);
  }
  function remove(path: string, index: number) {
    if (
      !window.confirm(
        "Bu kaydı kaldırmak istiyor musunuz? Değişiklik Kaydet ile uygulanır.",
      )
    )
      return;
    update(
      path,
      (valueAt(draft, path) as unknown[]).filter((_, i) => i !== index),
    );
  }
  function field(
    path: string,
    label: string,
    multiline = false,
    help?: string,
  ) {
    const value = String(valueAt(draft, path) ?? "");
    return (
      <label className={`adm-field ${multiline ? "wide" : ""}`} key={path}>
        <span>{label}</span>
        {multiline ? (
          <textarea
            value={value}
            rows={value.length > 250 ? 5 : 3}
            onChange={(e) => update(path, e.target.value)}
          />
        ) : (
          <input value={value} onChange={(e) => update(path, e.target.value)} />
        )}{" "}
        {help && <small>{help}</small>}
      </label>
    );
  }
  function lines(path: string, label: string) {
    const items = (valueAt(draft, path) as string[]) || [];
    return (
      <label className="adm-field wide" key={path}>
        <span>{label}</span>
        <textarea
          rows={Math.max(4, Math.min(10, items.length * 2))}
          value={items.join("\n\n")}
          onChange={(e) =>
            update(path, e.target.value ? e.target.value.split(/\n\n/) : [])
          }
        />
        <small>Her yeni paragraf veya madde için bir boş satır bırakın.</small>
      </label>
    );
  }
  function photo(path: string, label: string) {
    const url = String(valueAt(draft, path) || "");
    return (
      <div className="adm-photo-field" key={path}>
        <div className="adm-photo-preview">
          {url && (
            <Image
              src={previewUrl(url)}
              alt="Seçili görselin önizlemesi"
              fill
              sizes="(max-width:700px) 80vw, 300px"
              unoptimized
            />
          )}
        </div>
        <div>
          <strong>{label}</strong>
          <p>Fotoğrafı değiştirin veya kitaplıktan seçin.</p>
          <button
            className="adm-button secondary"
            onClick={() => setMediaPath(path)}
          >
            <ImageIcon size={17} />
            Görseli değiştir
          </button>
        </div>
      </div>
    );
  }
  function seo(path: string) {
    return (
      <details className="adm-card adm-seo">
        <summary>
          Arama motoru ve paylaşım ayarları <ChevronRight size={18} />
        </summary>
        <div className="adm-form-grid">
          {field(`${path}.title`, "Arama sonucu başlığı")}
          {field(`${path}.description`, "Arama sonucu açıklaması", true)}
          {photo(`${path}.image`, "Sosyal medya paylaşım görseli")}
        </div>
      </details>
    );
  }
  function switches(path: string, label: string, help?: string) {
    return (
      <label className="adm-toggle" key={path}>
        <input
          type="checkbox"
          checked={Boolean(valueAt(draft, path))}
          onChange={(e) => update(path, e.target.checked)}
        />
        <span>
          <strong>{label}</strong>
          {help && <small>{help}</small>}
        </span>
      </label>
    );
  }
  function orderButtons(path: string, i: number, total: number) {
    return (
      <div className="adm-order">
        <button
          className="adm-icon-button"
          disabled={i === 0}
          onClick={() => move(path, i, -1)}
          aria-label="Yukarı taşı"
        >
          <ArrowUp size={16} />
        </button>
        <button
          className="adm-icon-button"
          disabled={i === total - 1}
          onClick={() => move(path, i, 1)}
          aria-label="Aşağı taşı"
        >
          <ArrowDown size={16} />
        </button>
      </div>
    );
  }
  function addProject() {
    if (!draft) return;
    const id = crypto.randomUUID(),
      title = "Yeni çalışma";
    const p = {
      id,
      slug: `yeni-calisma-${id.slice(0, 6)}`,
      title,
      image: "/images/library.webp",
      alt: "Çalışmamızdan bir fotoğraf",
      summary: "",
      lead: "",
      paragraphs: [""],
      needs: [],
      impact: "",
      impactLabel: "",
      published: false,
      featured: false,
      seo: {
        title,
        description: "Çalışmamız hakkında ayrıntılı bilgi.",
        image: "/images/library.webp",
      },
    };
    update("projects", [...draft.projects, p]);
    setSelectedProject(id);
  }
  function addNews() {
    if (!draft) return;
    const id = crypto.randomUUID();
    update("news", [
      ...draft.news,
      {
        id,
        title: "Yeni haber",
        text: "",
        image: "/images/news-story.webp",
        alt: "Derneğimizden haber",
        href: draft.organization.instagram,
        published: false,
      },
    ]);
    setSelectedNews(id);
  }
  if (phase === "loading")
    return (
      <div className="adm-loading" role="status">
        <Image src="/images/logo.webp" alt="" width={64} height={64} />
        <p>Yönetim paneli hazırlanıyor…</p>
      </div>
    );
  if (phase === "login")
    return (
      <main className="adm-login">
        <form className="adm-login-card" onSubmit={signIn}>
          <div className="adm-login-heading">
            <Image
              src="/images/logo.webp"
              alt="Alpagu Derneği"
              width={88}
              height={88}
            />
            <h1>Yönetim Paneli</h1>
          </div>
          <label className="adm-field">
            <span>Yönetim şifresi</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              required
              maxLength={256}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </label>
          {error && (
            <p className="adm-alert error" role="alert">
              {error}
            </p>
          )}
          <button className="adm-button" type="submit" disabled={busy}>
            {busy ? "Giriş yapılıyor…" : "Giriş yap"}
            <ArrowUpRight size={19} />
          </button>
        </form>
        <a href="/" className="adm-return">
          Alpagu Derneği sitesine dön <ExternalLink size={14} />
        </a>
      </main>
    );
  if (!draft || !record) return null;
  const active = navigation.find((n) => n.id === section)!;
  const projectIndex = draft.projects.findIndex(
    (p) => p.id === (selectedProject || draft.projects[0]?.id),
  );
  const newsIndex = draft.news.findIndex(
    (n) => n.id === (selectedNews || draft.news[0]?.id),
  );
  return (
    <div className="adm-shell">
      {menu && (
        <button
          className="adm-menu-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`adm-sidebar ${menu ? "open" : ""}`}>
        <a
          className="adm-brand"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/images/logo.webp" alt="" width={44} height={44} />
          <span>ALPAGU</span>
        </a>
        <nav aria-label="Yönetim menüsü">
          {navigation.map((n) => (
            <button
              key={n.id}
              className={section === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
              aria-current={section === n.id ? "page" : undefined}
            >
              <n.icon size={19} />
              {n.label}
              {section === n.id && <span />}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-bottom">
          <button onClick={signOut} disabled={busy}>
            <LogOut size={18} />
            Çıkış yap
          </button>
        </div>
      </aside>
      <div className="adm-workspace">
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button
              className="adm-icon-button adm-menu-button"
              aria-label="Yönetim menüsünü aç"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span>Yönetim</span>
            <ChevronRight size={14} />
            <strong>{active.label}</strong>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-view-site"
          >
            Siteyi görüntüle <ExternalLink size={16} />
          </a>
        </header>
        <main className="adm-main">
          <div className="adm-page-heading">
            <div>
              <h1 ref={heading} tabIndex={-1}>
                {active.label}
              </h1>
              <p>
                {section === "dashboard"
                  ? "İçeriklerinizi buradan güncel tutabilirsiniz."
                  : section === "history"
                    ? "Önceki kayıtları inceleyin ve gerektiğinde geri yükleyin."
                    : section === "password"
                      ? "Yönetim paneline giriş için kullandığınız şifreyi güncelleyin."
                      : "Değişiklikleriniz Kaydet düğmesine bastığınızda sitede yayımlanır."}
              </p>
            </div>
            {section !== "password" && (
              <div className="adm-save-area">
                <span className={dirty ? "unsaved" : ""}>
                  {dirty
                    ? "Kaydedilmemiş değişiklikler"
                    : "Tüm değişiklikler kaydedildi"}
                </span>
                <button
                  className="adm-button"
                  onClick={save}
                  disabled={busy || !dirty}
                >
                  <Save size={18} />
                  {busy ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            )}
          </div>
          {(error || notice) && (
            <div
              role={error ? "alert" : "status"}
              className={`adm-alert ${error ? "error" : "success"}`}
            >
              {error || notice}
              <button
                aria-label="Bildirimi kapat"
                onClick={() => {
                  setError("");
                  setNotice("");
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <fieldset className="adm-editor-fieldset" disabled={busy}>
            {section === "dashboard" && (
              <>
                <div className="adm-welcome">
                  <div>
                    <h2>
                      Her güncel bilgi,
                      <br />
                      yeni bir bağ kurar.
                    </h2>
                    <p>
                      Çalışmalarınızı paylaşın, haberlerinizi duyurun ve
                      destekçilerinizin size ulaşmasını kolaylaştırın.
                    </p>
                    <button
                      className="adm-button"
                      onClick={() => navigate("home")}
                    >
                      Ana sayfayı düzenle <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <BookOpen size={148} strokeWidth={0.7} aria-hidden="true" />
                </div>
                <div className="adm-stats">
                  {[
                    {
                      n: draft.projects.filter((p) => p.published).length,
                      title: "Yayımlanan çalışma",
                      icon: BookOpen,
                      id: "projects",
                    },
                    {
                      n: draft.news.filter((p) => p.published).length,
                      title: "Ana sayfadaki haber",
                      icon: Newspaper,
                      id: "news",
                    },
                    {
                      n: draft.faqs.length,
                      title: "Sık sorulan soru",
                      icon: HelpCircle,
                      id: "faqs",
                    },
                  ].map((x) => (
                    <button key={x.id} onClick={() => navigate(x.id)}>
                      <x.icon size={21} />
                      <strong>{x.n}</strong>
                      <span>{x.title}</span>
                      <ArrowUpRight size={19} />
                    </button>
                  ))}
                </div>
                <div className="adm-card">
                  <div className="adm-card-heading">
                    <h2>Hızlı erişim</h2>
                    <span>En sık kullanılan alanlar</span>
                  </div>
                  <div className="adm-quick-links">
                    {[
                      {
                        label: "Yeni çalışma ekleyin",
                        text: "Çalışmalarınızı fotoğraf ve ayrıntılarıyla paylaşın.",
                        icon: BookOpen,
                        fn: () => {
                          navigate("projects");
                          addProject();
                        },
                      },
                      {
                        label: "İletişim ve bağış bilgileri",
                        text: "Telefon, sosyal medya ve banka bilgilerini düzenleyin.",
                        icon: Heart,
                        fn: () => navigate("organization"),
                      },
                      {
                        label: "Önceki kayıtlar",
                        text: "Yapılan değişikliklere göz atın, eski sürüme dönün.",
                        icon: History,
                        fn: () => navigate("history"),
                      },
                    ].map((x) => (
                      <button key={x.label} onClick={x.fn}>
                        <x.icon size={22} />
                        <div>
                          <strong>{x.label}</strong>
                          <span>{x.text}</span>
                        </div>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="adm-last-save">
                  <Clock3 size={15} />
                  Son kayıt: {readableDate(record.updatedAt)}
                </p>
              </>
            )}
            {section === "home" && (
              <>
                <div className="adm-card">
                  <h2>Karşılama alanı</h2>
                  <div className="adm-form-grid">
                    {field("home.title", "Büyük başlık")}
                    {field("home.subtitle", "Alt metin")}
                    {photo("home.image", "Ana görsel")}
                    {field("home.alt", "Görsel açıklaması")}
                    {field("home.primaryLabel", "İlk buton metni")}
                    {field("home.primaryHref", "İlk buton bağlantısı")}
                    {field("home.secondaryLabel", "İkinci buton metni")}
                    {field("home.secondaryHref", "İkinci buton bağlantısı")}
                  </div>
                </div>
                <div className="adm-card">
                  <h2>Dernek tanıtımı</h2>
                  <div className="adm-form-grid">
                    {field("home.aboutTitle", "Tanıtım başlığı", true)}
                    {field("home.aboutIntro", "Giriş cümlesi")}
                    {field("home.aboutSince", "Vurgulanan metin")}
                    {lines("home.aboutParagraphs", "Tanıtım metinleri")}
                    {photo("home.aboutImage", "Tanıtım fotoğrafı")}
                    {field("home.aboutAlt", "Fotoğraf açıklaması")}
                  </div>
                </div>
                <div className="adm-card">
                  <h2>Rakamlarla Alpagu</h2>
                  <div className="adm-form-grid">
                    {draft.stats.map((_, i) => (
                      <div className="adm-inset" key={i}>
                        {field(`stats.${i}.value`, `${i + 1}. değer`)}
                        {field(`stats.${i}.label`, "Açıklama")}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="adm-card">
                  <h2>Bölüm başlıkları ve katkı alanı</h2>
                  <div className="adm-form-grid">
                    {field("home.workTitle", "Çalışmalar bölümü")}
                    {field("home.newsTitle", "Haberler bölümü")}
                    {field("home.faqTitle", "Sorular bölümü")}
                    {field("join.title", "Katkı alanı başlığı")}
                    {field("join.donationTitle", "Bağış kartı başlığı")}
                    {field("join.donationText", "Bağış kartı metni", true)}
                    {field("join.volunteerTitle", "Gönüllülük kartı başlığı")}
                    {field(
                      "join.volunteerText",
                      "Gönüllülük kartı metni",
                      true,
                    )}
                  </div>
                </div>
                {seo("home.seo")}
              </>
            )}
            {section === "pages" && (
              <>
                <div
                  className="adm-tabs"
                  role="group"
                  aria-label="Düzenlenecek sayfa"
                >
                  {Object.entries(pageLabels).map(([id, label]) => (
                    <button
                      key={id}
                      className={page === id ? "active" : ""}
                      onClick={() => setPage(id as PageKey)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="adm-card">
                  <div className="adm-card-heading">
                    <h2>{pageLabels[page]}</h2>
                    <a
                      href={`/${page}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sayfayı aç <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="adm-form-grid">
                    {field(`pages.${page}.title`, "Sayfa başlığı")}
                    {field(
                      `pages.${page}.description`,
                      "Giriş açıklaması",
                      true,
                    )}
                    {!["gizlilik", "projeler"].includes(page) && (
                      <>
                        {field(`pages.${page}.heading`, "İçerik başlığı")}
                        {field(
                          `pages.${page}.emphasis`,
                          "Başlığın ikinci satırı",
                        )}
                        {field(`pages.${page}.lead`, "Giriş metni", true)}
                      </>
                    )}
                    {["hakkimizda", "gonullu-ol"].includes(page) && (
                      <>
                        {photo(`pages.${page}.image`, "Sayfa fotoğrafı")}
                        {field(`pages.${page}.alt`, "Fotoğraf açıklaması")}
                      </>
                    )}
                    {page === "hakkimizda" && (
                      <>
                        {lines(`pages.${page}.paragraphs`, "Derneğin hikâyesi")}
                        {field(`pages.${page}.extraHeading`, "Tarihçe başlığı")}
                        {field(
                          `pages.${page}.extraEmphasis`,
                          "Tarihçe başlığının ikinci satırı",
                        )}
                      </>
                    )}
                    {["bagis", "gonullu-ol", "iletisim"].includes(page) &&
                      field(
                        `pages.${page}.note`,
                        page === "bagis"
                          ? "Banka bilgilerinin altındaki açıklama"
                          : "Bilgilendirme metni",
                        true,
                      )}
                  </div>
                </div>
                {!["projeler", "iletisim"].includes(page) && (
                  <div className="adm-card">
                    <div className="adm-card-heading">
                      <h2>
                        {page === "hakkimizda"
                          ? "Tarihçe"
                          : page === "gizlilik"
                            ? "Bilgilendirme bölümleri"
                            : "İçerik maddeleri"}
                      </h2>
                      <button
                        className="adm-button secondary"
                        onClick={() =>
                          update(`pages.${page}.items`, [
                            ...draft.pages[page].items,
                            { title: "Yeni başlık", text: "", year: "" },
                          ])
                        }
                      >
                        <Plus size={16} />
                        Ekle
                      </button>
                    </div>
                    {draft.pages[page].items.map((_, i) => (
                      <div className="adm-inset" key={`${page}-${i}`}>
                        <div className="adm-item-toolbar">
                          <strong>{i + 1}. bölüm</strong>
                          {orderButtons(
                            `pages.${page}.items`,
                            i,
                            draft.pages[page].items.length,
                          )}
                          <button
                            className="adm-icon-button danger"
                            onClick={() => remove(`pages.${page}.items`, i)}
                            aria-label="Bölümü kaldır"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="adm-form-grid">
                          {page === "hakkimizda" &&
                            field(
                              `pages.${page}.items.${i}.year`,
                              "Tarih / yıl",
                            )}
                          {field(`pages.${page}.items.${i}.title`, "Başlık")}
                          {page !== "gonullu-ol" &&
                            field(
                              `pages.${page}.items.${i}.text`,
                              "Metin",
                              true,
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {seo(`pages.${page}.seo`)}
              </>
            )}
            {section === "projects" && (
              <>
                <div className="adm-section-actions">
                  <p>En fazla üç çalışmayı ana sayfada öne çıkarabilirsiniz.</p>
                  <button className="adm-button" onClick={addProject}>
                    <Plus size={18} />
                    Çalışma ekle
                  </button>
                </div>
                <div className="adm-collection">
                  <div className="adm-collection-list">
                    {draft.projects.map((p, i) => (
                      <div
                        className={
                          p.id === (selectedProject || draft.projects[0]?.id)
                            ? "active"
                            : ""
                        }
                        key={p.id}
                      >
                        <button onClick={() => setSelectedProject(p.id)}>
                          <strong>{p.title || "İsimsiz çalışma"}</strong>
                          <small>
                            {p.published ? "Yayında" : "Yayında değil"}
                            {p.published && p.featured ? " · Ana sayfada" : ""}
                          </small>
                        </button>
                        {orderButtons("projects", i, draft.projects.length)}
                      </div>
                    ))}
                  </div>
                  <div>
                    {projectIndex >= 0 &&
                      (() => {
                        const p = draft.projects[projectIndex],
                          path = `projects.${projectIndex}`,
                          isNew = !record.content.projects.some(
                            (old) => old.id === p.id,
                          );
                        return (
                          <>
                            <div className="adm-card">
                              <h2>Çalışma bilgileri</h2>
                              <div className="adm-form-grid">
                                <label className="adm-field wide">
                                  <span>Çalışma başlığı</span>
                                  <input
                                    value={p.title}
                                    onChange={(e) => {
                                      const next = structuredClone(draft);
                                      const target =
                                        next.projects[projectIndex];
                                      if (target.seo.title === target.title)
                                        target.seo.title = e.target.value;
                                      target.title = e.target.value;
                                      if (isNew)
                                        target.slug = uniqueSlug(
                                          e.target.value,
                                          next.projects
                                            .filter((x) => x.id !== p.id)
                                            .map((x) => x.slug),
                                        );
                                      setDraft(next);
                                      setNotice("");
                                    }}
                                  />
                                  <small>
                                    Sayfa adresi: /projeler/{p.slug}
                                  </small>
                                </label>
                                {field(
                                  `${path}.summary`,
                                  "Kart açıklaması",
                                  true,
                                )}
                                {field(
                                  `${path}.lead`,
                                  "Sayfanın giriş cümlesi",
                                  true,
                                )}
                                {photo(`${path}.image`, "Çalışma fotoğrafı")}
                                {field(`${path}.alt`, "Fotoğraf açıklaması")}
                                {lines(
                                  `${path}.paragraphs`,
                                  "Çalışmanın ayrıntıları",
                                )}
                                {lines(`${path}.needs`, "Destek ihtiyaçları")}
                                {field(`${path}.impact`, "Öne çıkan rakam")}
                                {field(
                                  `${path}.impactLabel`,
                                  "Rakamın açıklaması",
                                )}
                              </div>
                              <div className="adm-publish-options">
                                {switches(
                                  `${path}.published`,
                                  "Sitede yayımla",
                                  "Kapatıldığında çalışma sayfası ve kartları yayından kalkar.",
                                )}
                                {switches(
                                  `${path}.featured`,
                                  "Ana sayfada göster",
                                  "Yayımlanan çalışmalar arasından en fazla üçü seçilebilir.",
                                )}
                              </div>
                            </div>
                            {seo(`${path}.seo`)}
                          </>
                        );
                      })()}
                    {!draft.projects.length && (
                      <div className="adm-empty">
                        <BookOpen size={34} />
                        <h2>İlk çalışmanızı ekleyin.</h2>
                        <p>
                          Çalışmalarınızı fotoğraf ve açıklamalarıyla
                          paylaşabilirsiniz.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {section === "news" && (
              <>
                <div className="adm-section-actions">
                  <p>
                    Ana sayfada en fazla üç haber gösterilir. Sırayı oklarla
                    değiştirebilirsiniz.
                  </p>
                  <button className="adm-button" onClick={addNews}>
                    <Plus size={18} />
                    Haber ekle
                  </button>
                </div>
                <div className="adm-collection">
                  <div className="adm-collection-list">
                    {draft.news.map((n, i) => (
                      <div
                        className={
                          n.id === (selectedNews || draft.news[0]?.id)
                            ? "active"
                            : ""
                        }
                        key={n.id}
                      >
                        <button onClick={() => setSelectedNews(n.id)}>
                          <strong>{n.title}</strong>
                          <small>
                            {n.published ? "Ana sayfada" : "Yayında değil"}
                          </small>
                        </button>
                        {orderButtons("news", i, draft.news.length)}
                      </div>
                    ))}
                  </div>
                  <div>
                    {newsIndex >= 0 &&
                      (() => {
                        const path = `news.${newsIndex}`;
                        return (
                          <div className="adm-card">
                            <h2>Haber bilgileri</h2>
                            <div className="adm-form-grid">
                              {field(`${path}.title`, "Haber başlığı")}
                              {field(`${path}.text`, "Kısa açıklama", true)}
                              {photo(`${path}.image`, "Haber görseli")}
                              {field(`${path}.alt`, "Görsel açıklaması")}
                              {field(
                                `${path}.href`,
                                "Haberin bağlantısı",
                                false,
                                "Instagram paylaşımının veya yönlendirmek istediğiniz sayfanın adresi.",
                              )}
                            </div>
                            <div className="adm-publish-options">
                              {switches(
                                `${path}.published`,
                                "Ana sayfada yayımla",
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    {!draft.news.length && (
                      <div className="adm-empty">
                        <Newspaper size={34} />
                        <h2>İlk haberinizi ekleyin.</h2>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {section === "faqs" && (
              <div className="adm-card">
                <div className="adm-card-heading">
                  <h2>Sorular ve yanıtlar</h2>
                  <button
                    className="adm-button secondary"
                    onClick={() =>
                      update("faqs", [
                        ...draft.faqs,
                        { id: crypto.randomUUID(), q: "Yeni soru", a: "" },
                      ])
                    }
                  >
                    <Plus size={16} />
                    Soru ekle
                  </button>
                </div>
                {draft.faqs.map((faq, i) => (
                  <div className="adm-inset" key={faq.id}>
                    <div className="adm-item-toolbar">
                      <strong>{i + 1}. soru</strong>
                      {orderButtons("faqs", i, draft.faqs.length)}
                      <button
                        className="adm-icon-button danger"
                        onClick={() => remove("faqs", i)}
                        aria-label="Soruyu kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {field(`faqs.${i}.q`, "Soru")}
                    {field(`faqs.${i}.a`, "Yanıt", true)}
                  </div>
                ))}
              </div>
            )}
            {section === "organization" && (
              <>
                <div className="adm-card">
                  <h2>Dernek ve iletişim bilgileri</h2>
                  <div className="adm-form-grid">
                    {field("organization.name", "Derneğin tam adı")}
                    {field("organization.shortName", "Kısa adı")}
                    {field("organization.phone", "Telefon")}
                    {field("organization.email", "E-posta")}
                    {field("organization.instagram", "Instagram adresi")}
                    {field(
                      "organization.volunteerForm",
                      "Gönüllü başvuru formu",
                    )}
                    {field("organization.location", "Konum")}
                    {field(
                      "organization.footerText",
                      "Footer tanıtım metni",
                      true,
                    )}
                  </div>
                </div>
                <div className="adm-card">
                  <h2>Banka ve bağış bilgileri</h2>
                  <p className="adm-help">
                    Bu bilgiler bağış sayfasında yayımlanır. Kaydetmeden önce
                    hesap sahibi ve IBAN’ı kontrol edin.
                  </p>
                  <div className="adm-form-grid">
                    {field("organization.bank", "Banka adı")}
                    {field("organization.accountName", "Hesap sahibi")}
                    {field("organization.iban", "IBAN")}
                    {field(
                      "organization.donationSource",
                      "Bağış bilgileri kaynak bağlantısı",
                    )}
                  </div>
                </div>
              </>
            )}
            {section === "password" && (
              <PasswordSettings busy={busy} onChange={updatePassword} />
            )}
            {section === "history" && (
              <div className="adm-card">
                <h2>Kayıt geçmişi</h2>
                <p className="adm-help">
                  Son 20 kayıt saklanır. Geri yükleme tüm site içeriklerine
                  uygulanır; mevcut sürüm de geçmişe eklenir.
                </p>
                <div className="adm-history-row current">
                  <span className="adm-history-icon">
                    <Check size={19} />
                  </span>
                  <div>
                    <strong>Şu an yayındaki sürüm</strong>
                    <span>
                      {readableDate(record.updatedAt)} · {record.label}
                    </span>
                  </div>
                </div>
                {record.history.map((h) => (
                  <div className="adm-history-row" key={h.revision}>
                    <span className="adm-history-icon">
                      <History size={19} />
                    </span>
                    <div>
                      <strong>{h.label}</strong>
                      <span>{readableDate(h.updatedAt)}</span>
                    </div>
                    <button
                      className="adm-button secondary"
                      onClick={() => restore(h)}
                    >
                      Geri yükle
                    </button>
                  </div>
                ))}
                {!record.history.length && (
                  <p className="adm-empty-text">
                    İlk kaydınızdan sonra önceki sürümler burada görünecek.
                  </p>
                )}
              </div>
            )}
          </fieldset>
          <footer className="adm-footer">
            Alpagu Derneği{" "}
            <span>
              Web Tasarım, Uygulama ve Geliştirme:{" "}
              <a
                href="https://kocyigityazilim.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                kocyigityazilim.com
              </a>
            </span>
          </footer>
        </main>
      </div>
      {(mediaPath || libraryOpen) && (
        <MediaPicker
          csrf={csrf}
          value={mediaPath ? String(valueAt(draft, mediaPath)) : undefined}
          onSelect={mediaPath ? (url) => update(mediaPath, url) : undefined}
          onClose={() => {
            setMediaPath(null);
            setLibraryOpen(false);
          }}
        />
      )}
    </div>
  );
}
