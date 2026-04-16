import { createContext, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { dayNames, getWeekNumber, getYesterdayInfo } from '../../logic/dateUtils';
import { calculateStreak } from '../../logic/streak';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const todayIs = today.getDay();
    const currentDayName = dayNames[todayIs];

    // Estados con Persistencia Automática
    const [timerComplete, setTimerComplete] = useLocalStorage('timerKey', 0);
    const [lastTimerCount, setLastTimerCount] = useLocalStorage('lastTimerKey', 0);
    const [totalStreak, setTotalStreak] = useLocalStorage('totalStreak', 0);
    const [lastWeek, setLastWeek] = useLocalStorage('LastWeek', 0);
    const [wasSaturdaySuccessful, setWasSaturdaySuccessful] = useLocalStorage('wasSaturdaySuccessful', false);

    // Estado de los días (Cargado desde localStorage)
    const [days, setDays] = useLocalStorage('daysFalses', {
        sunday: false, monday: false, tuesday: false, wednesday: false,
        thursday: false, friday: false, saturday: false
    });

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

            setTotalStreak(yesterdayWasSuccessful ? totalStreak + 1 : 1);
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
            liveStreak
        }}>
            {children}
        </TimerContext.Provider>
    );
};