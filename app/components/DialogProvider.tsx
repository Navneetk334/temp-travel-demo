"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

type DialogType = "alert" | "confirm";

interface DialogState {
  id: string;
  type: DialogType;
  message: string;
  title?: string;
  resolve: (value: boolean) => void;
}

interface DialogContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  const showAlert = useCallback((message: string, title?: string) => {
    return new Promise<void>((resolve) => {
      const id = Math.random().toString(36).substring(7);
      setDialogs((prev) => [
        ...prev,
        {
          id,
          type: "alert",
          message,
          title,
          resolve: () => resolve(),
        },
      ]);
    });
  }, []);

  const showConfirm = useCallback((message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      const id = Math.random().toString(36).substring(7);
      setDialogs((prev) => [
        ...prev,
        {
          id,
          type: "confirm",
          message,
          title,
          resolve,
        },
      ]);
    });
  }, []);

  const handleClose = (id: string, result: boolean) => {
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id);
      if (dialog) {
        dialog.resolve(result);
      }
      return prev.filter((d) => d.id !== id);
    });
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Render Dialogs */}
      {dialogs.length > 0 && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {dialogs[0].type === "confirm" ? (
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
            ) : (
              <Info className="w-12 h-12 text-blue-500 mb-4" />
            )}

            <h3 className="text-lg font-black text-slate-50 mb-2">
              {dialogs[0].title || (dialogs[0].type === "confirm" ? "Confirm Action" : "Notification")}
            </h3>
            
            <p className="text-slate-300 text-sm font-medium mb-6">
              {dialogs[0].message}
            </p>

            <div className="flex w-full gap-3 justify-center">
              {dialogs[0].type === "confirm" && (
                <button
                  onClick={() => handleClose(dialogs[0].id, false)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => handleClose(dialogs[0].id, true)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                {dialogs[0].type === "confirm" ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
