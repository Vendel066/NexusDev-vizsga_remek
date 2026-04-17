import { useEffect, useState } from "react";

function AboutPage()
{ 
    const [team, setTeam] = useState([]);


    useEffect(() =>
    {
        fetch("http://127.0.0.1:3000/api/team")
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
                setTeam(data.team);
            }
        })
        .catch(error =>
        {
            console.error("Error fetching team data:", error);
        });
    }, []);


    return ( 
        <>
            <section className="about-section"> 
                <h2 className="section-title">Who we are?</h2> 
                <div className="about-content"> 
                    <p><strong>NexusDev</strong> is a young and dynamic web development team, founded in 2024 with the goal of providing unique and modern digital solutions for businesses.</p>
                    <p>Our mission is to bring our clients' ideas to life by creating websites and applications that are not only visually appealing but also highly effective and user-friendly.</p>
                    <p>We specialize in full-stack development, offering end-to-end solutions from concept and design to implementation and maintenance. Our team is passionate about leveraging the latest technologies to build scalable, secure, and high-performance digital products.</p>
                    <p>At NexusDev, we believe that great digital experiences combine creativity, functionality, and strategy. We work closely with our clients to understand their vision, tailor solutions to their needs, and help them achieve measurable results.</p>
                    <p>Whether it's developing a responsive website, a complex web application, or a custom backend system, we are committed to delivering innovative solutions that drive growth and enhance user satisfaction.</p>
                </div>
            </section>
            <section className="team-section">
                <h2 className="section-title">Team members</h2> 
                <div className="team-grid">
                    {team.map((member, index) =>
                    {
                        return (
                            <div key={member.uid} className="team-card"> 
                                <div className="team-card-image">
                                    <img src={member.pfpUrl} alt={`${member.fname} ${member.lname}`} />
                                </div>
                                <h3>{member.fname} {member.lname}</h3>
                                { member.uid === 1 && <p className="role">Backend Developer</p> }
                                { member.uid === 2 && <p className="role">Frontend Developer</p> }
                                { member.uid === 3 && <p className="role">Database Specialist</p> }
                                <p className="bio">{member.bio}</p> 
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}

export default AboutPage;