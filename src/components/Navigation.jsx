'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
	const pathname = usePathname();
	const isActive = (path) => {
		if (path === '/') return pathname === '/' || pathname.startsWith('/leetmath');
		return pathname.startsWith(path);
	};
	
	const navItems = [
		{
			path: '/',
			icon: '🔢',
			label: 'Math Lab',
			description: 'Proof board'
		},
		{
			path: '/chemistry',
			icon: '🧪',
			label: 'Chemistry Lab',
			description: 'Equation balancer & tools'
		},
		{
			path: '/physics',
			icon: '🔬',
			label: 'Physics Lab',
			description: 'Physics simulations & calculators'
		},
		{
			path: '/biology',
			icon: '🧬',
			label: 'Biology Lab',
			description: 'Anatomy, genetics, evolution & ecology'
		}
	];

	const toggleTheme = () => {
		const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = nextTheme;
		try {
			localStorage.setItem('prooflab:theme', nextTheme);
		} catch {
			// Theme switching should still work when storage is unavailable.
		}
	};

	const guideHref = pathname === '/guide'
		? '/guide'
		: `/guide?from=${encodeURIComponent(pathname)}`;
	
	return (
		<nav className="main-navbar" role="navigation" aria-label="Main navigation">
			<div className="nav-shell">
				<Link href="/" className="nav-brand" aria-label="ProofLab home">
					<span className="nav-brand-mark" aria-hidden="true">✦</span>
					<span>
						<strong>ProofLab</strong>
						<small>Learning labs</small>
					</span>
				</Link>

				<div className="nav-container">
					{navItems.map((item) => (
						<Link
							key={item.path}
							href={item.path}
							className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
							aria-label={`${item.label}: ${item.description}`}
							aria-current={isActive(item.path) ? 'page' : undefined}
						>
							<span className="nav-icon" aria-hidden="true">{item.icon}</span>
							<span className="nav-copy">
								<span className="nav-text">{item.label}</span>
								<span className="nav-description">{item.description}</span>
							</span>
							<span className="nav-active-dot" aria-hidden="true" />
						</Link>
					))}
				</div>

				<Link
					href={guideHref}
					className={`nav-guide-link ${pathname === '/guide' ? 'active' : ''}`}
					aria-label="Open the ProofLab platform guide"
					aria-current={pathname === '/guide' ? 'page' : undefined}
				>
					<span className="nav-guide-symbol" aria-hidden="true">?</span>
					<span className="nav-guide-label">Guide</span>
				</Link>

				<button
					type="button"
					className="nav-theme-toggle"
					onClick={toggleTheme}
					aria-label="Toggle color theme"
				>
					<span className="nav-theme-symbol" aria-hidden="true">
						<span className="theme-sun">☀</span>
						<span className="theme-moon">☾</span>
					</span>
					<span className="nav-theme-label">
						<span className="theme-light-label">Day</span>
						<span className="theme-dark-label">Night</span>
					</span>
				</button>
			</div>
		</nav>
	);
}

export default Navigation;
