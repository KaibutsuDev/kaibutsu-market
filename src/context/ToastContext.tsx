'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<Toast | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    // Si ya existe un temporizador activo, lo limpiamos para reiniciar el tiempo
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const id = Math.random().toString(36).substring(2, 9);
    // Reemplaza directamente el toast anterior (se sobrepone en la misma posición)
    setCurrentToast({ id, message, type });

    timerRef.current = setTimeout(() => {
      setCurrentToast(null);
    }, 2800);
  };

  const removeToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast fijo en la parte superior que se sobrepone suavemente sin apilarse ni tapar el catálogo */}
      <div className="fixed top-18 right-4 left-4 sm:left-auto sm:right-6 z-50 pointer-events-none flex justify-center sm:justify-end">
        {currentToast && (
          <div
            key={currentToast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border text-sm font-semibold max-w-sm w-full transition-all animate-in fade-in zoom-in-95 duration-150 ${
              currentToast.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : currentToast.type === 'info'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-emerald-950 text-white border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {currentToast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              ) : currentToast.type === 'info' ? (
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span className="leading-tight text-xs sm:text-sm">{currentToast.message}</span>
            </div>
            <button
              onClick={removeToast}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
