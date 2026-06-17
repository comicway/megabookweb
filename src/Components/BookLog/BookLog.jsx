import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from '../Context/AuthProvider';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../logic/firebase';

const BookLog = () => {

    const { user } = useAuth();

    const [localBook, setlocalBook] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const loadAndFetch = async () => {

            let ids = [];

            if (user) {
                try {
                    const userSnap = await getDoc(doc(db, 'users', user.uid));
                    if (userSnap.exists()) {
                        ids = userSnap.data().book_ids || [];
                    }
                } catch (err) {
                    console.error("Error loading book_ids from Firestore:", err.message);
                }
            }

            console.log('IDs a consultar:', ids);

            // Step 3: Fetch from Google Books API for each ID
            if (!ids || ids.length === 0) {
                setlocalBook([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const librosEncontrados = [];

            try {
                for (const id of ids) {
                    const apiUrl = `/api/books?id=${encodeURIComponent(id)}`;

                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                        if (response.status === 429 || response.status >= 500) {
                            throw new Error('SERVER_BUSY');
                        }
                        throw new Error(`HTTP Error: ${response.status}`);
                    }

                    const data = await response.json();

                    librosEncontrados.push(data);
                }

                if (librosEncontrados.length > 0) {
                    setlocalBook(librosEncontrados);
                } else {
                    throw new Error('No se encontraron libros con esos IDs.');
                }

            } catch (err) {
                if (err.message === 'SERVER_BUSY') {
                    setError('Servidor ocupado. Por favor, intenta de nuevo en unos momentos.');
                } else {
                    setError("Error al cargar la biblioteca. Por favor intenta más tarde.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadAndFetch();

    }, [user]);

    const handleDeleteBook = async (bookId) => {
        // 1. Ocultarlo visualmente de inmediato
        setlocalBook(prev => prev.filter(book => book.id !== bookId));

        // 2. Borrarlo de la nube
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { book_ids: arrayRemove(bookId) });
            } catch (err) {
                console.error("Error al eliminar el libro:", err);
            }
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-2 mt-[40px] text-center">
                <div className="border border-secundary rounded-md p-6">
                    <p className="text-white-a font-nsbold text-lg">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 bg-secundary text-black-a px-6 py-2 rounded-full font-nsbold active:opacity-70 active:scale-[0.98] transition-all duration-150">Reintentar</button>
                </div>
            </div>
        );
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
                            <div key={book.id || index} className="relative">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteBook(book.id);
                                    }}
                                    className="absolute top-5 right-2 bg-background-b text-white-a rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 shadow-md"
                                >
                                    X
                                </button>
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
