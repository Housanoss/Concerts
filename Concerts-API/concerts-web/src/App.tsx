// 1. Import your new component
import ConcertList from './Components/ConcertList';
import './App.css'; // Keep this if you want standard styling

function App() {
    return (
        // 2. The main layout container
        <div className="App">
            <header>
                <h1>My Concert Application</h1>
            </header>

            <main>
                {/* 3. This renders your component logic */}
                <ConcertList />
            </main>
        </div>
    )
}

export default App