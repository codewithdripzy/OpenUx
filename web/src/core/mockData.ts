import { NodeData } from "../core/interfaces/data";

export const landingMockNodes: NodeData[] = [
    {
        id: "1",
        uid: "1",
        title: "Initial Idea",
        context: "Create a SaaS for tracking habit progress with social features.",
        position: { x: 100, y: 100 },
        parents: [],
        connections: ["2", "3"],
        messages: [
            { sender: "user", content: "I want to build a habit tracker that allows friends to compete." },
            { sender: "agent", content: "That's a great idea! We should focus on core gamification and social connectivity." }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "2",
        uid: "2",
        title: "Database Schema",
        context: "Define the core models for habits, streaks, and user groups.",
        position: { x: 500, y: 50 },
        parents: ["1"],
        connections: [],
        messages: [
            { sender: "agent", content: "I've drafted a schema with Habit, Log, and Challenge models. This will support streaks and leaderboard functionality." }
        ],
        updatedAt: new Date().toISOString()
    },
    {
        id: "3",
        uid: "3",
        title: "UI Components",
        context: "Identify the primary views needed for the habit tracking app.",
        position: { x: 500, y: 250 },
        parents: ["1"],
        connections: [],
        messages: [
            { sender: "agent", content: "We'll need a Dashboard, Habit Creation modal, and a Social Feed. I can start by designing the habit card." }
        ],
        updatedAt: new Date().toISOString()
    }
];
