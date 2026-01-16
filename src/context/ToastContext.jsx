import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, duration = 4000) => {
    setToast({ message, visible: true });
    if (duration) {
      setTimeout(() => {
        setToast((current) =>
          current ? { ...current, visible: false } : null
        );
      }, duration);
    }
  }, []);

  // Quand visible passe à false, on supprime complètement le toast après l'animation
  useEffect(() => {
    if (!toast || toast.visible) return;
    const timeout = setTimeout(() => {
      setToast(null);
    }, 300); // durée de la transition CSS
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div 
          className={`vertyno-toast ${toast.visible ? "visible" : "hidden"}`}
          role="alert"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
