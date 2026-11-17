# Pocabin — Mandatory Development Rules

These rules are **persistent and mandatory** for every development task in this repository, whether done by a person or an AI agent (Claude Code, Antigravity, or any other). They apply whenever you create, modify, extend, refactor, debug or optimize anything: components, pages, layouts, features, hooks, utilities, API integrations, services, business logic, state management, styling, configuration, tests, scripts and implementation docs. No change is exempt, however small.

Act as a Senior Software Engineer and Software Architect who will maintain this codebase for the next five years. The goal is not just working software, but clean, consistent, reliable, scalable, accessible software that another developer can easily understand and extend.

**Understand first. Plan second. Implement third. Review fourth.**

---

## 1. Investigate the codebase before every change

Before writing or modifying any code, you MUST:

1. Inspect the project structure and the relevant files (see "Project map" below).
2. Read and understand the existing implementation before changing it.
3. Identify the architectural patterns and conventions in use.
4. Understand how components, modules, services, hooks, utilities and business logic interact.
5. Find existing reusable components, functions, dependencies and solutions.
6. Review the design system, styling conventions and state management when relevant.
7. Check the existing tests and how the affected functionality is validated.
8. Identify dependencies, side effects and architectural constraints.

Do not base architectural decisions on assumptions, generic best practices or personal preference. Do not introduce a "theoretically ideal" architecture that conflicts with the project or adds needless complexity. If the current architecture has problems, understand them before proposing improvements.

Before introducing a new pattern, abstraction, library, dependency or structure, verify that it:

- is genuinely necessary;
- cannot be replaced by reasonably reusing an existing solution;
- improves the project rather than just making it different;
- integrates naturally with the existing architecture.

For complex changes, briefly explain the strategy and architectural decisions before implementing. If a requirement conflicts with an existing architectural decision, explain the trade-offs before proceeding.

## 2. Clean code

- Readable, self-explanatory, predictable code with descriptive, consistent names.
- Small functions with a single responsibility. Apply SOLID and DRY where they help, without inventing unnecessary abstractions.
- No duplicated code, deeply nested conditionals or needless complexity.
- No dead code, unused imports, redundant variables or unnecessary dependencies.
- No magic numbers or hardcoded values: use named constants or configuration.
- Never use `any`, `@ts-ignore`, `eslint-disable` or similar just to silence errors.
- Comment only to explain complex decisions or non-obvious behavior.

## 3. Architecture and code organization

- Separation of concerns and the Single Responsibility Principle.
- Keep components, modules, services, hooks, utilities and business logic properly separated, with clear boundaries between presentation, business logic, data access and application state.
- No monolithic files, oversized components or unnecessary coupling.
- Use modular, reusable patterns where they genuinely improve maintainability.
- Preserve established patterns unless there is a justified reason to improve them.

## 4. Components and UI

- Reusable, composable, independently maintainable components with a single responsibility.
- Separate UI from data fetching and business logic where appropriate.
- Avoid prop drilling when a more suitable state solution exists.
- Consistent loading, error, empty and success states.
- Accessibility (WCAG) and semantic HTML: labels, roles, keyboard navigation, focus management, color contrast.
- Responsive behavior across relevant screen sizes.

## 5. Performance and scalability

- Avoid unnecessary re-renders, redundant API calls and inefficient operations.
- Use lazy loading, code splitting, caching and memoization when appropriate, not by default.
- Avoid premature optimization, but flag decisions that could become bottlenecks.
- Choose suitable data structures and algorithms.
- Keep dependencies lightweight and justify every new package.

## 6. Type safety and error handling

- Strong typing and clear contracts between layers (see "Type safety in this repo" below).
- Validate all external data and user input, especially at API boundaries.
- Handle errors explicitly and consistently. Never swallow exceptions silently.
- No fragile workarounds or unsafe type assertions.
- Meaningful error messages and sensible fallback behavior.

## 7. Testing and reliability

- Test important business logic and critical user flows, following the existing framework and conventions.
- Unit and integration tests where appropriate, covering edge cases, invalid input and failure scenarios.
- A feature is not done just because the happy path works. Never assume correctness without validation.

## 8. Dependencies and technical decisions

- Prefer existing dependencies and native platform capabilities.
- Never add a package without a clear technical justification.
- Choose solutions another developer can easily understand and maintain.
- Record important architectural decisions in `README.md` (or a `docs/` file) when they affect future work.

## 9. Refactoring and technical debt

- Do not accumulate technical debt unnecessarily. Fix root causes, not symptoms.
- Preserve unrelated functionality. Refactor problematic code when needed, but avoid unrelated rewrites.
- Leave the codebase consistent, and never in a worse state than you found it.
- Remove temporary debugging code before finishing.
- If a request would add significant debt, explain the implications and recommend a cleaner alternative.

## 10. Workflow

**Before:** investigate the codebase → understand architecture and conventions → identify reusable code → list affected files and dependencies → evaluate side effects → choose a strategy grounded in the project.

**During:** implement incrementally → follow the established architecture → keep changes focused and scoped → don't duplicate existing functionality → validate as you go.

**After:** review every modified file → check for duplication and code smells → verify architectural consistency → run the checks below → fix anything you broke → confirm nothing regressed → summarize what was done and any remaining limitations.

## 11. Definition of Done

A task is complete only when:

- the requested functionality works;
- it follows the project's architecture, and its architectural decisions are justified by actual investigation of the codebase;
- the code is clean, readable and maintainable;
- existing functionality remains intact;
- relevant validation has been performed (the checks below pass);
- no unnecessary technical debt was introduced.

Never prioritize speed over quality, never rewrite working code without a clear reason, and never create a workaround when a clean solution exists.

---

## Project map

npm workspaces monorepo. Node.js 22 LTS is the reference version; Node 24 is supported.

| Path | What lives there |
|---|---|
| `backend/src/app.js` | Express app and HTTP routes (thin: parse request → call repo → respond) |
| `backend/src/binders.js` | Binder/sheet/card repository: validation, normalization, SQL. Returns the nested binder shape |
| `backend/src/images.js` | Content-addressed image repository (disk + `images` table) |
| `backend/src/db.js` | SQLite connection and append-only migrations (`user_version`) |
| `backend/src/domain.js` | Backend domain constants (grid types, skins, statuses…) |
| `backend/src/config.js` | Environment-based configuration. No hardcoded paths or limits elsewhere |
| `backend/src/errors.js` | `HttpError` helpers. Throw these; the error middleware maps them to responses |
| `backend/test/` | API integration tests (`node:test`, real HTTP against a temporary data dir) |
| `frontend/src/App.jsx` | App state (reducer) and API orchestration |
| `frontend/src/lib/api.js` | The only place that talks HTTP to the backend |
| `frontend/src/lib/theme.js` | Theme values chosen in Claude Design |
| `frontend/src/components/` | UI components ported from the Claude Design prototype |
| `frontend/src/styles.css` | Original design stylesheet; `app-extra.css` holds additions |
| `design/binder-organizer.html` | Original Claude Design export: the visual reference. Do not edit |

Established conventions:

- Every binder mutation endpoint returns the **full updated binder**; the frontend swaps it in with `REPLACE_BINDER`. Keep it that way unless there is a documented reason to change it.
- Schema changes go in a **new** entry at the end of `MIGRATIONS` in `db.js`. Never edit a migration that has shipped.
- Images are referenced by URL (`/api/images/<id>/file`). Card images are uploaded before the card is saved.
- UI changes must match the visual language in `styles.css` and the design reference.

## Required checks (run after every change)

```bash
npm test          # backend API tests
npm run lint      # ESLint on the frontend
npm run build     # production build of the frontend
```

For UI changes, also run the app (`npm run dev`) and verify the affected flow in a browser, including the loading, error and empty states.

## Type safety in this repo

The project is currently **JavaScript, not TypeScript**. Until a migration is decided:

- Validate and normalize every input at the API boundary (see `normalizeCard` in `binders.js`).
- Keep the data contracts documented: binder/card shapes in `README.md` and in the `binders.js` header comment.
- Use JSDoc types for new non-trivial functions.
- Do not partially convert files to TypeScript ad hoc. A migration should be its own planned task.

## Known gaps against these rules (current technical debt)

These were inherited from porting the Claude Design prototype. Fix them as dedicated tasks, or when you touch the affected code. Don't silently add to them:

1. **Oversized file:** `frontend/src/components/modals.jsx` (~1,300 lines) holds every modal plus form controls (`CuteSelect`, `PillMulti`, `CropModal`…). It should be split into one module per modal plus shared form controls. `core.jsx` (~600 lines) also mixes constants, helpers, icons and components.
2. **Duplicated domain constants:** grid types, skins/colors, statuses and collection types are defined in both `backend/src/domain.js` and `frontend/src/components/core.jsx`, and must be kept in sync by hand. A shared module (for example, a `shared/` workspace) should become the single source of truth.
3. **No TypeScript and no frontend tests:** only the backend has tests. Critical UI flows (add/edit card, manage sheets) need coverage.
4. **Accessibility not audited:** few ARIA attributes. Modals need focus trapping and labelling; custom selects need keyboard support.
5. **No formatter configured:** consider Prettier, as its own change, to avoid noisy diffs.
6. **Mock features:** Community, the Stats charts/activity and the AI scanner still use prototype data (see `README.md`).
7. **No authentication:** every binder belongs to a single implicit owner.

## References

- Claude prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Architecture decision prompts: https://dev.to/devprompts/10-claude-prompts-for-better-architecture-decisions-with-examples-12lg
