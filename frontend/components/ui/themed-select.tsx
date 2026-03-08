"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface ThemedSelectOption {
  label: string;
  value: string;
}

interface ThemedSelectProps {
  value: string;
  onChange: (nextValue: string) => void;
  options: ThemedSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export default function ThemedSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  className = "",
  buttonClassName = "",
}: ThemedSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? "",
    [options, value]
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`inline-flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-left text-sm text-[var(--foreground)] transition hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
      >
        <span className={selectedLabel ? "" : "text-[var(--muted)]"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`ml-2 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[0_20px_40px_rgba(2,8,20,0.55)]"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--muted)]">No options</p>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-200"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? <Check size={14} className="text-sky-300" /> : null}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
