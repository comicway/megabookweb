import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState, useEffect } from 'react';

/* Validacion del buscador de libros*/

const validate = (values) => {

    const errors = {};
    if (!values.title) {
        errors.title = 'El titulo del libro es requerido';
    }
    return errors;
};

const RegisterBook = () => {

    const [query, setQuery] = useState(''); /* La informacion campo "Titulo del libro" */

    const [books, setBooks] = useState([]); /* Los datos del libro */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');


    const STORAGE_KEY = 'miConfiguracionRadio';

    /* Captura los datos del input como array de ids */
    const [inputValue, setInputValue] = useState(() => {
        try {
            const valorGuardado = localStorage.getItem(STORAGE_KEY);
            return valorGuardado ? JSON.parse(valorGuardado) : [];
        } catch (error) {
            console.error("¡Error al parsear! El JSON estaba corrupto:", error);
            return []; // asegurar siempre un array
        }
    });

    /* Toggle para checkboxes: añade o quita el id del array */
    const handleChange = (e) => {
        const id = e.target.value;
        setInputValue(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const [nuevoInput, setNuevoInput] = useState('');

    useEffect(() => {


        localStorage.setItem(STORAGE_KEY, JSON.stringify(inputValue)); /*Prepara las cajas*/

    }, [inputValue]);

    const handleSave = (e) => {

        e.preventDefault();

        if (inputValue.length > 0) {
            setStatusMessage('Agregado correctamente');

        } else {
            setStatusMessage('Por favor, selecciona un libro');
        }

        setTimeout(() => setStatusMessage(''), 3000);
    };


    useEffect(() => {

        if (!query) {
            setLoading(false);
            return;
        }

        const fetchBookData = async () => {
            setLoading(true);
            const apiKey = 'AIzaSyBzpG3HDLwYjHSYiEPJxgKVTyOizFL33cY';
            const encodedQuery = encodeURIComponent(query);

            const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&key=${apiKey}`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error('No se pudo obtener la respuesta de la API');
                }

                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    setBooks(data.items);
                } else {
                    throw new Error('No se encontraron libros con este titulo.');
                }
                return data;

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }

        };
        fetchBookData();

    }, [query]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className="container mx-auto px-2 mt-[20px]">
                <div className="grid grid-cols-1">
                    <Formik
                        initialValues={{
                            title: ''
                        }}
                        validate={validate}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setQuery(values.title);
                            setSubmitting(false);
                            resetForm();
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="relative w-full">
                                    <Field className="w-full border border-white-a rounded h-[56px] bg-transparent px-[15px] text-h1 font-nsbold font-bold text-white-a outline-none" name="title" type="text" placeholder="Título del libro*"></Field>
                                    <button
                                        type="submit"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer p-1"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 -960 960 960"
                                            className="h-6 w-6 fill-white-a hover:fill-secundary transition-colors"
                                        >
                                            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="text-secundary flex justify-center font-nsitalic">
                                    <ErrorMessage name="title" />
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        type="submit"
                                        className="w-full mt-3 bg-secundary h-14 text-black-a font-nsbold font-bold rounded-full text-btn shadow-general flex justify-center items-center gap-2"
                                        disabled={loading}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 -960 960 960"
                                            className="h-[25px] w-[25px] fill-black-a"
                                        >
                                            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                                        </svg>
                                        {loading ? 'Cargando libros...' : 'Buscar libro'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div className="container mx-auto px-2 mt-[16px]">
                    <div className="">
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            {books.map((book) => (
                                <div className="book-card" key={book.id}>
                                    <input
                                        type="checkbox"
                                        id={book.id}
                                        name="book"
                                        value={book.id}
                                        checked={inputValue.includes(book.id)}
                                        onChange={handleChange}
                                        className="peer hidden"
                                    />
                                    <label
                                        htmlFor={book.id}
                                        className="block cursor-pointer border-[6px] border-transparent rounded-md peer-checked:border-secundary transition-all"
                                    >
                                        {book.volumeInfo.imageLinks?.thumbnail && (
                                            <img className="w-full h-full object-cover rounded-sm" src={book.volumeInfo.imageLinks.thumbnail} alt={`Portada de ${book.volumeInfo.title}`} />
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 mt-2">
                    <div className="flex justify-center">
                        <button onClick={handleSave} className='w-full h-14 text-secundary font-nsbold font-bold rounded-full text-btn border border-secundary'>Agregar</button>
                    </div>
                    {statusMessage && (
                        <div className="text-secundary flex justify-center font-nsitalic mt-2">
                            {statusMessage}
                        </div>
                    )}
                    <div>
                        {/* Mostrar selección actual */}
                        <p style={{ marginTop: '10px' }}>
                            Selección actual (en React): <strong>{inputValue.length ? inputValue.join(', ') : 'Ninguna'}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterBook;