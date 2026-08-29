import {
	BookLock,
	Cctv,
	ClockArrowUp,
	EarthLock,
	Eye,
	Fingerprint,
	FolderKey,
	Glasses,
	GlobeLock,
	Handshake,
	KeyRound,
	LockKeyholeOpen,
	MousePointerBan,
	Radar,
	ScanFace,
	ShieldAlert,
	ShieldBan,
	ShieldEllipsis,
	ShieldUser,
	Waypoints,
	Webcam,
} from "lucide-react";
import { IconCloud } from "./ui/icon-cloud";

const Icons = [
	{
		title: "fingerprint",
		icon: Fingerprint,
	},
	{
		title: "folder-key",
		icon: FolderKey,
	},
	{
		title: "earth-lock",
		icon: EarthLock,
	},
	{
		title: "shield-alert",
		icon: ShieldAlert,
	},
	{
		title: "handshake",
		icon: Handshake,
	},
	{
		title: "key-round",
		icon: KeyRound,
	},
	{
		title: "cctv",
		icon: Cctv,
	},
	{
		title: "lock-keyhole-open",
		icon: LockKeyholeOpen,
	},
	{
		title: "waypoints",
		icon: Waypoints,
	},
	{
		title: "shield-user",
		icon: ShieldUser,
	},
	{
		title: "radar",
		icon: Radar,
	},
	{
		title: "eye",
		icon: Eye,
	},
	{
		title: "scan-face",
		icon: ScanFace,
	},
	{
		title: "shield-ellipsis",
		icon: ShieldEllipsis,
	},
	{
		title: "book-lock",
		icon: BookLock,
	},
	{
		title: "webcam",
		icon: Webcam,
	},
	{
		title: "mouse-pointer-ban",
		icon: MousePointerBan,
	},
	{
		title: "clock-arrow-up",
		icon: ClockArrowUp,
	},
	{
		title: "shield-ban",
		icon: ShieldBan,
	},
	{
		title: "glasses",
		icon: Glasses,
	},
];

export function IconCloudHero() {
	return (
		<IconCloud
			icons={Icons.map((item) => (
				<item.icon
					width={90}
					height={90}
					strokeWidth={1}
					color="#7aa5dae3"
					key={item.title}
					className="bg-[#7aa5dae3]"
				/>
			))}
		/>
	);
}
