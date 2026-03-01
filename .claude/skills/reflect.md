# Skill: reflect
# Trigger: End of session, or user says "reflect" / "update skills" / "feedback loop"
# Purpose: Review session learnings and update KB + skills

## Protocol

1. **Review the session** — what was built, changed, or discovered?

2. **Check for KB staleness** — does any topic file contain outdated info?
   - Completed feature → remove from issues.md
   - New dependency added → update stack.md
   - New convention established → update conventions.md
   - New bug found → add to issues.md

3. **Update KB files** that are stale using the Edit tool

4. **Update skills** if a skill's protocol needs revision based on session experience

5. **Update `project_knowledge_base.md` index** if:
   - New key files were created
   - Current branch changed
   - Major features completed or started

6. **Summary to user** — brief message: "Knowledge base updated. Here's what changed: [list]."

## What NOT to Update
- Session-specific state (current task, in-progress work)
- Speculative conclusions not yet verified
- Anything already in CLAUDE.md or global memory
