import { createContext, useContext, useState, type ReactNode } from 'react';

type HealthContextType = {
    data:unknown | null;
    loading: boolean;
    error: unknown | null;
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<unknown | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown | null>(null);

    return (
        <HealthContext.Provider value={{ data, loading,  error }}>
            {children}
        </HealthContext.Provider>
    );
}

export const usehealthContext = () => {
    const context= useContext(HealthContext);
    if (context === undefined) {
        throw new Error('useHealthContext must be used within a HealthProvider');
    }
    return context;
}