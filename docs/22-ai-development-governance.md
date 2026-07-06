# AI Development Governance: Quantum Living Solutions

This document governs the development workflow, quality gates, and code-contribution processes for future AI coding agents.

---

## 1. Zero-Shortcut AI Development Loop

To prevent code degradation, feature truncation, or logical errors, future agents must operate according to the following strict cycle:

```
[ STEP 1: PLAN ]
- Verify codebase files.
- Document proposed changes in implementation_plan.md.
- Obtain explicit user validation.
       |
       v
[ STEP 2: IMPLEMENT ]
- Edit only target files.
- Retain pre-existing comments and structure.
- Never write placeholder functions.
       |
       v
[ STEP 3: TEST ]
- Execute unit and integration tests.
- Verify coverage metrics remain stable.
       |
       v
[ STEP 4: SECURITY REVIEW ]
- Check files for secrets, tokens, or private endpoint leaks.
       |
       v
[ STEP 5: DOCUMENT & COMMIT ]
- Update walkthroughs and changelogs.
- Commit discrete changes.
```

---

## 2. Anti-Shortcut Directives

- **No Placeholder Implementations**: Writing `// TODO: Implement later` or `throw new Error("Not implemented")` in code to bypass execution steps is strictly forbidden.
- **Dependency Control**: Do not add packages or dependencies to `package.json` without documented reasoning in the implementation plan.
- **Test Integrity**: Weakening or commenting out tests to force CI/CD pipelines to pass is a critical failure.
- **Mute Silent Changes**: Do not modify existing configurations (e.g. `tsconfig.json`, eslint configurations) unless explicitly requested.
