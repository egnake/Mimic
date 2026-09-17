import { create } from 'zustand';
import { KeyProfile } from '@/types';

interface EditorState {
  currentProfile: KeyProfile | null;
  history: KeyProfile[];
  historyIndex: number;
  isDirty: boolean;
  customScad: string | null;
  
  setProfile: (profile: KeyProfile) => void;
  updateBitting: (index: number, value: string) => void;
  updateSecondaryBitting: (index: number, value: string) => void;
  updateTemplateId: (templateId: string) => void;
  updateProfileMeta: (meta: Partial<KeyProfile>) => void;
  setCustomScad: (scad: string | null) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentProfile: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  customScad: null,

  setCustomScad: (scad) => set({ customScad: scad }),

  setProfile: (profile) => set({
    currentProfile: profile,
    history: [profile],
    historyIndex: 0,
    isDirty: false,
  }),

  updateBitting: (index, value) => set((state) => {
    if (!state.currentProfile) return state;

    const newBitting = [...state.currentProfile.bitting];
    newBitting[index] = value;

    const updatedProfile = {
      ...state.currentProfile,
      bitting: newBitting,
      updatedAt: new Date().toISOString()
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(updatedProfile);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    return {
      currentProfile: updatedProfile,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
      customScad: null
    };
  }),

  updateSecondaryBitting: (index, value) => set((state) => {
    if (!state.currentProfile) return state;

    const newSecBitting = [...(state.currentProfile.secondaryBitting || [])];
    newSecBitting[index] = value;

    const updatedProfile = {
      ...state.currentProfile,
      secondaryBitting: newSecBitting,
      updatedAt: new Date().toISOString()
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(updatedProfile);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    return {
      currentProfile: updatedProfile,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
      customScad: null
    };
  }),

  updateProfileMeta: (meta) => set((state) => {
    if (!state.currentProfile) return state;

    let updatedProfile = {
      ...state.currentProfile,
      ...meta,
      updatedAt: new Date().toISOString()
    };

    // If positions changed, we must adjust bitting array length
    if (meta.positions !== undefined && meta.positions !== state.currentProfile.positions) {
      const oldBitting = state.currentProfile.bitting;
      let newBitting = [...oldBitting];
      
      if (meta.positions > oldBitting.length) {
        // pad with '0'
        newBitting = [...newBitting, ...Array(meta.positions - oldBitting.length).fill('0')];
      } else {
        // truncate
        newBitting = newBitting.slice(0, meta.positions);
      }
      updatedProfile.bitting = newBitting;
    }

    // If secondary positions changed, adjust secondary bitting
    if (meta.secondaryPositions !== undefined && meta.secondaryPositions !== (state.currentProfile.secondaryPositions || 0)) {
      const oldSecBitting = state.currentProfile.secondaryBitting || [];
      let newSecBitting = [...oldSecBitting];
      
      if (meta.secondaryPositions > oldSecBitting.length) {
        newSecBitting = [...newSecBitting, ...Array(meta.secondaryPositions - oldSecBitting.length).fill('0')];
      } else {
        newSecBitting = newSecBitting.slice(0, meta.secondaryPositions);
      }
      updatedProfile.secondaryBitting = newSecBitting;
    }

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(updatedProfile);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    return {
      currentProfile: updatedProfile,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
      customScad: null
    };
  }),

  updateTemplateId: (templateId) => set((state) => {
    if (!state.currentProfile) return state;

    const updatedProfile = {
      ...state.currentProfile,
      templateId,
      updatedAt: new Date().toISOString()
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(updatedProfile);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    return {
      currentProfile: updatedProfile,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
      customScad: null
    };
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        currentProfile: state.history[newIndex],
        historyIndex: newIndex,
        isDirty: true,
        customScad: null
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        currentProfile: state.history[newIndex],
        historyIndex: newIndex,
        isDirty: true,
        customScad: null
      };
    }
    return state;
  }),

  markSaved: () => set({ isDirty: false })
}));
