import { createContext, useState, useContext, useCallback } from 'react';

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
    const [headerData, setHeaderData] = useState({
        title: '',
        subtitle: '',
        action: null
    });

    const setHeader = useCallback((title, subtitle = '', action = null) => {
        setHeaderData({ title, subtitle, action });
    }, []);

    return (
        <HeaderContext.Provider value={{ headerData, setHeader }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => useContext(HeaderContext);
