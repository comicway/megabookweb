import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from '../Context/AuthProvider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../logic/firebase';

const validate = (values) => {
    const errors = {};

    if (!values.habitpre) {
        errors.habitpre = 'Por favor, selecciona un habito';
    }

    return errors;
};

const ConfigHabit = () => {

    const { user } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');
    const [initialData, setInitialData] = useState({
        habitpre: '',
        time: '',
        repeatdate: '',
    });

    useEffect(() => {
        const fetchConfig = async () => {
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        if (data.habit_config) {
                            setInitialData(data.habit_config);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching habit config from Firestore:", error);
                }
            }
        };
        fetchConfig();
    }, [user]);

    return (
        <>
            <div className="container mx-auto px-2 mt-[20px]">
                <div className="grid grid-cols-1">
                    <div className="gap-1 flex justify-start items-center mt-[6px]">
                        <img src="src/assets/icons/routine.svg" alt="" />
                        <h1 className="text-h1 text-white-a font-nsbold font-bold">Rutina previa</h1>
                    </div>
                </div>
                <div className='grid gird-cols-1'>
                    <Formik
                        enableReinitialize={true}
                        initialValues={initialData}
                        validate={validate}
                        onSubmit={async (values, { setSubmitting }) => {
                            if (user) {
                                try {
                                    // Convertir hora local de Chile (CLT/CLST) a UTC
                                    // El objeto Date del browser respeta el DST automáticamente
                                    // sin necesidad de hardcodear el offset -3 o -4
                                    let timeUTC = values.time;
                                    if (values.time) {
                                        const [hours, minutes] = values.time.split(':');
                                        const localDate = new Date();
                                        localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                        const utcHour = localDate.getUTCHours().toString().padStart(2, '0');
                                        const utcMinute = localDate.getUTCMinutes().toString().padStart(2, '0');
                                        timeUTC = `${utcHour}:${utcMinute}`;
                                    }

                                    const userRef = doc(db, 'users', user.uid);
                                    await updateDoc(userRef, {
                                        habit_config: { ...values, time: timeUTC }
                                    });
                                    setSuccessMessage('Configurado exitosamente');
                                } catch (error) {
                                    console.error("Error guardando en Firestore:", error);
                                    setSuccessMessage("Hubo un error al guardar los datos");
                                }
                            } else {
                                setSuccessMessage("Debes iniciar sesión para guardar");
                            }
                            setSubmitting(false);
                            setTimeout(() => setSuccessMessage(''), 5000);
                        }}
                    >
                        {({ isSubmitting, isValid }) => (
                            <Form>
                                <div className='grid grid-cols-1 relative mt-3'>
                                    <Field as="select" name="habitpre" id="habitpre" data-tracking-id="ConfigHabit-SelectHabitPre-Click" className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none appearance-none">
                                        <option value="" className="bg-background-a text-white-a font-nsbold" disabled>Selecciona una opcion...</option>
                                        <option value="antesdesayuno" className="bg-background-a text-white-a font-nsbold">Antes del desayuno</option>
                                        <option value="despuescepillar" className="bg-background-a text-white-a font-nsbold">Despues de cepillarte</option>
                                        <option value="antesejercicio" className="bg-background-a text-white-a font-nsbold">Antes de hacer ejercicio</option>
                                        <option value="antesdesiesta" className="bg-background-a text-white-a font-nsbold">Antes de la siesta</option>
                                        <option value="antesdedormir" className="bg-background-a text-white-a font-nsbold">Antes de dormir</option>
                                    </Field>
                                    <div className="absolute right-4 top-[50%] -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white-a" viewBox="0 -960 960 960">
                                            <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1">
                                    <span className="text-[14px] text-white-a font-nsitalic mt-2">Elige una actividad que ya realices a diario; será el impulso ideal para fortalecer tu hábito de lectura.</span>
                                </div>
                                <div className="grid grid-cols-1">
                                    <div className="gap-1 flex justify-start items-center mt-6">
                                        <img src="src/assets/icons/alarm.svg" alt="" />
                                        <h1 className="text-h1 text-white-a font-nsbold font-bold">Alarma</h1>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 mt-3'>
                                    <Field type="time" name="time" id="time" data-tracking-id="ConfigHabit-InputTime-Click" className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none [color-scheme:dark]"></Field>
                                </div>
                                <div className="grid grid-cols-1">
                                    <div className="gap-1 flex justify-start items-center mt-6">
                                        <img src="src/assets/icons/today.svg" alt="" />
                                        <h1 className="text-h1 text-white-a font-nsbold font-bold">Frecuencia</h1>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 relative mt-3'>
                                    <Field as="select" name="repeatdate" id="repeatdate" data-tracking-id="ConfigHabit-SelectRepeat-Click" className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none appearance-none">
                                        <option value="unavez" className="bg-background-a text-white-a font-nsbold">Una vez</option>
                                        <option value="diariamente" className="bg-background-a text-white-a font-nsbold">Diariamente</option>
                                        <option value="lunesaviernes" className="bg-background-a text-white-a font-nsbold">Lunes a Viernes</option>
                                        <option value="lunes" className="bg-background-a text-white-a font-nsbold">Lunes</option>
                                        <option value="martes" className="bg-background-a text-white-a font-nsbold">Martes</option>
                                        <option value="miercoles" className="bg-background-a text-white-a font-nsbold">Miercoles</option>
                                        <option value="jueves" className="bg-background-a text-white-a font-nsbold">Jueves</option>
                                        <option value="viernes" className="bg-background-a text-white-a font-nsbold">Viernes</option>
                                        <option value="sabado" className="bg-background-a text-white-a font-nsbold">Sabado</option>
                                        <option value="domingo" className="bg-background-a text-white-a font-nsbold">Domingo</option>
                                    </Field>
                                    <div className="absolute right-4 top-[50%] -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white-a" viewBox="0 -960 960 960">
                                            <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1">
                                    <span className="text-[14px] text-white-a font-nsitalic mt-2">Elige con qué frecuencia deseas recibir tus recordatorios.</span>
                                </div>
                                <ErrorMessage name="habitpre" component="div" />
                                <div className='flex justify-center'>
                                    <button data-tracking-id="ConfigHabit-BtnSave-Click" className="w-full mt-6 bg-secundary h-14 text-black-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2 active:opacity-70 active:scale-[0.98] transition-all duration-150" type="submit" disabled={isSubmitting || !isValid} >
                                        {isSubmitting ? 'Enviando...' : 'Guardar'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    {successMessage && (
                        <div style={{ marginTop: '1rem', color: 'green', fontWeight: 'bold' }}>
                            {successMessage}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1">
                    <Link to="/">
                        <div className="flex justify-center">
                            <button data-tracking-id="ConfigHabit-BtnReturn-Click" className="w-full mt-3 border border-secundary h-14 text-white-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2">Regresar</button>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default ConfigHabit