import { TimerProvider } from '../Context/TimerProvider'
import DailyStreak from '../DailyStreak/DailyStreak'
import BookLog from '../BookLog/BookLog'
import ConfigBook from '../ConfigBook/ConfigBook'

const HomePage = () => {
    return (
        <>
            <TimerProvider>
                <DailyStreak />
                <ConfigBook />
                <BookLog />
            </TimerProvider>
        </>
    )
}

export default HomePage