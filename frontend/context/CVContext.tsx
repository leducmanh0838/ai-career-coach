"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CVContextType {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export function CVProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <CVContext.Provider value={{ selectedFile, setSelectedFile }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within a CVProvider");
  }
  return context;
}