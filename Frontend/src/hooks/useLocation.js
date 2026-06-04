// Custom hook — Browser GPS se city detect karta hai (free, no API key)
import { useState } from 'react';

export const useLocation = () => {
    const [locLoading, setLocLoading] = useState(false);
    const [locError, setLocError] = useState('');

    const detectCity = async () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('GPS aapke browser mein support nahi hai');
                return;
            }
            setLocLoading(true);
            setLocError('');

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        // OpenStreetMap Nominatim — free, no API key
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await res.json();
                        const city =
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village ||
                            data.address?.county ||
                            '';
                        setLocLoading(false);
                        resolve(city);
                    } catch {
                        setLocLoading(false);
                        reject('Location detect nahi hui');
                    }
                },
                (err) => {
                    setLocLoading(false);
                    if (err.code === 1) reject('GPS permission deny ki — please allow karein');
                    else reject('Location detect nahi hui');
                },
                { timeout: 10000 }
            );
        });
    };

    return { detectCity, locLoading, locError, setLocError };
};
