import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const variantIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />,
  destructive: <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />,
  info: <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />,
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = variant ? variantIcons[variant] : null;
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {icon}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
