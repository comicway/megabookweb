import { useAuth } from '../Context/AuthProvider'
import readingHabitImg from '../../assets/img/habito_lectura.webp'

const Login = () => {
    const { signInWithGoogle } = useAuth()

    return (
        <div className='mx-auto w-full'>
            <div className='h-[430px] bg-cover bg-center' style={{ backgroundImage: `url(${readingHabitImg})` }}>
                <div className='grid grid-cols-1'>
                    <h1 className="text-[42px] font-nsdisplayblack text-white-a leading-tight mb-2">MegaBook</h1>
                </div>
                <div className='grid grid-cols-1'>
                    <div className="flex justify-center items-center">
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
            <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute bottom-8 left-0 w-full text-center">
                    <span className="text-[12px] text-white-a opacity-30 font-nsdisplayblack tracking-widest uppercase">
                        <a href="https://www.moises-script.cl/">Desarrollado por Moises-Script</a>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Login
