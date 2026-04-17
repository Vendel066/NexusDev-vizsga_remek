import { useState } from "react";

const ideas = [
    {
        id: 1,
        title: "Restaurants",
        description: "This idea is recommended for restaurant owners or restaurant chains who would like a professional website created for their establishment.",
        imageUrl: "https://restaurants.quandoo.com/hs-fs/hubfs/Blog/2024/Setting%20the%20stage%20-%20How%20to%20master%20restaurant%20ambience/Image%20of%20restaurant%20interior%20with%20blue%20decorations.png?width=1275&height=875&name=Image%20of%20restaurant%20interior%20with%20blue%20decorations.png"
    },
    {
        id: 2,
        title: "Cosmetics / Beauty",
        description: "This idea is designed for individual entrepreneurs who run a beauty or cosmetics business and would like a website with an online appointment booking system.",
        imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/44c53c105835755.5f81fa3700334.png"
    },
    {
        id: 3,
        title: "Factory Internal Network System",
        description: "This idea can be useful for factories that need an internal network system for purposes such as employee access control or workforce management.",
        imageUrl: "https://daidung.com/daidung-content/uploads/2025/06/A-Comprehensive-Guide-600x400.jpg"
    },
    {
        id: 4,
        title: "Mobile Application Development",
        description: "This idea is intended for individuals or businesses who would like to create their own mobile application.",
        imageUrl: "https://media.istockphoto.com/id/2177184303/photo/white-man-programmer-or-it-specialist-software-developer-with-glasses-working-late-into-the.jpg?s=612x612&w=0&k=20&c=EpktvqigUhvPxEtmhG0NVcpIow0ByxesHkDuvXfEdRA="
    },
    {
        id: 5,
        title: "Logistics Application Development",
        description: "This idea is useful for companies that need a logistics application for tasks such as product identification, supply management, or sales operations.",
        imageUrl: "https://www.brkdesigns.com/storage/2024/11/unnamed-11-600x400.jpg"
    },
    {
        id: 6,
        title: "Game Development",
        description: "This idea is for those who discovered the 'Other' category on our website and are interested in developing their own game.",
        imageUrl: "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/blogs/2147511893/images/6345cc-01a0-00d-703a-e66e5e02b54_Game_development_course_3.webp"
    }
];

function Ideas() {
    const [activeImage, setActiveImage] = useState(null);

    return (
        <div className="ideas-container">
            <h2 className="ideas-title">Ideas</h2>
            <div className="ideas-grid">
                {ideas.map((idea) => (
                    <div key={idea.id} className="idea-card">
                        <img
                            className="idea-card-img"
                            src={idea.imageUrl}
                            alt={idea.title}
                        />
                        <div className="idea-card-body">
                            <h4 className="idea-card-title">{idea.title}</h4>
                            <p className="idea-card-text">{idea.description}</p>
                            <button
                                type="button"
                                className="idea-card-btn"
                                onClick={() => setActiveImage(idea.imageUrl)}
                            >
                                View in big-picture-mode
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeImage && (
                <div className="idea-modal" onClick={() => setActiveImage(null)}>
                    <div className="idea-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={activeImage} alt="Big picture" />
                        <button
                            type="button"
                            className="idea-modal-close"
                            onClick={() => setActiveImage(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ideas;
