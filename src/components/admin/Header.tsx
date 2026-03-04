"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center px-4">
        <button
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground md:hidden h-9 w-9"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </button>

        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
