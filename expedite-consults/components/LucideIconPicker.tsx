import { LucideIcon, icons } from "lucide-react";
import { useState } from "react";
import { Card, Stack, Text, TextInput, Flex } from "@sanity/ui";
import { set, unset } from "sanity";

export default function LucideIconPicker({ value, onChange }: any) {
	const [search, setSearch] = useState("");

	const iconNames = Object.keys(icons).filter((name) =>
		name.toLowerCase().includes(search.toLowerCase())
	);

	const handleSelect = (name: string) => {
		onChange(name ? set(name) : unset());
	};

	const SelectedIcon =
		value && icons[value as keyof typeof icons]
			? (icons[value as keyof typeof icons] as LucideIcon)
			: null;

	return (
		<Stack space={4}>
			{SelectedIcon && (
				<Flex align="center" gap={3}>
					<Text size={1}>Selected Icon:</Text>
					<SelectedIcon size={20} />
					<Text size={1} muted>
						{value}
					</Text>
				</Flex>
			)}

			<TextInput
				value={search}
				onChange={(e) => setSearch(e.currentTarget.value)}
				placeholder="Search icons…"
			/>

			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "8px",
					maxHeight: 200,
					overflowY: "auto",
				}}
			>
				{iconNames.slice(0, 100).map((name) => {
					const Icon = icons[name as keyof typeof icons] as LucideIcon;
					const isSelected = name === value;

					return (
						<Card
							key={name}
							padding={2}
							radius={2}
							shadow={1}
							style={{
								cursor: "pointer",
								border: isSelected ? "2px solid #3b82f6" : "1px solid #ccc",
								backgroundColor: isSelected ? "#eff6ff" : "#fff",
							}}
							onClick={() => handleSelect(name)}
						>
							<Icon size={20} />
						</Card>
					);
				})}
			</div>
		</Stack>
	);
}
