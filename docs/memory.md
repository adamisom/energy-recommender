# Memory

## Where To Pick Up

Begin implementation starting with Phase 0 — you'll see from existing files and commits that 0.1 is already done, Reference docs/Implementation_Tasks.md for file-level details and Follow Implementation Notes section for gotchas, Consult docs/misc/planning-PRD_FINAL_REVIEW.md for edge cases and to ensure we resolve the ten Priority 2 items (Recommendations section on line 804) during implementation, and consult docs/Architecture.md as needed for high-level context

## Workflow Guidance

Right after you're done making file changes, I want you to run lint (`npm run lint` in root) and fix lint issues in the source code (but not in the markdown files), and then after that run build (`npm run build` in root) and fix any issues, and then after that, fix any `npm run test` issues
After each phase of work is completed, update docs/misc/PROJECT_STATUS and prompt me to update this doc (do not update memory.md yourself)
Don't create a Markdown doc without asking me first — and default to just telling me in the chat the same information you were creating a file for, but also advise if the info is worth saving.
Commit your changes by default in a new chat, until I tell you to 'stop committing until I verify the fix', but you're allowed to resume committing your changes when I tell you we're in "implementation mode". Implementation mode (default) = commit; Troubleshooting mode = don't.
Do not read anything in docs/chat-logs/

## References

Refer to Architecture.md for application architecture when needed, and Implementation_PRD.md as the main source-of-truth for what we're building and how we're building it
