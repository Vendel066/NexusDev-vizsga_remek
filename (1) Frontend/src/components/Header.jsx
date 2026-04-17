import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Header({ openAuthModal, uid, setUID, isFreelancer, isOwner })
{
    const [pfpUrl, setPfpUrl] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const isPrivileged = isFreelancer || isOwner;


    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            if (uid != -1)
            {
                fetch("http://127.0.0.1:3000/api/get_pfp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid })
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
                        setPfpUrl(data.pfpUrl);
                    }
                })
                .catch(error =>
                {
                    console.error(error);
                    alert("Unexpected error!");
                });
            }        
            }, 100);
    
            return () => clearInterval(interval);
    }, [uid]);
    
    
    function downloadApp()
    {
        fetch("http://127.0.0.1:3000/api/download_application",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid })
        })
        .then(response => response.blob())
        .then(blob =>
        {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Nexusdev Dashboard.exe";
            a.click();
        });
    }

    function logout()
    { 
        setUID(-1);
        localStorage.clear();
    }

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };


    return (
        <nav className="navbar"> 
            <div className="navbar-brand"> 
                <Link to="/" className="nav-link">NEXUSDEV</Link> 
            </div>
            <div className="navbar-nav"> 
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/ideas" className="nav-link">Ideas</Link> 
                {uid != -1 && (
                    <>
                        {isPrivileged ? <button onClick={downloadApp}>Download App</button> : <Link to="/order" className="nav-link">Order</Link> }
                        <Link to="/profile">
                            <img className="profile-icon" src={pfpUrl} alt="pfp" />
                        </Link>
                        <div className="profile-icon" onClick={logout}> 
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/> 
                            </svg>
                        </div>
                    </>
                )}
                {uid == -1 && ( 
                    <div className="profile-icon" onClick={openAuthModal}> 
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/> 
                        </svg>
                    </div>
                )}
            </div>
            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
            <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
                <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
                <Link to="/ideas" className="nav-link" onClick={() => setMenuOpen(false)}>Ideas</Link> 
                {uid != -1 && (
                    <>
                        {isPrivileged ? <button onClick={() => { downloadApp(); setMenuOpen(false); }}>Download App</button> : <Link to="/order" className="nav-link" onClick={() => setMenuOpen(false)}>Order</Link> }
                        <Link to="/profile" onClick={() => setMenuOpen(false)}>
                            <img className="profile-icon" src={pfpUrl} alt="pfp" />
                        </Link>
                        <div className="profile-icon" onClick={() => { logout(); setMenuOpen(false); }}> 
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/> 
                            </svg>
                        </div>
                    </>
                )}
                {uid == -1 && ( 
                    <div className="profile-icon" onClick={() => { openAuthModal(); setMenuOpen(false); }}> 
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/> 
                        </svg>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Header; 