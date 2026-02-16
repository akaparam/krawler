import { Activity, Compass, Link2, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/explore", label: "Explorer", icon: Compass }
];

export function AppLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-ink-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-ink-100">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur dark:border-ink-800/50 dark:bg-ink-900/75">
        <div className="page-shell flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-ink-900 p-2 text-white shadow-soft dark:bg-sky-600">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-sky-600 dark:text-sky-400">Krawler</p>
              <h1 className="text-base font-semibold">URL Intelligence Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-medium text-sky-700 sm:flex dark:bg-ink-800 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Frontend + API Live Surface
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="page-shell flex flex-col gap-6 lg:flex-row">
        <aside className="glass-panel h-fit rounded-2xl p-2 shadow-soft lg:w-56 dark:border-ink-700 dark:bg-ink-900/60">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-ink-100 dark:hover:bg-ink-800",
                      isActive
                        ? "bg-ink-900 text-white shadow-soft dark:bg-sky-600"
                        : "text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-200"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 animate-fade-up">
          <Outlet />
        </main>
      </div>
      <EditLinkDialog />
    </div>
  );
}
