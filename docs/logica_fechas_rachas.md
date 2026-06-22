# Lógica de Fechas y Rachas (Streaks) 📅

El sistema de rachas (streaks) de MegaBook es fundamental para fomentar la constancia de los usuarios. Recientemente, se refactorizó la lógica subyacente para asegurar resiliencia, honestidad matemática y robustez.

## 1. Independencia Horaria (Normalización 'T00:00:00')

**El Problema:**
Cuando comparamos fechas exactas generadas por el sistema (por ejemplo: el timestamp en el que finaliza un timer), nos enfrentamos a problemas de husos horarios y horas extremas. Si un usuario termina de leer el "Lunes a las 11:55 PM" y al día siguiente vuelve a leer el "Martes a las 1:00 AM", han pasado apenas unas 2 horas. Si el código restara directamente esos timestamps en milisegundos, interpretaría que **no ha pasado un día completo de 24 horas**, por lo que erróneamente no sumaría un día de racha.

**La Solución:**
Normalizamos y truncamos las fechas a **cadenas `YYYY-MM-DD` locales** y luego las forzamos a iniciar a las `"T00:00:00"`.
```javascript
const lastDate = new Date(lastDateStr + "T00:00:00");
const currentDate = new Date(currentDateStr + "T00:00:00");
```
De esta manera, el código ignora las horas, los minutos y el "Timezone Offset". Solo le importa el día matemático del calendario. Si leíste el "Día 10" y vuelves a leer el "Día 11", sin importar a qué hora fue, la matemática pura arrojará que la diferencia es **exactamente de 1 día**.

---

## 2. Prevención de Manipulaciones y Reseteo Automático

La función `calculateStreak(lastDateStr, currentDateStr, currentStreak)` se encarga de determinar el flujo lógico en el instante en el que un timer es completado:

1. **`diffDays === 0` (Mismo Día)**: El usuario completó varias sesiones hoy. Se mantiene la misma racha actual (ni sube, ni se resetea).
2. **`diffDays === 1` (Día Consecutivo)**: El caso ideal. El usuario completó una sesión al día siguiente. La racha se incrementa (`currentStreak + 1`).
3. **`diffDays > 1` (Inactividad)**: Hubo un hueco en el registro. Se rompió la cadena. Debido a que el usuario acaba de terminar un timer hoy, la racha se reinicia honestamente a `1`.

Esto elimina la antigua dependencia visual ligada a la UI de la semana (`wasSaturdaySuccessful`), permitiendo que el sistema sobreviva a ausencias de semanas o meses enteros.

---

## 3. Guía de Mantenimiento y Extensión

Si las reglas de negocio de MegaBook cambian en el futuro, este es el lugar para intervenir:

### ¿Qué hacer si queremos que la racha no se pierda en fin de semana?
Imagina que queremos añadir un "Permiso de Descanso" donde no se pierda la racha si la inactividad ocurre entre un viernes y un lunes (un gap de 3 días). 

Para lograrlo, modificarías el archivo `src/logic/streak.js` dentro de `calculateStreak`:
```javascript
// 1. Obtener el día de la semana de currentDate
const currentDay = currentDate.getDay(); // 0 = Domingo, 1 = Lunes

// 2. Extender la condición de tolerancia si es Lunes y el gap es pequeño
if (diffDays === 1 || (currentDay === 1 && diffDays <= 3)) {
    // Si saltaste Sábado o Domingo y volviste en Lunes, se te perdona el salto
    return currentStreak + 1;
} else {
    return 1;
}
```

### ¿Qué hacer si queremos dar "Comodines de Salto" (Freezes)?
Podrías agregar un parámetro adicional al método: `calculateStreak(lastDateStr, currentDateStr, currentStreak, freezeTokens)`.
Si `diffDays === 2` y el usuario tiene un `freezeToken > 0`, se le permite incrementar y simplemente se deduce un token en Firestore, manteniendo el valor real en `currentStreak`.
