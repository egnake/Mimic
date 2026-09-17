import * as React from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { useProfileStore } from "@/stores/profile-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loadProfiles } = useProfileStore();

  React.useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:block w-64 border-r border-border shrink-0 bg-surface/50">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden shrink-0">
          <MobileHeader />
        </div>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
