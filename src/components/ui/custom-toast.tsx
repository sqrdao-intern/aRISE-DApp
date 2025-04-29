'use client';

import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export const customToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: <CheckCircle2 className="text-green-500" />,
      className: 'bg-green-50 border-green-200',
    });
  },
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: <XCircle className="text-red-500" />,
      className: 'bg-red-50 border-red-200',
    });
  },
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: <AlertCircle className="text-yellow-500" />,
      className: 'bg-yellow-50 border-yellow-200',
    });
  },
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: <Info className="text-blue-500" />,
      className: 'bg-blue-50 border-blue-200',
    });
  },
}; 