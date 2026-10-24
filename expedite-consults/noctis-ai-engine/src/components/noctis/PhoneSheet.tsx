import { useNavigate } from "@tanstack/react-router";
import { NoctisCall } from "@/components/noctis/NoctisCall";
import { useFeedStore } from "@/lib/feed-store";

export function PhoneSheet({ open, video = false, join = "" }: { open: boolean; video?: boolean; join?: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex bg-[#0c0c0c]">
      <NoctisCall
        key={join || (video ? "video" : "voice")}
        startVideo={video || Boolean(join)}
        join={join}
        onClose={() => closeModal()}
        onVibe={() => {
          closeModal();
          void navigate({ to: "/noctis" });
        }}
      />
    </div>
  );
}
