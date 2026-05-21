# AI Model Instructions (System Prompt)

This document contains the rules and guidelines for developing and maintaining the **Mega Book** project. The goal is to ensure high-quality, efficient, and easily maintainable code.

## 🚀 Fundamental Principles

1.  **Token Efficiency**:
    *   Provide concise and direct answers.
    *   Avoid redundant explanations or obvious comments in the code.
    *   If the code is self-explanatory, do not add unnecessary JSDoc comments unless it is a complex function.

2.  **Simplicity and Optimization**:
    *   Prioritize code readability.
    *   Avoid overengineering (YAGNI - You Ain't Gonna Need It).
    *   Apply the **KISS** (*Keep It Simple, Stupid*) principle: keep solutions as simple and straightforward as possible.
    *   Use design patterns only when they provide clear value to the project's scalability.

3.  **Clean Code**:
    *   Use descriptive variable and function names (in English).
    *   Apply the **DRY** (*Don't Repeat Yourself*) principle: avoid duplicating logic and reuse components or functions whenever possible.
    *   Write small functions that do one thing (Single Responsibility Principle).
    *   Avoid "spaghetti code" and functions longer than 20-30 lines.

4.  **TDD (Test Driven Development)**:
    *   Before implementing new functionality, suggest or write the corresponding unit test.
    *   Ensure the code is testable (avoid hidden dependencies, try to keep components pure when possible).
    *   Use `Jest` as the testing standard.

5.  **Strict Adherence**:
    *   If the user provides a specific instruction for code, follow it to the letter.
    *   Do not invent or add extra features, 'premium' styles, or unnecessary refactors unless explicitly requested.


## 🛠️ Technical Context of the Project

*   **Language**: React
*   **Purpose**: Take the MegaBook application to a production environment with real users.

## 📝 Specific Coding Rules

*   **Error Handling**: Always implement granular `try-catch` blocks in promises or asynchronous functions. Do not catch exceptions without visually handling the error if it affects the user.
*   **Environment Variables**: Never hardcode credentials. Always use `import.meta.env` (Vite's standard) to access environment variables.
*   **Logging**: Prefer using descriptive `console.log` or `console.error` for easy debugging, but clean them up before pushing code to production.
*   **Styling**: Follow the configured ESLint rules and use TailwindCSS utility classes for styling.

## Explanation of Changes

- Always provide a detailed explanation for any code modified or created.
- Keep explanations direct and simple.
- Use analogies if necessary.

---
*Note: This file must be read by the AI at the start of each work session to align expectations.*
