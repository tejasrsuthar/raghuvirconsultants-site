# Project Rules & Customizations

- **Semantic Versioning**: For every update or modification request, increment the project semantic version across configuration files (`package.json`, `backend/app/main.py`), git tags, and release documentation.
- **Git Branching Policy**: For any new feature or enhancement, ALWAYS create a dedicated feature branch branched from `main` (e.g. `feat/<feature-name>`). Do NOT work or commit directly on `main` for new features.
- **Git Push Constraint**: Do NOT push commits or tags to `origin` (`git push`) unless the user explicitly requests or instructs you to push.
- **Graphify Graph**: Update the graphify graph and architectural dependency representations with every update by executing: `graphify extract . --code-only && graphify cluster-only /Users/harshitsuthar/workspace/raghuvirconsultants-site/`
- **Test Case Updates**: For every update in backend, update/add new test cases in the central `backend/tests/` folder keeping test coverage around 95% across all files.
- **Technical Documentation & Pastel Mermaid Diagrams**: For every change or feature update, maintain and update the technical documentation in `backend/docs/`. This documentation must provide complete API specifications, system architecture, pastel-colored Mermaid diagrams (`#E2F0CB`, `#FFDAC1`, `#B5EAD7`, `#C7CEEA`, `#FFB7B2`), overall user guide, and step-by-step operational instructions for all features in the Admin Console.
