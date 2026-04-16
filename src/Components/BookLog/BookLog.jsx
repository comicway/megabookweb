import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

/* Inicio rescatar datos de la LocalStorage */

const CLAVE_STORAGE = 'miConfiguracionRadio';

const BookLog = () => {

    const [localBook, setlocalBook] = useState(() => {

        try {
            const stringGuardado = localStorage.getItem(CLAVE_STORAGE);

            if (stringGuardado === null) {
                return [];
            }

            return JSON.parse(stringGuardado);

        } catch (error) {
            console.error("Error al leer localStorage", error);
            return [];
        }
    });

    console.log('Informacion en el locaStorage:', localBook);

    /* Inicio sacar datos del Google Books */

    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(localBook);
    const [books, setBooks] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        if (!query) {
            setLoading(false);
            return;  /* Detiene todo si no hay nada que buscar */
        }

        const fetchBookData = async () => {

            setLoading(true);

            const apiKey = 'AIzaSyBzpG3HDLwYjHSYiEPJxgKVTyOizFL33cY';
            const encodedQuery = encodeURIComponent(query);

            const librosEncontrados = [];

            try {

                for (const id of query) {

                    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`;

                    const response = await fetch(apiUrl)

                    /* console.log("Mira el objeto response:", response);
                    console.log("¿Es un array?:", Array.isArray(response)); */

                    const data = await response.json();

                    librosEncontrados.push(data);
                }

                setlocalBook(librosEncontrados);

                /*if (!librosEncontrados.ok) {
                    throw new Error('Error al conectar con Google Books');
                }*/

                if (librosEncontrados.length > 0) {
                    setlocalBook(librosEncontrados);
                } else {
                    throw new Error('No se encontraron libros con esos IDs.')
                }
                return librosEncontrados;
            } catch (err) {
                setError("setError catch: " + err.message);
            } finally {
                setLoading(false);
            }

        };
        fetchBookData();

    }, [query]);

    if (error) {
        return <div>Error - {error}</div>;
    }

    return (
        <>
            <div className="container mx-auto px-2 mt-[8px]">
                <div className="grid grid-cols-1">
                    <div className="flex justify-start items-center mt-[6px]">
                        <img src="src/assets/icons/book.svg" alt="" />
                        <h1 className="text-h1 text-white-a font-nsbold font-bold">Tu biblioteca</h1>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-2 mt-[8px]">
                <div className="">
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        {localBook.map((book, index) => (
                            <div key={book.id || index}>
                                <img className="book-card shadow-general rounded-md pt-3" src={book.volumeInfo?.imageLinks.thumbnail || 'No hay imagen'} alt={`Portada de ${book.volumeInfo?.title || 'Título Desconocido'}`} />
                                <div className="text-white-a font-nsextrabold font-extrabold text-sm pt-0.5">
                                    {book.volumeInfo?.title || 'Título Desconocido'}
                                </div>
                                <div className="text-white-a font-nsitalic text-xs pt-0.5">
                                    {book.volumeInfo?.authors?.join(', ') || 'Autor Desconocido'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookLog;