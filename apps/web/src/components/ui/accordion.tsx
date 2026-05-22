import type React from "react";
import { createContext, useContext, useState } from "react";

interface AccordionItemProps {
  children: React.ReactNode;
  value: string | number;
}

const AccordionContext = createContext<{
  openValue: string | number | null;
  setOpenValue: (v: string | number | null) => void;
} | null>(null);

export function Accordion({ children }: { children: React.ReactNode }) {
  const [openValue, setOpenValue] = useState<string | number | null>(null);
  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <div className="space-y-3">{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  return (
    <div className="overflow-hidden rounded-[8px]" id={`acc-item-${value}`}>
      {children}
    </div>
  );
}

export function AccordionTrigger({
  value,
  children,
}: {
  value: string | number;
  children: React.ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    return null;
  }
  const isOpen = ctx.openValue === value;
  return (
    <button
      aria-controls={`acc-${value}`}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-4 rounded-[8px] border border-zinc-800 bg-[#11120f] p-4 text-left transition-all duration-150 hover:border-[#c8ff00]/40"
      onClick={() => ctx.setOpenValue(isOpen ? null : value)}
    >
      <span className="font-semibold">{children}</span>
      <span
        className={`ml-2 font-mono text-sm ${isOpen ? "text-[#c8ff00]" : "text-zinc-500"}`}
      >
        {isOpen ? "-" : "+"}
      </span>
    </button>
  );
}

export function AccordionContent({
  value,
  children,
}: {
  value: string | number;
  children: React.ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    return null;
  }
  const isOpen = ctx.openValue === value;
  return (
    <div
      aria-hidden={!isOpen}
      className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 p-4" : "max-h-0 p-0"}`}
      id={`acc-${value}`}
      role="region"
      style={{ background: "transparent" }}
    >
      <div className="text-sm text-zinc-400">{children}</div>
    </div>
  );
}
