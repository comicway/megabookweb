import { createContext, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { dayNames, getWeekNumber, getYesterdayInfo } from '../../logic/dateUtils';
import { calculateStreak } from '../../logic/streak';
import { useAuth } from './AuthProvider';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../logic/firebase';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const { user } = useAuth();
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const todayIs = today.getDay();
    const currentDayName = dayNames[todayIs];

    // Estados con Persistencia Automática
    const [timerComplete, setTimerComplete] = useLocalStorage('timerKey', 0);
    const [lastTimerCount, setLastTimerCount] = useLocalStorage('lastTimerKey', 0);
    const [totalStreak, setTotalStreak] = useLocalStorage('totalStreak', 0);
    const [maxStreak, setMaxStreak] = useLocalStorage('maxStreak', 0);
    const [lastWeek, setLastWeek] = useLocalStorage('LastWeek', 0);
    const [wasSaturdaySuccessful, setWasSaturdaySuccessful] = useLocalStorage('wasSaturdaySuccessful', false);

    // Estado de los días (Cargado desde localStorage)
    const [days, setDays] = useLocalStorage('daysFalses', {
        sunday: false, monday: false, tuesday: false, wednesday: false,
        thursday: false, friday: false, saturday: false
    });

    // Sincronización inicial desde Firestore
    useEffect(() => {
        if (user) {
            const loadFirestoreData = async () => {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        if (data.total_streak !== undefined) setTotalStreak(data.total_streak);
                        if (data.max_streak !== undefined) setMaxStreak(data.max_streak);
                    }
                } catch (error) {
                    console.error("Error al cargar datos desde Firestore:", error.message);
                }
            };
            loadFirestoreData();
        }
    }, [user]);

    // Sincronización de cambio de semana
    useEffect(() => {
        if (lastWeek !== 0 && lastWeek !== currentWeek) {
            console.log("¡Semana Nueva detectada! Reseteando tablero...");
            setWasSaturdaySuccessful(days.saturday);
            setDays({
                sunday: false, monday: false, tuesday: false, wednesday: false,
                thursday: false, friday: false, saturday: false
            });
            setLastTimerCount(timerComplete);
        }
        setLastWeek(currentWeek);
    }, [currentWeek, lastWeek]);

    // Procesa el fin de un timer y actualiza racha
    useEffect(() => {
        if (timerComplete > 0 && !days[currentDayName] && lastTimerCount < timerComplete) {
            const updatedDays = { ...days, [currentDayName]: true };
            setDays(updatedDays);
            setLastTimerCount(timerComplete);

            // Lógica de Racha Infinita
            const { name, isAcrossWeek } = getYesterdayInfo(todayIs);
            const yesterdayWasSuccessful = isAcrossWeek ? wasSaturdaySuccessful : days[name];

            setTotalStreak(prevTotal => {
                const newTotal = yesterdayWasSuccessful ? prevTotal + 1 : 1;
                
                const syncMaxStreak = async () => {
                    if (user) {
                        try {
                            const userRef = doc(db, 'users', user.uid);
                            const userSnap = await getDoc(userRef);
                            
                            let dbMax = 0;
                            if (userSnap.exists()) {
                                dbMax = userSnap.data().max_streak || 0;
                            }
                            
                            setMaxStreak(prevMax => {
                                const finalMax = Math.max(newTotal, dbMax, prevMax);
                                
                                updateDoc(userRef, {
                                    last_session: serverTimestamp(),
                                    total_streak: newTotal,
                                    max_streak: finalMax
                                }).catch(error => {
                                    console.error("Error al guardar racha en Firestore:", error.message);
                                });
                                
                                return finalMax;
                            });
                        } catch (error) {
                            console.error("Error consultando max_streak real (posiblemente offline):", error.message);
                            // Fallback offline: actualiza localmente y encola en Firestore
                            setMaxStreak(prevMax => {
                                const finalMax = Math.max(newTotal, prevMax);
                                const userRef = doc(db, 'users', user.uid);
                                updateDoc(userRef, {
                                    last_session: serverTimestamp(),
                                    total_streak: newTotal,
                                    max_streak: finalMax
                                }).catch(err => console.error("Error al encolar actualización offline:", err.message));
                                return finalMax;
                            });
                        }
                    } else {
                        // Usuario no logueado
                        setMaxStreak(prevMax => Math.max(newTotal, prevMax));
                    }
                };
                
                syncMaxStreak();
                
                return newTotal;
            });
        }
    }, [timerComplete]);

    // Calcular racha en vivo (para la UI)
    const { name, isAcrossWeek } = getYesterdayInfo(todayIs);
    const yesterdayWasSuccessful = isAcrossWeek ? wasSaturdaySuccessful : days[name];
    const liveStreak = (days[currentDayName] || yesterdayWasSuccessful) ? totalStreak : 0;

    return (
        <TimerContext.Provider value={{
            timerComplete, setTimerComplete,
            days, setDays,
            totalStreak, setTotalStreak,
            maxStreak, setMaxStreak,
            liveStreak
        }}>
            {children}
        </TimerContext.Provider>
    );
};