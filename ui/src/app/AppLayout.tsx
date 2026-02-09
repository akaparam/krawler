import { Activity, Compass, Link2, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/explore", label: "Explorer", icon: Compass }
];

export function AppLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-transparent text-ink-800">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur">
        <div className="page-shell flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-ink-900 p-2 text-white shadow-soft">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-sky-600">Krawler</p>
              <h1 className="text-base font-semibold">URL Intelligence Console</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-medium text-sky-700 sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            Frontend + API Live Surface
          </div>
        </div>
      </header>

      <div className="page-shell flex flex-col gap-6 lg:flex-row">
        <aside className="glass-panel h-fit rounded-2xl p-2 shadow-soft lg:w-56">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-ink-100",
                      isActive
                        ? "bg-ink-900 text-white shadow-soft"
                        : "text-ink-600 hover:text-ink-900"
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
