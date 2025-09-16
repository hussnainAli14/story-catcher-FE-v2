import { useEffect, useState } from "react";

export const useWindowWidth = () => {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkWindowWidth = () => {
            const windowWidth = window.innerWidth;
            setIsVisible(windowWidth > 450);
        };

        checkWindowWidth();

        window.addEventListener('resize', checkWindowWidth);

        return () => {
            window.removeEventListener('resize', checkWindowWidth);
        };
    }, []);

    return isVisible;
}