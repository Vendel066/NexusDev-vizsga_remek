import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./components/Header.jsx";

import HomePage from "./components/HomePage.jsx";
import AboutPage from "./components/AboutPage.jsx";
import Ideas from "./components/Ideas.jsx";
import Order from "./components/Order.jsx";

import Profile from "./components/Profile.jsx";
import LogRegModul from "./components/AuthModal.jsx";

import Footer from "./components/Footer.jsx";

import "./App.css";

function App()
{
    const [showModal, setShowModal] = useState(false);

    const [uid, setUID] = useState(-1);
    const [lname, setLname] = useState("");

    const [isFreelancer, setIsFreelancer] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const [isOrderExists, setIsOrderExists] = useState(false);


    useEffect(() =>
    {
        const savedUID = localStorage.getItem("uid");
        let parsedUID = -1;

        if (savedUID)
        {
            parsedUID = parseInt(savedUID);
        }

        if (parsedUID == -1)
        {
            return;
        }

        fetch("http://127.0.0.1:3000/api/auto_login",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: parsedUID })
        })
        .then(response => response.json())
        .then(data =>
        {
            if (data.error)
            {
                console.error(data.debugMessage);
                alert(data.message);
            }

            if (data.isLoggedIn)
            {
                handleLogin(parsedUID, data.freelancer, data.owner_privileges);
            }
            
        })
        .catch(error => 
        {
            console.error(error);
            alert("Unexpected error!");
        });
    }, []);


    function handleLogin(uid, isFreelancer, isOwner)
    {
        setUID(uid);
        setIsFreelancer(isFreelancer);
        setIsOwner(isOwner);

        localStorage.setItem("uid", uid.toString());
        
        fetch("http://127.0.0.1:3000/api/have_order",
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
                setIsOrderExists(data.have_order);
            }
        })
        .catch(error => 
        {
            console.error(error);
            alert("Unexpected error!");
        });

        fetch("http://127.0.0.1:3000/api/get_lastname/",
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
                setLname(data.lname);
            }
        })
        .catch(error => 
        {
            console.error(error);
            alert("Unexpected error!");
        });
    }


    return (
        <BrowserRouter>
            <Header openAuthModal={() => setShowModal(true)} uid={uid} setUID={setUID} isFreelancer={isFreelancer} isOwner={isOwner} />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage userName={uid != -1 ? lname : null} uid={uid} isFreelancer={isFreelancer} isOwner={isOwner} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/ideas" element={<Ideas />} />
                    <Route path="/order" element={uid === -1 ? <HomePage userName={null} /> : ((isFreelancer === 1 || isOwner === 1) ? <HomePage userName={lname} /> : <Order uid={uid} isOrderExists={isOrderExists} setIsOrderExists={setIsOrderExists} />)} />
                    <Route path="/profile" element={uid != -1 ? <Profile uid={uid} /> : <HomePage userName={null} />} />
                </Routes>
            </main>
            <Footer />
            
            {showModal && ( <LogRegModul closeModal={() => setShowModal(false)} onLogin={handleLogin} /> )}
        </BrowserRouter>
    );
}

export default App;