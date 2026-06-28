import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Native fallback for the color scheme hook. Web keeps its own hydration-aware version.
 */
export function useColorScheme() {
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    const colorScheme = useRNColorScheme();

    if (hasHydrated) {
        return colorScheme;
    }

    return 'light';
}
