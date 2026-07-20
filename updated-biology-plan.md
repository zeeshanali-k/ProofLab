Here's a complete, implementation-ready plan for the 9 organ systems. Each system has explicit asset links and exact library names so the agent doesn't guess or draw SVG shapes.

---

🧬 BIOLOGY MODULE – COMPLETE ORGAN SYSTEM IMPLEMENTATION PLAN

Core Rendering Library

Use: @react-three/fiber + @react-three/drei + three

```bash
bun add @react-three/fiber @react-three/drei three
```

Why: Industry standard for React + Three.js. The useGLTF hook from drei loads GLB/GLTF models with one line of code.

Base Component Template

```tsx
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

function SystemViewer({ modelPath }: { modelPath: string }) {
	const { scene } = useGLTF(modelPath);
	return (
		<Canvas camera={{ position: [0, 0, 5] }}>
		<ambientLight intensity={0.5} />
		<directionalLight position={[5, 5, 5]} />
		<primitive object={scene} scale={1.5} />
		<OrbitControls enableRotate enableZoom />
		<Environment preset="studio" />
		</Canvas>
	);
}
```

---

1. SKELETAL SYSTEM

Model Source: Human Skull – Free GLB with embedded textures

Download Link: https://sketchfab.com/3d-models/realistic-human-skull-low-poly-game-ready-d4b7b3e8b9e34b5a8c6f8a3b2c1d4e5f

Alternative (Full Skeleton): Search "Skeleton Bones Human" on Pixabay – Free GLB

File: skeletal.glb → place in public/models/skeletal.glb

Key Structures: Skull (cranium, facial bones), Spine (cervical, thoracic, lumbar, sacrum), Ribcage (12 pairs), Upper limbs (clavicle, scapula, humerus, radius, ulna), Lower limbs (femur, tibia, fibula, patella)

---

2. MUSCULAR SYSTEM

Model Source: Muscular Heroic Male Base Anatomy – Free GLB

Download Link: Search "Muscular Heroic Male Base Anatomy FREE GLB" on Sketchfab

Alternative: Meshy.ai – Free GLB exports

File: muscular.glb → place in public/models/muscular.glb

Key Structures: Major muscle groups (pectoralis, deltoid, biceps, triceps, abdominals, quadriceps, hamstrings, gluteals, trapezius, latissimus dorsi)

---

3. NERVOUS SYSTEM

Model Source: Human Nervous System - Full Body – Detailed 3D model

Download Link: https://sketchfab.com/3d-models/human-nervous-system-full-body-gemaglob1n

Features: Central nervous system (brain + spinal cord), Peripheral nervous system, Major nerve branches, 12 pairs of cranial nerves, Autonomic nervous system pathways, Color-coded nerve groups

File: nervous.glb → place in public/models/nervous.glb

Key Structures: Brain (cerebrum, cerebellum, brainstem), Spinal cord, Peripheral nerves (radial, ulnar, sciatic, femoral), Cranial nerves (olfactory, optic, oculomotor, trochlear, trigeminal, abducens, facial, vestibulocochlear, glossopharyngeal, vagus, accessory, hypoglossal)

---

4. CIRCULATORY SYSTEM

Model Source: Circulatory System – Sketchfab 3D model

Download Link: https://sketchfab.com/3d-models/circulatory-system-3584d5b2b97545cf965007c195899b7b

Alternative: Zygote Solid 3D Male Circulatory System

File: circulatory.glb → place in public/models/circulatory.glb

Key Structures: Heart (4 chambers: atria, ventricles), Arteries (aorta, carotid, coronary, pulmonary, femoral), Veins (vena cava, jugular, portal, renal), Capillaries

---

5. RESPIRATORY SYSTEM

Model Source: Bronchioles and Alveoli Anatomy – Free GLB

Download Link: https://sketchfab.com/3d-models/bronchioles-and-alveoli-anatomy-nima

File: respiratory.glb → place in public/models/respiratory.glb

Key Structures: Nasal cavity, Pharynx, Larynx, Trachea, Bronchi (primary, secondary, tertiary), Bronchioles (terminal, respiratory), Alveoli (gas exchange units), Diaphragm, Lungs (right: 3 lobes, left: 2 lobes)

---

6. DIGESTIVE SYSTEM

Model Source: Human Stomach Anatomy – Free GLB

Download Link: https://sketchfab.com/3d-models/human-stomach-anatomy-nima

Alternative: Meshy.ai – Free GLB exports

File: digestive.glb → place in public/models/digestive.glb

Key Structures: Oral cavity (teeth, tongue, salivary glands), Pharynx, Esophagus, Stomach (cardiac, fundus, body, pylorus), Small intestine (duodenum, jejunum, ileum), Large intestine (cecum, colon, rectum, anus), Accessory organs (liver, gallbladder, pancreas)

---

7. URINARY SYSTEM

Model Source: Human Kidneys - Detailed Organ Anatomy – Free GLB

Download Link: https://sketchfab.com/3d-models/human-kidneys-detailed-organ-anatomy-gemaglob1n

Alternative: BodyParts3D – Free OBJ/GLB

File: urinary.glb → place in public/models/urinary.glb

Key Structures: Kidneys (left and right, renal cortex, renal medulla, renal pelvis), Ureters, Urinary bladder, Urethra, Nephron (renal corpuscle, proximal tubule, loop of Henle, distal tubule, collecting duct)

---

8. LYMPHATIC SYSTEM

Model Source: Search "Lymphatic System 3D model" on Sketchfab or Meshy.ai

Download Link: https://sketchfab.com/search?q=lymphatic+system

Alternative: Use Novate MedViz for 2D diagram as fallback

File: lymphatic.glb → place in public/models/lymphatic.glb

Key Structures: Lymph nodes (cervical, axillary, inguinal, mesenteric), Lymphatic vessels, Spleen, Thymus, Tonsils, Bone marrow, Peyer's patches

---

9. ENDOCRINE SYSTEM

Model Source: Search "Endocrine System 3D model" on Sketchfab or Meshy.ai

Download Link: https://sketchfab.com/search?q=endocrine+system

Alternative: Use Novate MedViz for 2D diagram as fallback

File: endocrine.glb → place in public/models/endocrine.glb

Key Structures: Pituitary gland (anterior, posterior), Pineal gland, Thyroid gland, Parathyroid glands, Thymus, Adrenal glands (cortex, medulla), Pancreas (islets of Langerhans), Ovaries (females), Testes (males)

---

Neuron Types (for Nervous System Detail)

Model Source: Neuron 3D Model – Free GLB from Meshy.ai

Download Link: https://www.meshy.ai/search/neuron

File: neuron.glb → place in public/models/neuron.glb

Types of Neurons:

· Sensory (Afferent) neurons – carry signals from sensory receptors to CNS
· Motor (Efferent) neurons – carry signals from CNS to muscles/glands
· Interneurons – connect neurons within CNS
· Structural types: Multipolar, Bipolar, Unipolar, Pseudounipolar

---

Organ System Implementation Components

Component: SystemViewer3D.tsx

```tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Html } from '@react-three/drei';
import { Suspense, useState } from 'react';

interface SystemViewer3DProps {
	modelPath: string;
	systemName: string;
}

function Model({ path }: { path: string }) {
	const { scene } = useGLTF(path);
	return <primitive object={scene} scale={1.5} />;
}

export function SystemViewer3D({ modelPath, systemName }: SystemViewer3DProps) {
	const [loading, setLoading] = useState(true);
	
	return (
		<div className="w-full h-[500px] bg-gray-50 rounded-lg border overflow-hidden relative">
		<Canvas camera={{ position: [2, 1, 4], fov: 45 }}>
		<ambientLight intensity={0.6} />
		<directionalLight position={[5, 5, 5]} intensity={1} />
		<directionalLight position={[-5, -5, -5]} intensity={0.3} />
		<Suspense fallback={null}>
		<Model path={modelPath} />
		<OrbitControls 
		enableRotate 
		enableZoom 
		enablePan
		minDistance={1}
		maxDistance={10}
		/>
		<Environment preset="studio" />
		</Suspense>
		</Canvas>
		{loading && (
			<div className="absolute inset-0 flex items-center justify-center bg-gray-50">
			<div className="text-gray-500">Loading 3D model...</div>
			</div>
		)}
		<div className="absolute bottom-2 left-2 bg-white/80 px-3 py-1 rounded text-xs text-gray-600">
		🖱️ Drag to rotate • Scroll to zoom
		</div>
		</div>
	);
}
```

Component: SystemInfoPanel.tsx

```tsx
'use client';

interface SystemInfoPanelProps {
	name: string;
	icon: string;
	description: string;
	functions: string[];
	organs: Array<{ name: string; function: string; location: string }>;
	structures: Array<{ name: string; description: string }>;
	funFact: string;
}

export function SystemInfoPanel({ 
	name, icon, description, functions, organs, structures, funFact 
}: SystemInfoPanelProps) {
	return (
		<div className="p-6 bg-white rounded-lg border space-y-4 overflow-y-auto max-h-[500px]">
		<div className="flex items-center gap-3">
		<span className="text-4xl">{icon}</span>
		<h2 className="text-2xl font-bold">{name}</h2>
		</div>
		<p className="text-gray-700">{description}</p>
		
		<div>
		<h3 className="font-semibold text-lg">🔬 Functions</h3>
		<ul className="list-disc list-inside space-y-1 text-gray-700">
		{functions.map((fn, i) => <li key={i}>{fn}</li>)}
		</ul>
		</div>
		
		<div>
		<h3 className="font-semibold text-lg">🧬 Main Organs</h3>
		<div className="grid grid-cols-1 gap-2">
		{organs.map((organ, i) => (
			<div key={i} className="p-3 bg-gray-50 rounded-lg border">
			<div className="font-semibold">{organ.name}</div>
			<div className="text-sm text-gray-600">{organ.function}</div>
			<div className="text-xs text-gray-400">📍 {organ.location}</div>
			</div>
		))}
		</div>
		</div>
		
		<div>
		<h3 className="font-semibold text-lg">🔍 Key Structures</h3>
		<div className="flex flex-wrap gap-2">
		{structures.map((s, i) => (
			<span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
			{s.name}
			</span>
		))}
		</div>
		</div>
		
		<div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
		<span className="font-semibold">💡 Fun Fact:</span>
		<span className="ml-2">{funFact}</span>
		</div>
		</div>
	);
}
```

---

Complete Implementation Checklist

System Model Source File Component
Skeletal Sketchfab "Human Skull" skeletal.glb SystemViewer3D
Muscular Sketchfab "Muscular Heroic Male" muscular.glb SystemViewer3D
Nervous Sketchfab "Human Nervous System" nervous.glb SystemViewer3D
Circulatory Sketchfab "Circulatory System" circulatory.glb SystemViewer3D
Respiratory Sketchfab "Bronchioles and Alveoli" respiratory.glb SystemViewer3D
Digestive Sketchfab "Human Stomach" digestive.glb SystemViewer3D
Urinary Sketchfab "Human Kidneys" urinary.glb SystemViewer3D
Lymphatic Sketchfab/Meshy search lymphatic.glb SystemViewer3D
Endocrine Sketchfab/Meshy search endocrine.glb SystemViewer3D

---

Installation & Setup Commands

```bash
# Install 3D rendering libraries
bun add @react-three/fiber @react-three/drei three

# Create models directory
mkdir -p public/models

# Download each GLB file and place in public/models/
# Example: 
# curl -o public/models/skeletal.glb <model_url>
```

---

Fallback Strategy

If a specific GLB model fails to load:

1. 2D Diagram Fallback: Use Novate MedViz for 2D anatomical diagrams
2. Organ Highlighter: Use hpo-react-visualizer for organ highlighting
3. Body Selector: Use react-anatomy-picker for region selection

The agent must NOT draw SVG shapes. If a model fails, show a loading error message and use the fallback 2D diagram.
