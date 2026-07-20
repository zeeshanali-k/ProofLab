'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
	const pathname = usePathname();
	
	const isActive = (path) => {
		if (path === '/') return pathname === '/';
		return pathname.startsWith(path);
	};
	
	const navItems = [
		{
			path: '/',
			icon: '🔢',
			label: 'Math Lab',
			description: 'Algebra reasoning debugger'
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
	
	return (
		<nav className="main-navbar" role="navigation" aria-label="Main navigation">
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
						<span className="nav-text">{item.label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}

export default Navigation;
