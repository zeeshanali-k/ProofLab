'use client';

import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useState, useEffect, useCallback, Component, type ReactNode } from 'react';
import type { SystemId } from '@/lib/biology/systemContent';
import type { Object3D } from 'three';
import { Box3, Vector3 } from 'three';
import { SystemDiagram2D } from './SystemDiagram2D';
import { createPortal } from 'react-dom';

const MODEL_PATHS: Record<SystemId, string> = {
	skeletal: '/models/skeletal_system.glb',
	muscular: '/models/muscular_system.glb',
	nervous: '/models/nervous_system.glb',
	circulatory: '/models/circulatory_system.glb',
	respiratory: '/models/respiratory_system.glb',
	digestive: '/models/digestive_system.glb',
	urinary: '/models/urinary_system.glb',
	lymphatic: '/models/lymphatic_system.glb',
	endocrine: '/models/endocrine_system.glb',
};

const IMAGE_PATHS: Record<SystemId, string> = {
	skeletal: '/models/skeletal_system.jpg',
	muscular: '/models/muscular_system.png',
	nervous: '/models/nervous_system.jpg',
	circulatory: '/models/circulatory_system.png',
	respiratory: '/models/respiratory_system.png',
	digestive: '/models/digestive_system.jpg',
	urinary: '/models/urinary_system.png',
	lymphatic: '/models/lymphatic_system.png',
	endocrine: '/models/endocrine_system.png',
};

const CAMERA_CONFIG: Record<SystemId, { position: [number, number, number]; fov: number }> = {
	skeletal:      { position: [0, 0, 80], fov: 60 },
	muscular:      { position: [0, 0, 8],  fov: 50 },
	nervous:       { position: [0, 0, 5],  fov: 45 },
	circulatory:   { position: [0, 0, 5],  fov: 45 },
	respiratory:   { position: [0, 0, 5],  fov: 45 },
	digestive:     { position: [0, 0, 8],  fov: 50 },
	urinary:       { position: [0, 0, 80], fov: 60 },
	lymphatic:     { position: [0, 0, 8],  fov: 50 },
	endocrine:     { position: [0, 0, 5],  fov: 45 },
};

const SYSTEM_NAMES: Record<SystemId, string> = {
	skeletal: 'Skeletal System',
	muscular: 'Muscular System',
	nervous: 'Nervous System',
	circulatory: 'Circulatory System',
	respiratory: 'Respiratory System',
	digestive: 'Digestive System',
	urinary: 'Urinary System',
	lymphatic: 'Lymphatic System',
	endocrine: 'Endocrine System',
};

const SYSTEM_COLORS: Record<SystemId, string> = {
	skeletal: '#f59e0b',
	muscular: '#ef4444',
	nervous: '#a855f7',
	circulatory: '#dc2626',
	respiratory: '#3b82f6',
	digestive: '#22c55e',
	urinary: '#f97316',
	lymphatic: '#14b8a6',
	endocrine: '#8b5cf6',
};

class CanvasErrorBoundary extends Component<
	{ children: ReactNode; fallback: ReactNode },
	{ hasError: boolean }
> {
	constructor(props: { children: ReactNode; fallback: ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	render() {
		if (this.state.hasError) return this.props.fallback;
		return this.props.children;
	}
}

function Model({ path }: { path: string }) {
	const { scene } = useGLTF(path);
	const [offset, setOffset] = useState<Vector3>(() => new Vector3());

	useEffect(() => {
		const box = new Box3().setFromObject(scene);
		const center = box.getCenter(new Vector3());
		setOffset(center.negate());
		return () => {
			scene.traverse((child: Object3D) => {
				const mesh = child as any;
				if (mesh.geometry) mesh.geometry.dispose();
				if (mesh.material) {
					if (Array.isArray(mesh.material)) mesh.material.forEach((m: any) => m.dispose());
					else mesh.material.dispose();
				}
			});
		};
	}, [scene]);

	return (
		<group position={offset}>
			<primitive object={scene} scale={1.5} />
		</group>
	);
}

function SceneContent({ modelPath }: { modelPath: string }) {
	return (
		<>
			<ambientLight intensity={0.6} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			<directionalLight position={[-5, -5, -5]} intensity={0.3} />
			<Suspense fallback={null}>
				<Model path={modelPath} />
			</Suspense>
			<OrbitControls
				enableRotate
				enableZoom
				enablePan
				target={[0, 0, 0]}
				minDistance={2}
				maxDistance={200}
			/>
			<Environment preset="studio" />
		</>
	);
}

function SystemPreview({ systemId, onClick }: { systemId: SystemId; onClick: () => void }) {
	const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');
	const imagePath = IMAGE_PATHS[systemId];
	const color = SYSTEM_COLORS[systemId];

	useEffect(() => {
		setImgState('loading');
	}, [systemId]);

	return (
		<div className="bio-3d-preview" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}>
			{imgState === 'loading' && (
				<div className="bio-3d-preview-placeholder" style={{ borderColor: color }}>
					<div className="bio-3d-preview-spinner" style={{ borderTopColor: color }} />
				</div>
			)}
			{imgState !== 'error' && (
				<img
					src={imagePath}
					alt={`${SYSTEM_NAMES[systemId]} diagram`}
					className="bio-3d-preview-img"
					style={{ opacity: imgState === 'loaded' ? 1 : 0 }}
					onLoad={() => setImgState('loaded')}
					onError={() => setImgState('error')}
				/>
			)}
			{imgState === 'error' && (
				<div className="bio-3d-preview-fallback">
					<SystemDiagram2D systemId={systemId} />
				</div>
			)}
			<div className="bio-3d-preview-overlay" style={{ background: `linear-gradient(to top, ${color}dd 0%, transparent 60%)` }}>
				<span className="bio-3d-preview-label">{SYSTEM_NAMES[systemId]}</span>
				<span className="bio-3d-preview-cta">Click to explore in 3D →</span>
			</div>
		</div>
	);
}

function FullscreenModal({ systemId, onClose }: { systemId: SystemId; onClose: () => void }) {
	const modelPath = MODEL_PATHS[systemId];
	const camera = CAMERA_CONFIG[systemId];
	const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

	useEffect(() => {
		setLoadState('loading');
		let cancelled = false;
		fetch(modelPath, { method: 'HEAD' })
			.then((res) => {
				if (cancelled) return;
				setLoadState(res.ok ? 'ready' : 'error');
			})
			.catch(() => {
				if (!cancelled) setLoadState('error');
			});
		return () => { cancelled = true; };
	}, [modelPath]);

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handleKey);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', handleKey);
			document.body.style.overflow = '';
		};
	}, [onClose]);

	const color = SYSTEM_COLORS[systemId];

	const content = (
		<div className="bio-3d-modal-backdrop" onClick={onClose}>
			<div className="bio-3d-modal" onClick={(e) => e.stopPropagation()}>
				<div className="bio-3d-modal-header" style={{ borderColor: color }}>
					<h2>{SYSTEM_NAMES[systemId]} — 3D Viewer</h2>
					<button className="bio-3d-modal-close" onClick={onClose} aria-label="Close">✕</button>
				</div>
				<div className="bio-3d-modal-body">
					{loadState === 'loading' && (
						<div className="bio-3d-modal-loading">
							<div className="bio-3d-spinner" />
							<span>Loading 3D model...</span>
						</div>
					)}
					{loadState === 'error' && (
						<div className="bio-3d-modal-error">
							<span>⚠️</span> 3D model could not be loaded. Please check the model file exists.
						</div>
					)}
					{loadState === 'ready' && (
						<CanvasErrorBoundary fallback={
							<div className="bio-3d-modal-error">
								<span>⚠️</span> 3D model failed to render. The file may be corrupted or unsupported.
							</div>
						}>
							<Canvas camera={{ position: camera.position, fov: camera.fov }}>
								<SceneContent modelPath={modelPath} />
							</Canvas>
						</CanvasErrorBoundary>
					)}
				</div>
				<div className="bio-3d-modal-footer">
					🖱️ Drag to rotate • Scroll to zoom • Right-click to pan • Press <kbd>Esc</kbd> to close
				</div>
			</div>
		</div>
	);

	if (typeof document !== 'undefined') {
		return createPortal(content, document.body);
	}
	return null;
}

interface SystemViewer3DProps {
	systemId: SystemId;
}

export function SystemViewer3D({ systemId }: SystemViewer3DProps) {
	const [isOpen, setIsOpen] = useState(false);
	const handleClose = useCallback(() => setIsOpen(false), []);

	return (
		<>
			<SystemPreview systemId={systemId} onClick={() => setIsOpen(true)} />
			{isOpen && <FullscreenModal systemId={systemId} onClose={handleClose} />}
		</>
	);
}

export default SystemViewer3D;
