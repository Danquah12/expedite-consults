import { createFileRoute } from "@tanstack/react-router";
import { CertPage } from "@/components/social/Hub";

export const Route = createFileRoute("/certs/$certId")({ component: CertRoute });

function CertRoute() {
  const { certId } = Route.useParams();
  return <CertPage certId={certId} />;
}
