import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string): string => {
  const id = toast.loading(message);
  return String(id); // Aseguramos que siempre sea un string
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const showInfo = (message: string) => { // NEW: Export showInfo
  toast.info(message);
};