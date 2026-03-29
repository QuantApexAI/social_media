---
name: skill-creator-v1
description: Creates and improves Claude Code skills (SKILL.md packages). Use when the user wants to create a new skill, update an existing skill, design a slash command, or build reusable agent capabilities. Covers the full lifecycle from requirements gathering through validation and iteration.
---

# Skill Creator v1

## Quick Reference

A skill is a folder with a `SKILL.md` file (+ optional resources) that gives Claude specialized capabilities. Skills are the "what to do" layer — procedural knowledge, workflows, domain expertise.

```
skill-name/
├── SKILL.md              # Required. YAML frontmatter + markdown instructions.
├── scripts/              # Optional. Executable code (Python/Bash).
├── references/           # Optional. Docs loaded on demand into context.
└── assets/               # Optional. Files used in output (templates, images).
```

## Creation Workflow

1. **Gather requirements** — Understand use cases with concrete examples
2. **Categorize** — Identify skill type to select the right template
3. **Draft** — Write frontmatter, then body, then resources
4. **Validate** — Run security + structural checks
5. **Test** — Use the Claude A/B pattern (fresh instance tests the skill)
6. **Iterate** — Fix observed failures, not imagined ones

Follow these steps in order. Each is detailed below.

---

## Step 1: Gather Requirements

Ask the user (avoid asking more than 3 questions at once):

- "What specific tasks should this skill handle? Give 2-3 examples."
- "What would a user say that should trigger this skill?"
- "Are there scripts, templates, or reference docs to bundle?"

Conclude when you have 2+ concrete usage examples and clear trigger phrases.

## Step 2: Categorize the Skill

Map the user's intent to one of four categories, then use the matching template from [references/templates.md](references/templates.md):

| Category | Signals | Template |
|----------|---------|----------|
| **Standards & Conventions** | coding rules, style guides, naming conventions | Template A |
| **Tool & Workflow** | deploy, build, convert, process, slash commands | Template B |
| **Analysis & Reasoning** | analyze, evaluate, measure, interpret data | Template C |
| **Architecture & Design** | design systems, review architecture, structure projects | Template D |

## Step 3: Draft the Skill

### 3a. Write the Frontmatter

```yaml
---
name: kebab-case-name          # Required. Max 64 chars. Must match folder name.
description: >                  # Required. Max 1024 chars. THE most important field.
  Third-person voice. What it does + when to use it.
  Include trigger synonyms users would actually say.
---
```

**Frontmatter rules:**
- `name`: lowercase alphanumeric + hyphens. No leading/trailing/consecutive hyphens.
- `description`: Third person. Front-load distinguishing keywords. Include "Use when..." triggers. No angle brackets.
- All skill descriptions share a ~15,000 char budget. Aim for 100-200 words max.

**Optional Claude Code extension fields** (use only when needed):

| Field | Use Case |
|-------|----------|
| `disable-model-invocation: true` | Dangerous operations (deploy, delete). Manual `/name` only. |
| `user-invocable: false` | Background knowledge skills. Claude auto-loads, hidden from `/` menu. |
| `allowed-tools` | Pre-approve specific tools (e.g., `Read Grep Glob`). Scope to minimum. |
| `argument-hint` | Autocomplete hint (e.g., `[filename] [format]`). |
| `context: fork` | Run in isolated subagent context. Protects main context window. |
| `agent` | Subagent type when `context: fork` is set. |
| `model` | Override model for this skill. |

### 3b. Write the Body

**Section ordering matters.** Follow this hierarchy:

```
1. One-sentence purpose           (anchors Claude's mental model)
2. Quick start / most common op   (handles 80% of invocations)
3. Rules and constraints           (boundaries before flexibility)
4. Decision trees / branches       (handles remaining 20%)
5. Examples (if needed)            (concrete demonstrations)
6. Resource references             (progressive disclosure links)
7. Anti-patterns / gotchas         (exclusion constraints last)
```

**Writing rules:**
- Imperative voice: "Extract the text" not "The text should be extracted"
- One concept per section. Max 3 heading levels (`##`, `###`, `####`).
- Under **500 lines** total. Move details to `references/` files.
- Only add what Claude does NOT already know. Apply the "Token ROI test": if removing a line would not degrade output, delete it.
- One default approach with escape hatch. Never offer multiple equal options.
- For conditional logic, use explicit branching or push variants to separate reference files.

**Progressive disclosure budget:**

| Level | Budget | When Loaded |
|-------|--------|-------------|
| Metadata (name + description) | ~100 tokens | Always in context |
| SKILL.md body | <5,000 tokens | On skill trigger |
| Reference files | Unlimited | On demand by Claude |

### 3c. Build Resources

**Scripts** (`scripts/`): For operations that need deterministic reliability or get rewritten repeatedly. Scripts execute via Bash — only output consumes tokens (massive savings). Test scripts by running them.

**References** (`references/`): Documentation Claude reads on demand. Keep one level deep from SKILL.md (no nested references). For files >100 lines, add a table of contents. For files >10,000 words, include grep patterns in SKILL.md.

**Assets** (`assets/`): Templates, images, fonts used in output. Not loaded into context.

Delete any resource directories not needed. Do NOT create: README.md, CHANGELOG.md, INSTALLATION_GUIDE.md, or any auxiliary documentation files.

### 3d. String Substitutions (Optional)

Skills support dynamic content:

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All args passed when invoking `/skill-name arg1 arg2` |
| `$ARGUMENTS[N]` / `$N` | Specific argument by 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `` !`command` `` | Shell command output injected before loading |

## Step 4: Validate

Run these checks before considering the skill complete:

**Structural checks:**
- [ ] SKILL.md has valid YAML frontmatter with `name` and `description`
- [ ] `name` is kebab-case, matches folder name, max 64 chars
- [ ] `description` is third-person, <1024 chars, no angle brackets
- [ ] Body is under 500 lines
- [ ] Reference files are one level deep, descriptively named
- [ ] No extraneous documentation files (README, CHANGELOG, etc.)

**Security checks:**
- [ ] No hardcoded secrets (API keys, tokens, passwords, connection strings)
- [ ] No absolute paths containing `/Users/`, `/home/`, `C:\Users\`
- [ ] No `.env`, `.ssh`, `.aws`, or credential files included
- [ ] No `.git/` directory included
- [ ] Scripts contain no outbound network calls unless declared
- [ ] Scripts contain no `eval()`, `exec()`, or dynamic code execution
- [ ] Scripts contain no credential file access (`~/.ssh/`, `~/.aws/`)
- [ ] No prompt injection patterns (instruction overrides, role-play attacks, encoded payloads)
- [ ] No invisible Unicode characters in text files

**Content quality checks:**
- [ ] Description includes both "what it does" AND "when to use it"
- [ ] No explanations of concepts Claude already knows
- [ ] Imperative voice throughout
- [ ] Consistent terminology (pick one term, use it everywhere)
- [ ] Examples use input/output pairs (2-3 max, diminishing returns after)

## Step 5: Test with Claude A/B Pattern

1. **Claude A** (this instance): Designs the skill
2. **Claude B** (fresh instance with the skill loaded): Tests on real tasks

Create 3+ test scenarios:
```
Scenario: {description}
Trigger: "{what the user would say}"
Expected: [{list of expected behaviors}]
```

Run each scenario with Claude B. Observe:
- Does the skill trigger correctly?
- Are instructions followed in order?
- Are reference files read when appropriate?
- Where does Claude deviate from expected behavior?

## Step 6: Iterate Based on Observations

| Observed Problem | Fix |
|---|---|
| Skill not triggered | Revise `description` with stronger trigger terms |
| Instructions partially followed | Strengthen language, add explicit constraints |
| Wrong tool/library used | Add "Use X. Do NOT use Y." |
| Output format inconsistent | Add output template |
| Claude re-reads same reference file | Promote that content to SKILL.md body |
| Claude ignores a reference file | Make link more prominent or rename descriptively |
| Skill triggers for unrelated requests | Narrow description, add specificity |

---

## Key Principles Summary

1. **The description field is everything.** It is the sole mechanism for skill discovery. 100-200 words, third person, "what + when" structure.
2. **Concise is key.** Context window is shared. Only add what Claude does not know.
3. **Match freedom to fragility.** Narrow bridge = specific guardrails. Open field = flexible guidance.
4. **Solve observed failures, not imagined ones.** Test first, document gaps second.
5. **One level deep.** References link from SKILL.md, never from other references.
6. **Execute, don't load.** Scripts run via Bash; only output enters context.

For category-specific templates, see [references/templates.md](references/templates.md).
