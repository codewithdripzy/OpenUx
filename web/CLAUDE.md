# CLAUDE.md

## Project: AI Workflow Prompt System

This project is a **structured prompt system for AI-assisted product building**. It converts a product idea into a set of optimized, page-based prompt files designed to reduce token waste and improve consistency across AI tools.

The system is not a UI generator. It is a **prompt architecture layer**.

---

## Core Concept

Each application is broken into:

* Pages (e.g. Home, Login, Dashboard)
* Components within pages
* Each page has a **self-contained prompt**
* Prompts are **minimal, non-redundant, and context-aware**

The goal is:

> Reduce repeated context across AI calls and improve efficiency when generating or iterating on software.

---

## Folder Structure

```
/project
  /pages
    home.prompt.txt
    login.prompt.txt
    dashboard.prompt.txt
  GEMINI.md
  CLAUDE.md
  CODEX.md
  workflow.json
```

---

## Design Principles

### 1. No Redundant Context

Do NOT repeat:

* product description
* global app goals
* previously defined pages

Each page should assume:

> “Upstream context has already been processed.”

---

### 2. Local Page Intelligence

Each prompt must only include:

* what this page does
* what it needs to collect or show
* constraints specific to this page
* user intent for this step

---

### 3. Token Efficiency First

Prompts must be:

* compact
* direct
* structured
* free of filler language

Prefer:

> instructions over explanations

---

### 4. Dependency Awareness

Each page exists in a flow.

Allowed references:

* previous page outputs
* expected next page
* shared global state (if explicitly defined)

Do NOT restate flow unless necessary.

---

## Prompt Format (per page)

Each `.prompt.txt` file should follow this structure:

```
PAGE: <name>

ROLE:
What this page is responsible for in the product flow.

OBJECTIVE:
Single clear goal of the page.

INPUTS:
What data is expected from previous steps or user input.

BEHAVIOR:
How the AI or system should behave on this page.

CONSTRAINTS:
Rules that must be followed (tone, UX, validation, etc.)

OUTPUT:
What this page produces (data, navigation, state change).
```

---

## Example: home.prompt.txt

```
PAGE: Home

ROLE:
First entry point for the user.

OBJECTIVE:
Communicate value proposition and guide user to sign up.

INPUTS:
None

BEHAVIOR:
- Explain product in a simple and direct way
- Do not overload with details
- Focus on clarity and trust

CONSTRAINTS:
- No repetition of product explanation elsewhere
- Keep messaging under 3 key points

OUTPUT:
- User click intent (signup or learn more)
```

---

## AI Model Compatibility

This project is designed to work with:

* Claude (Anthropic)
* Gemini (Google)
* Codex / GPT-style models

Each model receives a separate file:

* `CLAUDE.md` → reasoning + structure focus
* `GEMINI.md` → multimodal + reasoning expansion
* `CODEX.md` → implementation/code generation focus

---

## Usage Rule

When using this system:

1. Load only the relevant page prompt
2. Do NOT inject full project context
3. Treat each page as an isolated instruction unit
4. Use upstream outputs as minimal references only

---

## Important Philosophy

This system prioritizes:

* **structure over verbosity**
* **modularity over large context dumps**
* **predictable AI behavior over open-ended prompting**
* **token efficiency over convenience**

---

## Warning

If prompts begin repeating shared context across pages, the system is incorrectly implemented.

The entire purpose is:

> eliminate redundant context across AI interactions
