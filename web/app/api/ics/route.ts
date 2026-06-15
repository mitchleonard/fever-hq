import { generateIcs } from "@/lib/ics";

export const runtime = "nodejs";

export async function GET() {
  const body = generateIcs();
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="fever-2026.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
