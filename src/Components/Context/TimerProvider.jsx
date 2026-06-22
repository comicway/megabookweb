import { createContext, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { dayNames, getWeekNumber } from '../../logic/dateUtils';
import { calculateStreak, getLocalYYYYMMDD } from '../../logic/streak';
import { useAuth } from './AuthProvider';
import { doc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
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
    const [lastSessionDate, setLastSessionDate] = useLocalStorage('lastSessionDate', null); // "YYYY-MM-DD"

    // Estado visual de la semana (Cargado desde localStorage)
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
                        if (data.last_session_date) setLastSessionDate(data.last_session_date);
                        
                        if (data.timer_state) {
                            if (data.timer_state.days) setDays(data.timer_state.days);
                            if (data.timer_state.timerComplete !== undefined) setTimerComplete(data.timer_state.timerComplete);
                            if (data.timer_state.lastTimerCount !== undefined) setLastTimerCount(data.timer_state.lastTimerCount);
                            if (data.timer_state.lastWeek !== undefined) setLastWeek(data.timer_state.lastWeek);
                        }
                    }
                } catch (error) {
                    console.error("Error al cargar datos desde Firestore:", error.message);
                }
            };
            loadFirestoreData();
        }
    }, [user]);

    // Reseteo visual de los checks cada nueva semana
    useEffect(() => {
        if (lastWeek !== 0 && lastWeek !== currentWeek) {
            console.log("¡Semana Nueva detectada! Reseteando tablero visual...");
            const resetDays = {
                sunday: false, monday: false, tuesday: false, wednesday: false,
                thursday: false, friday: false, saturday: false
            };
            setDays(resetDays);
            setLastTimerCount(timerComplete);

            if (user) {
                const userRef = doc(db, 'users', user.uid);
                updateDoc(userRef, {
                    'timer_state.days': resetDays,
                    'timer_state.lastWeek': currentWeek,
                    'timer_state.lastTimerCount': timerComplete
                }).catch(console.error);
            }
        }
        setLastWeek(currentWeek);
    }, [currentWeek, lastWeek]);

    // Procesa el fin de un timer: Actualiza racha con base en Fechas (Date)
    useEffect(() => {
        if (timerComplete > 0 && lastTimerCount < timerComplete) {
            
            const todayStr = getLocalYYYYMMDD();
            let updatedDays = days;
            
            // Si es el primer timer completado del día
            if (!days[currentDayName]) {
                updatedDays = { ...days, [currentDayName]: true };
                setDays(updatedDays);
            }

            // Calculamos la nueva racha de forma estricta (salto > 1 día resetea)
            const newTotal = calculateStreak(lastSessionDate, todayStr, totalStreak);
            
            setTotalStreak(newTotal);
            setLastSessionDate(todayStr);
            setLastTimerCount(timerComplete);

            const syncData = async () => {
                if (user) {
                    try {
                        const userRef = doc(db, 'users', user.uid);
                        const userSnap = await getDoc(userRef);
                        
                        let dbMax = userSnap.exists() ? (userSnap.data().max_streak || 0) : 0;
                        const finalMax = Math.max(newTotal, dbMax, maxStreak);
                        setMaxStreak(finalMax);
                        
                        // Guardado atómico de la data
                        await updateDoc(userRef, {
                            last_session: serverTimestamp(),
                            last_session_date: todayStr, // Clave para cálculo independiente de zona
                            total_streak: newTotal,
                            max_streak: finalMax,
                            'timer_state.days': updatedDays,
                            'timer_state.timerComplete': timerComplete,
                            'timer_state.lastTimerCount': timerComplete,
                            'timer_state.lastWeek': lastWeek
                        });
                        
                    } catch (error) {
                        console.error("Error offline/online al guardar racha:", error.message);
                        // Fallback local guardando offline state
                        const finalMax = Math.max(newTotal, maxStreak);
                        setMaxStreak(finalMax);
                        const userRef = doc(db, 'users', user.uid);
                        updateDoc(userRef, {
                            last_session: serverTimestamp(),
                            last_session_date: todayStr,
                            total_streak: newTotal,
                            max_streak: finalMax,
                            'timer_state.days': updatedDays,
                            'timer_state.timerComplete': timerComplete,
                            'timer_state.lastTimerCount': timerComplete,
                            'timer_state.lastWeek': lastWeek
                        }).catch(err => console.error(err));
                    }
                } else {
                    setMaxStreak(prevMax => Math.max(newTotal, prevMax));
                }
            };
            
            syncData();
        }
    }, [timerComplete]);

    // Calcular racha en vivo (para la UI): si pasaron > 1 días desde la última sesión, visualmente es 0
    let liveStreak = totalStreak;
    if (lastSessionDate) {
        const todayStr = getLocalYYYYMMDD();
        const diffTime = new Date(todayStr + "T00:00:00").getTime() - new Date(lastSessionDate + "T00:00:00").getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            liveStreak = 0; // Visualmente perdió la racha, al terminar timer hoy se reseteará a 1
        }
    }

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