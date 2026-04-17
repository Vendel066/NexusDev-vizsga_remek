const fs = require("fs");
const path = require("path");



function manager(message, level)
{
    const logsDir = path.join(".", "logs");

    if (!fs.existsSync(logsDir))
    {
        fs.mkdirSync(logsDir);
    }

    const date = new Date();
    const fileName = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}.log`;
    const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
    const msg = `[${time}] [${level}] - ${message}`;

    console.log(msg);
    fs.appendFileSync(path.join(logsDir, fileName), msg + "\n");
}



function log(message)
{
    manager(message, "LOG");
}

function warning(message)
{
    manager(message, "WARNING");
}

function error(message)
{
    manager(message, "ERROR");
}



module.exports = { log, warning, error };