import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom";

const validate = (value) => {
    const error = {};
    if (!value.time) {
        error.time = 'El tiempo es requerido'
    } else if (!/^[0-9]+$/i.test(value.time)) {
        error.time = 'Solo se permiten numeros';
    }
    return error;
};

const ReadBook = () => {
    const [successMessage, setSuccessMessage] = useState('');

    const [timeHabit, setTimeHabit] = useState(() => {

        try {
            const timeGuardado = localStorage.getItem('timeFormData');
            return timeGuardado ? JSON.parse(timeGuardado) : [];
        } catch (error) {
            console.error("¡Error al parsear! El JSON estaba corrupto:", error);
            return [];
        }
    });

    console.log("aqui la data del tiempo ", timeHabit);

    return (
        <>
            <div className="container mx-auto px-2 mt-[20px]">
                <div className="grid grid-cols-1 text-center text-white-a">
                    <h1 className="font-nsbold font-black text-daily leading-[0.8]">{timeHabit.time} min</h1>
                    <p className="font-nsmedium font-medium text-h1">tiempo de lectura</p>
                </div>
                <div className="grid grid-cols-1">
                    <Formik
                        initialValues={{ time: '' }}
                        validate={validate}
                        onSubmit={(value, { setSubmitting, resetForm }) => {
                            setTimeout(() => {
                                try {
                                    const jsonData = JSON.stringify(value);
                                    localStorage.setItem('timeFormData', jsonData);
                                    setSuccessMessage('¡Gracias, tu tiempo ha sido registrado.');
                                    resetForm();
                                } catch (error) {
                                    console.error("No se puede registrar un tiempo", error);
                                    setSuccessMessage('Hubo un error al guardar los datos');
                                }
                                setSubmitting(false);
                                setTimeout(() => setSuccessMessage(''), 5000);
                            }, 1000); // 1 segundo de demora
                        }} >
                        {({ isSubmitting }) => (
                            <Form className="container mx-auto">
                                <div>
                                    <Field className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none appearance-none" name="time" type="text" placeholder="Ejemplo 25 min"></Field>
                                </div>
                                <div className="text-secundary flex justify-center font-nsitalic mt-2">
                                    <ErrorMessage name="time" />
                                </div>
                                <div className="flex justify-center">
                                    <button className="w-full mt-6 bg-secundary h-14 text-black-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Enviando...' : 'Resgistrar tiempo'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    <div className="container mx-auto">
                        <Link to="/timer">
                            <button className="w-full mt-3 border border-secundary h-14 text-white-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2">
                                Empezar a leer
                            </button>
                        </Link>
                    </div>
                    {successMessage && (
                        <div className="mx-[5px] text-gren font-bold">{successMessage}</div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ReadBook