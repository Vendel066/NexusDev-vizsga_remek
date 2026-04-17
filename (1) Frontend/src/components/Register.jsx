import { useState, useRef } from "react";

function Register({ onSuccess })
{
    const [email_address, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFName] = useState("");
    const [mname, setMName] = useState("");
    const [lname, setLName] = useState("");
    const [role, setRole] = useState("client");
    const [pfp, setPfp] = useState(null);
    const [pfpUrl, setPfpUrl] = useState("http://127.0.0.1:3000/profile_pictures/default.png");
    const fileInputRef = useRef(null);


    function openPfpSelector()
    {
        fileInputRef.current.click();
    }

    function selectPfp(e)
    {
        const file = e.target.files[0];

        if (file)
        {
            setPfp(file);

            const reader = new FileReader();

            reader.onload = () =>
            {
                setPfpUrl(reader.result);
            };
            
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e)
    {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("freelancer", role === "freelancer" ? 1 : 0);
        formData.append("email_address", email_address);
        formData.append("password", password);
        formData.append("fname", fname);
        formData.append("mname", mname);
        formData.append("lname", lname);
        if (pfp)
        {
            formData.append("pfp", pfp);
        }
        
        fetch("http://127.0.0.1:3000/api/register",
        {
            method: "POST",
            body: formData
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
                onSuccess();
            }
        })
        .catch(error => console.error("Error:", error));
    }


    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div id="pfp-preview-container">
                <img id="pfp-preview" src={pfpUrl} alt="Profile Picture Preview" />
            </div>
            <div id="pfp-buttons">
                <button type="button" onClick={openPfpSelector}>Upload Picture</button>
                <button type="button" onClick={() => { setPfp(null); setPfpUrl("http://127.0.0.1:3000/profile_pictures/default.png"); }}>Remove Picture</button>
            </div>
            <div className="role-select">
                <label>
                    <input type="radio" name="role" value="client" checked={role === "client"} onChange={(e) => setRole(e.target.value)} required />
                    <span>Client</span>
                </label>
                <label>
                    <input type="radio" name="role" value="freelancer" checked={role === "freelancer"} onChange={(e) => setRole(e.target.value)} />
                    <span>Freelancer</span>
                </label>
            </div>
            <input type="file" accept="image/*" onChange={(e) => selectPfp(e)} ref={fileInputRef} style={{ display: "none" }} />
            <input type="text" placeholder="First name..." maxLength={32} value={fname} onChange={(e) => setFName(e.target.value)} required />
            <input type="text" placeholder="Middle name..." maxLength={32} value={mname} onChange={(e) => setMName(e.target.value)} />
            <input type="text" placeholder="Last name..." maxLength={32} value={lname} onChange={(e) => setLName(e.target.value)} required />
            <input type="email" placeholder="Email address..." maxLength={320} value={email_address} onChange={(e) => setEmailAddress(e.target.value)} required />
            <input type="password" placeholder="Password..." maxLength={1024} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="auth-submit">Register</button>
        </form>
    );
}

export default Register;