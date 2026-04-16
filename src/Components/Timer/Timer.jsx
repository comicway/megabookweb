import { useState, useEffect, useContext } from "react";
import { TimerContext } from '../Context/TimerProvider';

const Timer = () => {

    const [countdownStarted, setCountdownStarted] = useState(false);
    // const [timeRemaining, setTimeRemaining] = useState(0);

    const [segundosTotales, setSegundosTotales] = useState(59);


    const [timeHabit, setTimeHabit] = useState(() => {

        try {
            const timeGuardado = localStorage.getItem('timeFormData');
            return timeGuardado ? JSON.parse(timeGuardado) : {};
        } catch (error) {
            console.error("¡Error al parsear! El JSON estaba corrupto:", error);
            return {};
        }
    });

    const [minutosTotales, setMinutosTotales] = useState(() => {

        const tiempoCrudo = timeHabit?.time || 0;

        return (Number(tiempoCrudo));

    });

    console.log("aqui la data del tiempo ", timeHabit);

    /* const formatearMinutos = (minutos) => {
       
        const minutosTexto = String(minutos);

        const minutosConCero = minutosTexto.padStart(2, '0');

        return `${minutosConCero}:00`;
    }; */

    const handleStarted = () => {

        /*const tiempoCrudo = timeHabit?.time || 0;
        
        setSegundosTotales(Number(tiempoCrudo) * 60);

        setMinutosTotales(Number(tiempoCrudo));

        setTimeRemaining(segundosTotales);*/

        setCountdownStarted(true);

    };

    console.log("Segundos Totales: ", segundosTotales);
    console.log("Minutos Totales: ", minutosTotales);

    const handleStop = () => {
        setCountdownStarted(false);
        setSegundosTotales(0);
        setMinutosTotales(0);
        // setTimeRemaining(0);
    };

    const { timerComplete, setTimerComplete } = useContext(TimerContext);

    useEffect(() => {

        let intervalo = null;

        if (countdownStarted && minutosTotales > 0) {

            intervalo = setInterval(() => {

                if (segundosTotales > 0) {

                    setSegundosTotales((prevSegundos) => prevSegundos - 1);

                    if (segundosTotales == 1) {

                        setMinutosTotales(minutosTotales - 1);

                    }

                } else {
                    setSegundosTotales(59);
                };

            }, 1000);

        } else if (segundosTotales == 0 && minutosTotales == 0) {

            setCountdownStarted(false);

        };

        if (countdownStarted == false && minutosTotales == 0) {

            setTimerComplete((prev) => prev + 1);

        };

        return () => { if (intervalo) clearInterval(intervalo); };

    }, [countdownStarted, segundosTotales, minutosTotales]);

    console.log("El timer se ha completado ", timerComplete, " veces");

    return (
        <>
            <div className="container mx-auto px-2 mt-5">
                <div className="grid grid-cols-1 text-center">
                    {/*<p className="text-[54px]">{formatearMinutos(timeRemaining)}</p>*/}
                    {/*<p className="text-[54px]">{timeRemaining}</p>*/}
                    <div className="bg-primary rounded-md w-full mx-auto shadow-general ">
                        <p className="font-nsmedium font-medium text-white-a text-daily">{minutosTotales}:{segundosTotales}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-7">
                    <button onClick={handleStop} className="w-[98%] border border-secundary h-14 text-white-a font-nsbold font-bold rounded-full text-btn flex justify-center items-center gap-2">STOP</button>
                    <button onClick={handleStarted} className="w-[98%] bg-secundary h-14 text-black-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2">PLAY</button>
                </div>
                <div className="grid grid-cols-1 mt-7">
                    <div className="border border-white-a rounded-md w-full flex p-3 items-center">
                        <div className="w-[10%]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 -960 960 960"
                                className="h-6 w-6 fill-white-a"
                            >
                                <path d="M300-80q-58 0-99-41t-41-99v-520q0-58 41-99t99-41h500v600q-25 0-42.5 17.5T740-220q0 25 17.5 42.5T800-160v80H300Zm-60-267q14-7 29-10t31-3h20v-440h-20q-25 0-42.5 17.5T240-740v393Zm160-13h320v-440H400v440Zm-160 13v-453 453Zm60 187h373q-6-14-9.5-28.5T660-220q0-16 3-31t10-29H300q-26 0-43 17.5T240-220q0 26 17 43t43 17Z" />
                            </svg>
                        </div>
                        <div className="w-[90%]">
                            <h1 className="text-white-a font-nsitalic font-bold text-h1">Dato curioso:</h1>
                            <p className="text-white-a font-nsitalic text-h1">Leer solo 15 minutos al día puede ayudarte a terminar hasta 20 libros al año.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Timer