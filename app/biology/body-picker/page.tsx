'use client';
import dynamic from 'next/dynamic';
const BodyPicker = dynamic(() => import('../../../src/components/biology/BodyPicker'), { ssr: false });

export default function BodyPickerPage() {
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>🦴 Body Region Selector</h1>
				<p className="page-description">Click body regions to select them. Supports adult male/female and front/back views.</p>
			</div>
			<BodyPicker />
		</main>
	);
}
