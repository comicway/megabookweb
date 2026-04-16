export const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getYesterdayInfo = (todayIs) => {
    if (todayIs > 0) {
        return {
            name: dayNames[todayIs - 1],
            isAcrossWeek: false
        };
    }
    return {
        name: "saturday",
        isAcrossWeek: true
    };
};
