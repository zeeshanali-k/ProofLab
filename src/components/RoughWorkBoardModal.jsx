'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearRoughWorkScene,
  emptyRoughWorkScene,
  hasRoughWorkContent,
  loadRoughWorkScene,
  saveRoughWorkScene,
  snapshotRoughWorkScene,
} from '../lib/roughWorkStorage';

const SAVE_DEBOUNCE_MS = 300;

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((module) => module.Excalidraw),
  {
    ssr: false,
    loading: () => <div className="rough-work-loading">Preparing your rough board…</div>,
  },
);

const editorOptions = {
  canvasActions: {
    changeViewBackgroundColor: true,
    clearCanvas: false,
    export: false,
    loadScene: false,
    saveAsImage: false,
    saveToActiveFile: false,
    toggleTheme: true,
  },
  tools: { image: false },
};

export default function RoughWorkBoardModal({ open, boardKey, title, onClose, sharedTransitionName }) {
  if (!open) return null;
  return <OpenRoughWorkBoard key={boardKey} boardKey={boardKey} title={title} onClose={onClose} sharedTransitionName={sharedTransitionName} />;
}

function OpenRoughWorkBoard({ boardKey, title, onClose, sharedTransitionName }) {
  const [initialScene] = useState(() => loadRoughWorkScene(boardKey));
  const [scene, setScene] = useState(initialScene.scene);
  const [sceneVersion, setSceneVersion] = useState(0);
  const [elementCount, setElementCount] = useState(() => initialScene.scene.elements.filter((element) => !element?.isDeleted).length);
  const [saveFailed, setSaveFailed] = useState(initialScene.error);
  const latestSceneRef = useRef(initialScene.scene);
  const saveTimerRef = useRef(null);
  const saveNowRef = useRef(() => {});
  const clearedRef = useRef(false);
  const closeButtonRef = useRef(null);

  const flushSave = useCallback((reportFailure = true) => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (clearedRef.current) return;
    const saved = saveRoughWorkScene(boardKey, latestSceneRef.current);
    if (reportFailure) setSaveFailed(!saved);
  }, [boardKey]);

  useEffect(() => {
    saveNowRef.current = flushSave;
  }, [flushSave]);

  useEffect(() => {
    document.body.classList.add('rough-work-open');
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handlePageHide = () => saveNowRef.current();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        flushSave();
        onClose();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('rough-work-open');
      saveNowRef.current(false);
    };
  }, [flushSave, onClose]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const handleChange = useCallback((elements, appState) => {
    clearedRef.current = false;
    latestSceneRef.current = snapshotRoughWorkScene(elements, appState);
    setElementCount(latestSceneRef.current.elements.filter((element) => !element?.isDeleted).length);
    scheduleSave();
  }, [scheduleSave]);

  const handleClose = () => {
    flushSave();
    onClose();
  };

  const handleClear = () => {
    if (hasRoughWorkContent(latestSceneRef.current) && !window.confirm('Clear every item from this rough board?')) return;

    const wasCleared = clearRoughWorkScene(boardKey);
    const nextScene = emptyRoughWorkScene();
    latestSceneRef.current = nextScene;
    clearedRef.current = wasCleared;
    setSaveFailed(!wasCleared);
    setScene(nextScene);
    setElementCount(0);
    setSceneVersion((version) => version + 1);
  };

  return (
    <div className="rough-work-backdrop" role="presentation">
      <section className="rough-work-modal" role="dialog" aria-modal="true" aria-label={`Rough work board for ${title}`} style={{ viewTransitionName: sharedTransitionName }}>
        <header className="rough-work-header">
          <div>
            <span className="panel-eyebrow">ROUGH WORK</span>
            <h2>{title}</h2>
          </div>
          <div className="rough-work-actions">
            <span className={`rough-work-save-status ${saveFailed ? 'unsaved' : ''}`} aria-live="polite">
              {saveFailed ? 'This board cannot be saved on this device' : 'Saved locally'}
            </span>
            <button type="button" className="icon-btn rough-work-close" onClick={handleClose} ref={closeButtonRef} aria-label="Close rough work board">×</button>
          </div>
        </header>
        <div className="rough-work-editor" aria-label="Rough work canvas" data-rough-work-elements={elementCount}>
          {scene && (
            <Excalidraw
              key={`${boardKey}-${sceneVersion}`}
              initialData={scene}
              onChange={handleChange}
              renderTopRightUI={() => <button type="button" className="rough-work-canvas-clear" onClick={handleClear}>Empty board</button>}
              UIOptions={editorOptions}
              name={`ProofLab rough work — ${title}`}
            />
          )}
        </div>
      </section>
    </div>
  );
}
