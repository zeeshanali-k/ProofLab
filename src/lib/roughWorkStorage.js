export const ROUGH_WORK_STORAGE_VERSION = 1;
export const ROUGH_WORK_STORAGE_PREFIX = `prooflab:rough-work:v${ROUGH_WORK_STORAGE_VERSION}`;

const EMPTY_SCENE = Object.freeze({ elements: [], appState: {} });
const PERSISTED_APP_STATE_KEYS = ['gridSize', 'theme', 'viewBackgroundColor'];

export const proofBoardKey = (problemId) => `${ROUGH_WORK_STORAGE_PREFIX}:proof:${problemId}`;
export const leetMathBoardKey = (challengeId) => `${ROUGH_WORK_STORAGE_PREFIX}:leetmath:${challengeId}`;

export const emptyRoughWorkScene = () => ({ elements: [], appState: {} });

function availableStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function persistedAppState(appState = {}) {
  return PERSISTED_APP_STATE_KEYS.reduce((next, key) => {
    if (appState[key] !== undefined) next[key] = appState[key];
    return next;
  }, {});
}

function isValidScene(candidate) {
  return candidate
    && typeof candidate === 'object'
    && Array.isArray(candidate.elements)
    && candidate.appState
    && typeof candidate.appState === 'object';
}

export function snapshotRoughWorkScene(elements, appState) {
  return {
    elements: Array.isArray(elements) ? elements : [],
    appState: persistedAppState(appState),
  };
}

export function loadRoughWorkScene(boardKey, storage) {
  const target = availableStorage(storage);
  if (!target || !boardKey) return { scene: emptyRoughWorkScene(), error: false };

  try {
    const raw = target.getItem(boardKey);
    if (!raw) return { scene: emptyRoughWorkScene(), error: false };
    const parsed = JSON.parse(raw);
    if (parsed?.version !== ROUGH_WORK_STORAGE_VERSION || !isValidScene(parsed.scene)) {
      return { scene: emptyRoughWorkScene(), error: false };
    }
    return { scene: snapshotRoughWorkScene(parsed.scene.elements, parsed.scene.appState), error: false };
  } catch {
    return { scene: emptyRoughWorkScene(), error: true };
  }
}

export function saveRoughWorkScene(boardKey, scene, storage) {
  const target = availableStorage(storage);
  if (!target || !boardKey) return false;

  try {
    target.setItem(boardKey, JSON.stringify({
      version: ROUGH_WORK_STORAGE_VERSION,
      scene: snapshotRoughWorkScene(scene?.elements, scene?.appState),
    }));
    return true;
  } catch {
    return false;
  }
}

export function clearRoughWorkScene(boardKey, storage) {
  const target = availableStorage(storage);
  if (!target || !boardKey) return false;

  try {
    target.removeItem(boardKey);
    return true;
  } catch {
    return false;
  }
}

export function hasRoughWorkContent(scene = EMPTY_SCENE) {
  return scene.elements.some((element) => !element?.isDeleted);
}
