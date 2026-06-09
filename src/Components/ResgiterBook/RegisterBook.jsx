import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthProvider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../logic/firebase';

/* Validacion del buscador de libros*/

const validate = (values) => {

    const errors = {};
    if (!values.title) {
        errors.title = 'El titulo del libro es requerido';
    }
    return errors;
};

const RegisterBook = () => {

    const { user } = useAuth();

    const [query, setQuery] = useState(''); /* La informacion campo "Titulo del libro" */

    const [books, setBooks] = useState([]); /* Los datos del libro */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    /* Captura los datos del input como array de ids */
    const [inputValue, setInputValue] = useState([]);

    /* Carga inicial de IDs directamente desde Firestore */
    const loadBookIds = async () => {
        if (!user) {
            setInputValue([]);
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setInputValue(userSnap.data().book_ids || []);
            } else {
                setInputValue([]);
            }
        } catch (err) {
            console.error("Error al cargar book_ids desde Firestore:", err.message);
            setInputValue([]);
        }
    };

    useEffect(() => {
        loadBookIds();
    }, [user]);

    /* Toggle para checkboxes: añade o quita el id del array */
    const handleChange = (e) => {
        const id = e.target.value;
        setInputValue(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (inputValue.length === 0) {
            setStatusMessage('Por favor, selecciona un libro');
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { book_ids: inputValue });
                setStatusMessage('Agregado correctamente a la nube');
            } catch (err) {
                console.error("Error al guardar book_ids en Firestore:", err.message);
                setStatusMessage('Error al guardar en la nube');
            }
        } else {
            setStatusMessage('Debes iniciar sesión para guardar');
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
            const encodedQuery = encodeURIComponent(query);
            const apiUrl = `/api/books?q=${encodedQuery}`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    if (response.status === 429 || response.status >= 500) {
                        throw new Error('SERVER_BUSY');
                    }
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
                if (err.message === 'SERVER_BUSY') {
                    setError('Servidor ocupado. Por favor, intenta de nuevo en unos momentos.');
                } else {
                    setError('Error al buscar libros. Revisa tu conexión.');
                }
            } finally {
                setLoading(false);
            }

        };
        fetchBookData();

    }, [query]);

    if (error) {
        return (
            <div className="container mx-auto px-2 mt-[40px] text-center">
                <div className="border border-secundary rounded-md p-6">
                    <p className="text-white-a font-nsbold text-lg">{error}</p>
                    <button onClick={() => setError(null)} className="mt-4 bg-secundary text-black-a px-6 py-2 rounded-full font-nsbold">Intentar de nuevo</button>
                </div>
            </div>
        );
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
                                        data-tracking-id="RegisterBook-BtnSearchIcon-Click"
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
                                        data-tracking-id="RegisterBook-BtnSearchFull-Click"
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
                                        data-tracking-id="RegisterBook-CheckBook-Click"
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
                        <button onClick={handleSave} data-tracking-id="RegisterBook-BtnSave-Click" className='w-full h-14 text-secundary font-nsbold font-bold rounded-full text-btn border border-secundary'>Agregar</button>
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
