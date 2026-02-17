import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import EditUser from "./EditUser.tsx";
import App from './App.tsx';
import Concert from './Concert.tsx';
import AdminTickets from './Components/AdminTickets';
import ConcertEditor from './Components/ConcertEditor';

function AppRoute() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<App />}
                />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/edituser" element={<EditUser />} />
                <Route path="/concert/:id" element={<Concert />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                {/* Admin Routes */}
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/concert/new" element={<ConcertEditor />} />
                <Route path="/admin/concert/:id" element={<ConcertEditor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoute;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRoute />
    </StrictMode>,
)