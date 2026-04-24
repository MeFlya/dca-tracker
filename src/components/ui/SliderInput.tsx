"use client";

import { useId, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint: string;
  /** Optional formatter for the displayed badge value (defaults to raw number) */
  formatDisplay?: (v: number) => string;
  onChange: (value: number) => void;
  className?: string;
}

// Clamp helper
function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

// Round to the nearest step to avoid float drift
function snapToStep(v: number, step: number, min: number): number {
  const steps = Math.round((v - min) / step);
  return Math.round((min + steps * step) * 1e10) / 1e10;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  formatDisplay,
  onChange,
  className,
}: SliderInputProps) {
  const id = useId();

  // Local draft for the text input — lets user type freely before committing
  const [draft, setDraft] = useState<string | null>(null);

  // Percentage for the filled track, clamped 0–100
  const fillPct = clamp(((value - min) / (max - min)) * 100, 0, 100);

  const trackStyle = {
    background: `linear-gradient(to right, #1d4ed8 ${fillPct}%, #e2e8f0 ${fillPct}%)`,
  };

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseFloat(e.target.value);
      const snapped = snapToStep(raw, step, min);
      onChange(clamp(snapped, min, max));
      setDraft(null);
    },
    [min, max, step, onChange]
  );

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  };

  const commitDraft = useCallback(() => {
    if (draft === null) return;
    const raw = parseFloat(draft.replace(",", "."));
    if (!isNaN(raw)) {
      const snapped = snapToStep(raw, step, min);
      onChange(clamp(snapped, min, max));
    }
    setDraft(null);
  }, [draft, min, max, step, onChange]);

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitDraft();
    if (e.key === "Escape") setDraft(null);
  };

  const displayValue = formatDisplay ? formatDisplay(value) : String(value);
  const inputValue = draft !== null ? draft : value;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 leading-tight"
        >
          {label}
        </label>

        {/* Value badge — numeric input for precise entry */}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleNumberChange}
            onBlur={commitDraft}
            onKeyDown={handleNumberKeyDown}
            aria-label={`Valeur numérique pour ${label}`}
            className="slider-number-input"
            style={{ width: `${Math.max(3.5, displayValue.length * 0.62 + 1)}rem` }}
          />
          <span className="text-xs font-medium text-gray-500 select-none">{unit}</span>
        </div>
      </div>

      {/* Slider */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSlider}
        className="slider"
        style={trackStyle}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
      />

      {/* Min / max labels */}
      <div className="flex justify-between text-[10px] text-gray-500 font-medium select-none -mt-1">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 leading-snug">{hint}</p>
    </div>
  );
}
