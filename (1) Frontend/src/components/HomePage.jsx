function HomePage({ userName, uid, isFreelancer, isOwner })
{
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

    const isPrivileged = isFreelancer || isOwner;

    return (
        <>
            <section className="hero-section">
                <h1>{userName ? `Welcome ${userName}!` : "Welcome to NexusDev!"}</h1>
                <p className="subtitle">
                    {userName
                        ? "Thank you for choosing us. For further orders, please click on the Order page."
                        : "We offer innovative webdevelopment solutions for businesses."
                    }
                </p>
            </section>
            {isPrivileged ? (
                <section className="download-section">
                    <h2 className="section-title">Dashboard Access</h2>
                    <p className="download-description">
                        As a freelancer, you have access to our desktop dashboard application. It helps you manage orders and projects more efficiently.
                    </p>
                    <button className="download-btn" onClick={downloadApp}>Download Dashboard App</button>
                </section>
            ) : (
                <section className="services-section">
                    <h2 className="section-title">Our Services</h2>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon">🌐</div>
                            <h3>Web Development</h3>
                            <p>Custom websites and web applications built with modern technologies like React, Node.js, and more. Responsive design for all devices.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">📱</div>
                            <h3>Mobile Apps</h3>
                            <p>Native and cross-platform mobile applications for iOS and Android. Seamless user experience with cutting-edge features.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🖥️</div>
                            <h3>Desktop Applications</h3>
                            <p>Custom desktop applications for Windows, macOS, and Linux. Powerful tools built with .NET, Electron, or native technologies.</p>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default HomePage;
