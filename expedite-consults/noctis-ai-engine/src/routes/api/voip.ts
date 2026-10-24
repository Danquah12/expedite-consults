import { createFileRoute } from "@tanstack/react-router";

function publicUrl(request: Request) {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  return `${proto}://${host}${url.pathname}${url.search}`;
}

export const Route = createFileRoute("/api/voip")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { twilioSigned, voiceTwiml } = await import("@/lib/voip.server");
        const form = await request.formData();
        const params: Record<string, string> = {};
        for (const [key, value] of form.entries()) {
          if (typeof value === "string") params[key] = value;
        }
        const signature = request.headers.get("x-twilio-signature") ?? "";
        if (!twilioSigned(publicUrl(request), params, signature)) {
          return new Response("Forbidden", { status: 403 });
        }
        const to = params.To || params.to || "";
        return new Response(voiceTwiml(to), {
          headers: { "content-type": "text/xml; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
