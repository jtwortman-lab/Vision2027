import { createContext, useContext, useState, ReactNode } from 'react';

interface ADMContextType {
  selectedADM: string | null;
  setSelectedADM: (adm: string | null) => void;
}

const ADMContext = createContext<ADMContextType | undefined>(undefined);

export const ADM_LIST = ['Michael Torres', 'Jennifer Adams', 'Robert Chen'];

export function ADMProvider({ children }: { children: ReactNode }) {
  const [selectedADM, setSelectedADM] = useState<string | null>(null);

  return (
    <ADMContext.Provider value={{ selectedADM, setSelectedADM }}>
      {children}
    </ADMContext.Provider>
  );
}

export function useADM() {
  const context = useContext(ADMContext);
  if (context === undefined) {
    throw new Error('useADM must be used within an ADMProvider');
  }
  return context;
}
