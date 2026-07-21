export const ROUGH_WORK_STORAGE_VERSION = 2;
export const ROUGH_WORK_STORAGE_PREFIX = `prooflab:rough-work:v${ROUGH_WORK_STORAGE_VERSION}`;
const LEGACY_ROUGH_WORK_STORAGE_PREFIX = 'prooflab:rough-work:v1';

const EMPTY_SCENE = Object.freeze({ elements: [], appState: {} });
const PERSISTED_APP_STATE_KEYS = ['gridSize', 'theme', 'viewBackgroundColor'];

export const proofBoardKey = (userId, problemId) => `${ROUGH_WORK_STORAGE_PREFIX}:${userId}:proof:${problemId}`;
export const leetMathBoardKey = (userId, challengeId) => `${ROUGH_WORK_STORAGE_PREFIX}:${userId}:leetmath:${challengeId}`;

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

export function hasLegacyRoughWork(storage) {
  const target = availableStorage(storage);
  if (!target) return false;
  try {
    for (let index = 0; index < target.length; index += 1) {
      if (target.key(index)?.startsWith(`${LEGACY_ROUGH_WORK_STORAGE_PREFIX}:`)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function migrateLegacyRoughWork(userId, storage) {
  const target = availableStorage(storage);
  if (!target || !userId) return false;
  try {
    const legacyKeys = [];
    for (let index = 0; index < target.length; index += 1) {
      const key = target.key(index);
      if (key?.startsWith(`${LEGACY_ROUGH_WORK_STORAGE_PREFIX}:`)) legacyKeys.push(key);
    }
    legacyKeys.forEach((legacyKey) => {
      const parts = legacyKey.split(':');
      const workspace = parts[3];
      const itemId = parts.slice(4).join(':');
      const accountKey = `${ROUGH_WORK_STORAGE_PREFIX}:${userId}:${workspace}:${itemId}`;
      if (target.getItem(accountKey)) return;
      const parsed = JSON.parse(target.getItem(legacyKey));
      if (!isValidScene(parsed?.scene)) return;
      target.setItem(accountKey, JSON.stringify({
        version: ROUGH_WORK_STORAGE_VERSION,
        scene: snapshotRoughWorkScene(parsed.scene.elements, parsed.scene.appState),
      }));
    });
    return legacyKeys.length > 0;
  } catch {
    return false;
  }
}
