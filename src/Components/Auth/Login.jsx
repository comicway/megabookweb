import { useAuth } from '../Context/AuthProvider'

const Login = () => {
    const { signInWithGoogle } = useAuth()

    return (
        <div className="min-h-screen bg-background-a flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secundary opacity-10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secundary opacity-10 rounded-full blur-[100px]"></div>

            <div className="z-10 text-center">
                <img src="/src/assets/icons/book.svg" alt="MegaBook Logo" className="w-20 h-20 mx-auto mb-6 drop-shadow-glow" />
                <h1 className="text-[42px] font-nsdisplayblack text-white-a leading-tight mb-2">
                    MegaBook
                </h1>
                <p className="text-white-a font-nsitalic opacity-70 mb-12 max-w-[280px] mx-auto">
                    La única métrica que importa es tu constancia. Empieza tu viaje de 66 días hoy.
                </p>

                <button
                    onClick={signInWithGoogle}
                    className="w-full max-w-[300px] h-14 bg-white-a text-black-a font-nsbold font-bold rounded-full flex justify-center items-center gap-3 shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98]"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6" />
                    Entrar con Google
                </button>
            </div>

            <div className="absolute bottom-8 left-0 w-full text-center">
                <span className="text-[12px] text-white-a opacity-30 font-nsdisplayblack tracking-widest uppercase">
                    Build for retention
                </span>
            </div>
        </div>
    )
}

export default Login
