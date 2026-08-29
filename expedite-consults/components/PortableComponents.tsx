import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

export const portableComponents = {
	types: {
		image: ({ value }: any) => {
			const imageUrl = urlFor(value).width(1200).url();

			return (
				<div className="my-6 w-full">
					<div className="relative aspect-video rounded-lg overflow-hidden">
						<Image
							src={imageUrl}
							alt={value.alt || "Blog image"}
							fill
							sizes="(max-width: 768px) 100vw, 800px"
							className="object-cover"
						/>
					</div>
					{value.caption && (
						<p className="text-sm text-muted-foreground mt-2 text-center">
							{value.caption}
						</p>
					)}
				</div>
			);
		},
		code: ({ value }: any) => (
			<pre className="bg-muted text-sm p-4 rounded-lg overflow-x-auto my-6 whitespace-pre-wrap md:whitespace-pre">
				<code>{value.code}</code>
			</pre>
		),
		callout: ({ value }: any) => (
			<div className="border-l-4 border-primary bg-primary/5 p-4 my-6 rounded-lg">
				<p className="text-sm leading-relaxed">{value.message}</p>
			</div>
		),
	},

	block: {
		h1: ({ children }: any) => (
			<h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4">{children}</h1>
		),
		h2: ({ children }: any) => (
			<h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4">
				{children}
			</h2>
		),
		h3: ({ children }: any) => (
			<h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3">
				{children}
			</h3>
		),
		h4: ({ children }: any) => (
			<h4 className="text-lg md:text-xl font-semibold mt-6 mb-2">{children}</h4>
		),
		blockquote: ({ children }: any) => (
			<blockquote className="border-l-4 border-border pl-4 italic my-6 text-muted-foreground text-sm md:text-base">
				{children}
			</blockquote>
		),
		normal: ({ children }: any) => (
			<p className="text-sm md:text-base leading-relaxed mb-4">{children}</p>
		),
	},

	marks: {
		strong: ({ children }: any) => (
			<strong className="font-semibold">{children}</strong>
		),
		em: ({ children }: any) => <em className="italic">{children}</em>,
		code: ({ children }: any) => (
			<code className="bg-muted px-1.5 py-1 rounded text-sm font-mono">
				{children}
			</code>
		),
		link: ({ children, value }: any) => {
			const isExternal = !value.href?.startsWith("/");
			return (
				<a
					href={value.href}
					target={isExternal ? "_blank" : undefined}
					rel={isExternal ? "noopener noreferrer" : undefined}
					className="text-primary underline hover:text-primary/80 transition-colors"
				>
					{children}
				</a>
			);
		},
	},

	list: {
		bullet: ({ children }: any) => (
			<ul className="list-disc ml-5 md:ml-6 my-4 space-y-2 text-sm md:text-base">
				{children}
			</ul>
		),
		number: ({ children }: any) => (
			<ol className="list-decimal ml-5 md:ml-6 my-4 space-y-2 text-sm md:text-base">
				{children}
			</ol>
		),
	},

	listItem: {
		bullet: ({ children }: any) => <li className="ml-1">{children}</li>,
		number: ({ children }: any) => <li className="ml-1">{children}</li>,
	},

	unknownType: ({ value }: any) => (
		<div className="bg-red-100 text-red-700 p-4 my-4 rounded">
			⚠️ Unknown block type: {JSON.stringify(value)}
		</div>
	),
};
