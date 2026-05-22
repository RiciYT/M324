import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";

import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
        <Sun className="size-[1.2rem] scale-100 opacity-100 transition-[opacity,scale,filter] duration-150 ease-out dark:scale-[0.25] dark:opacity-0 dark:blur-[4px]" />
        <Moon className="absolute size-[1.2rem] scale-[0.25] opacity-0 blur-[4px] transition-[opacity,scale,filter] duration-150 ease-out dark:scale-100 dark:opacity-100 dark:blur-none" />
        <span className="sr-only">Darstellung wechseln</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#11120f]">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Hell
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dunkel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
