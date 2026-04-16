import { useContext } from "react";
import { TimerContext } from '../Context/TimerProvider';


const DailyStreak = () => {

    const { days, timerComplete, liveStreak } = useContext(TimerContext);

    return (
        <>
            <div className="container mx-auto px-2 mt-[8px]">
                <div className="grid grid-cols-1">
                    <div className="flex justify-start items-center mt-[6px]">
                        <img src="src/assets/icons/fire.svg" alt="" />
                        <h1 className="text-h1 text-white-a font-nsbold font-bold">Tu racha</h1>
                    </div>
                </div>
                <div className="grid pt-3">
                    <div className="grid-cols-2 flex items-center gap-4">
                        <div className=" bg-primary p-4 rounded-md w-full text-center flex flex-col justify-center shadow-general">
                            <span className="text-white-a font-nsbold font-black text-daily leading-[0.8]">{timerComplete}</span>
                            <span className="text-white-a font-nsmedium font-medium text-dailysub leading-none">Timers</span>
                        </div>
                        <div className=" bg-primary p-4 rounded-md w-full text-center flex flex-col justify-center shadow-general">
                            <span className="text-white-a font-nsbold font-black text-daily leading-[0.8]">{liveStreak}</span>
                            <span className="text-white-a font-nsmedium font-medium text-dailysub leading-none">Días</span>
                        </div>
                    </div>
                </div>
                <div className="grid pt-3">
                    <div className="grid-cols-1">
                        <div className="relative flex justify-between items-center w-full px-4 py-8 bg-primary shadow-general rounded-3xl">
                            {/* Línea conectora de fondo */}
                            <div className="absolute top-[35%] left-9 right-9 h-0.5 bg-secundary opacity-50" />
                            {[
                                { label: 'L', key: 'monday' },
                                { label: 'M', key: 'tuesday' },
                                { label: 'M', key: 'wednesday' },
                                { label: 'J', key: 'thursday' },
                                { label: 'V', key: 'friday' },
                                { label: 'S', key: 'saturday' },
                                { label: 'D', key: 'sunday' }
                            ].map((day) => {
                                const isCompleted = days[day.key];
                                return (
                                    <div key={day.key} className="relative z-10 flex flex-col items-center gap-4">
                                        {/* Círculo de estado */}
                                        <div className={`
                                                flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-secundary transition-all duration-300
                                                ${isCompleted ? 'bg-secundary shadow-general' : 'bg-primary'}
                                            `}>
                                            {isCompleted && (
                                                <span className="text-white-a text-lg font-bold">✓</span>
                                            )}
                                        </div>
                                        {/* Etiqueta del día */}
                                        <span className="font-nsmedium font-medium text-white-a text-day uppercase leading-[0.8]">
                                            {day.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DailyStreak;