import { useEffect, useRef } from 'react'

const DotBackground = () => {
    const canvasRef = useRef(null)
    const mousePos = useRef({ x: -1000, y: -1000 })

    useEffect(() => {
        const handleResize = () => {
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

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    )
}

export default DotBackground
