const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql");
const multer = require("multer");
const bcrypt = require("bcrypt");
const express = require("express");
const debug = require("./debug.js");
const settings = require("./settings.js");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(cookieParser());
app.use(cors(settings.SV_CORS));
app.use((error, req, res, next) =>
{
    debug.error(`Unhandled error: ${error}!`);
    res.status(500).json({ error: true, message: "Internal server error!" });
});



const profilePicturesDir = path.join(__dirname, "profile_pictures"); app.use("/profile_pictures", express.static(profilePicturesDir));
const documentsDir = path.join(__dirname, "documents");
const projectsDir = path.join(__dirname, "projects");
const applicationDir = path.join(__dirname, "application");

[profilePicturesDir, documentsDir, projectsDir, applicationDir].forEach(dir =>
{
    if (!fs.existsSync(dir))
    {
        fs.mkdirSync(dir);
    }
});



function createStorage(destinationPath)
{
    return multer.diskStorage
    ({
        destination: function (req, file, cb)
        {
            cb(null, destinationPath);
        },
        filename: function (req, file, cb)
        {
            const uniqueName = Date.now() + "-" + file.originalname;
            cb(null, uniqueName);
        },
    });
}

const uploadProfilePicture = multer
({
    storage: createStorage(profilePicturesDir)
});
  
const uploadDocument = multer
({
    storage: createStorage(documentsDir)
});

const uploadProject = multer
({
    storage: createStorage(projectsDir)
});

const uploadApplication = multer
({
    storage: createStorage(applicationDir)
});



app.listen(settings.SV_PORT, settings.SV_HOST, (error) =>
{
    debug.log("Starting server...");

    if (error)
    {
        debug.error(`Failed to start server: ${error}!`);
        process.exit(1);
    }

    debug.log(`Server is running on \"http://${settings.SV_HOST}:${settings.SV_PORT}\"!`);
})

const db = mysql.createConnection
({
    host: settings.DB_HOST,
    port: settings.DB_PORT,
    user: settings.DB_USER,
    password: settings.DB_PASSWORD,
    database: settings.DB_DATABASE,
    multipleStatements: true
});

db.connect((error) =>
{
    debug.log("Connecting to the MySQL database...");

    if (error)
    {
        debug.error(`Failed to connect to the MySQL database: ${error}!`);
        process.exit(1);
    }

    debug.log("Connected to the MySQL database successfully!");
});



app.post("/api/register", uploadProfilePicture.single("pfp"), (req, res) =>
{
    debug.log("Register new user...");

    const { freelancer, email_address, password, fname, mname, lname } = req.body;

    if (freelancer === null || freelancer === undefined || !email_address || !password || !fname || !lname)
    {
        debug.error("Registration error: Missing required fields!");
        return res.status(400).json({ error: true, debugMessage: "Registration error: Missing required fields!", message: "Missing required fields!" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const pfp = req.file ? req.file.filename : null;

    db.query("INSERT INTO users (freelancer, email_address, password, fname, mname, lname, pfp) VALUES (?, ?, ?, ?, ?, ?, ?);", [freelancer, email_address, hashedPassword, fname, mname, lname, pfp], (error, results) =>
    {
        if (error)
        {
            if (error.code === 'ER_DUP_ENTRY')
            {
                debug.error("Registration error: Email address already exists!");
                return res.status(400).json({ error: true, debugMessage: `Registration error: ${error.message}!`, message: "Email address already exists!" });
            }

            debug.error(`Registration error: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Registration error: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.affectedRows > 0)
        {
            debug.log("Registration successful!");
            return res.status(201).json({ error: false });
        }
        else
        {
            debug.log("Registration failed due to an unknown reason!");
            return res.status(400).json({ error: true, debugMessage: "Registration failed due to an unknown reason!", message: "Unknown error!" });
        }
    });
});

app.post("/api/login", (req, res) =>
{
    debug.log("Client trying to log in...");

    const { email_address, password } = req.body;

    if (!email_address || !password)
    {
        debug.error("Login error: Missing required fields!");
        return res.status(400).json({ error: true, debugMessage: "Login error: Missing required fields!", message: "Missing required fields!" });
    }

    db.query("SELECT uid, password, freelancer, owner_privileges FROM users WHERE email_address = ?;", [email_address], (error, results) =>
    {
        if (error)
        {
            debug.error(`Login error: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Login error: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("Login error: Invalid email address!");
            return res.status(401).json({ error: true, debugMessage: "Login error: Invalid email address!", message: "Invalid email address!" });
        }

        const user = results[0];

        if (!bcrypt.compareSync(password, user.password))
        {
            debug.error("Login error: Invalid password!");
            return res.status(401).json({ error: true, debugMessage: "Login error: Invalid password!", message: "Invalid password!" });
        }

        debug.log("Client successfully logged in!");
        return res.status(200).json({ error: false, uid: user.uid, freelancer: user.freelancer, owner_privileges: user.owner_privileges });
    });
});

app.post("/api/auto_login", (req, res) =>
{
    debug.log("Client trying to log in...");

    const { uid } = req.body;

    if (uid == -1)
    {
        return res.status(500).json({ error: false, isLoggedIn: false });
    }

    db.query("SELECT freelancer, owner_privileges FROM users WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Login error: ${error.message}!`);
            return res.status(500).json({ error: true, isLoggedIn: false, debugMessage: `Login error: ${error.message}!`, message: "Login error: Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("Login error: User not found!");
            return res.status(401).json({ error: true, isLoggedIn: false, debugMessage: "Login error: User not found!", message: "Login error: User not found!" });
        }

        const user = results[0];

        debug.log("Client successfully logged in!");
        return res.status(200).json({ error: false, isLoggedIn: true, freelancer: user.freelancer, owner_privileges: user.owner_privileges });
    });
});

app.post("/api/have_order", (req, res) =>
{
    const { uid } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
    }

    debug.log(`User (uid: ${uid}) checking their order...`);

    db.query("SELECT COUNT(*) AS order_count FROM orders WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during order check: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during order check: ${error.message}!`, message: "Internal server error!" });
        }

        const orderCount = results[0].order_count;
        const have_order = orderCount > 0;

        if (have_order)
        {
            debug.log("User already have an order.");
        }
        else
        {
            debug.log("User does not have an order yet.");
        }

        return res.status(200).json({ error: false, have_order: have_order });
    });
});

app.post("/api/get_lastname/", (req, res) =>
{
    const { uid } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
    }

    debug.log(`User (uid: ${uid}) getting their last name...`);

    db.query("SELECT lname FROM users WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during lastname fetch: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during lastname fetch: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("User not found!");
            return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
        }

        const user = results[0];

        debug.log("Successfully got their last name!");
        return res.status(200).json({ error: false, lname: user.lname });
    });
});

app.post("/api/get_pfp", (req, res) =>
{
    const { uid } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
    }

    db.query("SELECT pfp FROM users WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during profile picture fetch: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during profile picture fetch: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("User not found!");
            return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
        }

        const user = results[0];
        const pfpUrl = user.pfp ? `http://127.0.0.1:3000/profile_pictures/${user.pfp}` : "http://127.0.0.1:3000/profile_pictures/default.png";
        
        return res.status(200).json({ error: false, pfpUrl: pfpUrl });
    });
});

app.post("/api/get_profile", (req, res) =>
{
    const { uid } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
    }

    debug.log(`User (uid: ${uid}) getting their profile...`);

    db.query("SELECT email_address, fname, mname, lname, bio, pfp FROM users WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during profile fetch: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during profile fetch: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("User not found!");
            return res.status(404).json({ error: true, debugMessage: "User not found!", message: "User not found!" });
        }

        const user = results[0];
        const pfpUrl = user.pfp ? `http://127.0.0.1:3000/profile_pictures/${user.pfp}` : "http://127.0.0.1:3000/profile_pictures/default.png";

        debug.log("Successfully got their profile!");
        return res.status(200).json({ error: false, profile: { email_address: user.email_address, fname: user.fname, mname: user.mname, lname: user.lname, bio: user.bio, pfpUrl: pfpUrl } });
    });
});

app.post("/api/update_profile", uploadProfilePicture.single("pfp"), (req, res) =>
{
    const { uid, email_address, password, fname, mname, lname, bio, isDeletingPfp } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Profile update error: User not found!", message: "User not found!" });
    }

    debug.log(`User (uid: ${uid}) updating their profile...`);

    db.query("SELECT * FROM users WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during profile update: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during profile update: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("Profile update error: User not found!");
            return res.status(404).json({ error: true, debugMessage: "Profile update error: User not found!", message: "User not found!" });
        }

        const user = results[0];

        const updatedEmail = email_address || user.email_address;
        const updatedPassword = password ? bcrypt.hashSync(password, 10) : user.password;
        const updatedFname = fname || user.fname;
        const updatedMname = mname || user.mname;
        const updatedLname = lname || user.lname;
        const updatedBio = bio || user.bio;
        const updatedPfp = isDeletingPfp === "true" ? null : (req.file ? req.file.filename : user.pfp);

        if (isDeletingPfp === "true" && user.pfp)
        {
            const filePath = path.join(profilePicturesDir, user.pfp);

            if (fs.existsSync(filePath))
            {
                fs.unlink(filePath, (err) =>
                {
                    if (err)
                    {
                        debug.error(`Error while deleting old profile picture: ${err.message}!`);
                    }
                });
            }
        }

        db.query("UPDATE users SET email_address = ?, password = ?, fname = ?, mname = ?, lname = ?, bio = ?, pfp = ? WHERE uid = ?;", [updatedEmail, updatedPassword, updatedFname, updatedMname, updatedLname, updatedBio, updatedPfp, uid], (error, results) =>
        {
            if (error)
            {
                debug.error(`Database error during profile update: ${error.message}!`);
                return res.status(500).json({ error: true, debugMessage: `Database error during profile update: ${error.message}!`, message: "Internal server error!" });
            }

            if (results.affectedRows > 0)
            {
                debug.log("Profile updated successfully!");
                return res.status(200).json({ error: false });
            }

            debug.error("Profile update failed due to an unknown reason!");
            return res.status(400).json({ error: true, debugMessage: "Profile update failed due to an unknown reason!", message: "Profile update failed!" });
        });
    });
});

app.get("/api/team", (req, res) =>
{
    debug.log("Getting team member's data...");

    db.query("SELECT uid, fname, lname, bio, pfp FROM users LIMIT 3;", (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during team fetch: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during team fetch: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            debug.error("No team members found in the database!");
            return res.status(404).json({ error: true, debugMessage: "No team members found in the database!", message: "No team members found!" });
        }

        const team = results.map(member =>
        {
            const pfpUrl = member.pfp ? `http://127.0.0.1:3000/profile_pictures/${member.pfp}` : "http://127.0.0.1:3000/profile_pictures/default.png";
            return { uid: member.uid, fname: member.fname, lname: member.lname, bio: member.bio, pfpUrl: pfpUrl };
        });

        debug.log("Team member's data found!");
        return res.status(200).json({ error: false, team: team });
    });
});

app.post("/api/submit_order", uploadDocument.single("document_data"), (req, res) =>
{
    const { uid, title, description, type, other_type, platform, budget, deadline } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Order submission error: User not found!", message: "User not found!" });
    }

    debug.log(`User (uid: ${uid}) submitting an order...`);

    if (!title || !description || !type || !platform || !budget || !deadline)
    {
        debug.error("Order submission error: Missing required fields!");
        return res.status(400).json({ error: true, debugMessage: "Order submission error: Missing required fields!", message: "Missing required fields!" });
    }

    if (platform === 0 || platform === "0" || parseInt(platform) === 0)
    {
        debug.error("Order submission error: Invalid platform selected!");
        return res.status(400).json({ error: true, debugMessage: "Order submission error: Invalid platform selected!", message: "Please select a valid platform!" });
    }

    const documentName = req.file ? req.file.filename : null;

    db.query("INSERT INTO orders (uid, title, description, type, other_type, platform, budget, document_url, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [uid, title, description, type, other_type, platform, budget, documentName, deadline], (error, results) =>
    {
        if (error)
        {
            debug.error(`Order submission error: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Order submission error: ${error.message}!`, message: "Internal server error!" });
        }

        debug.log("Order sent!");
        return res.status(200).json({ error: false });
    }); 
});

app.post("/api/get_order", (req, res) =>
{
    const { uid } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Order getting error: User not found!", message: "User not found!" });
    }

    debug.log(`User (uid: ${uid}) getting their order...`);

    db.query("SELECT * FROM orders WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Order getting error: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Order getting error: ${error.message}!`, message: "Internal server error!" });
        }

        if (results.length === 0)
        {
            return res.status(404).json({ error: true, debugMessage: "Order getting error: Order not found!", message: "Order not found!" });
        }

        const order = results[0];

        debug.log("Order found!");
        return res.status(200).json({ error: false, order: order });
    });
});

app.post("/api/get_orders", (req, res) =>
{
    const { user_id } = req.body;

    if (!user_id)
    {
        debug.error("Get orders error: Missing user_id!");
        return res.status(400).json({ error: true, debugMessage: "Get orders error: Missing user_id!", message: "Missing user_id!" });
    }

    debug.log(`Fetching orders for user (uid: ${user_id})...`);

    db.query("SELECT freelancer, owner_privileges FROM users WHERE uid = ?;", [user_id], (error, userResults) =>
    {
        if (error)
        {
            debug.error(`Get orders error: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Get orders error: ${error.message}!`, message: "Internal server error!" });
        }

        if (userResults.length === 0)
        {
            debug.error("Get orders error: User not found!");
            return res.status(404).json({ error: true, debugMessage: "Get orders error: User not found!", message: "User not found!" });
        }

        const user = userResults[0];
        let query = "SELECT * FROM orders";
        let queryParams = [];

        if (!user.owner_privileges)
        {
            query += " WHERE freelancer_uid = ?";
            queryParams.push(-1);
        }

        db.query(query, queryParams, (error, results) =>
        {
            if (error)
            {
                debug.error(`Orders getting error: ${error.message}!`);
                return res.status(500).json({ error: true, debugMessage: `Orders getting error: ${error.message}!`, message: "Internal server error!" });
            }
        
            if (results.length === 0)
            {
                debug.warning("Orders getting warning: No orders found!");
                return res.status(404).json({ error: true, debugMessage: "Orders getting warning: No orders found!", message: "No orders found!" });
            }
        
            debug.log(`Orders found: ${results.length}`);
            return res.status(200).json({ error: false, orders: results });
        });
    });
});

app.post("/api/download_document", (req, res) =>
{
    const { uid, document_url } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Document download error: User not found!", message: "User not found!" });
    }

    if (!document_url)
    {
        return res.status(404).json({ error: true, debugMessage: "Document donwload error: Document not found!" ,message: "Document not found!" })
    }

    debug.log(`User (uid: ${uid}) downloading document...`);

    res.download(path.join(documentsDir, document_url), (err) =>
    {
        if (err)
        {
            debug.error(`Error while downloading document: ${err.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Error while downloading document: ${err.message}!`, message: "Error while downloading document!" });
        }
    });

    debug.log("Document successfully downloaded!");
});

app.post("/api/upload_project", uploadProject.single("file"), (req, res) =>
{
    try
    {
        const oid = req.body.oid;
        const project_version = req.body.project_version;
        const uploadedFile = req.file;

        if (!oid)
        {
            return res.status(404).json({ error: true, debugMessage: "Error while uploading project: User not found!", message: "Order not found!" });
        }

        if (!uploadedFile)
        {
            return res.status(400).json({ error: true, debugMessage: "Error while uploading project: No file uploaded!", message: "No file uploaded!" });
        }

        if (!project_version)
        {
            return res.status(400).json({ error: true, debugMessage: "Error while uploading project: No version provided!", message: "No version provided!" });
        }

        debug.log(`Uploading project (oid: ${oid}) (version: ${project_version})...`);

        db.query("UPDATE orders SET project_version = ?, project_url = ? WHERE oid = ?;", [project_version, uploadedFile.filename, oid], (error, results) =>
        {
            if (error)
            {
                debug.error(`Error while uploading project: ${error.message}!`);
                return res.status(500).json({ error: true, debugMessage: `Error while uploading project: ${error.message}`, message: "Internal server error!" });
            }

            if (results.affectedRows > 0)
            {
                debug.log("Project uploaded successfully!");
                return res.status(200).json({ error: false });
            }

            debug.error("Project failed to upload!");
            return res.status(400).json({ error: true, debugMessage: "Project failed to upload!", message: "Project version failed to upload!" });
        });
    }
    catch (err)
    {
        debug.error(err);
        res.status(500).json({ error: true, debugMessage: `Unexpected error while uploading project: ${err.message}!`, message: "Unexpected error while uploading project!" });
    }
});

app.post("/api/download_project", (req, res) =>
{
    const { uid, project_url } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Downloading error: User not found!", message: "User not found!" });
    }

    if (!project_url)
    {
        return res.status(404).json({ error: true, debugMessage: "Downloading error: Project version not found!", message: "Project version not found!" })
    }

    debug.log(`User (uid: ${uid}) downloading latest version of their project...`);
  
    res.download(path.join(projectsDir, project_url), (err) =>
    {
        if (err)
        {
            debug.error(`Error while downloading project: ${err.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Error while downloading project: ${err.message}!`, message: "Error while downloading project file!" });
        }
    });

    debug.log("Latest version downloaded!");
});

app.post("/api/get_order_messages", (req, res) =>
{
    const { uid , oid} = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Error while getting messages: User not found!", message: "User not found!" });
    }

    db.query("SELECT * FROM order_messages WHERE oid = ?;", [oid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during order message fetch: ${error}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during order message fetch: ${error}!`, message: "Internal server error!" });
        }

        return res.status(200).json({ error: false, messages: results });
    });
});

app.post("/api/send_order_message", (req, res) =>
{
    const { uid, message } = req.body;

    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Message sending error: User not found!", message: "User not found!" });
    }

    if (!message)
    {
        return res.status(400).json({ error: true, debugMessage: "Message sending error: Missing required fields!", message: "Missing required fields!" });
    }

    if (message.length > 1024)
    {
        return res.status(400).json({ error: true, debugMessage: "Message sending error: Message is too long! Maximum length is 1024 characters.", message: "Message is too long! Maximum length is 1024 characters." });
    }

    debug.log(`User (uid: ${uid}) sending a message...`);

    db.query("INSERT INTO order_messages (uid, message) VALUES (?, ?);", [uid, message], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during sending message: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Database error during sending message: ${error.message}!`, message: "Internal server error!" });
        }

        debug.log("Message sent!");
        return res.status(200).json({ error: false });
    });
});

app.post("/api/update_order_status", (req, res) =>
{
    const { oid, status, uid } = req.body;
    
    if (oid === undefined || oid === null || status === undefined || status === null || uid === undefined || uid === null)
    {
        debug.error("Order status update error: Missing required fields!");
        return res.status(400).json({error: true, debugMessage: "Order status update error: Missing required fields!", message: "Missing required fields!"});
    }
    
    debug.log(`Updating order status (oid: ${oid}) to ${status}...`);

    db.query("SELECT freelancer_uid FROM orders WHERE oid = ?;", [oid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during order status update: ${error.message}!`);
            return res.status(500).json({error: true, debugMessage: `Database error during order status update: ${error.message}!`, message: "Internal server error!"});
        }

        if (results.length === 0)
        {
            debug.warning(`Order status update failed: Order not found (oid: ${oid})`);
            return res.status(404).json({error: true, debugMessage: "Order status update failed: Order not found!", message: "Order not found!"});
        }

        const order = results[0];

        if (order.freelancer_uid !== -1 && order.freelancer_uid !== uid)
        {
            debug.error(`Order status update error: Order is already taken by another freelancer (oid: ${oid})`);
            return res.status(400).json({error: true, debugMessage: "Order status update error: Order is already taken by another freelancer!", message: "Order is already taken by another freelancer!"});
        }
    });
    
    db.query("UPDATE orders SET status = ?, freelancer_uid = ? WHERE oid = ?;", [status, uid, oid], (error, result) =>
    {
        if (error)
        {
            debug.error(`Order status update error: ${error.message}!`);
            return res.status(500).json({error: true, debugMessage: `Order status update error: ${error.message}!`, message: "Internal server error!"});
        }
    
        if (result.affectedRows === 0)
        {
            debug.warning(`Order status update failed: Order not found (oid: ${oid})`);
            return res.status(404).json({error: true, debugMessage: "Order status update failed: Order not found!", message: "Order not found!"});
        }
    
        debug.log(`Order status updated successfully (oid: ${oid})`);
    
        return res.status(200).json({error: false, message: "Order status updated successfully!", oid: oid, status: status});
    });
});

app.post("/api/revoke_order", (req, res) =>
{
    const { uid } = req.body;
    
    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Error while revocating order: User not found!", message: "User not found!" });
    }
    
    debug.log(`User (uid: ${uid}) revoking their order...`);

    db.query("SELECT document_url FROM orders WHERE uid = ?;", [uid], (error, results) =>
    {
        if (error)
        {
            debug.error(`Database error during order revocation: ${error.message}!`);
            return res.status(500).json({ error: true, debugMessage: `Error while revocating order: ${error.message}!`, message: "Internal server error!" });
        }
    
        if (results.length === 0)
        {
            return res.status(404).json({ error: true, debugMessage: "Error while revocating order: Order not found!", message: "Order not found!" });
        }
    
        const documentName = results[0].document_url;
        if (documentName)
        {
            const fullPath = path.join(documentsDir, documentName);
    
            fs.unlink(fullPath, (err) =>
            {
                if (err)
                {
                    debug.error(`Failed to delete file: ${err.message}!`);
                }
            });
        }
    
        db.query("DELETE FROM orders WHERE uid = ?;", [uid], (error, results) =>
        {
            if (error)
            {
                debug.error(`Database error during order revocation: ${error.message}!`);
                return res.status(500).json({ error: true, debugMessage: `Database error during order deletion: ${error.message}!`, message: "Internal server error!" });
            }

            debug.log("Order revoked successfully!");
            return res.status(200).json({ error: false });
        });
    });
});

app.post("/api/download_application", (req, res) =>
{
    const { uid } = req.body;
    
    if (!uid)
    {
        return res.status(404).json({ error: true, debugMessage: "Error while downloading application: User not found!", message: "User not found!" });
    }

    debug.log(`Downloading latest nexusdev dashboard for user (uid: ${uid})...`);

    try
    {
        const files = fs.readdirSync(applicationDir);
        const exeFiles = files.filter(file => file.endsWith('.exe'));
        
        if (exeFiles.length === 0)
        {
            debug.error("No .exe files found in application directory!");
            return res.status(404).json({ error: true, debugMessage: "No .exe files found!", message: "No application available for download!" });
        }
        
        let latestFile = null;
        let latestVersion = null;
        
        exeFiles.forEach(file =>
        {
            const versionMatch = file.match(/(\d+(?:\.\d+)*)\$/);

            if (versionMatch)
            {
                const version = versionMatch[1];

                if (!latestVersion || compareVersions(version, latestVersion) > 0)
                {
                    latestVersion = version;
                    latestFile = file;
                }
            }
        });
        
        if (!latestFile)
        {
            debug.error("No valid versioned .exe files found!");
            return res.status(404).json({ error: true, debugMessage: "No valid versioned .exe files found!", message: "No application available for download!" });
        }
        
        debug.log(`Selected latest version: ${latestFile}`);
        
        res.download(path.join(applicationDir, latestFile), (err) =>
        {
            if (err)
            {
                debug.error(`Error while downloading application: ${err.message}!`);
                return res.status(500).json({ error: true, debugMessage: `Error while downloading application: ${err.message}!`, message: "Error while downloading application!" });
            }
        });
        
        debug.log("Application downloaded!");
    }
    catch (err)
    {
        debug.error(`Unexpected error while downloading application: ${err.message}!`);
        return res.status(500).json({ error: true, debugMessage: `Unexpected error while downloading application: ${err.message}!`, message: "Internal server error!" });
    }
});



function compareVersions(version1, version2)
{
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++)
    {
        const v1 = v1Parts[i] || 0;
        const v2 = v2Parts[i] || 0;
        
        if (v1 > v2) return 1;
        if (v1 < v2) return -1;
    }
    
    return 0;
}