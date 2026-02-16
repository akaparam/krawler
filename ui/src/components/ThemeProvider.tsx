import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  return <>{children}</>;
}
