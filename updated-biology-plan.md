You are completely right — the previous plan was too surface-level. A real biology module needs dedicated, detailed sections for each organ system with 3D models, labeled structures, and rich educational content. Let's build this properly from the ground up.

---

🧬 BIOLOGY MODULE – COMPLETE IMPLEMENTATION PLAN (REVISED)

Project Context & Non‑Negotiable

· Stack: Next.js (App Router) + TypeScript + Bun
· No Git: Follow steps sequentially; mark each step [x] once done
· Agent Instructions: Do not touch git. Use bun for all package management. Follow the plan exactly.

---

PHASE 0: Library Research & Asset Sourcing

Goal: Identify the best libraries and 3D assets for detailed organ system visualization.

Selected Libraries

Library Purpose Rationale
@medhuelabs/openhuman-viewer Full 3D anatomy viewer React + Three.js, OpenHuman Atlas integration, system toggling, Apache-2.0
novate-medviz 2D anatomical diagrams 550+ structures, 10 views, gender-specific, AI-powered
hpo-react-visualizer Organ highlighting Simple React component for HPO organ visualization
react-anatomy-picker Body region selector SVG-based, multiple anatomy types, multi-select
@react-three/fiber + @react-three/drei 3D rendering Industry standard for Three.js in React
three.js 3D engine Core 3D library

3D Asset Sources

Source Description License
Open 3D Model (AnatomyTOOL) Full human anatomy model by Leiden/ Utrecht/Maastricht Universities CC BY-SA
OpenHuman Atlas Smart 3D platform for anatomy Free/Open-access
BioDigital Human 3D atlas of human anatomy Free limited access
Z-Anatomy Free and open-source anatomy Open-source

Installation Command

```bash
bun add @medhuelabs/openhuman-viewer novate-medviz hpo-react-visualizer react-anatomy-picker @react-three/fiber @react-three/drei three
bun add -d @types/three
```

---

PHASE 1: Project Structure

Goal: Create the complete folder structure for the biology module.

Step 1.1: Create Structure

```
src/
├── app/
│   └── biology/
│       ├── page.tsx                      # Main dashboard
│       ├── systems/
│       │   ├── page.tsx                  # Systems overview
│       │   ├── skeletal/
│       │   │   └── page.tsx              # Skeletal system
│       │   ├── muscular/
│       │   │   └── page.tsx              # Muscular system
│       │   ├── nervous/
│       │   │   └── page.tsx              # Nervous system (brain + nerves)
│       │   ├── circulatory/
│       │   │   └── page.tsx              # Circulatory system
│       │   ├── respiratory/
│       │   │   └── page.tsx              # Respiratory system
│       │   ├── digestive/
│       │   │   └── page.tsx              # Digestive system
│       │   ├── urinary/
│       │   │   └── page.tsx              # Urinary/Excretory system
│       │   ├── lymphatic/
│       │   │   └── page.tsx              # Lymphatic/Immune system
│       │   └── endocrine/
│       │       └── page.tsx              # Endocrine system
│       ├── cells/
│       │   └── page.tsx                  # Cell types & structures
│       └── ecology/
│           └── page.tsx                  # Biogeochemical cycles
├── components/
│   └── biology/
│       ├── systems/
│       │   ├── SystemViewer3D.tsx        # 3D anatomy viewer (OpenHuman)
│       │   ├── SystemDiagram2D.tsx       # 2D diagram (Novate MedViz)
│       │   ├── OrganHighlighter.tsx      # HPO organ highlighter
│       │   ├── BodyRegionPicker.tsx      # react-anatomy-picker
│       │   └── SystemInfoPanel.tsx       # Educational content panel
│       ├── shared/
│       │   ├── SystemNavigation.tsx      # System selector tabs
│       │   ├── StructureLabel.tsx        # Labeled structure display
│       │   └── ErrorDisplay.tsx          # Error component
│       └── data/
│           └── systemData.ts             # Educational content for each system
├── lib/
│   └── biology/
│       ├── types.ts                      # TypeScript interfaces
│       ├── constants.ts                  # System definitions
│       └── systemContent.ts              # Detailed educational content
└── public/
└── assets/
└── anatomy/                       # 3D model assets (GLB/GLTF)
├── skeletal.glb
├── muscular.glb
├── nervous.glb
├── circulatory.glb
├── respiratory.glb
├── digestive.glb
├── urinary.glb
├── lymphatic.glb
└── endocrine.glb
```

---

PHASE 2: Core Types & Data

Goal: Define TypeScript interfaces and educational content for each system.

Step 2.1: TypeScript Types (lib/biology/types.ts)

```typescript
export type SystemId =
| 'skeletal'
| 'muscular'
| 'nervous'
| 'circulatory'
| 'respiratory'
| 'digestive'
| 'urinary'
| 'lymphatic'
| 'endocrine';

export interface SystemInfo {
	id: SystemId;
	name: string;
	icon: string;
	description: string;
	functions: string[];
	mainOrgans: OrganInfo[];
	keyStructures: StructureInfo[];
	commonConditions: ConditionInfo[];
	funFact: string;
	color: string;
}

export interface OrganInfo {
	name: string;
	description: string;
	location: string;
	function: string;
	imageUrl?: string;
	modelId?: string; // For 3D model referencing
}

export interface StructureInfo {
	name: string;
	description: string;
	type: 'organ' | 'tissue' | 'cell' | 'bone' | 'muscle' | 'nerve' | 'vessel';
}

export interface ConditionInfo {
	name: string;
	description: string;
	symptoms: string[];
}

export interface CellTypeInfo {
	name: string;
	description: string;
	location: string;
	function: string;
	imageUrl?: string;
	keyFeatures: string[];
}
```

Step 2.2: Educational Content (lib/biology/systemContent.ts)

```typescript
import { SystemInfo } from './types';

export const SYSTEM_CONTENT: Record<SystemId, SystemInfo> = {
	skeletal: {
		id: 'skeletal',
		name: 'Skeletal System',
		icon: '🦴',
		description: 'The skeletal system provides structure, protection, and movement for the body. It consists of 206 bones in the adult human body.',
		functions: [
			'Provides structural support for the body',
			'Protects vital organs (skull protects brain, ribcage protects heart and lungs)',
			'Enables movement through joints and muscle attachments',
			'Produces blood cells in bone marrow',
			'Stores minerals like calcium and phosphorus'
		],
		mainOrgans: [
			{ name: 'Skull', description: 'Protects the brain and forms the structure of the face.', location: 'Head', function: 'Protection and facial structure' },
			{ name: 'Spine (Vertebral Column)', description: '33 vertebrae forming the central axis of the skeleton.', location: 'Back', function: 'Supports the body and protects the spinal cord' },
			{ name: 'Ribcage', description: '12 pairs of ribs protecting the thoracic cavity.', location: 'Chest', function: 'Protects heart and lungs' },
			{ name: 'Femur', description: 'The longest and strongest bone in the body.', location: 'Thigh', function: 'Supports body weight and enables movement' },
		],
		keyStructures: [
			{ name: 'Compact Bone', description: 'Dense outer layer of bone tissue.', type: 'tissue' },
			{ name: 'Spongy Bone', description: 'Porous inner bone containing bone marrow.', type: 'tissue' },
			{ name: 'Cartilage', description: 'Flexible connective tissue at joints.', type: 'tissue' },
			{ name: 'Ligaments', description: 'Connect bone to bone at joints.', type: 'tissue' },
		],
		commonConditions: [
			{ name: 'Osteoporosis', description: 'Loss of bone density making bones fragile.', symptoms: ['Bone fractures', 'Back pain', 'Loss of height'] },
			{ name: 'Fracture', description: 'Broken bone due to trauma or stress.', symptoms: ['Pain', 'Swelling', 'Inability to move the affected area'] },
		],
		funFact: 'The smallest bone in the human body is the stapes in the ear, only 3mm long!',
		color: '#f59e0b'
	},
	// ... Define all other systems similarly
};
```

Step 2.3: System Definitions (lib/biology/constants.ts)

```typescript
import { SystemId } from './types';

export const SYSTEM_IDS: SystemId[] = [
	'skeletal', 'muscular', 'nervous', 'circulatory', 
'respiratory', 'digestive', 'urinary', 'lymphatic', 'endocrine'
];

export const SYSTEM_LABELS: Record<SystemId, string> = {
	skeletal: 'Skeletal System',
	muscular: 'Muscular System',
	nervous: 'Nervous System',
	circulatory: 'Circulatory System',
	respiratory: 'Respiratory System',
	digestive: 'Digestive System',
	urinary: 'Urinary System',
	lymphatic: 'Lymphatic & Immune System',
	endocrine: 'Endocrine System'
};

export const SYSTEM_ICONS: Record<SystemId, string> = {
	skeletal: '🦴',
	muscular: '💪',
	nervous: '🧠',
	circulatory: '❤️',
	respiratory: '🫁',
	digestive: '🍽️',
	urinary: '🧫',
	lymphatic: '🛡️',
	endocrine: '🧬'
};
```

---

PHASE 3: Core Components

Goal: Build the reusable components for the biology module.

Step 3.1: Error Display (components/biology/shared/ErrorDisplay.tsx)

```tsx
'use client';

interface ErrorDisplayProps {
	errors: Array<{ field: string; message: string; type: string }>;
	onFix?: (field: string) => void;
}

export function ErrorDisplay({ errors, onFix }: ErrorDisplayProps) {
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

Step 3.2: 3D System Viewer (components/biology/systems/SystemViewer3D.tsx)

This uses the OpenHuman Viewer library to render 3D anatomy models.

```tsx
'use client';

	import { useEffect, useState } from 'react';
	import { 
		AtlasViewer, 
		DEFAULT_ATLAS_TEXTURE_QUALITY, 
		createAtlasPerformanceProfile,
		getRuntimeSystemBundlePath,
		getRuntimeSystemTextureManifestPath,
		type AtlasViewerSystem 
	} from '@medhuelabs/openhuman-viewer';
	import { SystemId } from '@/lib/biology/types';
	import { ErrorDisplay } from '../shared/ErrorDisplay';
	
	interface SystemViewer3DProps {
		systemId: SystemId;
		selectedObjectId?: string | null;
		onSelect?: (objectId: string) => void;
	}
	
	const SYSTEM_BUNDLE_MAP: Record<SystemId, string> = {
		skeletal: 'skeletal',
		muscular: 'muscular',
		nervous: 'nervous',
		circulatory: 'cardiovascular',
		respiratory: 'respiratory',
		digestive: 'digestive',
		urinary: 'urinary',
		lymphatic: 'lymphatic',
		endocrine: 'endocrine'
	};
	
	export function SystemViewer3D({ 
		systemId, 
		selectedObjectId = null, 
		onSelect 
	}: SystemViewer3DProps) {
		const [errors, setErrors] = useState<any[]>([]);
		const [systems, setSystems] = useState<AtlasViewerSystem[]>([]);
		
		useEffect(() => {
			try {
				const assetBasePath = '/assets/anatomy';
				const systemKey = SYSTEM_BUNDLE_MAP[systemId];
				
				const viewerSystems: AtlasViewerSystem[] = [{
					bundleUrl: getRuntimeSystemBundlePath(systemKey, { basePath: assetBasePath }),
				  systemId: systemKey,
				  textureManifestUrl: getRuntimeSystemTextureManifestPath(systemKey, { 
					  basePath: assetBasePath 
				  }),
				  textureQuality: DEFAULT_ATLAS_TEXTURE_QUALITY,
				  visible: true,
				}].filter((system): system is AtlasViewerSystem => Boolean(system.bundleUrl));
				
				setSystems(viewerSystems);
				setErrors([]);
			} catch (error) {
				setErrors([{ field: 'general', message: 'Failed to load 3D anatomy model', type: 'syntax' }]);
			}
		}, [systemId]);
		
		if (errors.length > 0) {
			return <ErrorDisplay errors={errors} />;
		}
		
		return (
			<div className="w-full h-[500px] bg-gray-50 rounded-lg border overflow-hidden">
			<AtlasViewer
			bodyPosition="anatomical"
			colorScheme="light"
			performanceProfile={createAtlasPerformanceProfile()}
			selectedObjectId={selectedObjectId}
			systems={systems}
			onObjectClick={(objectId) => onSelect?.(objectId)}
			/>
			</div>
		);
	}
	```
	
	Step 3.3: 2D System Diagram (components/biology/systems/SystemDiagram2D.tsx)
	
	Uses Novate MedViz for 2D anatomical diagrams.
	
	```tsx
	'use client';
	
	import { MedDiagram } from 'novate-medviz';
	import { SystemId } from '@/lib/biology/types';
	import { ErrorDisplay } from '../shared/ErrorDisplay';
	
	interface SystemDiagram2DProps {
		systemId: SystemId;
		view?: 'front' | 'back' | 'leftside' | 'rightside' | 'internal';
		gender?: 'male' | 'female';
	}
	
	const SYSTEM_VIEW_MAP: Record<SystemId, 'front' | 'back' | 'leftside' | 'rightside' | 'internal'> = {
		skeletal: 'front',
		muscular: 'front',
		nervous: 'internal',
		circulatory: 'front',
		respiratory: 'internal',
		digestive: 'internal',
		urinary: 'internal',
		lymphatic: 'front',
		endocrine: 'internal'
	};
	
	export function SystemDiagram2D({ 
		systemId, 
		view, 
		gender = 'male' 
	}: SystemDiagram2DProps) {
		const diagramView = view || SYSTEM_VIEW_MAP[systemId] || 'front';
		
		try {
			return (
				<div className="w-full bg-white rounded-lg border overflow-hidden p-4">
				<MedDiagram
				data={{ symptoms: [] }}
				view={diagramView}
				gender={gender}
				style={{ maxWidth: '100%', height: '400px' }}
				/>
				<div className="mt-2 text-xs text-gray-500 text-center">
				View: {diagramView} • Gender: {gender} • 550+ anatomical structures[reference:11]
				</div>
				</div>
			);
		} catch (error) {
			return (
				<ErrorDisplay errors={[{ field: 'general', message: '2D diagram failed to load', type: 'syntax' }]} />
			);
		}
	}
	```
	
	Step 3.4: Organ Highlighter (components/biology/systems/OrganHighlighter.tsx)
	
	Uses HPO React Visualizer.
	
	```tsx
	'use client';
	
	import { useState } from 'react';
	import { HpoVisualizer } from 'hpo-react-visualizer';
	import { ErrorDisplay } from '../shared/ErrorDisplay';
	
	interface OrganHighlighterProps {
		onSelect?: (organId: string) => void;
	}
	
	export function OrganHighlighter({ onSelect }: OrganHighlighterProps) {
		const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
		
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
				<div className="p-4 bg-white rounded-lg border">
				<HpoVisualizer
				organs={organs}
				onSelect={(organId) => {
					setSelectedOrgan(organId);
					onSelect?.(organId);
				}}
				selectedOrganId={selectedOrgan}
				/>
				{selectedOrgan && (
					<div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
					<span className="font-semibold">Selected organ:</span>
					<span className="ml-2 capitalize">{selectedOrgan}</span>
					</div>
				)}
				<div className="mt-2 text-xs text-gray-500 text-center">
				Supported organs: brain, heart, lung, liver, kidney, intestine, bladder, muscle, blood, immune[reference:13]
				</div>
				</div>
			);
		} catch (error) {
			return (
				<ErrorDisplay errors={[{ field: 'general', message: 'Organ highlighter failed to load', type: 'syntax' }]} />
			);
		}
	}
	```
	
	Step 3.5: System Info Panel (components/biology/systems/SystemInfoPanel.tsx)
	
	```tsx
	'use client';
	
	import { SystemInfo } from '@/lib/biology/types';
	
	interface SystemInfoPanelProps {
		system: SystemInfo;
	}
	
	export function SystemInfoPanel({ system }: SystemInfoPanelProps) {
		return (
			<div className="p-6 bg-white rounded-lg border space-y-4">
			<div className="flex items-center gap-3">
			<span className="text-4xl">{system.icon}</span>
			<h2 className="text-2xl font-bold">{system.name}</h2>
			</div>
			
			<p className="text-gray-700">{system.description}</p>
			
			<div>
			<h3 className="font-semibold text-lg mb-2">🔬 Functions</h3>
			<ul className="list-disc list-inside space-y-1 text-gray-700">
			{system.functions.map((fn, i) => (
				<li key={i}>{fn}</li>
			))}
			</ul>
			</div>
			
			<div>
			<h3 className="font-semibold text-lg mb-2">🧬 Main Organs</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
			{system.mainOrgans.map((organ, i) => (
				<div key={i} className="p-3 bg-gray-50 rounded-lg border">
				<div className="font-semibold">{organ.name}</div>
				<div className="text-sm text-gray-600">{organ.function}</div>
				<div className="text-xs text-gray-400">{organ.location}</div>
				</div>
			))}
			</div>
			</div>
			
			<div>
			<h3 className="font-semibold text-lg mb-2">🔍 Key Structures</h3>
			<div className="flex flex-wrap gap-2">
			{system.keyStructures.map((struct, i) => (
				<span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
				{struct.name}
				</span>
			))}
			</div>
			</div>
			
			<div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
			<span className="font-semibold">💡 Fun Fact:</span>
			<span className="ml-2">{system.funFact}</span>
			</div>
			
			<div>
			<h3 className="font-semibold text-lg mb-2">⚠️ Common Conditions</h3>
			{system.commonConditions.map((condition, i) => (
				<div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200 mb-2">
				<div className="font-semibold text-red-700">{condition.name}</div>
				<div className="text-sm text-gray-700">{condition.description}</div>
				<div className="text-xs text-gray-500">Symptoms: {condition.symptoms.join(', ')}</div>
				</div>
			))}
			</div>
			</div>
		);
	}
	```
	
	Step 3.6: System Navigation (components/biology/shared/SystemNavigation.tsx)
	
	```tsx
	'use client';
	
	import { SYSTEM_IDS, SYSTEM_ICONS, SYSTEM_LABELS } from '@/lib/biology/constants';
	import { SystemId } from '@/lib/biology/types';
	
	interface SystemNavigationProps {
		activeSystem: SystemId;
		onSystemChange: (system: SystemId) => void;
	}
	
	export function SystemNavigation({ activeSystem, onSystemChange }: SystemNavigationProps) {
		return (
			<div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border">
			{SYSTEM_IDS.map((id) => (
				<button
				key={id}
				onClick={() => onSystemChange(id)}
				className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
					activeSystem === id
					? 'bg-blue-600 text-white shadow-md'
			: 'bg-white hover:bg-gray-100 border'
				}`}
				>
				<span>{SYSTEM_ICONS[id]}</span>
				<span className="text-sm font-medium">{SYSTEM_LABELS[id]}</span>
				</button>
			))}
			</div>
		);
	}
	```
	
	---
	
	PHASE 4: Pages
	
	Goal: Create the main pages for the biology module.
	
	Step 4.1: Main Dashboard (app/biology/page.tsx)
	
	```tsx
	'use client';
	
	import { useState } from 'react';
	import { SystemNavigation } from '@/components/biology/shared/SystemNavigation';
	import { SystemViewer3D } from '@/components/biology/systems/SystemViewer3D';
	import { SystemInfoPanel } from '@/components/biology/systems/SystemInfoPanel';
	import { OrganHighlighter } from '@/components/biology/systems/OrganHighlighter';
	import { SYSTEM_CONTENT } from '@/lib/biology/systemContent';
	import { SystemId } from '@/lib/biology/types';
	
	export default function BiologyPage() {
		const [activeSystem, setActiveSystem] = useState<SystemId>('skeletal');
		
		return (
			<main className="container mx-auto p-6 max-w-7xl">
			<h1 className="text-3xl font-bold mb-6">🧬 Biology Module</h1>
			
			<SystemNavigation 
			activeSystem={activeSystem} 
			onSystemChange={setActiveSystem} 
			/>
			
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
			<div className="space-y-6">
			<SystemViewer3D systemId={activeSystem} />
			<OrganHighlighter />
			</div>
			<div>
			<SystemInfoPanel system={SYSTEM_CONTENT[activeSystem]} />
			</div>
			</div>
			</main>
		);
	}
	```
	
	Step 4.2: Individual System Pages
	
	Create separate pages for each system (example for nervous system):
	
	```tsx
	// app/biology/systems/nervous/page.tsx
	'use client';
	
	import { SystemViewer3D } from '@/components/biology/systems/SystemViewer3D';
	import { SystemInfoPanel } from '@/components/biology/systems/SystemInfoPanel';
	import { SYSTEM_CONTENT } from '@/lib/biology/systemContent';
	
	export default function NervousSystemPage() {
		const system = SYSTEM_CONTENT.nervous;
		
		return (
			<main className="container mx-auto p-6 max-w-7xl">
			<h1 className="text-3xl font-bold mb-6">🧠 {system.name}</h1>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<SystemViewer3D systemId="nervous" />
			<SystemInfoPanel system={system} />
			</div>
			</main>
		);
	}
	```
	
	---
	
	PHASE 5: Asset Setup
	
	Goal: Download and serve 3D anatomy models.
	
	Step 5.1: Download Anatomy Models
	
	The Open 3D Model project provides free, university-created anatomy models:
	
	1. Visit: https://anatomytool.org/open3dmodel-learn[reference:15]
	2. Download the GLB/GLTF files for each organ system
	3. Place them in public/assets/anatomy/ with the following naming:
	· skeletal.glb
	· muscular.glb
	· nervous.glb
	· cardiovascular.glb
	· respiratory.glb
	· digestive.glb
	· urinary.glb
	· lymphatic.glb
	· endocrine.glb
	
	Step 5.2: Alternative: Use OpenHuman Atlas
	
	If self-hosting models is complex, use the OpenHuman Atlas hosted assets:
	
	```tsx
	// Configure asset resolver for hosted assets
	const assetResolver = createOpenHumanAtlasAssetResolver({
		baseUrl: 'https://cdn.openhuman.org/atlas/'
	});
	```
	
	---
	
	PHASE 6: Testing
	
	Step 6.1: Unit Tests (tests/biology/systems.test.ts)
	
	```typescript
	import { describe, expect, test } from 'bun:test';
	import { SYSTEM_CONTENT } from '@/lib/biology/systemContent';
	import { SYSTEM_IDS } from '@/lib/biology/constants';
	
	describe('Biology Systems', () => {
		test('all systems have content', () => {
			SYSTEM_IDS.forEach(id => {
				expect(SYSTEM_CONTENT[id]).toBeDefined();
				expect(SYSTEM_CONTENT[id].name).toBeDefined();
				expect(SYSTEM_CONTENT[id].functions.length).toBeGreaterThan(0);
				expect(SYSTEM_CONTENT[id].mainOrgans.length).toBeGreaterThan(0);
			});
		});
	});
	```
	
	Step 6.2: Run Tests
	
	```bash
	bun test
	```
	
	---
	
	PHASE 7: Build & Deployment
	
	Step 7.1: Build for Production
	
	```bash
	bun run build
	```
	
	Step 7.2: Start Production Server
	
	```bash
	bun run start
	```
	
	---
	
	Implementation Checklist
	
	Phase Step Status
	0 Install dependencies with Bun [ ]
	1 Create folder structure [ ]
	2 2.1 Define TypeScript types [ ]
	2 2.2 Create educational content for all systems [ ]
	2 2.3 Define system constants [ ]
	3 3.1 Error Display component [ ]
	3 3.2 3D System Viewer (OpenHuman) [ ]
	3 3.3 2D System Diagram (Novate MedViz) [ ]
	3 3.4 Organ Highlighter (HPO) [ ]
	3 3.5 System Info Panel [ ]
	3 3.6 System Navigation [ ]
	4 4.1 Main dashboard page [ ]
	4 4.2 Individual system pages (all 9) [ ]
	5 5.1 Download and serve 3D assets [ ]
	6 6.1 Unit tests [ ]
	6 6.2 Run tests [ ]
	7 7.1 Build for production [ ]
	7 7.2 Start production server [ ]
	
	---
	
	Notes for the Agent
	
	1. OpenHuman Viewer: The package requires serving the atlas runtime files. Either host them locally or use the MedHue-hosted asset endpoint.
	2. Educational Content: The systemContent.ts file needs to be fully populated with detailed information for all 9 systems. The example shows the skeletal system — copy the pattern for all others.
	3. 3D Models: The Open 3D Model project from AnatomyTOOL provides free, university-created models. Download the GLB/GLTF files and place them in the public folder.
	4. Novate MedViz: This library requires a data prop with symptoms array. Pass an empty array or create sample symptom data for demonstration.
	5. HPO Visualizer: Supports brain, eye, ear, nose, teeth, throat, heart, lung, liver, kidney, intestine, bladder, integument, muscle, blood, cell, metabolism, endocrine, neoplasm, immune, growth, prenatal.
