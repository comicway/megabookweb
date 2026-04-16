import { calculateStreak } from './streak';

test('dias de racha en true', () => {

    const days = {
        0: true, // Domingo
        1: true, // Lunes
        2: false, // Martes
        3: true, // Miercoles
        4: false, // Jueves
        5: false, // Viernes
        6: false // Sabado
    };
    expect(calculateStreak(days)).toBe(2);
});