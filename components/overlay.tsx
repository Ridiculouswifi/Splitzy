import React, { createContext, ReactNode, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type OverlayContextType = {
    show: (component: ReactNode) => void;
    hide: () => void;
};

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
    const [content, setContent] = useState<ReactNode | null>(null);

    const show = (component: ReactNode) => setContent(component);
    const hide = () => setContent(null);

    return (
        <OverlayContext.Provider value={{ show, hide }}>
        {children}
        
            <View style={styles.overlay}>
            {content}
            </View>
        
        </OverlayContext.Provider>
    );
};

export const useOverlay = (): OverlayContextType => {
    const context = useContext(OverlayContext);
    if (!context) throw new Error('useOverlay must be used within an OverlayProvider');
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
});