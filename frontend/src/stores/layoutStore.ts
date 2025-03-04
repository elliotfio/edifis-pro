import { create } from 'zustand';

interface LayoutState {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isExpanded: true,
    toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));