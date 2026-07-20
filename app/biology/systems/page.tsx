'use client';

import { useState } from 'react';
import { SystemNavigation } from '../../../src/components/biology/systems/SystemNavigation';
import { SystemInfoPanel } from '../../../src/components/biology/systems/SystemInfoPanel';
import { SystemViewer3D } from '../../../src/components/biology/systems/SystemViewer3D';
import { SYSTEM_CONTENT } from '@/lib/biology/systemContent';
import type { SystemId } from '@/lib/biology/systemContent';

export default function SystemsPage() {
	const [activeSystem, setActiveSystem] = useState<SystemId>('skeletal');
	const system = SYSTEM_CONTENT[activeSystem];

	return (
		<main className="bio-page bio-systems-page">
			<div className="page-header">
				<h1>🫀 Organ Systems</h1>
				<p className="page-description">Explore the 9 major human body systems — their organs, structures, functions, and common conditions.</p>
			</div>

			<SystemNavigation activeSystem={activeSystem} onSystemChange={setActiveSystem} />

			<div className="bio-systems-layout">
				<div className="bio-systems-diagram">
					<SystemViewer3D systemId={activeSystem} />
				</div>
				<div className="bio-systems-info">
					<SystemInfoPanel system={system} />
				</div>
			</div>
		</main>
	);
}
