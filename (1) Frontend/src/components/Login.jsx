import { useState } from "react";

function Login({ closeModal, onLogin })
{
    const [email_address, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");


    function handleSubmit(e)
    {
        e.preventDefault();
        
        fetch("http://127.0.0.1:3000/api/login",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify
            ({
                email_address: email_address,
                password: password
            })
        })
        .then(response => response.json())
        .then(data =>
        {
            if (data.error)
            {
                console.error(data.debugMessage);
                alert(data.message);
            }
            else
            {
                onLogin(data.uid, data.freelancer, data.owner_privileges);
                closeModal();
            }
        })
        .catch(error => console.error("Error:", error));
    }


    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email address..." maxLength={320} value={email_address} onChange={(e) => setEmailAddress(e.target.value)} required />
            <input type="password" placeholder="Password..." maxLength={1024} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="auth-submit">Login</button>
        </form>
    );
}

export default Login;
