'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function MoleculeViewer({ pdbId = '1CRN', smiles = undefined, style = 'cartoon', width = 500, height = 400 }) {
	const containerRef = useRef(null);
	const viewerRef = useRef(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [error, setError] = useState(null);
	const pdbIdRef = useRef(pdbId);
	const styleRef = useRef(style);
	const smilesRef = useRef(smiles);

	useEffect(() => { pdbIdRef.current = pdbId; }, [pdbId]);
	useEffect(() => { styleRef.current = style; }, [style]);
	useEffect(() => { smilesRef.current = smiles; }, [smiles]);

	const getStyleConfig = (styleType) => {
		switch (styleType) {
			case 'cartoon':
				return { cartoon: { color: 'spectrum' } };
			case 'stick':
				return { stick: {} };
			case 'sphere':
				return { sphere: { colorscheme: 'Jmol' } };
			case 'surface':
				return { surface: { opacity: 0.7, color: 'white' } };
			default:
				return { cartoon: { color: 'spectrum' } };
		}
	};

	const loadMolecule = useCallback(() => {
		if (!viewerRef.current || !window.$3Dmol) return;

		const viewer = viewerRef.current;
		viewer.clear();

		const currentStyle = styleRef.current;
		const currentSmiles = smilesRef.current;
		const currentPdbId = pdbIdRef.current;

		const onLoad = () => {
			try {
				viewer.setStyle({}, getStyleConfig(currentStyle));
				viewer.zoomTo();
				viewer.render();
			} catch (err) {
				console.warn('3Dmol render error:', err);
			}
		};

		if (currentSmiles) {
			window.$3Dmol.download(`smiles:${currentSmiles}`, viewer, {}, onLoad);
		} else {
			window.$3Dmol.download(`pdb:${currentPdbId}`, viewer, { multimodel: true }, onLoad);
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		// 3Dmol.js uses OffscreenCanvas.transferToImageBitmap internally, which
		// throws in Next.js/Turbopack environments. Removing it forces 3Dmol to
		// fall back to standard canvas rendering, which works reliably.
		const OrigOffscreenCanvas = window.OffscreenCanvas;
		delete window.OffscreenCanvas;

		let cancelled = false;

		const init = () => {
			if (cancelled || !containerRef.current || !window.$3Dmol) return;

			try {
				if (viewerRef.current) {
					viewerRef.current.clear();
					viewerRef.current = null;
				}

				const viewer = window.$3Dmol.createViewer(containerRef.current, {
					backgroundColor: 'white',
					antialias: true,
					disableFog: true,
				});

				viewerRef.current = viewer;
				setIsLoaded(true);
				loadMolecule();
			} catch (err) {
				if (!cancelled) {
					setError(`Failed to initialize viewer: ${err.message}`);
				}
			}
		};

		if (window.$3Dmol) {
			init();
		} else {
			const script = document.createElement('script');
			script.src = 'https://3dmol.csb.pitt.edu/build/3Dmol-min.js';
			script.async = true;
			script.onload = () => {
				if (!cancelled) init();
			};
			script.onerror = () => {
				if (!cancelled) setError('Failed to load 3Dmol.js script');
			};
			document.head.appendChild(script);
		}

		return () => {
			cancelled = true;
			if (viewerRef.current) {
				try { viewerRef.current.clear(); } catch {}
				viewerRef.current = null;
			}
			// Restore OffscreenCanvas for other components
			if (OrigOffscreenCanvas) {
				window.OffscreenCanvas = OrigOffscreenCanvas;
			}
		};
	}, [loadMolecule]);

	useEffect(() => {
		if (isLoaded && viewerRef.current) {
			loadMolecule();
		}
	}, [pdbId, smiles, style, isLoaded, loadMolecule]);

	return (
		<div className="molecule-viewer-container">
			<div
				ref={containerRef}
				style={{ width: `${width}px`, height: `${height}px` }}
				className="molecule-viewer-canvas"
			/>

			{error && (
				<div className="molecule-error">
					⚠️ {error}
				</div>
			)}

			{!error && !isLoaded && (
				<div className="molecule-loading">
					Loading 3D viewer...
				</div>
			)}

			<div className="molecule-hint">
				{pdbId} • Drag to rotate • Scroll to zoom • Right-click to menu
			</div>
		</div>
	);
}

export default MoleculeViewer;
