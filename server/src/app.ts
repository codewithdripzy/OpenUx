import "dotenv/config";
import OpenUxServer from './server';

const server = new OpenUxServer(Number(process.env.PORT) || 3000);

server.run().catch(err => {
    console.error("Unable to start OpenUx server:", err);
    process.exit(1);
});

export default server;
