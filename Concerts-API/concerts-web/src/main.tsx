import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import App from './App.tsx'
import RequireAuth from "./Components/RequireAuth.tsx";

function AppRoute() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <App />
                        </RequireAuth>
                    }
                />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
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
