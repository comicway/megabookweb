/**
 * Calcula la racha en base a la diferencia de fechas de la última sesión.
 * @param {string|null} lastDateStr - Fecha de última sesión "YYYY-MM-DD"
 * @param {string} currentDateStr - Fecha actual "YYYY-MM-DD"
 * @param {number} currentStreak - Valor actual de la racha
 * @returns {number} Nueva racha calculada
 */
export const calculateStreak = (lastDateStr, currentDateStr, currentStreak) => {
    if (!lastDateStr || currentStreak === 0) return 1;

    // Forzar inicio de día para ignorar horas y evitar bugs de Timezone
    const lastDate = new Date(lastDateStr + "T00:00:00");
    const currentDate = new Date(currentDateStr + "T00:00:00");

    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Mismo día: mantiene la racha actual
        return currentStreak;
    } else if (diffDays === 1) {
        // Día siguiente consecutivo: suma 1
        return currentStreak + 1;
    } else {
        // Gap mayor a 1 día: racha perdida, se reinicia a 1 (pues hoy acaba de completar)
        return 1;
    }
};

/**
 * Retorna la fecha actual en formato local YYYY-MM-DD
 */
export const getLocalYYYYMMDD = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    return date.toISOString().split('T')[0];
};