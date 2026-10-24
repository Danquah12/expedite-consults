import { beginPick, endPick, inspectLocalFile, MEDIA_ACCEPT, stashInbound } from "@/lib/local-media";

export function MediaFileField({
  onPicked,
  id = "clinic-file",
}: {
  onPicked: (file: File, kind: "image" | "video", url: string) => void;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="file"
      accept={MEDIA_ACCEPT}
      className="sr-only"
      onClick={() => {
        beginPick();
        const clear = () => {
          window.setTimeout(() => endPick(), 400);
          window.removeEventListener("focus", clear);
        };
        window.addEventListener("focus", clear);
      }}
      onChange={async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        endPick();
        if (!file) return;
        const inspected = await inspectLocalFile(file);
        if (!inspected) return;
        stashInbound(file);
        onPicked(inspected.file, inspected.kind, inspected.url);
      }}
    />
  );
}
