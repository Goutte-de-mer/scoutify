import { ReactNode } from "react";

interface FormFieldProps {
  label?: string;
  children?: ReactNode;
  value?: string | number;
  type?: "text" | "email" | "tel" | "number" | "date" | "url" | "color";
  placeholder?: string;
  id?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  darkMode?: boolean;
}

export function FormField({
  label,
  children,
  value,
  type = "text",
  placeholder,
  id,
  onChange,
  onBlur,
  min,
  max,
  step,
  required = false,
  darkMode = false,
}: FormFieldProps) {
  const inputId =
    id ??
    (label ? `field-${label.replace(/\s/g, "-").toLowerCase()}` : undefined);
  const strValue = value !== undefined && value !== null ? String(value) : "";
  const isEmpty = strValue === "" || value === null || value === undefined || (type === "number" && required && value === 0);
  
  const inputClassName = 
    type === "color" 
      ? "input-color"
      : darkMode
        ? "input-base-dark"
        : "input-base";
  
  const labelClassName = darkMode
    ? "mb-2 block text-sm font-semibold text-white"
    : "mb-2 block text-sm font-semibold text-black";

  return (
    <div className={label ? "" : "flex-1"}>
      {label && (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
          {required && (
            <span className={darkMode ? "ml-1 text-red-400" : "ml-1 text-red-500"}>
              *
            </span>
          )}
        </label>
      )}
      {children ?? (
        <input
          id={inputId ?? undefined}
          type={type}
          value={strValue}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={inputClassName}
          min={min}
          max={max}
          step={step}
          required={required}
        />
      )}
    </div>
  );
}
