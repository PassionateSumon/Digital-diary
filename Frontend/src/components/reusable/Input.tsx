import { VariantProps, cva } from "class-variance-authority";
import { ChangeEvent, InputHTMLAttributes } from "react";
import { cn } from "../../utils/utils";

const inputVariants = cva(
  "w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white border border-primary focus:ring-2 focus:ring-accent ",
        secondary:
          "bg-secondary text-white border border-secondary focus:ring-2 focus:ring-accent ",
        error:
          "bg-background text-white border border-red-500 focus:ring-2 focus:ring-red-500 ",
      },
      inputSize: {
        sm: "h-8 text-sm",
        md: "h-10 text-md",
        lg: "h-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      inputSize: "md",
    },
  }
);

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  variant?: "primary" | "secondary" | "error";
  inputSize?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  errorMessage?: string;
  onChnage?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  variant = "primary",
  inputSize = "md",
  label,
  className,
  errorMessage,
  onChnage,
  ...props
}: InputProps) => {
  return (
    <div className={cn("flex flex-col gap-1 ", className)}>
      {label && (
        <label className="text-sm font-medium text-text ">{label}</label>
      )}
      <input
        className={inputVariants({ variant, inputSize })}
        onChange={onChnage}
        {...props}
      />
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
};

export { Input, inputVariants };
