import { useAuth } from '../Context/AuthProvider'
import readingHabitImg from '../../assets/img/habito_lectura.webp'
import { useState, useEffect, useRef } from 'react'

const Login = () => {
    const { signInWithGoogle } = useAuth()
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640)
    const canvasRef = useRef(null)
    const mousePos = useRef({ x: -1000, y: -1000 })

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 640)
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth
                canvasRef.current.height = window.innerHeight
            }
        }

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY }
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)
        handleResize()

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#808790'

            const gap = 10
            const radius = 0.5
            const attractionRange = 80
            const attractionForce = 0.15

            for (let x = 0; x < canvas.width; x += gap) {
                for (let y = 0; y < canvas.height; y += gap) {
                    let dx = mousePos.current.x - x
                    let dy = mousePos.current.y - y
                    let dist = Math.sqrt(dx * dx + dy * dy)

                    let moveX = 0
                    let moveY = 0

                    if (dist < attractionRange) {
                        moveX = dx * (1 - dist / attractionRange) * attractionForce
                        moveY = dy * (1 - dist / attractionRange) * attractionForce
                    }

                    ctx.beginPath()
                    ctx.arc(x + moveX, y + moveY, radius, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
            animationFrameId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
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
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 pointer-events-none z-0"
                style={{ opacity: 0.6 }}
            />

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
                            <>
                                {imgSEO}
                                {textInform}
                            </>
                        ) : (
                            <>
                                {textInform}
                                {imgSEO}
                            </>
                        )}
                    </div>
                </div>
                <div className='container mx-auto'>
                    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
                        <div className="absolute bottom-8 left-0 w-full text-center">
                            <span className="text-[12px] text-white-a opacity-30 font-nsdisplayblack tracking-widest uppercase">
                                <a href="https://www.moises-script.cl/">Desarrollado por Moises-Script</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
