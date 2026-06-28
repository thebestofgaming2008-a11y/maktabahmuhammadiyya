import { toast as sonnerToast } from "sonner";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast({ title, description, variant }: ToastInput) {
  const message = title || description || "Done";
  if (variant === "destructive") {
    return sonnerToast.error(message, { description: title ? description : undefined });
  }
  return sonnerToast.success(message, { description: title ? description : undefined });
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: [],
  };
}
