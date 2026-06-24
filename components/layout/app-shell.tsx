import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
