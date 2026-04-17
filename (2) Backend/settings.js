const settings =
{
    SV_HOST: "127.0.0.1",
    SV_PORT: 3000,

    SV_CORS:
    {
        origin: (origin, callback) =>
        {
            const allowedOrigins =
            [
                /^http:\/\/localhost:5173(\/.*)?$/,
                /^http:\/\/localhost:3000(\/.*)?$/,
                /^http:\/\/127\.0\.0\.1:5173(\/.*)?$/,
                /^http:\/\/127\.0\.0\.1:3000(\/.*)?$/
            ];

            if (!origin)
            {
                return callback(null, true);
            }

            if (allowedOrigins.some(pattern => pattern.test(origin)))
            {
                callback(null, true);
            }
            else
            {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    },
    
    DB_HOST: "127.0.0.1",
    DB_PORT: 3306,
    DB_USER: "root",
    DB_PASSWORD: "",
    DB_DATABASE: "nexusdev"
}

module.exports = settings;