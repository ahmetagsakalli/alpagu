import { test, expect, type APIRequestContext } from "@playwright/test";
import sharp from "sharp";
const origin = "http://127.0.0.1:3100";
const password = "Only-for-local-tests-79";
async function login(request: APIRequestContext) {
  const r = await request.post("/api/admin/login", {
    headers: { origin },
    data: { password },
  });
  expect(r.status()).toBe(200);
  return (await r.json()).csrf as string;
}
async function get(request: APIRequestContext) {
  const r = await request.get("/api/admin/content");
  expect(r.ok()).toBeTruthy();
  return r.json();
}
async function post(
  request: APIRequestContext,
  path: string,
  csrf: string,
  data: unknown,
) {
  return request.post(`/api/admin/${path}`, {
    headers: { origin, "x-csrf-token": csrf },
    data,
  });
}
test.describe.configure({ mode: "serial" });
test("unauthorized APIs and cross-origin login are rejected", async ({
  request,
}) => {
  for (const path of ["content", "history", "media", "session"])
    expect((await request.get(`/api/admin/${path}`)).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin/login", {
        headers: { origin: "https://untrusted.example" },
        data: { password },
      })
    ).status(),
  ).toBe(403);
  const r = await request.get("/admin");
  expect(r.headers()["x-robots-tag"]).toContain("noindex");
  expect(r.headers()["cache-control"]).toContain("no-store");
  expect(await r.text()).not.toContain("scrypt$");
});
test("login cookies, CSRF, logout and session revocation", async ({
  request,
}) => {
  const csrf = await login(request);
  const state = await request.storageState();
  const cookie = state.cookies.find((c) => c.name === "alpagu_admin")!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  const current = await get(request);
  expect(
    (
      await request.post("/api/admin/content", {
        headers: { origin },
        data: { content: current.content, revision: current.revision },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/admin/logout", {
        headers: { origin: "https://untrusted.example", "x-csrf-token": csrf },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect((await post(request, "logout", csrf, {})).ok()).toBeTruthy();
  expect((await request.get("/api/admin/content")).status()).toBe(401);
});
test("save is visible publicly, stale writes fail, restore works and validation is atomic", async ({
  request,
}) => {
  const csrf = await login(request);
  const before = await get(request);
  const content = structuredClone(before.content);
  content.home.subtitle = "Çocukların yarınları için. Doğrulama";
  let r = await post(request, "content", csrf, {
    content,
    revision: before.revision,
    label: "Kayıt doğrulaması",
  });
  expect(r.status()).toBe(200);
  const saved = await r.json();
  expect(await (await request.get("/")).text()).toContain(
    content.home.subtitle,
  );
  r = await post(request, "content", csrf, {
    content: before.content,
    revision: before.revision,
  });
  expect(r.status()).toBe(409);
  content.organization.iban = "TR00000000000000000000000000";
  r = await post(request, "content", csrf, {
    content,
    revision: saved.revision,
  });
  expect(r.status()).toBe(400);
  expect((await get(request)).revision).toBe(saved.revision);
  r = await post(request, "restore", csrf, {
    revision: saved.revision,
    targetRevision: before.revision,
  });
  expect(r.status()).toBe(200);
  expect(await (await request.get("/")).text()).not.toContain("Doğrulama");
});
test("new Turkish project slug works without deployment and unpublishing removes it", async ({
  request,
}) => {
  const csrf = await login(request);
  let current = await get(request);
  const p = {
    ...structuredClone(current.content.projects[0]),
    id: "e2e-project",
    slug: "cocuklar-icin-yeni-kutuphane",
    title: "Çocuklar İçin Yeni Kütüphane",
    featured: false,
    published: true,
  };
  current.content.projects.push(p);
  let r = await post(request, "content", csrf, {
    content: current.content,
    revision: current.revision,
  });
  expect(r.status()).toBe(200);
  expect((await request.get("/projeler/" + p.slug)).status()).toBe(200);
  expect(await (await request.get("/projeler")).text()).toContain(p.title);
  expect(await (await request.get("/sitemap.xml")).text()).toContain(p.slug);
  current = await get(request);
  current.content.projects.find(
    (x: { id: string }) => x.id === p.id,
  ).published = false;
  r = await post(request, "content", csrf, {
    content: current.content,
    revision: current.revision,
  });
  expect(r.status()).toBe(200);
  expect((await request.get("/projeler/" + p.slug)).status()).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    p.slug,
  );
});
test("photo upload converts to WebP, stays private until save, then survives restoration", async ({
  request,
}) => {
  const csrf = await login(request);
  const before = await get(request);
  const bytes = await sharp({
    create: { width: 500, height: 300, channels: 3, background: "#157a70" },
  })
    .jpeg()
    .toBuffer();
  const upload = await request.post("/api/admin/media", {
    headers: {
      origin,
      "x-csrf-token": csrf,
      "x-filename": "verification.jpg",
      "Content-Type": "image/jpeg",
    },
    data: bytes,
  });
  expect(upload.status()).toBe(200);
  const asset = await upload.json();
  expect(asset.width).toBe(500);
  expect(asset.bytes).toBeLessThan(bytes.length);
  expect((await request.get(asset.url)).status()).toBe(404);
  expect(
    (await request.get("/api/admin/media/" + asset.id)).headers()[
      "content-type"
    ],
  ).toBe("image/webp");
  const data = structuredClone(before.content);
  data.home.image = asset.url;
  data.home.seo.image = asset.url;
  const saved = await post(request, "content", csrf, {
    content: data,
    revision: before.revision,
  });
  expect(saved.status()).toBe(200);
  expect((await request.get(asset.url)).status()).toBe(200);
  const current = await saved.json();
  expect(
    (
      await post(request, "restore", csrf, {
        revision: current.revision,
        targetRevision: before.revision,
      })
    ).status(),
  ).toBe(200);
  expect((await request.get(asset.url)).status()).toBe(200);
  const bad = await request.post("/api/admin/media", {
    headers: {
      origin,
      "x-csrf-token": csrf,
      "x-filename": "bad.svg",
      "Content-Type": "image/png",
    },
    data: Buffer.from('<svg onload="alert(1)"></svg>'),
  });
  expect(bad.status()).toBe(400);
});
test("desktop editor saves Turkish copy and opens photo library", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/admin");
  await page.getByLabel("Yönetim şifresi").fill(password);
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Genel bakış", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/admin-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Ana sayfa", exact: true }).click();
  const subtitle = page.getByLabel("Alt metin", { exact: true });
  const original = await subtitle.inputValue();
  await subtitle.fill(original + " İyilikle.");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("yayımlandı");
  await subtitle.fill(original);
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("yayımlandı");
  await page.getByRole("button", { name: "Görseli değiştir" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Görsel kitaplığını kapat" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile panel and public site fit viewport; FAQ opens exclusively", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  await page.getByLabel("Yönetim şifresi").fill(password);
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Genel bakış", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/admin-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Yönetim menüsünü aç" }).click();
  await page
    .getByRole("button", { name: "Site bilgileri", exact: true })
    .click();
  await expect(page.getByLabel("IBAN", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("UMUT");
  const details = page.locator('details[name="alpagu-faq"]');
  await details.nth(0).locator("summary").click();
  await details.nth(1).locator("summary").click();
  await expect(details.nth(0)).not.toHaveAttribute("open", "");
  await expect(details.nth(1)).toHaveAttribute("open", "");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".news-card")
      .first()
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("sticky");
  await page.screenshot({
    path: "test-results/site-mobile.png",
    fullPage: true,
  });
});

test("five wrong logins are rate limited", async ({ request }) => {
  for (let i = 0; i < 5; i++)
    expect(
      (
        await request.post("/api/admin/login", {
          headers: { origin },
          data: { password: "incorrect" },
        })
      ).status(),
    ).toBe(401);
  expect(
    (
      await request.post("/api/admin/login", {
        headers: { origin },
        data: { password },
      })
    ).status(),
  ).toBe(429);
});
