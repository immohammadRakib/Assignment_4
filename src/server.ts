import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port || 3000;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }); 

        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(async () => {
                await prisma.$disconnect();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();




process.on('unhandledRejection', (error) => {
    console.error('🚨 Unhandled Rejection at Promise:', error);
    process.exit(1); 
});

process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception thrown:', error);
    process.exit(1);
});
