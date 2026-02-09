import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { useToastStore } from "@/store/toast-store";
import { cn } from "@/lib/utils";

export function ToastHost(): JSX.Element {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3 shadow-soft animate-fade-up",
            toast.variant === "success" && "border-sky-200",
            toast.variant === "error" && "border-amber-300",
            toast.variant === "info" && "border-ink-200"
          )}
        >
          {toast.variant === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-sky-600" />}
          {toast.variant === "error" && <CircleAlert className="mt-0.5 h-4 w-4 text-amber-600" />}
          {toast.variant === "info" && <Info className="mt-0.5 h-4 w-4 text-ink-500" />}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-800">{toast.title}</p>
            {toast.description ? (
              <p className="text-xs text-ink-500">{toast.description}</p>
            ) : null}
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
