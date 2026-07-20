'use client';

import { SYSTEM_IDS, SYSTEM_CONTENT } from '@/lib/biology/systemContent';
import type { SystemId } from '@/lib/biology/systemContent';

export function SystemNavigation({ activeSystem, onSystemChange }: {
	activeSystem: SystemId;
	onSystemChange: (id: SystemId) => void;
}) {
	return (
		<div className="bio-system-nav">
			{SYSTEM_IDS.map(id => {
				const sys = SYSTEM_CONTENT[id];
				return (
					<button
						key={id}
						onClick={() => onSystemChange(id)}
						className={`bio-system-nav-btn ${activeSystem === id ? 'active' : ''}`}
						style={activeSystem === id ? { background: sys.color, borderColor: sys.color } : {}}
					>
						<span className="bio-system-nav-icon">{sys.icon}</span>
						<span className="bio-system-nav-label">{sys.name.replace(' System', '').replace('Lymphatic & Immune', 'Lymphatic')}</span>
					</button>
				);
			})}
		</div>
	);
}

export default SystemNavigation;
