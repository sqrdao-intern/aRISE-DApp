'use client';

import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export const customToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      className: "bg-white/10 backdrop-blur-lg border border-white/20 text-white",
    });
  },
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      className: "bg-white/10 backdrop-blur-lg border border-white/20 text-white",
    });
  },
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      className: "bg-white/10 backdrop-blur-lg border border-white/20 text-white",
    });
  },
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: <Info className="h-5 w-5 text-blue-500" />,
      className: "bg-white/10 backdrop-blur-lg border border-white/20 text-white",
    });
  },
}; 