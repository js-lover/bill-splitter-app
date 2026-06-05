# Bill Splitter App (Ortak Hesap) - Claude Instructions

Welcome to the Bill Splitter App project!

## 📚 Important Documentation

Before proposing or making any architectural changes, or starting work on a new feature, **YOU MUST** review the relevant documentation in the `docs/` directory. These files explain the system's architecture, requirements, and database schema:

- **`docs/01_requirements.md`**: Explains functional and non-functional requirements across Phase 1, Phase 2, and Phase 3.
- **`docs/02_user_flows.md`**: Details user flows for sign up, creating groups, adding expenses, and settling debts.
- **`docs/03_workflows.md`**: Background processes, debt simplification algorithm, OCR processing, and notifications.
- **`docs/04_architecture_and_costs.md`**: Stack details (React Native + Supabase) and cost analysis.
- **`docs/05_database_schema.md`**: Supabase PostgreSQL tables and relationships.

**Rules for Claude:**
1. Always ensure your proposed solutions align with the current architecture (React Native + Expo + Supabase) and follow the established flows and schemas.
2. Read `@AGENTS.md` for tool-specific guidelines (like the specific Expo version to use).
