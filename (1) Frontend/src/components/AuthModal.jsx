import { useState } from "react";

import Login from "./Login.jsx";
import Register from "./Register.jsx";

function LogRegModul({ closeModal, onLogin })
{
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="auth-card" onClick={(e) => e.stopPropagation()}>
                <button className="auth-card-close" onClick={closeModal}>✕</button>
                <h2>{showLogin ? "Login" : "Register"}</h2>
                <div className="auth-tabs">
                    <button className={showLogin ? "auth-tab active" : "auth-tab"} onClick={() => setShowLogin(true)}>Login</button>
                    <button className={showLogin ? "auth-tab" : "auth-tab active"} onClick={() => setShowLogin(false)}>Register</button>
                </div>
                {showLogin ?
                (
                    <Login closeModal={closeModal} onLogin={onLogin} />
                )
                :
                (
                    <Register onSuccess={() => setShowLogin(true)} />
                )}
            </div>
        </div>
    );
}

export default LogRegModul;