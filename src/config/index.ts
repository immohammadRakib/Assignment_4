import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.join( process.cwd(), ".env" ) });

export default {
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL || "", 
    app_url: process.env.APP_URL,
    client_url: process.env.CLIENT_URL || "https://assignment-5-git-main-rakiblp6gmailcoms-projects.vercel.app",
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET || "",
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "",
    jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION || "1d",
    jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
    ssl_commerz_store_id: process.env.SSL_COMERZ_STORE_ID || "",
    ssl_commerz_store_password: process.env.SSL_COMERZ_STORE_PASSWORD || "",
}
