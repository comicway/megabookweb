import { useLocation, Route, Routes, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TimerProvider } from './Components/Context/TimerProvider'
import { AuthProvider, useAuth } from './Components/Context/AuthProvider'
import RegisterBook from './Components/ResgiterBook/RegisterBook'
import ReadBook from './Components/ReadBook/ReadBook'
import Timer from './Components/Timer/Timer'
import ConfigHabit from './Components/ConfigHabit/ConfigHabit'
import HomePage from './Components/Home/Home'
import ToolBar from './Components/ToolBar/ToolBar'
import Login from './Components/Auth/Login'
import ProtectedRoute from './Components/Auth/ProtectedRoute'

function AppContent() {
  const [h1Router, setH1Router] = useState('Megabook');
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setH1Router('Megabook');
        break;
      case '/readbook':
        setH1Router('Nueva Sesión');
        break;
      case '/confighabit':
        setH1Router('Configurar hábito');
        break;
      case '/registerbook':
        setH1Router('Registro de libros');
        break;
      case '/timer':
        setH1Router('Sesión Activa');
        break;
      case '/login':
        setH1Router('Bienvenido');
        break;
    }
  }, [location]);

  return (
    <div className={!isLoginPage ? 'pb-24' : ''}>
      <TimerProvider>
        {/* Ocultar el título superior si es la página de login o si no hay usuario */}
        {!isLoginPage && user && (
          <div className="container mx-auto px-4 mt-[20px] relative flex items-center justify-center">
            <span className='font-nsdisplayblack text-titlepage text-white-a'>{h1Router}</span>
            <button 
              onClick={signOut}
              className="absolute right-4 text-[14px] text-white-a opacity-60 hover:opacity-100 font-nsbold transition-opacity"
            >
              Salir
            </button>
          </div>
        )}

        <Routes>
          <Route path='/login' element={user ? <Navigate to="/" /> : <Login />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/readbook' element={<ReadBook />} />
            <Route path='/confighabit' element={<ConfigHabit />} />
            <Route path='/registerbook' element={<RegisterBook />} />
            <Route path='/timer' element={<Timer />} />
          </Route>
        </Routes>

        {/* Ocultar el ToolBar si es la página de login o si no hay usuario */}
        {!isLoginPage && user && <ToolBar />}
      </TimerProvider>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App