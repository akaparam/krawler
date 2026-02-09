import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

type ToastState = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastStore = {
  toasts: ToastState[];
  pushToast: (input: Omit<ToastState, "id">) => void;
  dismissToast: (id: number) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  pushToast: (input) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    set((state) => ({ toasts: [...state.toasts, { id, ...input }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
      }));
    }, 3000);
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  }
}));
