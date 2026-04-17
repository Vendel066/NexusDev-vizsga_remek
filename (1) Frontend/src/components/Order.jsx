import { useEffect, useState } from "react";

function Order({ uid, isOrderExists, setIsOrderExists })
{
    const [oid, setOid] = useState(-1);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState(-1);
    const [other_type, setOtherType] = useState("");
    const [platform, setPlatform] = useState(-1);
    const [budget, setBudget] = useState(-1);
    const [document_url, setDocumentUrl] = useState("");
    const [deadline, setDeadline] = useState("");
    const [project_version, setProjectVersion] = useState("");
    const [project_url, setProjectUrl] = useState("");
    const [status, setStatus] = useState("");
    
    const [document_data, setDocumentData] = useState(null);
    
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);


    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            if (uid && isOrderExists)
            {
                fetch("http://127.0.0.1:3000/api/get_order",
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
                        const order = data.order;
        
                        setOid(order.oid);
                        setTitle(order.title);
                        setDescription(order.description);
                        setType(order.type);
                        setOtherType(order.other_type);
                        setPlatform(order.platform);
                        setBudget(order.budget);
                        setDocumentUrl(order.document_url);
                        setDeadline(order.deadline);
                        setProjectVersion(order.project_version);
                        setProjectUrl(order.project_url)
                        setStatus(order.status);
                    }
                })
                .catch(error =>
                {
                    console.error(error);
                    alert("An error occurred while fetching your order. Please try again.");
                });
            }        
        }, 100);

        return () => clearInterval(interval);
    }, [uid, isOrderExists]);

    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            if (uid && isOrderExists)
            {
                fetch("http://127.0.0.1:3000/api/get_order_messages",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid, oid })
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
                        setChatMessages(data.messages);
                    }
                })
                .catch(error =>
                {
                    console.error(error);
                    alert("An error occurred while fetching order messages!");
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [uid, oid, isOrderExists]);
    

    function getDocument(e)
    {
        const file = e.target.files[0];

        if (file)
        {
            setDocumentData(file);
        }
    }

    function sendOrder()
    {
        const formData = new FormData();
    
        formData.append("uid", uid);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("type", type);
        formData.append("other_type", other_type ?? -1);
        formData.append("platform", platform ?? -1);
        formData.append("budget", budget);
        formData.append("deadline", deadline);
    
        if (document_data)
        {
            formData.append("document_data", document_data);
        }
    
        fetch("http://127.0.0.1:3000/api/submit_order",
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
                setIsOrderExists(true);
            }
        })
        .catch(error =>
        {
            console.error(error);
            alert("An error occurred while submitting your order!");
        });
    }

    function downloadProject()
    {
        fetch("http://127.0.0.1:3000/api/download_project",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, project_url })
        })
        .then(response => response.blob())
        .then(blob =>
        {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = project_url;
            a.click();
        });
    }

    function sendMessage()
    {
        fetch("http://127.0.0.1:3000/api/send_order_message",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, message: newMessage })
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
                setNewMessage("");
            }
        })
        .catch(error =>
        {
            console.error(error);
            alert("An error occurred while sending your message!");
        });
    }

    function revokeOrder()
    {
        fetch("http://127.0.0.1:3000/api/revoke_order",
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
                setTitle("");
                setDescription("");
                setType(0);
                setOtherType("");
                setPlatform(0);
                setBudget(0);
                setDocumentUrl("");
                setProjectVersion("");
                setProjectUrl("");
                setDeadline("");
                setStatus("");

                setIsOrderExists(false);
                setShowRevokeConfirm(false);
            }
        })
        .catch(error =>
        {
            console.error(error);
            alert("An error occurred while revoking your order!");
        });
    }


    return (
        <div className="about-section">
            <h2 className="section-title">Order</h2>
            <div className="about-content">
                {isOrderExists ?
                (
                    <div>
                        <div className="about-content" id="order-info">
                            <h1>Order informations</h1>
                            <p><strong>Project name:</strong> {title}</p>
                            <p><strong>Project description:</strong> {description}</p>
                            <p><strong>Project type:</strong> {type === 1 ? "Website" : type === 2 ? "Desktop Application" : type === 3 ? "Mobile Application" : type === 4 ? other_type : "Unknown"}</p>
                            {type > 1 && <p><strong>Project platform:</strong> {platform === 1 ? "Windows" : platform === 2 ? "Linux" : platform === 3 ? "MacOS" : platform === 4 ? "Android" : platform === 5 ? "IOS" : "Unknown"}</p>}
                            <p><strong>Project budget:</strong> ${budget}</p>
                            <p><strong>Project deadline:</strong> {new Date(deadline).toLocaleDateString()}</p>
                            <br />
                            {status === 1 && <p><strong>Status:</strong> Pending...</p>}
                            {status === 2 && <p><strong>Status:</strong> In progress...</p>}
                            {status === 3 && <p><strong>Status:</strong> Completed!</p>}
                            {status === 4 && <p><strong>Status:</strong> Canceled!</p>}
                            {project_url && <br />}
                            {project_url && <button onClick={downloadProject}>Download v{project_version}</button>}
                        </div>

                        <div className="about-content" id="chat-panel">
                            <h1>Chat</h1>
                            <div id="chat-messages">
                                {chatMessages.length > 0 &&
                                (
                                    chatMessages.map(message =>
                                    (
                                        <div key={message.mid}className="chat-message-wrapper">
                                            {Date.now() - new Date(message.created_at) > 86400000 &&<span className="chat-message-time">{new Date(message.created_at).toLocaleString()}</span>}
                                            {uid === message.uid ?
                                            (
                                                <p className="chat-message message-you">{message.message}</p>
                                            )
                                            :
                                            (
                                                <p className="chat-message message-notyou">{message.message}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <textarea id="chat-input" placeholder="Type your message here..." rows={1} maxLength={1024} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button id="chat-send" onClick={sendMessage}>Send</button>
                        </div>

                        <br />

                        <button className="auth-submit" onClick={() => setShowRevokeConfirm(true)}>Revoke Order</button>
                    </div>
                )
                :
                (
                    <form className="auth-form" onSubmit={(e) => {e.preventDefault(); sendOrder();}}>
                        <label htmlFor="title">Title</label>
                        <input type="text" name="title" placeholder="Title here..." maxLength={32} value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <label htmlFor="description">Description</label>
                        <textarea name="description" placeholder="Description here..." rows={5} maxLength={1024} value={description} onChange={(e) => setDescription(e.target.value)} required />
                        <label htmlFor="type">Type</label>
                        <select name="type" value={type} onChange={(e) => setType(parseInt(e.target.value))} required>
                            <option value={0} disabled>Type...</option>
                            <option value={1}>Website</option>
                            <option value={2}>Desktop Application</option>
                            <option value={3}>Mobile Application</option>
                            <option value={4}>Other</option>
                        </select>
                        {type === 4 && (
                            <>
                                <label htmlFor="other_type">Other Type</label>
                                <input type="text" placeholder="Describe your type..." maxLength={64} value={other_type} onChange={(e) => setOtherType(e.target.value)} required />
                            </>
                        )}
                        {type > 1 && (
                            <>
                                <label htmlFor="platform">Platform</label>
                                <select name="platform" id="platform" value={platform} onChange={(e) => setPlatform(parseInt(e.target.value))} required>
                                    <option value={0} disabled>Platform...</option>
                                    {type === 2 && (
                                        <>
                                            <option value={1}>Windows</option>
                                            <option value={2}>Linux</option>
                                            <option value={3}>MacOS</option>
                                        </>
                                    )}
                                    {type === 3 && (
                                        <>
                                            <option value={4}>Android</option>
                                            <option value={5}>IOS</option>
                                        </>
                                    )}
                                    {type === 4 && (
                                        <>
                                            <option value={1}>Windows</option>
                                            <option value={2}>Linux</option>
                                            <option value={3}>MacOS</option>
                                            <option value={4}>Android</option>
                                            <option value={5}>IOS</option>
                                        </>
                                    )}
                                </select>
                            </>
                        )}
                        <label htmlFor="budget">Budget</label>
                        <input type="number" name="budget" placeholder="Budget..." min={0} step={0.01} value={budget} onChange={(e) => setBudget(parseFloat(e.target.value))} required />
                        <label htmlFor="document">Document</label>
                        <input type="file" name="document" accept=".pdf,.doc,.docx,.txt" onChange={(e) => getDocument(e)} required />
                        <label htmlFor="deadline">Deadline</label>
                        <input type="date" name="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
                        <button type="submit" className="auth-submit">Submit order</button>
                    </form>
                )}
            </div>
            {showRevokeConfirm && (
                <div className="revoke-modal-overlay" onClick={() => setShowRevokeConfirm(false)}>
                    <div className="revoke-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Revocation</h3>
                        <p>Are you sure you want to revoke this order? This action cannot be undone and will permanently delete your order.</p>
                        <div className="revoke-modal-buttons">
                            <button className="revoke-cancel-btn" onClick={() => setShowRevokeConfirm(false)}>Cancel</button>
                            <button className="revoke-confirm-btn" onClick={revokeOrder}>Revoke Order</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Order;