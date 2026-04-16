export const calculateStreak = (days, today = new Date().getDay()) => {

    const values = Object.values(days);

    let streak = 0;

    for (let i = today; i >= 0; i--) {
        if (values[i] === true) {
            streak++;
        } else if (i < today) {
            break;
        }
    }

    return streak;
}