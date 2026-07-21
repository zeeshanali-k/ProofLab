import { describe, expect, it } from 'vitest';
import {
  ROUGH_WORK_STORAGE_VERSION,
  clearRoughWorkScene,
  hasLegacyRoughWork,
  hasRoughWorkContent,
  leetMathBoardKey,
  loadRoughWorkScene,
  proofBoardKey,
  saveRoughWorkScene,
  snapshotRoughWorkScene,
  migrateLegacyRoughWork,
} from '@/src/lib/roughWorkStorage';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
  };
}

describe('rough-work storage', () => {
  it('keeps per-workspace boards separate and persists only durable scene state', () => {
    const storage = memoryStorage();
    const proofKey = proofBoardKey('user-a', 'missing-middle-term');
    const challengeKey = leetMathBoardKey('user-a', '003');
    const scene = snapshotRoughWorkScene(
      [{ id: 'rectangle-1', type: 'rectangle', isDeleted: false }],
      { gridSize: 20, theme: 'dark', viewBackgroundColor: '#ffffff', selectedElementIds: { 'rectangle-1': true }, scrollX: 55 },
    );

    expect(saveRoughWorkScene(proofKey, scene, storage)).toBe(true);
    expect(loadRoughWorkScene(proofKey, storage).scene).toEqual({
      elements: [{ id: 'rectangle-1', type: 'rectangle', isDeleted: false }],
      appState: { gridSize: 20, theme: 'dark', viewBackgroundColor: '#ffffff' },
    });
    expect(loadRoughWorkScene(challengeKey, storage).scene.elements).toEqual([]);
  });

  it('starts blank for malformed or incompatible saved data', () => {
    const storage = memoryStorage();
    const key = proofBoardKey('user-a', 'bad-data');
    storage.setItem(key, '{not-json');
    expect(loadRoughWorkScene(key, storage)).toMatchObject({ scene: { elements: [], appState: {} }, error: true });

    storage.setItem(key, JSON.stringify({ version: ROUGH_WORK_STORAGE_VERSION + 1, scene: { elements: [{ id: 'old' }], appState: {} } }));
    expect(loadRoughWorkScene(key, storage)).toEqual({ scene: { elements: [], appState: {} }, error: false });
  });

  it('clears only the selected board and handles unavailable storage without losing in-memory work', () => {
    const storage = memoryStorage();
    const firstKey = proofBoardKey('user-a', 'first');
    const secondKey = proofBoardKey('user-a', 'second');
    const scene = { elements: [{ id: 'pen-1', isDeleted: false }], appState: {} };
    saveRoughWorkScene(firstKey, scene, storage);
    saveRoughWorkScene(secondKey, scene, storage);

    expect(hasRoughWorkContent(scene)).toBe(true);
    expect(clearRoughWorkScene(firstKey, storage)).toBe(true);
    expect(loadRoughWorkScene(firstKey, storage).scene.elements).toEqual([]);
    expect(loadRoughWorkScene(secondKey, storage).scene.elements).toEqual(scene.elements);

    const unavailableStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    expect(saveRoughWorkScene(firstKey, scene, unavailableStorage)).toBe(false);
    expect(clearRoughWorkScene(firstKey, unavailableStorage)).toBe(false);
  });

  it('copies legacy anonymous boards into an account-specific v2 namespace without overwriting a board', () => {
    const storage = memoryStorage();
    const legacyKey = 'prooflab:rough-work:v1:proof:missing-middle-term';
    const existingAccountKey = proofBoardKey('user-a', 'existing');
    storage.setItem(legacyKey, JSON.stringify({ version: 1, scene: { elements: [{ id: 'legacy' }], appState: {} } }));
    storage.setItem(existingAccountKey, JSON.stringify({ version: 2, scene: { elements: [{ id: 'current' }], appState: {} } }));

    expect(hasLegacyRoughWork(storage)).toBe(true);
    expect(migrateLegacyRoughWork('user-a', storage)).toBe(true);
    expect(loadRoughWorkScene(proofBoardKey('user-a', 'missing-middle-term'), storage).scene.elements).toEqual([{ id: 'legacy' }]);
    expect(storage.getItem(existingAccountKey)).toContain('current');
  });
});
