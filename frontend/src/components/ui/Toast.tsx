import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from './Button';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const toastConfig: Record<ToastType, { icon: React.ReactNode; barColor: string }> = {
  success: { icon: <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />, barColor: 'bg-accent' },
  error: { icon: <XCircle className="w-4 h-4 text-crit flex-shrink-0" />, barColor: 'bg-crit' },
  warning: { icon: <AlertTriangle className="w-4 h-4 text-warn flex-shrink-0" />, barColor: 'bg-warn' },
  info: { icon: <Info className="w-4 h-4 text-info flex-shrink-0" />, barColor: 'bg-info' },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => {
      const next = [...prev, { id, type, message }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const config = toastConfig[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="pointer-events-auto flex items-center gap-3 px-3 py-2.5 bg-surface border border-border shadow-dark-md rounded-lg overflow-hidden relative"
              >
                {/* Left accent bar */}
                <div className={cn('absolute left-0 top-0 bottom-0 w-0.5', config.barColor)} />
                <div className="pl-1.5">
                  {config.icon}
                </div>
                <span className="flex-1 text-sm text-ink">{t.message}</span>
                <button
                  onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                  className="text-ink-muted hover:text-ink transition-colors p-1 rounded -mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
