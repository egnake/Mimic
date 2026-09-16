import { create } from 'zustand';
import { KeyProfile } from '@/types';
import { db } from '@/lib/db';

interface ProfileState {
  profiles: KeyProfile[];
  isLoading: boolean;
  loadProfiles: () => Promise<void>;
  addProfile: (profile: KeyProfile) => Promise<void>;
  updateProfile: (profile: KeyProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  isLoading: false,
  loadProfiles: async () => {
    set({ isLoading: true });
    try {
      const allProfiles = await db.profiles.orderBy('updatedAt').reverse().toArray();
      set({ profiles: allProfiles });
    } catch (error) {
      console.error("Failed to load profiles", error);
    } finally {
      set({ isLoading: false });
    }
  },
  addProfile: async (profile: KeyProfile) => {
    await db.profiles.add(profile);
    set((state) => ({ profiles: [profile, ...state.profiles] }));
  },
  updateProfile: async (profile: KeyProfile) => {
    await db.profiles.put(profile);
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === profile.id ? profile : p)),
    }));
  },
  deleteProfile: async (id: string) => {
    await db.profiles.delete(id);
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
    }));
  },
}));
