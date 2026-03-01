# Skill: memorize
# Trigger: After learning something new about the project
# Purpose: Keep the knowledge base current — autonomous, no permission needed

## Instructions

Update the knowledge base when you discover:
- New architectural patterns or decisions
- New dependencies or library versions
- New bugs, workarounds, or gotchas
- Completed or removed features
- Changes to conventions or naming patterns
- New test patterns or mock strategies

## Protocol

1. Determine which KB file to update:
   - Stack/toolchain changes → `kb/stack.md`
   - Architecture/routing/data flow changes → `kb/architecture.md`
   - Command changes → `kb/commands.md`
   - Test framework/pattern changes → `kb/testing.md`
   - Convention/naming changes → `kb/conventions.md`
   - New bugs or resolved issues → `kb/issues.md`
   - Major changes → also update index `project_knowledge_base.md`

2. Edit the relevant file using the Edit tool — do not rewrite the whole file unless major restructure is needed

3. Keep entries concise — KB files are reference docs, not essays

4. If the change is a major architectural shift (new framework, new service, restructured directories):
   - Update all affected KB files
   - Inform the user: "I've updated the knowledge base to reflect [summary of changes]."

## Update Rules
- Remove stale entries when features are completed or bugs are fixed
- Do not duplicate information across multiple KB files
- Do not add speculative or unverified information
- Do not store session-specific state (current task, in-progress work)
