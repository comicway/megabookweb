import { useAuth } from '../Context/AuthProvider'
import readingHabitImg from '../../assets/img/habito_lectura.webp'
import { useState, useEffect } from 'react'
import DotBackground from './DotBackground'

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

    const textInform = (
        <p className='font-nsmedium text-white-a text-h1 flex items-center px-3'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum explicabo libero aut illo eius possimus animi tempore quas nemo dolorem atque.
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
                                <h1 className='text-white-a font-nsdisplayblack text-btn p-4 flex items-end text-center'>Habitos de lectura, entra en la app para que puedas cumplir tus metas de lectura</h1>
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
                        {textInform}
                        {imgSEO}
                    </div>
                    <div className='grid sm:grid-cols-2 grid-cols-1 mt-10'>
                        {isDesktop ? (
                            <>{imgSEO}{textInform}</>
                        ) : (
                            <>{textInform}{imgSEO}</>
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
                            <p className='text-white-a text-day mt-2'>Habitos de lectura, entra en la app para que puedas cumplir tus metas de lectura</p>
                        </div>
                        <div>
                            <img src={readingHabitImg} alt="Img 2" className='rounded-md' />
                            <p className='text-white-a text-day mt-2'>Habitos de lectura, entra en la app para que puedas cumplir tus metas de lectura</p>
                        </div>
                        <div>
                            <img src={readingHabitImg} alt="Img 3" className='rounded-md' />
                            <p className='text-white-a text-day mt-2'>Habitos de lectura, entra en la app para que puedas cumplir tus metas de lectura</p>
                        </div>
                    </div>
                    <div className='container mx-auto gird grid-cols-1 pt-7'>
                        <h2 className='text-white-a text-day text-center'>Contexto</h2>
                        <p className='text-white-a text-day mt-2 text-center'>Habitos de lectura, entra en la app para que puedas cumplir tus metas de lectura</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
