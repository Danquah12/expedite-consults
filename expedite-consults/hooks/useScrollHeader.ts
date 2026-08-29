import { useEffect, useState } from "react";

export function useScrollHeader(offset = 50) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > offset;
			setScrolled(isScrolled);
		};

		// Call it once on mount
		handleScroll();

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [offset]);

	return scrolled;
}
