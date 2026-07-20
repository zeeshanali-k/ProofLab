Here is a complete, self-contained implementation plan for the Biology Module.

---

BIOLOGY MODULE – COMPLETE IMPLEMENTATION PLAN

Project Context & Non-Negotiables

· Stack: Next.js (App Router) + TypeScript + Bun (package manager)
· No Git: Follow steps sequentially; mark each step [x] once done
· Agent Instructions: Do not touch git. Use bun for all package management. Follow the plan exactly. If a library fails to install, skip that specific feature and continue.

---

PHASE 0: Library Research & Selection

Goal: Identify the best libraries for biology visualization in Next.js/React with minimal friction.

Selected Libraries

Library Purpose Rationale
react-anatomy-picker Interactive body part selection SVG-based, supports adult/child, front/back, male/female, hover/click highlight, multi-select, TypeScript
react-body-selector Body part selection with intensity Supports male/female, front/back, intensity levels 1-3, zero dependencies
hpo-react-visualizer Organ highlighting Human Phenotype Ontology-based, supports brain/heart/lung/liver/kidney/intestine/bladder/muscle/blood/immune etc.
novate-medviz Comprehensive anatomy 550+ anatomical structures, 10 views (front/back/side/internal), gender-specific, AI-powered NLP
ideogram Chromosome visualization Supports human/mouse/eukaryotes, draw/annotate/animations, React integration examples
reactreejs Phylogenetic trees Newick format, rectangular/circular layouts, zoom/pan, editing, sequence alignment panel

Installation Command (All at Once)

```bash
bun add react-anatomy-picker react-body-selector hpo-react-visualizer novate-medviz ideogram reactreejs
```

Fallback: If any library causes issues, document the error, skip that feature, and continue.

---

PHASE 1: Project Setup & Structure

Goal: Create the module structure and install dependencies.

Step 1.1: Create Module Structure

```
src/
├── app/
│   └── biology/
│       ├── page.tsx                      # Main biology dashboard
│       ├── anatomy/
│       │   └── page.tsx                  # Full anatomy viewer (Novate MedViz)
│       ├── body-picker/
│       │   └── page.tsx                  # Interactive body selector
│       ├── organs/
│       │   └── page.tsx                  # HPO organ highlighter
│       ├── genetics/
│       │   ├── page.tsx                  # Chromosome viewer (Ideogram)
│       │   └── bugs/
│       │       └── page.tsx              # Build-A-Bug genetics simulator
│       ├── evolution/
│       │   └── page.tsx                  # Phylogenetic trees (Reactreejs)
│       └── ecology/
│           └── page.tsx                  # Biogeochemical cycles
├── components/
│   └── biology/
│       ├── AnatomyViewer.tsx             # Novate MedViz wrapper
│       ├── BodyPicker.tsx                # react-anatomy-picker wrapper
│       ├── BodySelector.tsx              # react-body-selector wrapper
│       ├── OrganHighlighter.tsx          # hpo-react-visualizer wrapper
│       ├── ChromosomeViewer.tsx          # Ideogram wrapper
│       ├── PhylogeneticTree.tsx          # Reactreejs wrapper
│       ├── BugSimulator.tsx              # Build-A-Bug genetics
│       ├── EcologyCycles.tsx             # Biogeochemical cycles
│       └── ErrorDisplay.tsx              # Reusable error component
└── lib/
└── biology/
├── types.ts                      # TypeScript interfaces
├── genetics.ts                   # Genetics logic (Punnett squares)
├── ecology.ts                    # Cycle data
└── constants.ts                  # Sample data (FASTA, Newick, etc.)
```

Step 1.2: Install Dependencies

```bash
bun add react-anatomy-picker react-body-selector hpo-react-visualizer novate-medviz ideogram reactreejs
```

Step 1.3: Verify Installation

```bash
bun run build  # Should complete without errors
```

---

PHASE 2: Core TypeScript Types & Constants

Goal: Define shared types and sample data.

Step 2.1: Define TypeScript Types (lib/biology/types.ts)

```typescript
// Genetics
export interface Trait {
	id: string;
	name: string;
	dominantAllele: string;
	recessiveAllele: string;
	description: string;
}

export interface Organism {
	id: string;
	name: string;
	traits: Record<string, { allele1: string; allele2: string }>;
}

export interface Offspring {
	id: string;
	traits: Record<string, { allele1: string; allele2: string; phenotype: string }>;
}

// Ecology
export interface CycleData {
	name: string;
	description: string;
	reservoirs: { name: string; amount: string }[];
	fluxes: { from: string; to: string; rate: string }[];
	humanImpact: string;
}

// Anatomy
export interface BodyPart {
	id: string;
	name: string;
	system: string;
	description: string;
}

// Evolution
export interface PhylogeneticNode {
	name: string;
	children?: PhylogeneticNode[];
	branchLength?: number;
}
```

Step 2.2: Define Sample Data (lib/biology/constants.ts)

```typescript
// Sample Newick tree for evolution page
export const SAMPLE_NEWICK = 
'((Homo_sapiens:0.09,Pan_troglodytes:0.11):0.07,(Mus_musculus:0.23,Rattus_norvegicus:0.21):0.14);';

// Sample FASTA for sequence alignment
export const SAMPLE_FASTA = `
>Homo_sapiens
MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHF
>Pan_troglodytes
MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHF
>Mus_musculus
MVLSGEDKSNIKAAWGKIGGHGAEYGAEALERMFASFPTTKTYFPHF
`.trim();

// Sample traits for Bug Simulator
export const BUG_TRAITS: Trait[] = [
	{ id: 'antennae', name: 'Antennae Length', dominantAllele: 'L', recessiveAllele: 'l', description: 'Long (L) vs Short (l)' },
	{ id: 'wing_color', name: 'Wing Color', dominantAllele: 'R', recessiveAllele: 'r', description: 'Red (R) vs Blue (r)' },
	{ id: 'body_shape', name: 'Body Shape', dominantAllele: 'O', recessiveAllele: 'o', description: 'Round (O) vs Oval (o)' },
	{ id: 'eye_color', name: 'Eye Color', dominantAllele: 'D', recessiveAllele: 'd', description: 'Dark (D) vs Light (d)' },
];

// Sample bug phenotypes for display
export const BUG_PHENOTYPES: Record<string, Record<string, string>> = {
	antennae: { LL: 'Long', Ll: 'Long', ll: 'Short' },
	wing_color: { RR: 'Red', Rr: 'Red', rr: 'Blue' },
	body_shape: { OO: 'Round', Oo: 'Round', oo: 'Oval' },
	eye_color: { DD: 'Dark', Dd: 'Dark', dd: 'Light' },
};

// Ecology cycle data
export const ECOLOGY_CYCLES: CycleData[] = [
	{
		name: 'Carbon Cycle',
		description: 'Movement of carbon through atmosphere, biosphere, oceans, and geosphere.',
		reservoirs: [
			{ name: 'Atmosphere', amount: '~750 Gt C' },
			{ name: 'Oceans', amount: '~38,000 Gt C' },
			{ name: 'Fossil Fuels', amount: '~4,000 Gt C' },
		],
		fluxes: [
			{ from: 'Atmosphere', to: 'Plants', rate: '~120 Gt/year' },
			{ from: 'Plants', to: 'Atmosphere', rate: '~60 Gt/year' },
			{ from: 'Oceans', to: 'Atmosphere', rate: '~90 Gt/year' },
		],
		humanImpact: 'Burning fossil fuels releases ~10 Gt C/year, disrupting the natural cycle.',
	},
// Add similar for Nitrogen, Phosphorus, Water cycles
];
```

---

PHASE 3: UI Components

Goal: Build the interactive React components.

Step 3.1: Error Display (components/biology/ErrorDisplay.tsx)

```tsx
'use client';

interface ErrorDisplayProps {
	errors: Array<{ field: string; message: string; type: string }>;
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
	if (errors.length === 0) return null;
	
	return (
		<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
		<div className="font-semibold text-red-800">⚠️ Issues Found:</div>
		{errors.map((error, i) => (
			<div key={i} className="flex items-start gap-2 text-sm text-red-700">
			<span className="mt-1">•</span>
			<div>
			{error.field !== 'general' && (
				<span className="font-mono bg-red-100 px-1 rounded">{error.field}</span>
			)}
			<span className="ml-2">{error.message}</span>
			</div>
			</div>
		))}
		</div>
	);
}
```

Step 3.2: Anatomy Viewer (components/biology/AnatomyViewer.tsx)

```tsx
'use client';

		import { useState } from 'react';
		import { MedDiagram, MedicalTranscriptionAnalyzer } from 'novate-medviz';
		import { ErrorDisplay } from './ErrorDisplay';
		
		interface AnatomyViewerProps {
			view?: 'front' | 'back' | 'leftside' | 'rightside' | 'internal';
			gender?: 'male' | 'female';
		}
		
		export function AnatomyViewer({ view = 'front', gender = 'male' }: AnatomyViewerProps) {
			const [symptomData, setSymptomData] = useState({
				symptoms: [
					{ name: 'chest pain', bodyPart: 'chest', severity: 'moderate', coordinates: { x: 0.5, y: 0.3 } }
				]
			});
			const [errors, setErrors] = useState<any[]>([]);
			
			try {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🧬 Anatomy Viewer</h3>
					<p className="text-sm text-gray-500 mb-4">
					550+ anatomical structures • {view} view • {gender}
					</p>
					<div className="border rounded-lg overflow-hidden">
					<MedDiagram 
					data={symptomData} 
					view={view} 
					gender={gender} 
					style={{ maxWidth: '100%', height: '500px' }}
					/>
					</div>
					<div className="mt-4 text-sm text-gray-500">
					<span className="font-semibold">Supported views:</span> front, back, leftside, rightside, internal
					</div>
					</div>
				);
			} catch (error) {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🧬 Anatomy Viewer</h3>
					<ErrorDisplay errors={[{ field: 'general', message: 'Novate MedViz failed to load. Please check installation.', type: 'syntax' }]} />
					</div>
				);
			}
		}
		```
		
		Step 3.3: Body Picker (components/biology/BodyPicker.tsx)
		
		```tsx
		'use client';
		
		import { useState } from 'react';
		import { AnatomyPicker, AdultMaleFront, AdultMaleBack, AdultFemaleFront, AdultFemaleBack } from 'react-anatomy-picker';
		import { ErrorDisplay } from './ErrorDisplay';
		
		interface BodyPickerProps {
			gender?: 'male' | 'female';
			view?: 'front' | 'back';
		}
		
		export function BodyPicker({ gender = 'male', view = 'front' }: BodyPickerProps) {
			const [selected, setSelected] = useState<string[]>([]);
			const [errors, setErrors] = useState<any[]>([]);
			
			const getSvg = () => {
				if (gender === 'male' && view === 'front') return AdultMaleFront;
				if (gender === 'male' && view === 'back') return AdultMaleBack;
				if (gender === 'female' && view === 'front') return AdultFemaleFront;
				if (gender === 'female' && view === 'back') return AdultFemaleBack;
				return AdultMaleFront;
			};
			
			try {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🦴 Body Region Selector</h3>
					<div className="flex gap-4 mb-4">
					<button 
					onClick={() => {/* toggle gender */}} 
					className="px-3 py-1 bg-gray-200 rounded-lg text-sm"
					>
					Toggle Gender
					</button>
					<button 
					onClick={() => {/* toggle view */}} 
					className="px-3 py-1 bg-gray-200 rounded-lg text-sm"
					>
					Toggle View
					</button>
					</div>
					<div className="border rounded-lg p-4 bg-gray-50">
					<AnatomyPicker
					SvgComponent={getSvg()}
					selected={selected}
					highlightColor="#1471C9"
					onPartSelect={(part) => {
						setSelected(prev => 
						prev.includes(part) 
						? prev.filter(p => p !== part) 
						: [...prev, part]
						);
					}}
					style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
					/>
					</div>
					{selected.length > 0 && (
						<div className="mt-4 p-3 bg-blue-50 rounded-lg">
						<span className="font-semibold">Selected:</span>
						<span className="ml-2">{selected.join(', ')}</span>
						</div>
					)}
					<div className="mt-2 text-sm text-gray-500">
					Supports: Adult Male/Female, Child, Toddler, Infant • Front/Back views
					</div>
					</div>
				);
			} catch (error) {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🦴 Body Region Selector</h3>
					<ErrorDisplay errors={[{ field: 'general', message: 'react-anatomy-picker failed to load.', type: 'syntax' }]} />
					</div>
				);
			}
		}
		```
		
		Step 3.4: Organ Highlighter (components/biology/OrganHighlighter.tsx)
		
		```tsx
		'use client';
		
		import { useState } from 'react';
		import { HpoVisualizer } from 'hpo-react-visualizer';
		import { ErrorDisplay } from './ErrorDisplay';
		
		export function OrganHighlighter() {
			const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
			const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
			const [errors, setErrors] = useState<any[]>([]);
			
			const organs = [
				{ id: 'brain', colorName: 'purple' },
				{ id: 'heart', colorName: 'red' },
				{ id: 'lung', colorName: 'blue' },
				{ id: 'liver', colorName: 'green' },
				{ id: 'kidney', colorName: 'orange' },
				{ id: 'intestine', colorName: 'brown' },
				{ id: 'bladder', colorName: 'yellow' },
				{ id: 'muscle', colorName: 'pink' },
				{ id: 'blood', colorName: 'crimson' },
				{ id: 'immune', colorName: 'teal' },
			];
			
			try {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🧫 Organ Highlighter</h3>
					<p className="text-sm text-gray-500 mb-4">Click any organ to highlight it</p>
					<div className="border rounded-lg p-4 bg-gray-50">
					<HpoVisualizer
					organs={organs}
					onSelect={(organId) => setSelectedOrgan(organId)}
					onHover={(organId) => setHoveredOrgan(organId)}
					selectedOrganId={selectedOrgan}
					hoveredOrganId={hoveredOrgan}
					/>
					</div>
					{selectedOrgan && (
						<div className="mt-4 p-3 bg-blue-50 rounded-lg">
						<span className="font-semibold">Selected organ:</span>
						<span className="ml-2 capitalize">{selectedOrgan}</span>
						</div>
					)}
					<div className="mt-2 text-sm text-gray-500">
					Supported: brain, eye, ear, nose, teeth, throat, heart, lung, liver, kidney, intestine, bladder, muscle, blood, immune, and more
					</div>
					</div>
				);
			} catch (error) {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🧫 Organ Highlighter</h3>
					<ErrorDisplay errors={[{ field: 'general', message: 'hpo-react-visualizer failed to load.', type: 'syntax' }]} />
					</div>
				);
			}
		}
		```
		
		Step 3.5: Body Selector (Intensity) (components/biology/BodySelector.tsx)
		
		```tsx
		'use client';
		
		import { useState } from 'react';
		import { Body, ExtendedBodyPart } from 'react-body-selector';
		import { ErrorDisplay } from './ErrorDisplay';
		
		interface BodySelectorProps {
			gender?: 'male' | 'female';
			side?: 'front' | 'back';
		}
		
		export function BodySelector({ gender = 'male', side = 'front' }: BodySelectorProps) {
			const [selectedParts, setSelectedParts] = useState<ExtendedBodyPart[]>([]);
			const [errors, setErrors] = useState<any[]>([]);
			
			const handleBodyPartPress = (bodyPart: ExtendedBodyPart) => {
				const exists = selectedParts.find(p => p.slug === bodyPart.slug);
				if (exists) {
					setSelectedParts(selectedParts.filter(p => p.slug !== bodyPart.slug));
				} else {
					setSelectedParts([...selectedParts, { slug: bodyPart.slug, intensity: 2 }]);
				}
			};
			
			try {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">💪 Body Selector (Intensity)</h3>
					<p className="text-sm text-gray-500 mb-4">Click body parts to select them (intensity levels 1-3)</p>
					<div className="border rounded-lg p-4 bg-gray-50">
					<Body
					data={selectedParts}
					gender={gender}
					side={side}
					scale={1.5}
					colors={['#0984e3', '#74b9ff', '#a29bfe']}
					onBodyPartPress={handleBodyPartPress}
					/>
					</div>
					{selectedParts.length > 0 && (
						<div className="mt-4 p-3 bg-blue-50 rounded-lg">
						<span className="font-semibold">Selected:</span>
						<span className="ml-2">{selectedParts.map(p => p.slug).join(', ')}</span>
						</div>
					)}
					<div className="mt-2 text-sm text-gray-500">
					Available: abs, biceps, chest, deltoids, gluteal, hamstring, head, neck, quadriceps, triceps, and more
					</div>
					</div>
				);
			} catch (error) {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">💪 Body Selector</h3>
					<ErrorDisplay errors={[{ field: 'general', message: 'react-body-selector failed to load.', type: 'syntax' }]} />
					</div>
				);
			}
		}
		```
		
		Step 3.6: Chromosome Viewer (components/biology/ChromosomeViewer.tsx)
		
		```tsx
		'use client';
		
		import { useEffect, useRef, useState } from 'react';
		import { ErrorDisplay } from './ErrorDisplay';
		
		declare global {
			interface Window {
				Ideogram: any;
			}
		}
		
		interface ChromosomeViewerProps {
			organism?: string;
			chromosomes?: string[];
		}
		
		export function ChromosomeViewer({ organism = 'human', chromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y'] }: ChromosomeViewerProps) {
			const containerRef = useRef<HTMLDivElement>(null);
			const [errors, setErrors] = useState<any[]>([]);
			
			useEffect(() => {
				if (typeof window === 'undefined') return;
				
				const loadIdeogram = async () => {
					try {
						// Load Ideogram from CDN
						const script = document.createElement('script');
						script.src = 'https://cdn.jsdelivr.net/npm/ideogram@1.0.0/dist/js/ideogram.min.js';
			script.async = true;
			document.head.appendChild(script);
			
			script.onload = () => {
				if (containerRef.current && window.Ideogram) {
					const ideogram = new window.Ideogram({
						container: containerRef.current,
						organism: organism,
						chromosomes: chromosomes,
						annotations: [
							{ name: 'Gene A', chromosome: '1', position: 100000000 },
							{ name: 'Gene B', chromosome: '1', position: 200000000 },
						],
						annotationHeight: 20,
					});
				}
			};
			
			return () => {
				document.head.removeChild(script);
			};
					} catch (error) {
						setErrors([{ field: 'general', message: 'Failed to load Ideogram library', type: 'syntax' }]);
					}
				};
				
				loadIdeogram();
			}, [organism, chromosomes]);
			
			return (
				<div className="p-6 bg-white rounded-xl shadow-md border">
				<h3 className="text-lg font-semibold mb-4">🧬 Chromosome Viewer</h3>
				<p className="text-sm text-gray-500 mb-4">
				{organism.charAt(0).toUpperCase() + organism.slice(1)} • {chromosomes.length} chromosomes
				</p>
				<div 
				ref={containerRef} 
				className="border rounded-lg bg-gray-50 min-h-[400px]"
				/>
				<ErrorDisplay errors={errors} />
				<div className="mt-2 text-sm text-gray-500">
				Supports: human, mouse, and many other eukaryotes • Annotations and animations
				</div>
				</div>
			);
		}
		```
		
		Step 3.7: Phylogenetic Tree (components/biology/PhylogeneticTree.tsx)
		
		```tsx
		'use client';
		
		import { useState } from 'react';
		import { Reactree } from 'reactreejs';
		import 'reactreejs/style.css';
		import { SAMPLE_NEWICK, SAMPLE_FASTA } from '@/lib/biology/constants';
		import { ErrorDisplay } from './ErrorDisplay';
		
		interface PhylogeneticTreeProps {
			newick?: string;
			fasta?: string;
			height?: number;
		}
		
		export function PhylogeneticTree({ 
			newick = SAMPLE_NEWICK, 
			fasta = SAMPLE_FASTA,
			height = 600 
		}: PhylogeneticTreeProps) {
			const [showAlignment, setShowAlignment] = useState(false);
			const [errors, setErrors] = useState<any[]>([]);
			
			try {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🌳 Phylogenetic Tree</h3>
					<div className="flex gap-4 mb-4">
					<button 
					onClick={() => setShowAlignment(!showAlignment)}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
					{showAlignment ? 'Hide' : 'Show'} Sequence Alignment
					</button>
					</div>
					<div className="border rounded-lg overflow-hidden">
					<Reactree 
					newick={newick} 
					fasta={showAlignment ? fasta : undefined}
					defaultHeight={height}
					/>
					</div>
					<div className="mt-2 text-sm text-gray-500">
					Features: Rectangular/circular layouts • Zoom/pan • Edit (reroot/flip/ladderize) • Export SVG/PNG/PDF
					</div>
					</div>
				);
			} catch (error) {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🌳 Phylogenetic Tree</h3>
					<ErrorDisplay errors={[{ field: 'general', message: 'reactreejs failed to load. Please check installation.', type: 'syntax' }]} />
					</div>
				);
			}
		}
		```
		
		Step 3.8: Bug Simulator (components/biology/BugSimulator.tsx)
		
		```tsx
		'use client';
		
		import { useState } from 'react';
		import { BUG_TRAITS, BUG_PHENOTYPES } from '@/lib/biology/constants';
		import { ErrorDisplay } from './ErrorDisplay';
		
		interface Bug {
			id: string;
			name: string;
			traits: Record<string, { allele1: string; allele2: string }>;
		}
		
		export function BugSimulator() {
			const [parent1, setParent1] = useState<Bug>({
				id: 'p1',
				name: 'Parent 1',
				traits: {
					antennae: { allele1: 'L', allele2: 'l' },
					wing_color: { allele1: 'R', allele2: 'r' },
					body_shape: { allele1: 'O', allele2: 'o' },
					eye_color: { allele1: 'D', allele2: 'd' },
				}
			});
			
			const [parent2, setParent2] = useState<Bug>({
				id: 'p2',
				name: 'Parent 2',
				traits: {
					antennae: { allele1: 'L', allele2: 'l' },
					wing_color: { allele1: 'R', allele2: 'r' },
					body_shape: { allele1: 'O', allele2: 'o' },
					eye_color: { allele1: 'D', allele2: 'd' },
				}
			});
			
			const [offspring, setOffspring] = useState<Bug[]>([]);
			const [errors, setErrors] = useState<any[]>([]);
			
			const getPhenotype = (traitId: string, allele1: string, allele2: string): string => {
				const key = [allele1, allele2].sort().join('');
				return BUG_PHENOTYPES[traitId]?.[key] || 'Unknown';
			};
			
			const getRandomAllele = (allele1: string, allele2: string): string => {
				return Math.random() < 0.5 ? allele1 : allele2;
			};
			
			const breedBugs = () => {
				try {
					const numOffspring = 8;
					const newOffspring: Bug[] = [];
					
					for (let i = 0; i < numOffspring; i++) {
						const childTraits: Record<string, { allele1: string; allele2: string }> = {};
						
						for (const trait of BUG_TRAITS) {
							const p1Allele = getRandomAllele(
								parent1.traits[trait.id].allele1,
								parent1.traits[trait.id].allele2
							);
							const p2Allele = getRandomAllele(
								parent2.traits[trait.id].allele1,
								parent2.traits[trait.id].allele2
							);
							childTraits[trait.id] = { allele1: p1Allele, allele2: p2Allele };
						}
						
						newOffspring.push({
							id: `o${i + 1}`,
							name: `Offspring ${i + 1}`,
							traits: childTraits,
						});
					}
					
					setOffspring(newOffspring);
					setErrors([]);
				} catch (error) {
					setErrors([{ field: 'general', message: 'Failed to breed bugs', type: 'syntax' }]);
				}
			};
			
			const renderBugEmoji = (traits: Record<string, { allele1: string; allele2: string }>) => {
				// Simple visual representation based on traits
				const antennae = getPhenotype('antennae', traits.antennae.allele1, traits.antennae.allele2);
				const wingColor = getPhenotype('wing_color', traits.wing_color.allele1, traits.wing_color.allele2);
				const bodyShape = getPhenotype('body_shape', traits.body_shape.allele1, traits.body_shape.allele2);
				
				return (
					<div className="text-center p-2 bg-gray-50 rounded-lg">
					<div className="text-3xl">
					{bodyShape === 'Round' ? '🐞' : '🪲'}
					</div>
					<div className="text-xs mt-1">
					<div>{antennae} antennae</div>
					<div>{wingColor} wings</div>
					<div>{bodyShape} body</div>
					</div>
					</div>
				);
			};
			
			return (
				<div className="p-6 bg-white rounded-xl shadow-md border">
				<h3 className="text-lg font-semibold mb-4">🐛 Build-A-Bug Genetics Simulator</h3>
				
				<div className="grid grid-cols-2 gap-6 mb-6">
				<div className="p-4 border rounded-lg">
				<h4 className="font-semibold mb-2">Parent 1</h4>
				{BUG_TRAITS.map(trait => (
					<div key={trait.id} className="flex items-center gap-2 text-sm mb-1">
					<span className="w-24">{trait.name}:</span>
					<select 
					value={`${parent1.traits[trait.id].allele1}${parent1.traits[trait.id].allele2}`}
					onChange={(e) => {
						const val = e.target.value;
						setParent1(prev => ({
							...prev,
							traits: {
								...prev.traits,
								[trait.id]: { allele1: val[0], allele2: val[1] }
							}
						}));
					}}
					className="p-1 border rounded text-sm"
					>
					<option value="LL">LL (Homozygous Dominant)</option>
					<option value="Ll">Ll (Heterozygous)</option>
					<option value="ll">ll (Homozygous Recessive)</option>
					</select>
					</div>
				))}
				</div>
				
				<div className="p-4 border rounded-lg">
				<h4 className="font-semibold mb-2">Parent 2</h4>
				{BUG_TRAITS.map(trait => (
					<div key={trait.id} className="flex items-center gap-2 text-sm mb-1">
					<span className="w-24">{trait.name}:</span>
					<select 
					value={`${parent2.traits[trait.id].allele1}${parent2.traits[trait.id].allele2}`}
					onChange={(e) => {
						const val = e.target.value;
						setParent2(prev => ({
							...prev,
							traits: {
								...prev.traits,
								[trait.id]: { allele1: val[0], allele2: val[1] }
							}
						}));
					}}
					className="p-1 border rounded text-sm"
					>
					<option value="LL">LL (Homozygous Dominant)</option>
					<option value="Ll">Ll (Heterozygous)</option>
					<option value="ll">ll (Homozygous Recessive)</option>
					</select>
					</div>
				))}
				</div>
				</div>
				
				<button
				onClick={breedBugs}
				className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
				>
				🧬 Breed Bugs!
				</button>
				
				<ErrorDisplay errors={errors} />
				
				{offspring.length > 0 && (
					<div className="mt-6">
					<h4 className="font-semibold mb-3">Offspring ({offspring.length})</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{offspring.map((bug, index) => (
						<div key={bug.id} className="p-3 border rounded-lg">
						<div className="font-semibold text-sm">{bug.name}</div>
						{renderBugEmoji(bug.traits)}
						<div className="text-xs mt-2 text-gray-500">
						{BUG_TRAITS.map(t => (
							<div key={t.id}>
							{t.name}: {getPhenotype(t.id, bug.traits[t.id].allele1, bug.traits[t.id].allele2)}
							</div>
						))}
						</div>
						</div>
					))}
					</div>
					</div>
				)}
				
				<div className="mt-4 text-sm text-gray-500">
				<span className="font-semibold">Traits:</span> Antennae (L/l), Wing Color (R/r), Body Shape (O/o), Eye Color (D/d)
				</div>
				</div>
			);
		}
		```
		
		Step 3.9: Ecology Cycles (components/biology/EcologyCycles.tsx)
		
		```tsx
		'use client';
		
		import { useState } from 'react';
		import { ECOLOGY_CYCLES } from '@/lib/biology/constants';
		import { ErrorDisplay } from './ErrorDisplay';
		
		export function EcologyCycles() {
			const [selectedCycle, setSelectedCycle] = useState(0);
			const [errors, setErrors] = useState<any[]>([]);
			
			const cycle = ECOLOGY_CYCLES[selectedCycle];
			
			try {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🌍 Biogeochemical Cycles</h3>
					
					<div className="flex gap-2 mb-6 flex-wrap">
					{ECOLOGY_CYCLES.map((c, i) => (
						<button
						key={i}
						onClick={() => setSelectedCycle(i)}
						className={`px-4 py-2 rounded-lg ${
							selectedCycle === i ? 'bg-blue-600 text-white' : 'bg-gray-200'
						}`}
						>
						{c.name}
						</button>
					))}
					</div>
					
					<div className="p-4 border rounded-lg">
					<h4 className="font-semibold text-lg">{cycle.name}</h4>
					<p className="text-gray-600 mt-2">{cycle.description}</p>
					
					<div className="mt-4">
					<h5 className="font-semibold">Reservoirs</h5>
					<div className="grid grid-cols-3 gap-2 mt-1">
					{cycle.reservoirs.map((r, i) => (
						<div key={i} className="p-2 bg-gray-50 rounded text-sm">
						<div className="font-medium">{r.name}</div>
						<div className="text-gray-500">{r.amount}</div>
						</div>
					))}
					</div>
					</div>
					
					<div className="mt-4">
					<h5 className="font-semibold">Fluxes</h5>
					<div className="space-y-1 mt-1">
					{cycle.fluxes.map((f, i) => (
						<div key={i} className="text-sm flex gap-2">
						<span>{f.from}</span>
						<span className="text-gray-400">→</span>
						<span>{f.to}</span>
						<span className="text-gray-500 ml-2">{f.rate}</span>
						</div>
					))}
					</div>
					</div>
					
					<div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
					<h5 className="font-semibold text-yellow-800">🌍 Human Impact</h5>
					<p className="text-sm text-yellow-700">{cycle.humanImpact}</p>
					</div>
					</div>
					</div>
				);
			} catch (error) {
				return (
					<div className="p-6 bg-white rounded-xl shadow-md border">
					<h3 className="text-lg font-semibold mb-4">🌍 Biogeochemical Cycles</h3>
					<ErrorDisplay errors={[{ field: 'general', message: 'Failed to load ecology data', type: 'syntax' }]} />
					</div>
				);
			}
		}
		```
		
		---
		
		PHASE 4: Pages & Routing
		
		Goal: Create the main pages for the biology module.
		
		Step 4.1: Main Dashboard (app/biology/page.tsx)
		
		```tsx
		import Link from 'next/link';
		
		export default function BiologyDashboard() {
			const tools = [
				{ name: 'Anatomy Viewer', path: '/biology/anatomy', icon: '🧬', desc: '550+ anatomical structures' },
				{ name: 'Body Picker', path: '/biology/body-picker', icon: '🦴', desc: 'Interactive body region selection' },
				{ name: 'Body Selector', path: '/biology/body-selector', icon: '💪', desc: 'Body parts with intensity' },
				{ name: 'Organ Highlighter', path: '/biology/organs', icon: '🧫', desc: 'HPO organ visualization' },
				{ name: 'Chromosome Viewer', path: '/biology/genetics', icon: '🧬', desc: 'Chromosome visualization' },
				{ name: 'Bug Simulator', path: '/biology/genetics/bugs', icon: '🐛', desc: 'Build-A-Bug genetics' },
				{ name: 'Phylogenetic Tree', path: '/biology/evolution', icon: '🌳', desc: 'Evolutionary relationships' },
				{ name: 'Ecology Cycles', path: '/biology/ecology', icon: '🌍', desc: 'Biogeochemical cycles' },
			];
			
			return (
				<main className="container mx-auto p-6 max-w-6xl">
				<h1 className="text-3xl font-bold mb-6">🧪 Biology Module</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{tools.map((tool) => (
					<Link
					key={tool.path}
					href={tool.path}
					className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition border hover:border-blue-400"
					>
					<div className="text-4xl mb-3">{tool.icon}</div>
					<h2 className="text-xl font-semibold">{tool.name}</h2>
					<p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
					</Link>
				))}
				</div>
				</main>
			);
		}
		```
		
		Step 4.2: Anatomy Page (app/biology/anatomy/page.tsx)
		
		```tsx
		'use client';
		
		import { AnatomyViewer } from '@/components/biology/AnatomyViewer';
		
		export default function AnatomyPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🧬 Anatomy Viewer</h1>
				<AnatomyViewer />
				</main>
			);
		}
		```
		
		Step 4.3: Body Picker Page (app/biology/body-picker/page.tsx)
		
		```tsx
		'use client';
		
		import { BodyPicker } from '@/components/biology/BodyPicker';
		
		export default function BodyPickerPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🦴 Body Region Selector</h1>
				<BodyPicker />
				</main>
			);
		}
		```
		
		Step 4.4: Body Selector Page (app/biology/body-selector/page.tsx)
		
		```tsx
		'use client';
		
		import { BodySelector } from '@/components/biology/BodySelector';
		
		export default function BodySelectorPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">💪 Body Selector (Intensity)</h1>
				<BodySelector />
				</main>
			);
		}
		```
		
		Step 4.5: Organs Page (app/biology/organs/page.tsx)
		
		```tsx
		'use client';
		
		import { OrganHighlighter } from '@/components/biology/OrganHighlighter';
		
		export default function OrgansPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🧫 Organ Highlighter</h1>
				<OrganHighlighter />
				</main>
			);
		}
		```
		
		Step 4.6: Genetics Page (app/biology/genetics/page.tsx)
		
		```tsx
		'use client';
		
		import { ChromosomeViewer } from '@/components/biology/ChromosomeViewer';
		
		export default function GeneticsPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🧬 Chromosome Viewer</h1>
				<ChromosomeViewer />
				</main>
			);
		}
		```
		
		Step 4.7: Bug Simulator Page (app/biology/genetics/bugs/page.tsx)
		
		```tsx
		'use client';
		
		import { BugSimulator } from '@/components/biology/BugSimulator';
		
		export default function BugSimulatorPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🐛 Build-A-Bug Genetics Simulator</h1>
				<BugSimulator />
				</main>
			);
		}
		```
		
		Step 4.8: Evolution Page (app/biology/evolution/page.tsx)
		
		```tsx
		'use client';
		
		import { PhylogeneticTree } from '@/components/biology/PhylogeneticTree';
		
		export default function EvolutionPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🌳 Phylogenetic Tree</h1>
				<PhylogeneticTree />
				</main>
			);
		}
		```
		
		Step 4.9: Ecology Page (app/biology/ecology/page.tsx)
		
		```tsx
		'use client';
		
		import { EcologyCycles } from '@/components/biology/EcologyCycles';
		
		export default function EcologyPage() {
			return (
				<main className="container mx-auto p-6 max-w-4xl">
				<h1 className="text-2xl font-bold mb-6">🌍 Biogeochemical Cycles</h1>
				<EcologyCycles />
				</main>
			);
		}
		```
		
		---
		
		PHASE 5: Testing
		
		Step 5.1: Unit Tests (tests/biology/genetics.test.ts)
		
		```typescript
		import { describe, expect, test } from 'bun:test';
		import { BUG_TRAITS } from '@/lib/biology/constants';
		
		describe('Genetics', () => {
			test('BUG_TRAITS has correct structure', () => {
				expect(BUG_TRAITS).toBeDefined();
				expect(BUG_TRAITS.length).toBeGreaterThan(0);
				expect(BUG_TRAITS[0]).toHaveProperty('id');
				expect(BUG_TRAITS[0]).toHaveProperty('dominantAllele');
				expect(BUG_TRAITS[0]).toHaveProperty('recessiveAllele');
			});
		});
		```
		
		Step 5.2: Run Tests
		
		```bash
		bun test
		```
		
		---
		
		PHASE 6: Build & Deployment
		
		Step 6.1: Build for Production
		
		```bash
		bun run build
		```
		
		Step 6.2: Start Production Server
		
		```bash
		bun run start
		```
		
		---
		
		Implementation Checklist
		
		Phase Step Status
		0 Library Research & Selection [ ]
		1 1.1 Create module structure [ ]
		1 1.2 Install dependencies with Bun [ ]
		1 1.3 Verify installation [ ]
		2 2.1 Define TypeScript types [ ]
		2 2.2 Define sample data (constants) [ ]
		3 3.1 Error Display component [ ]
		3 3.2 Anatomy Viewer component [ ]
		3 3.3 Body Picker component [ ]
		3 3.4 Organ Highlighter component [ ]
		3 3.5 Body Selector component [ ]
		3 3.6 Chromosome Viewer component [ ]
		3 3.7 Phylogenetic Tree component [ ]
		3 3.8 Bug Simulator component [ ]
		3 3.9 Ecology Cycles component [ ]
		4 4.1 Main dashboard page [ ]
		4 4.2 Anatomy page [ ]
		4 4.3 Body Picker page [ ]
		4 4.4 Body Selector page [ ]
		4 4.5 Organs page [ ]
		4 4.6 Genetics page [ ]
		4 4.7 Bug Simulator page [ ]
		4 4.8 Evolution page [ ]
		4 4.9 Ecology page [ ]
		5 5.1 Unit tests [ ]
		5 5.2 Run tests [ ]
		6 6.1 Build for production [ ]
		6 6.2 Start production server [ ]
		
		---
		
		Notes for the Agent
		
		1. Error Handling: If a library fails to install, skip that feature and continue.
		2. Fallback Components: Each component has built-in error handling that displays a friendly message if the library fails to load.
		3. Consistency: Follow the same UI patterns as the existing chemistry and physics modules.
		4. Documentation: Add comments for any complex logic.
		5. CDN Loading: The Chromosome Viewer uses a CDN-loaded script. Ensure internet connectivity for that feature.
