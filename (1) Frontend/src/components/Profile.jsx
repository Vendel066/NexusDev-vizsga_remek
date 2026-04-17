import { useEffect, useState, useRef } from "react";

function Profile({ uid })
{
    const [email_address, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");

    const [fname, setFname] = useState("");
    const [mname, setMname] = useState("");
    const [lname, setLname] = useState("");
    const [bio, setBio] = useState("");
    const [pfpUrl, setPfpUrl] = useState("");
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const fileInputRef = useRef(null);
    const [pfpFile, setPfpFile] = useState(null);
    const [isDeletingPfp, setIsDeletingPfp] = useState(false);


    useEffect(() =>
    {
        getProfile();
    }, [uid]);


    function getProfile()
    {
        if (uid != -1)
        {
            fetch("http://127.0.0.1:3000/api/get_profile",
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
                    setEmailAddress(data.profile.email_address);
                    setFname(data.profile.fname);
                    setMname(data.profile.mname);
                    setLname(data.profile.lname);
                    setBio(data.profile.bio);
                    setPfpUrl(data.profile.pfpUrl);
                }
            })
            .catch(error => 
            {
                console.error(error);
                alert("Unexpected error!");
            });
        }
    }

    function openPfpSelector()
    {
        fileInputRef.current.click();
    };

    function selectPfp(e)
    {
        if (uid != -1)
        {
            const file = e.target.files[0];

            if (file)
            {
                setPfpFile(file);
                setIsDeletingPfp(false);

                const reader = new FileReader();

                reader.onload = () =>
                {
                    setPfpUrl(reader.result);
                };
                
                reader.readAsDataURL(file);
            }
        }
    }
    
    function editProfile(e)
    {
        if (uid != -1)
        {
            e.preventDefault();
    
            const formData = new FormData();
            formData.append("uid", uid);
            formData.append("email_address", email_address);
            formData.append("password", password);
            formData.append("fname", fname);
            formData.append("mname", mname);
            formData.append("lname", lname);
            formData.append("bio", bio);
            formData.append("isDeletingPfp", isDeletingPfp);
    
            if (pfpFile)
            {
                formData.append("pfp", pfpFile);
            }
    
            fetch("http://127.0.0.1:3000/api/update_profile",
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
                    alert(message);
                }
                else
                {
                    getProfile();
                }
            })
            .catch(error =>
            {
                console.error(error);
            });
        }
    }


    return (
        <div className="profile-container">
            <h2 className="section-title profile-title">Edit Profile</h2>

            <div className="profile-columns">
                <div className="profile-left">
                    <div className="team-card">
                        <div className="team-card-image">
                            <img src={pfpUrl} alt="Profile" />
                        </div>
                        <h3>{fname} {mname} {lname}</h3>
                        <p className="role">
                            {email_address}
                        </p>
                        <p className="bio">{bio || "No bio yet"}</p>
                    </div>
                </div>

                <div className="profile-right">
                    <div className="about-section">
                        <div className="about-content">
                            <form className="auth-form" onSubmit={editProfile}>
                                <div id="pfp-buttons">
                                    <button onClick={openPfpSelector}>Change profile picture</button>
                                    <button onClick={() => setIsDeletingPfp(true)}>Delete profile picture</button>
                                </div>
                                <input type="file" accept="image/jpeg" onChange={e => selectPfp(e)} ref={fileInputRef} style={{ display: "none" }} />
                                <input type="text" placeholder="First name..." value={fname} onChange={e => setFname(e.target.value)} />
                                <input type="text" placeholder="Middle name..." value={mname} onChange={e => setMname(e.target.value)} />
                                <input type="text" placeholder="Last name..." value={lname} onChange={e => setLname(e.target.value)} />
                                <textarea placeholder="Bio" value={bio} rows="4" onChange={e => setBio(e.target.value)} className="profile-textarea" />
                                <input type="email" placeholder="Email address..." value={email_address} onChange={e => setEmailAddress(e.target.value)} />
                                <div style={{ position: "relative" }}>
                                    <input type={showNewPassword ? "text" : "password"} placeholder="New password..." value={password} onChange={e => setPassword(e.target.value)} />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style=
                                        {{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#fff",
                                            fontSize: "14px"
                                        }}>
                                        {showNewPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <button type="submit" className="auth-submit">Save</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;