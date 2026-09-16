import React from "react";
import { KeyProfile } from "@/types";
import { getTemplate } from "@/lib/templates";

interface KeyVisualProps {
  profile: KeyProfile;
}

export function KeyVisual({ profile }: KeyVisualProps) {
  const templateId = profile.templateId || "kwikset-kw1";
  const template = getTemplate(templateId) || getTemplate("kwikset-kw1")!;
  
  return (
    <>
      {template.drawOutline(profile)}
      {template.drawCuts && template.drawCuts(profile)}
    </>
  );
}
