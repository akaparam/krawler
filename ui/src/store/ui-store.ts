import { create } from "zustand";

type UiState = {
  editLinkShortCode: string | null;
  openEditDialog: (shortCode: string) => void;
  closeEditDialog: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  editLinkShortCode: null,
  openEditDialog: (shortCode) => set({ editLinkShortCode: shortCode }),
  closeEditDialog: () => set({ editLinkShortCode: null })
}));
