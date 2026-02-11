import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({ size = "md", label, className, overlay = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-[3px]",
    lg: "h-14 w-14 border-4",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-3", !overlay && className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-muted border-t-primary",
          sizeClasses[size]
        )}
      />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm", className)}>
        {spinner}
      </div>
    );
  }

  return spinner;
}