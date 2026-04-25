# OpenUx

**Think it. Build it.**

OpenUx is an open-source, AI-driven UX architecture platform. It allows product designers and developers to describe their application ideas and automatically generates structured, interconnected UI workflows (nodes) using state-of-the-art AI models.

## 🚀 Features

- **Prompt-to-Workflow**: Transform natural language descriptions into complete application architectures.
- **Structured UX Data**: Each generated node includes page slugs, rules, actions, and specific AI prompts for implementation.
- **Iterative Refinement**: Refactor entire workflows in real-time by chatting with the AI.
- **Multi-Model Support**: Powered by the Vercel AI SDK, supporting Gemini 2.5, Claude 4.5, and GPT-4o.
- **Monorepo Architecture**: Clean separation between the Next.js frontend and Node.js/Express backend.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, Tailwind CSS, Framer Motion, React Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Vercel AI SDK.
- **Infrastructure**: Pnpm workspaces.

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+)
- Pnpm (v9+)
- MongoDB instance (local or Atlas)
- AI Provider API Keys (Google, OpenAI, or Anthropic)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/OpenUx.git
   cd OpenUx
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Setup environment variables:
   - Create `.env` in the `server` directory (see `server/.env.example`)
   - Create `.env` in the `web` directory (see `web/.env.example`)

4. Start development servers:
   ```bash
   # From root
   pnpm dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
