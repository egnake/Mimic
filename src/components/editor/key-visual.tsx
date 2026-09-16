import React from "react";
import { KeyProfile } from "@/types";
import { getTemplate } from "@/lib/templates";

interface KeyVisualProps {
  profile: KeyProfile;
}

export function KeyVisual({ profile }: KeyVisualProps) {
  const template = getTemplate(profile.templateId);
  
  return (
    <>
      {template.drawOutline(profile)}
      {template.drawCuts && template.drawCuts(profile)}
    </>
  );
}
