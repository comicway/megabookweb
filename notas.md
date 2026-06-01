❌ Lo que falta
OK 1. Libros no se persisten en Firestore RegisterBook.jsx y BookLog.jsx guardan y leen los IDs de libros seleccionados solo en localStorage (miConfiguracionRadio). Si el usuario cambia de dispositivo o limpia el navegador, pierde su biblioteca. Para el OMTM esto importa porque afecta la retención.

OK 2. Configuración de hábito no se persiste en Firestore ConfigHabit.jsx guarda habitpre, time y repeatdate solo en localStorage (habitData). Esto es crítico para el futuro punto de Push Notifications, que necesita leer esa configuración desde la nube.

OK 3. Reglas de seguridad de Firestore no están aplicadas Las reglas documentadas en 
cloud-firestore.md
 están escritas pero no hay evidencia de que estén desplegadas en Firebase Console. Con las reglas por defecto, los datos podrían estar expuestos.

OK 4. maxStreak no está protegida contra decrementos En TimerProvider.jsx, el updateDoc escribe max_streak: newMax donde newMax = Math.max(newTotal, prevMax). El problema es que prevMax viene del estado local (localStorage), no de Firestore. Si el localStorage se limpia, prevMax vuelve a 0 y podría sobreescribir el histórico real en Firestore.

OK 5. Sin manejo de errores offline / conflictos de sincronización Si el usuario completa un timer sin conexión, el updateDoc falla silenciosamente (solo hay un console.error). No hay cola de reintentos ni indicador visual de estado de sincronización.

Resumen de prioridad para el OMTM
Pendiente	Impacto en OMTM	                                            Urgencia
Persistir libros en Firestore	Medio (retención)	                    Alta
Persistir config de hábito en Firestore	Alto (Push Notifications)	    Alta
Aplicar reglas de seguridad	Alto (seguridad de datos)	                Alta
Proteger max_streak contra reset de localStorage	Medio (métricas)	Media
Manejo offline	Bajo (MVP)	                                            Baja