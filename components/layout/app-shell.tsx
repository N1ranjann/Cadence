import { Navigation } from "./navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Navigation />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
