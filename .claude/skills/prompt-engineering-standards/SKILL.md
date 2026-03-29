---
name: prompt-engineering-standards
description: |
  Enforces Claude prompt engineering best practices when writing system prompts,
  user prompts, skill descriptions, agent instructions, tool descriptions, or
  CLAUDE.md files. Applies when crafting, reviewing, or refactoring prompts for
  Claude models (API, Claude Code, skills, MCP tools). Covers clarity, XML
  structure, multishot examples, chain of thought, role assignment, prompt
  chaining, long context ordering, output format control, and latest-model
  specifics. Based on Anthropic's official prompt engineering documentation.
user-invocable: false
---

# Prompt Engineering Standards

## Core Principles

1. **Clarity over cleverness.** Claude is a brilliant new employee with no context on your norms. If a colleague with minimal context would be confused, Claude will be too.
2. **Context window is a public good.** Every token competes with conversation history, tool output, and other skills. Only add what Claude does not already know.
3. **Tell Claude what TO DO**, not what NOT to do. Positive instructions outperform prohibitions.
4. **Specify success criteria.** State what good output looks like before asking for it.
5. **Prompt engineering over fine-tuning.** Prompts are cheaper, faster to iterate, preserve general knowledge, and survive model updates.

## Technique Hierarchy

Apply in this order when troubleshooting or improving prompts. Techniques at the top have the broadest effectiveness:

1. Be clear and direct
2. Use examples (multishot prompting)
3. Let Claude think (chain of thought)
4. Use XML tags for structure
5. Give Claude a role (system prompts)
6. Chain complex prompts into subtasks
7. Long context ordering tips

## Clarity and Specificity

- Provide context: purpose, audience, workflow position, success criteria.
- Use sequential numbered steps for multi-step instructions.
- Be explicit about output format, length, and style. If you want only code, say so.
- Replace vague directives with concrete constraints:
  - Vague: "Remove PII from these messages."
  - Specific: "Replace names with CUSTOMER_[ID], emails with EMAIL_[ID]@example.com. Preserve sentiment and product references."

## Multishot Examples

Include 3-5 diverse, relevant examples to anchor Claude's output format and style.

```xml
<examples>
  <example>
    <input>Added JWT authentication to login endpoint</input>
    <output>feat(auth): implement JWT-based login authentication</output>
  </example>
  <example>
    <input>Fixed timezone bug in report dates</input>
    <output>fix(reports): correct date formatting in timezone conversion</output>
  </example>
</examples>
```

- Examples must mirror real use cases and cover edge cases.
- Wrap in `<example>` tags; nest multiple inside `<examples>`.
- Vary examples enough to prevent unintended pattern lock-in.

## Chain of Thought

Give Claude space to reason before answering. Three levels of increasing structure:

| Level | Technique | When to Use |
|-------|-----------|-------------|
| Basic | "Think step-by-step." | Simple reasoning tasks |
| Guided | "First consider X, then evaluate Y, finally decide Z." | Multi-factor decisions |
| Structured | "Reason in `<thinking>` tags, then answer in `<answer>` tags." | Complex analysis where reasoning must be separable from output |

- For text-prompt CoT (without the `thinking` API parameter), Claude must output its reasoning -- no output means no reasoning. The `thinking` API parameter handles this separately.
- Skip chain of thought for simple tasks where latency matters.

## XML Tag Usage

Use XML tags to separate instructions, data, examples, and output sections.

```xml
<instructions>
Analyze the contract for liability clauses.
</instructions>

<contract>
{{CONTRACT_TEXT}}
</contract>
```

- No canonical "correct" tag names. Use names that describe the content: `<document>`, `<instructions>`, `<data>`, `<thinking>`, `<answer>`.
- Be consistent: use the same tag names throughout and reference them ("Using the contract in `<contract>` tags...").
- Nest tags for hierarchy: `<documents><document index="1">...</document></documents>`.
- Combine XML with multishot (`<examples>`) and chain of thought (`<thinking>`, `<answer>`) for maximum structure.

## Role Assignment

Assign roles via the `system` parameter. The right role transforms Claude from general assistant to domain expert.

```python
system="You are a senior security engineer specializing in OWASP Top 10 vulnerabilities."
```

- Put the role in `system`. Put task instructions in the `user` turn.
- Be specific: "data scientist specializing in customer insight for Fortune 500 companies" outperforms generic "data scientist".
- Experiment: different roles surface different insights from the same data.

## Prompt Chaining

Break complex tasks into sequential subtasks. Each subtask gets Claude's full attention.

- Identify discrete steps: Research -> Outline -> Draft -> Edit -> Format.
- Use XML tags for handoffs between prompts.
- Each subtask has one clear objective.
- Run independent subtasks in parallel for speed.

**Self-correction chain**: Generate -> Review (grade A-F) -> Revise based on feedback.

## Long Context Ordering

For prompts with 20K+ tokens of input data:

1. **Documents at the TOP**, query at the BOTTOM. Can meaningfully improve response quality, especially with complex multi-document inputs.
2. **Wrap documents in indexed XML tags**:
   ```xml
   <documents>
     <document index="1">
       <source>annual_report.pdf</source>
       <document_content>{{CONTENT}}</document_content>
     </document>
   </documents>
   ```
3. **Ground responses in quotes.** Ask Claude to extract relevant quotes in `<quotes>` tags before answering. Cuts through noise in long documents.

## Output Format Control

- Use structured outputs or explicit format instructions. Avoid prefilling on Claude 4.6+ -- it produces less predictable results; prefer structured outputs or explicit instructions.
- Provide a format template or example output showing exact structure.
- Match your prompt style to desired output style. Markdown in prompts produces markdown in output.
- For JSON output, specify the schema or provide a complete example.
- Use XML format indicators: "Write your analysis in `<analysis>` tags."

## Claude 4.6 Specifics

Claude 4.6 follows instructions more literally. Adjust prompts accordingly:

- **Remove anti-laziness language.** Delete "be thorough", "think carefully", "don't be lazy". Use the `effort` parameter instead.
- **Remove aggressive tool-use language.** Replace "You MUST use [tool]" with proportionate instructions.
- **Be explicit about "above and beyond" behavior.** Claude 4.6 does exactly what you ask. If you want extras, request them.
- **Add context and motivation.** Explain WHY behind instructions for better targeting.
- **Watch your examples closely.** Claude 4.6 pays very close attention to example details. Ensure examples exactly match desired behavior.

- **Include autonomy guidance** for agent prompts: "Take local, reversible actions freely. For hard-to-reverse or externally visible actions, ask the user before proceeding."
- **Minimize hallucinations** with investigation directives: instruct Claude to read files before making claims, never speculate about code it has not opened.

## Skill Description Writing

When writing `description` fields for Claude Code skills:

- Write in **third person**: "Processes Excel files" not "I can process Excel files".
- Include **what it does** and **when to use it** with concrete trigger phrases.
- Front-load distinguishing keywords for fast scanning.
- Max 1024 characters. Target 100-200 words.

## Structured Prompt Template

Reference layout for well-structured prompts:

```
1. System message: Role definition
2. Long documents/data (for long context scenarios)
3. Context and background
4. Examples (in <examples> tags)
5. Instructions (numbered steps)
6. Thinking directive (if needed): <thinking> then <answer>
7. The specific query/task (at the END for long context)
```

## Prohibited

- NEVER use vague instructions without specifying format, audience, or success criteria.
- NEVER mix instructions with data in the same unstructured block -- use XML tags to separate.
- NEVER put queries before long documents -- documents go first, queries last.
- NEVER expect Claude to infer output format -- specify it explicitly or provide examples.
- NEVER use "be thorough" or "don't be lazy" with Claude 4.6 models -- use the effort parameter.
- NEVER rely on prefilling for output format on Claude 4.6+ models -- use structured outputs or explicit instructions instead.
- NEVER write single monolithic prompts for complex multi-step tasks -- chain subtasks.
- NEVER omit examples when output format or style consistency matters -- provide 3-5 diverse examples.
- NEVER force Claude into a role via user messages -- use the `system` parameter for roles.
- NEVER include sensitive data (API keys, credentials) in prompt text or examples.
