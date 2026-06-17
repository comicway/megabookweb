/**
 * useTimerSound.js
 * Helper que encapsula la generación de sonido sintético de campana
 * mediante la Web Audio API nativa del navegador.
 * No requiere archivos de audio externos.
 */

/**
 * Genera y reproduce un sonido de campana sintético.
 * La frecuencia desciende de La5 (880Hz) a La4 (440Hz) con un fade-out de 1.2s.
 */
export const playBellSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);

        gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
        console.warn('Web Audio API no disponible en este navegador.', e);
    }
};
