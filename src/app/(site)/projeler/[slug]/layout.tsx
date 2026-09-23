import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/content-store";
// Check visibility before the page's loading boundary can start a 200 response.
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, { projects }] = await Promise.all([params, getContent()]);
  if (!projects.some((p) => p.slug === slug && p.published)) notFound();
  return children;
}
