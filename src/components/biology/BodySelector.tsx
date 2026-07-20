'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ErrorDisplay } from './ErrorDisplay';

const BodyComponent = dynamic(
	() => import('react-body-selector').then(mod => {
		const Selector = ({ selectedParts, onBodyPartPress, gender, side }: any) => {
			return (
				<mod.Body
					data={selectedParts}
					gender={gender}
					side={side}
					scale={1.5}
					colors={['#0984e3', '#74b9ff', '#a29bfe']}
					onBodyPartPress={onBodyPartPress}
				/>
			);
		};
		return { default: Selector };
	}),
	{ ssr: false, loading: () => <div className="bio-loading">Loading body selector...</div> }
);

export function BodySelector() {
	const [selectedParts, setSelectedParts] = useState<any[]>([]);
	const [gender, setGender] = useState<'male' | 'female'>('male');
	const [side, setSide] = useState<'front' | 'back'>('front');

	const handleBodyPartPress = (bodyPart: any) => {
		queueMicrotask(() => {
			setSelectedParts(prev => {
				const exists = prev.find((p: any) => p.slug === bodyPart.slug);
				if (exists) {
					return prev.filter((p: any) => p.slug !== bodyPart.slug);
				}
				return [...prev, { slug: bodyPart.slug, intensity: 2 }];
			});
		});
	};

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">💪 Body Selector (Intensity)</h3>
			<p className="bio-card-desc">Click body parts to select them with intensity levels 1-3</p>

			<div className="bio-controls">
				<div className="bio-control-group">
					<label>Gender</label>
					<div className="bio-btn-group">
						<button onClick={() => setGender('male')} className={`bio-btn ${gender === 'male' ? 'active' : ''}`}>Male</button>
						<button onClick={() => setGender('female')} className={`bio-btn ${gender === 'female' ? 'active' : ''}`}>Female</button>
					</div>
				</div>
				<div className="bio-control-group">
					<label>Side</label>
					<div className="bio-btn-group">
						<button onClick={() => setSide('front')} className={`bio-btn ${side === 'front' ? 'active' : ''}`}>Front</button>
						<button onClick={() => setSide('back')} className={`bio-btn ${side === 'back' ? 'active' : ''}`}>Back</button>
					</div>
				</div>
			</div>

			<div className="bio-viewer-container">
				<BodyComponent
					selectedParts={selectedParts}
					onBodyPartPress={handleBodyPartPress}
					gender={gender}
					side={side}
				/>
			</div>

			{selectedParts.length > 0 && (
				<div className="bio-result">
					<strong>Selected:</strong> {selectedParts.map((p: any) => p.slug).join(', ')}
				</div>
			)}

			<ErrorDisplay errors={[]} />

			<div className="bio-info">
				Available: abs, biceps, chest, deltoids, gluteal, hamstring, head, neck, quadriceps, triceps, and more
			</div>
		</div>
	);
}

export default BodySelector;
