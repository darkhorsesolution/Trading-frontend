// VersionContext.tsx
import React, { createContext, useContext, ReactNode } from "react";

interface VersionContextProps {
  version: string;
}

const VersionContext = createContext<VersionContextProps | undefined>(
  undefined
);

export const useVersion = (): VersionContextProps => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error("useVersion must be used within a VersionProvider");
  }
  return context;
};

interface VersionProviderProps {
  version: string; // Add version prop
  children: ReactNode;
}

export const VersionProvider: React.FC<VersionProviderProps> = ({
  version,
  children,
}) => {
  const value: VersionContextProps = {
    version,
  };

  return (
    <VersionContext.Provider value={value}>{children}</VersionContext.Provider>
  );
};
