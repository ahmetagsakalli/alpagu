import { NextRequest } from "next/server";
import { cloud, readBinary } from "@/lib/cms/store";
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (cloud() || !/^[a-f0-9-]{36}\.webp$/.test(file))
    return new Response(null, { status: 404 });
  try {
    return new Response(
      new Uint8Array(await readBinary(file.slice(0, -5), true)),
      {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      },
    );
  } catch {
    return new Response(null, { status: 404 });
  }
}
