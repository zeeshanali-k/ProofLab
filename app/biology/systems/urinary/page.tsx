'use client';
import { SystemInfoPanel } from '../../../../src/components/biology/systems/SystemInfoPanel';
import { SystemDiagram2D } from '../../../../src/components/biology/systems/SystemDiagram2D';
import { SYSTEM_CONTENT } from '@/lib/biology/systemContent';
export default function UrinaryPage() {
	const system = SYSTEM_CONTENT.urinary;
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>{system.icon} {system.name}</h1>
				<p className="page-description">{system.description}</p>
			</div>
			<div className="bio-systems-layout">
				<div className="bio-systems-diagram"><SystemDiagram2D systemId="urinary" /></div>
				<div className="bio-systems-info"><SystemInfoPanel system={system} /></div>
			</div>
		</main>
	);
}
