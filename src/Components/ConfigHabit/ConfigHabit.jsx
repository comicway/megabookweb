import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { Link } from "react-router-dom";

const validate = (values) => {
    const errors = {};

    if (!values.habitpre) {
        errors.habitpre = 'Por favor, selecciona un habito';
    }

    return errors;
};

const ConfigHabit = () => {

    const [successMessage, setSuccessMessage] = useState('');

    const [formuHabit, setFormuHabit] = useState(() => {

        try {
            const habitGuardado = localStorage.getItem('habitData');
            return habitGuardado ? JSON.parse(habitGuardado) : [];
        } catch (error) {
            console.error("¡Error al parsear! El JSON estaba corrupto:", error);
            return [];
        }
    });

    console.log("Lo que esta en el LocalHabit:", formuHabit);

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
                        initialValues={{
                            habitpre: '',
                            time: '',
                            repeatdate: '',
                        }}
                        validate={validate}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setTimeout(() => {
                                try {
                                    const jsonData = JSON.stringify(values);
                                    localStorage.setItem('habitData', jsonData);
                                    setSuccessMessage('Configurado pre habito');
                                    resetForm();
                                } catch (error) {
                                    console.error("No se puede guardar en localStorage", error);
                                    setSuccessMessage("Hubo un error al guardar los datos");
                                }
                                setSubmitting(false);
                                setTimeout(() => setSuccessMessage(''), 5000);
                            }, 1000);
                        }}
                    >
                        {({ isSubmitting, isValid }) => (
                            <Form>
                                <div className='grid grid-cols-1 relative mt-3'>
                                    <Field as="select" name="habitpre" id="habitpre" className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none appearance-none">
                                        <option value="" className="bg-background-a text-white-a font-nsbold" disabled>Selecciona una opcion...</option>
                                        <option value="antesdesayuno" className="bg-background-a text-white-a font-nsbold">Antes del desayuno</option>
                                        <option value="despuescepillar" className="bg-background-a text-white-a font-nsbold">Despues de cepillarte</option>
                                        <option value="antesejercicio" className="bg-background-a text-white-a font-nsbold">Antes de hacer ejercicio</option>
                                        <option value="antesdesiesta" className="bg-background-a text-white-a font-nsbold">Antes de la siesta</option>
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
                                    <Field type="time" name="time" id="time" className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none [color-scheme:dark]"></Field>
                                </div>
                                <div className="grid grid-cols-1">
                                    <div className="gap-1 flex justify-start items-center mt-6">
                                        <img src="src/assets/icons/today.svg" alt="" />
                                        <h1 className="text-h1 text-white-a font-nsbold font-bold">Frecuencia</h1>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 relative mt-3'>
                                    <Field as="select" name="repeatdate" id="repeatdate" className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none appearance-none">
                                        <option value="unavez" className="bg-background-a text-white-a font-nsbold">Una vez</option>
                                        <option value="diariamente" className="bg-background-a text-white-a font-nsbold">Diariamente</option>
                                        <option value="lunesaviernes" className="bg-background-a text-white-a font-nsbold">Lunes a Viernes</option>
                                        <option value="lunes" className="bg-background-a text-white-a font-nsbold">Lunes</option>
                                        <option value="martes" className="bg-background-a text-white-a font-nsbold">Martes</option>
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
                                {/*<div className='grid grid-cols-1'>
                            <div className='flex justify-end'>
                                <div className='buttonplus'>+</div>
                            </div>
                        </div>*/}
                                <ErrorMessage name="habitpre" component="div" />
                                <div className='flex justify-center'>
                                    <button className="w-full mt-6 bg-secundary h-14 text-black-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2" type="submit" disabled={isSubmitting || !isValid} >
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
                            <button className="w-full mt-3 border border-secundary h-14 text-white-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2">Regresar</button>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default ConfigHabit