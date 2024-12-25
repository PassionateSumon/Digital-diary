import { ButtonHTMLAttributes, ReactElement } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "../../utils/utils";

const buttonVariants = cva(
  "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-accent",
        secondary: "bg-secondary text-white hover:bg-accent",
        submit: "bg-primary text-white hover:bg-accent",
        cancel: "bg-secondary text-white hover:bg-accent",
      },
      size: {
        sm: "h-8",
        md: "h-10",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  variant: "primary" | "secondary" | "submit" | "cancel";
  size: "sm" | "md" | "lg";
  text: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
}

const Button = ({
  variant,
  size,
  text,
  onClick,
  className,
  disabled = false,
  startIcon,
  endIcon,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {text}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};

export { Button, buttonVariants };
