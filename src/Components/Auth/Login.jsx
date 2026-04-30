import { useAuth } from '../Context/AuthProvider'
import readingHabitImg from '../../assets/img/habito_lectura.webp'
import { useState, useEffect } from 'react'
import DotBackground from './DotBackground'
import Footer from '../Footer/Footer'

const Login = () => {
    const { signInWithGoogle } = useAuth()
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640)

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 640)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const textInform1 = (
        <p className='font-nsmedium text-white-a text-h1 flex items-center px-3'>
            Tu biblioteca personal, siempre contigo. Organiza tus libros, lleva el control de lo que lees y descubre cuánto puedes avanzar cuando la constancia se vuelve un hábito.
        </p>
    )

    const textInform2 = (
        <p className='font-nsmedium text-white-a text-h1 flex items-center px-3'>
            Registra tu lectura día a día. Con el tracking diario de MegaBook, cada página cuenta y cada sesión te acerca más a convertir la lectura en tu mejor hábito.
        </p>
    )

    const imgSEO = (
        <img src={readingHabitImg} alt="Un texto para SEO" className='rounded-md mt-5' />
    )

    return (
        <div className="relative min-h-screen bg-background-a overflow-x-hidden">
            <DotBackground />

            <div className="relative z-10">
                <div className='mx-auto container'>
                    <div className='grid grid-cols-1'>
                        <h1 className="font-nsdisplayblack text-white-a leading-tight my-3 py-3 text-center">MegaBook</h1>
                    </div>
                    <div className='grid gird-cols-1'>
                        <div
                            className='h-[400px] w-[350px] md:w-full bg-cover bg-center rounded-md mx-auto'
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${readingHabitImg})`
                            }}
                        >

                            <div className='h-full grid grid-cols-1'>
                                <h1 className='text-white-a font-nsdisplayblack text-tittlelogin p-4 flex items-end justify-center text-center'>Tu próximo gran hábito empieza con una página. Entra y comienza hoy.</h1>
                                <div className="flex justify-center">
                                    <button
                                        onClick={signInWithGoogle}
                                        className="w-full max-w-[300px] h-14 bg-white-a text-black-a font-nsbold font-bold rounded-full flex justify-center items-center gap-3 shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98]"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6" />
                                        Entrar con Google
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='container mx-auto px-2 my-10'>
                    <div className='grid sm:grid-cols-2 grid-cols-1'>
                        {textInform1}
                        {imgSEO}
                    </div>
                    <div className='grid sm:grid-cols-2 grid-cols-1 mt-10'>
                        {isDesktop ? (
                            <>{imgSEO}{textInform2}</>
                        ) : (
                            <>{textInform2}{imgSEO}</>
                        )}
                    </div>
                </div>

                <div className='container-full mx-auto border-t border-t-white-a py-7'>
                    <div className='container mx-auto gird grid-cols-1'>
                        <h2 className='text-white-a text-day text-center'>Ventajas</h2>
                    </div>
                    <div className='container mx-auto grid sm:grid-cols-3 grid-cols-1 gap-8 pt-7'>
                        <div>
                            <img src={readingHabitImg} alt="Img 1" className='rounded-md' />
                            <p className='text-white-a text-day mt-2'>Leer 15 minutos al día transforma tu mente. MegaBook te ayuda a construir ese hábito sin excusas.</p>
                        </div>
                        <div>
                            <img src={readingHabitImg} alt="Img 2" className='rounded-md' />
                            <p className='text-white-a text-day mt-2'>Visualiza tu progreso con rachas diarias. Saber que llevas 30 días seguidos es la mejor motivación para no parar.</p>
                        </div>
                        <div>
                            <img src={readingHabitImg} alt="Img 3" className='rounded-md' />
                            <p className='text-white-a text-day mt-2'>Tu biblioteca crece contigo. Guarda cada libro que terminas y mira cómo se construye tu historia como lector.</p>
                        </div>
                    </div>
                    <div className='container mx-auto gird grid-cols-1 pt-7'>
                        <h2 className='text-white-a text-day text-center'>Contexto</h2>
                        <p className='text-white-a text-day mt-2 text-center'>MegaBook es un producto mínimo viable (PMV) en fase de validación. Por ahora es completamente gratuito mientras medimos el interés y los hábitos de lectura de nuestra comunidad. Tu uso nos ayuda a decidir el futuro de esta herramienta como aplicación oficial.</p>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default Login
