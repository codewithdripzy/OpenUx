import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

class Database {
    private name: string;
    private host: string;
    private port: string;
    private user: string;
    private password: string;

    constructor() {
        dotenv.config();

        this.name = process.env.DB_NAME ?? '';
        this.host = process.env.DB_HOST ?? '';
        this.port = process.env.DB_PORT ?? '';
        this.user = process.env.DB_USER ?? '';
        this.password = process.env.DB_PASSWORD ?? '';
    }

    async getConnection() {
        try {
            return await mongoose
                .connect(
                    `mongodb+srv://${this.user}:${this.password}@${this.host}/${this.name}?retryWrites=true&w=majority&family=4&appName=workstudio-cluster`,
                    { serverApi: { version: '1', strict: true, deprecationErrors: true } }
                )
                .then(async () => {
                    console.log('Connected to the database');
                });
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            throw error;
        }
    }
}

export default Database;
