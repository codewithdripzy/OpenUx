import http from "http";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import Database from "./config/database";
import { Server } from "socket.io";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import projectRouter from "./routes/project.routes";
import { RequestUserData } from "./core/interfaces/data";

declare global {
    namespace Express {
        interface Request {
            user?: RequestUserData;
        }
    }
}

class OpenUxServer {
    port: number;
    app: express.Application;

    allowedOrigins: string[];
    server: http.Server;
    io: Server;

    connectedSessions: Map<string, string>;

    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
        this.server = http.createServer(this.app);

        // Real-time AI collaboration
        this.io = new Server(this.server, {
            cors: { origin: this.allowedOrigins.length ? this.allowedOrigins : true, methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD"] },
        });
        this.connectedSessions = new Map();

        this.setup();
    }

    async setup() {
        this.app.use(cors({
            origin: (origin, cb) => cb(null, origin ?? true),
            credentials: true,
        }));
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.connect();
    }

    async connect() {
        const database = new Database();
        await database.getConnection();

        this.route()
    }

    route() {
        this.app.use("/public/", express.static("public"));
        this.app.get("/api/v:version/health", (_, res) => res.json({ status: "ok" }));

        this.app.use("/api/v:version/auth", authRouter);
        this.app.use("/api/v:version/user", userRouter);
        this.app.use("/api/v:version/projects", projectRouter);
    }

    async run() {
        this.server.listen(this.port, () => console.log(`OpenUx Server running on port ${this.port}`));
    }
}

export default OpenUxServer;
