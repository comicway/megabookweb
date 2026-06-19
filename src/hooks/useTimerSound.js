/**
 * useTimerSound.js
 * Helper que encapsula la generación de sonido sintético de campana
 * mediante la Web Audio API nativa del navegador.
 * No requiere archivos de audio externos.
 */

/**
 * Genera y reproduce un sonido de campana sintético clásico.
 * Combina un tono fundamental puro con armónicos para lograr
 * un timbre metálico y resonante, sin efectos de caída de tono.
 */
export const playBellSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;

        // Oscilador 1: Fundamental (Tono base, resonancia larga)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 880; // La5
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        gain1.gain.setValueAtTime(0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // Resonancia duradera

        // Oscilador 2: Armónico metálico (Brillo inicial)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 1760; // Octava superior
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        gain2.gain.setValueAtTime(0.4, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0); // Decaimiento medio

        // Oscilador 3: Inarmónico (Ataque percusivo o golpe de martillo)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'triangle';
        osc3.frequency.value = 2420; // Frecuencia inarmónica para dar textura de metal
        
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        
        gain3.gain.setValueAtTime(0.2, now);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Decaimiento muy rápido

        // Iniciar y detener todos los osciladores
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        
        osc1.stop(now + 3.0);
        osc2.stop(now + 1.0);
        osc3.stop(now + 0.3);

    } catch (e) {
        console.warn('Web Audio API no disponible en este navegador.', e);
    }
};
