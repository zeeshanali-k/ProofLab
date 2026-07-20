'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const moduleNames: Record<string, string> = {
	biology: 'Biology',
	chemistry: 'Chemistry',
	physics: 'Physics',
};

function formatSegment(segment: string) {
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function ModuleBackLink() {
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);
	const [module] = segments;
	const moduleName = moduleNames[module];

	if (!moduleName || segments.length < 2) {
		return null;
	}

	const parentSegments = segments.slice(0, -1);
	const parentHref = `/${parentSegments.join('/')}`;
	const parentName = parentSegments.length === 1
		? moduleName
		: formatSegment(parentSegments[parentSegments.length - 1]);

	return (
		<nav className={`module-back-nav module-back-nav--${module}`} aria-label="Module navigation">
			<Link href={parentHref} className="module-back-link">
				<span aria-hidden="true">←</span>
				Back to {parentName}
			</Link>
		</nav>
	);
}
