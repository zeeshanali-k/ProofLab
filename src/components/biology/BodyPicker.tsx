'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ErrorDisplay } from './ErrorDisplay';

const AnatomyPickerModule = dynamic(
	() => import('react-anatomy-picker').then(mod => {
		const Picker = ({ selected, onPartSelect, gender, view }: any) => {
			try {
				const AnatomyPicker = (mod as any).AnatomyPicker || (mod as any).default;
				const SvgComponent = gender === 'male' && view === 'front'
					? (mod as any).AdultMaleFront
					: gender === 'male' && view === 'back'
						? (mod as any).AdultMaleBack
						: gender === 'female' && view === 'front'
							? (mod as any).AdultFemaleFront
							: (mod as any).AdultFemaleBack;

				if (!AnatomyPicker || !SvgComponent) return <div className="bio-loading">Body picker loading...</div>;

				const PickerComponent = AnatomyPicker as any;
				return (
					<PickerComponent
						SvgComponent={SvgComponent}
						selected={selected}
						highlightColor="#1471C9"
						onPartSelect={onPartSelect}
						style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
					/>
				);
			} catch {
				return <div className="bio-loading">Body picker unavailable</div>;
			}
		};
		return { default: Picker };
	}),
	{ ssr: false, loading: () => <div className="bio-loading">Loading body picker...</div> }
);

export function BodyPicker() {
	const [selected, setSelected] = useState<string[]>([]);
	const [gender, setGender] = useState<'male' | 'female'>('male');
	const [view, setView] = useState<'front' | 'back'>('front');

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🦴 Body Region Selector</h3>
			<p className="bio-card-desc">Click body regions to select them. Supports adult male/female, front/back views.</p>

			<div className="bio-controls">
				<div className="bio-control-group">
					<label>Gender</label>
					<div className="bio-btn-group">
						<button onClick={() => setGender('male')} className={`bio-btn ${gender === 'male' ? 'active' : ''}`}>Male</button>
						<button onClick={() => setGender('female')} className={`bio-btn ${gender === 'female' ? 'active' : ''}`}>Female</button>
					</div>
				</div>
				<div className="bio-control-group">
					<label>View</label>
					<div className="bio-btn-group">
						<button onClick={() => setView('front')} className={`bio-btn ${view === 'front' ? 'active' : ''}`}>Front</button>
						<button onClick={() => setView('back')} className={`bio-btn ${view === 'back' ? 'active' : ''}`}>Back</button>
					</div>
				</div>
			</div>

			<div className="bio-viewer-container">
				<AnatomyPickerModule
					selected={selected}
					onPartSelect={(part: string) => {
						queueMicrotask(() => {
							setSelected(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
						});
					}}
					gender={gender}
					view={view}
				/>
			</div>

			{selected.length > 0 && (
				<div className="bio-result">
					<strong>Selected regions:</strong> {selected.join(', ')}
				</div>
			)}

			<ErrorDisplay errors={[]} />

			<div className="bio-info">
				Supports: Adult Male/Female, Child, Toddler, Infant • Front/Back views • Multi-select with hover highlight
			</div>
		</div>
	);
}

export default BodyPicker;
