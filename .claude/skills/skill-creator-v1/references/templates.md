# Skill Templates by Category

## Table of Contents
- [Template A: Standards & Conventions](#template-a-standards--conventions)
- [Template B: Tool & Workflow](#template-b-tool--workflow)
- [Template C: Analysis & Reasoning](#template-c-analysis--reasoning)
- [Template D: Architecture & Design](#template-d-architecture--design)
- [Frontmatter Extensions Reference](#frontmatter-extensions-reference)

---

## Template A: Standards & Conventions

For coding rules, style guides, naming conventions. High rule density, minimal examples. Often `user-invocable: false` (background knowledge).

```markdown
---
name: {language}-standards
description: |
  Enforces {language} coding standards for this project. Applies when writing,
  reviewing, or refactoring {language} code. Covers naming conventions, project
  structure, error handling, and testing patterns.
---

# {Language} Standards

## Naming
- Variables/functions: `{pattern}`
- Types/interfaces: `{pattern}`
- Constants: `{pattern}`
- Files: `{pattern}`

## Project Structure
{directory layout with one-line annotations per directory}

## Error Handling
- {Rule 1 with inline code example}
- {Rule 2}
- NEVER {prohibited pattern}

## Testing
- {Testing convention with example command}
- Minimum {X}% coverage on {scope}

## Prohibited
- NEVER {violation 1} -- {brief reason}
- NEVER {violation 2} -- {brief reason}
```

**Target**: ~40 lines. Zero examples needed (Claude knows languages). Focus only on project-specific deviations.

---

## Template B: Tool & Workflow

For deploy, build, convert, process operations. Procedural core with explicit stop conditions. User-invocable slash commands.

```markdown
---
name: {action}-{target}
description: |
  {Verb}s {target} using {tool/platform}. Use when the user asks to
  {trigger phrase 1}, {trigger phrase 2}, or {trigger phrase 3}.
---

# {Action} {Target}

## Quick Start

{Most common single operation:}
```bash
{exact command}
```

## Prerequisites

- {Required tool}: `{install/verify command}`

## Workflow

1. **Validate**: `{command}` -- STOP if fails
2. **{Core step}**: `{command}`
3. **Verify**: `{command}` -- expected: {success criteria}
4. **Report**: Output {result URL/path}

## Decision Points

- **{Condition A}?** -> {Action A}
- **{Condition B}?** -> Add flag `{flag}` to step 2

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `{error msg}` | {cause} | `{fix}` |
```

**Target**: ~50 lines. Commands ARE the examples. Add `disable-model-invocation: true` for destructive operations.

---

## Template C: Analysis & Reasoning

For analysis, evaluation, measurement tasks. Highest example-to-rule ratio. Structured output templates.

```markdown
---
name: {domain}-analysis
description: |
  Performs {domain} analysis including {metric1}, {metric2}, and {metric3}.
  Use when analyzing {data type}, interpreting {result type}, or evaluating
  {assessment target}. Produces structured analysis reports.
---

# {Domain} Analysis

## Metrics to Compute

Always calculate ALL of the following:

| Metric | Formula | Target |
|--------|---------|--------|
| {M1} | `{formula}` | {threshold} |
| {M2} | `{formula}` | {threshold} |
| {M3} | `{formula}` | {threshold} |

## Methodology

1. **Validate data**: Check for {common issues}
2. **Compute metrics**: Use formulas above
3. **Statistical validation**: {specific test, e.g., "t-test, p < 0.05"}
4. **Interpret**: Compare against thresholds, flag failures

## Validation Rules

- ALWAYS {critical constraint}
- NEVER {prohibited shortcut}
- Report {required disclosure}

## Code Template

```python
{Reusable function, 15-20 lines max}
```

## Output Format

```markdown
# {Domain} Analysis: {subject}

## Summary
{1-paragraph with key metric highlighted}

## Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|

## Interpretation
{2-3 sentences contextualizing results}

## Caveats
{Known limitations}
```

## Example

**Input**: {representative input}
**Output**: {structurally complete example}
```

**Target**: ~80 lines. Include one full input/output example. Mandatory output template.

---

## Template D: Architecture & Design

For system design, architecture review, project structure guidance. Principle-driven with explicit applicability boundaries.

```markdown
---
name: {paradigm}-architecture
description: |
  Architectural guidance for {paradigm} systems. Applies when designing
  services, reviewing architecture, or structuring {scope} projects.
---

# {Paradigm} Architecture

## Core Principles

1. **{Principle}**: {One sentence}. Implies: {concrete implication}.
2. **{Principle}**: {One sentence}. Implies: {concrete implication}.
3. **{Principle}**: {One sentence}. Implies: {concrete implication}.

## When to Apply

**Use when**: {conditions where this is appropriate}
**Do NOT use when**: {conditions where an alternative fits} -> Use {alternative}

## Standard Structure

```
{component/directory layout with annotations}
```

## Layer Boundaries

| Layer | Depends On | Never Depends On |
|-------|-----------|------------------|
| {Layer 1} | {deps} | {forbidden deps} |
| {Layer 2} | {deps} | {forbidden deps} |

## Decision Framework

- **{Design question}** -> Apply {pattern}, because {reason}
- **{Design question}** -> Apply {pattern}, because {reason}

## Anti-Patterns

- NEVER {violation} -- leads to {consequence}
```

**Target**: ~55 lines. Principle-driven. No code examples (too context-dependent). Include "when NOT to apply".

---

## Frontmatter Extensions Reference

All fields beyond `name` and `description` are optional. Use only when needed.

### Open Standard Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Kebab-case identifier. Max 64 chars. Required. |
| `description` | string | What + when. Max 1024 chars. Required. |
| `license` | string | License name or "Complete terms in LICENSE.txt" |
| `compatibility` | string | Environment requirements. Max 500 chars. |
| `metadata` | map | Arbitrary key-value pairs (string:string). |

### Claude Code Extension Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `disable-model-invocation` | bool | `false` | `true` = manual `/name` only. Claude cannot auto-invoke. |
| `user-invocable` | bool | `true` | `false` = hidden from `/` menu. Background knowledge only. |
| `allowed-tools` | string | none | Space-delimited pre-approved tools. Scope to minimum. |
| `argument-hint` | string | none | Autocomplete hint (e.g., `[filename]`). |
| `context` | string | none | Set to `fork` for isolated subagent execution. |
| `agent` | string | none | Subagent type when `context: fork`. |
| `model` | string | none | Override model for this skill. |
| `hooks` | object | none | Lifecycle hooks scoped to this skill. |

### Invocation Control Matrix

| Config | User can invoke | Claude can invoke |
|--------|----------------|-------------------|
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

### Rules-to-Examples Ratio by Category

| Category | Ratio | Reasoning |
|----------|-------|-----------|
| Standards & Conventions | 5:1 | Claude knows languages; rules disambiguate preferences |
| Tool & Workflow | 3:1 | Commands are self-documenting; rules handle branching |
| Analysis & Reasoning | 2:1 | Complex outputs benefit from demonstrations |
| Architecture & Design | 4:1 | Principle-heavy; examples show principle application |
