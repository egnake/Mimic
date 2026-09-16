"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEmptyProfile } from "@/lib/profile/normalize";
import { useProfileStore } from "@/stores/profile-store";
import { useEditorStore } from "@/stores/editor-store";

export default function NewProfileRedirect() {
  const router = useRouter();
  const { addProfile } = useProfileStore();
  const { setProfile } = useEditorStore();

  useEffect(() => {
    const initProfile = async () => {
      const newProfile = createEmptyProfile();
      await addProfile(newProfile);
      setProfile(newProfile);
      router.replace(`/profiles/${newProfile.id}`);
    };
    
    initProfile();
  }, [router, addProfile, setProfile]);

  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <p className="text-muted-foreground animate-pulse">Creating new profile...</p>
    </div>
  );
}
