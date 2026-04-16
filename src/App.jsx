import { useLocation, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TimerProvider } from './Components/Context/TimerProvider'
import RegisterBook from './Components/ResgiterBook/RegisterBook'
import ReadBook from './Components/ReadBook/ReadBook'
import Timer from './Components/Timer/Timer'
import ConfigHabit from './Components/ConfigHabit/ConfigHabit'
import HomePage from './Components/Home/Home'
import ToolBar from './Components/ToolBar/ToolBar'

function App() {

  const [h1Router, setH1Router] = useState('Megabook');
  const location = useLocation();

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
    }
  }, [location]);

  return (
    <div className='pb-24'>
      <TimerProvider>
        <div className="container mx-auto text-center px-2 mt-[20px]">
          <span className='font-nsdisplayblack text-titlepage text-white-a'>{h1Router}</span>
        </div>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/readbook' element={<ReadBook />} />
          <Route path='/confighabit' element={<ConfigHabit />} />
          <Route path='/registerbook' element={<RegisterBook />} />
          <Route path='/timer' element={<Timer />} />
        </Routes>
        <ToolBar />
      </TimerProvider>
    </div>
  )
}

export default App  