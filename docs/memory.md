# Memory

## Where To Pick Up

This app is done

## Workflow Guidance

NEVER put contents of .env* files in the chat, you can read the file but only suggest changes indirectly
Don't run the dev server, always make me do that
Right after you're done making file changes, I want you to run lint (`npm run lint` in root) and fix lint issues in the source code (but not in the markdown files), and then after that run build (`npm run build` in root) and fix any issues, and then after that, fix any `npm run test` issues
After each phase of work is completed, update docs/misc/PROJECT_STATUS and prompt me to update this doc (do not update memory.md yourself)
Don't create a Markdown doc without asking me first — and default to just telling me in the chat the same information you were creating a file for, but also advise if the info is worth saving.
Commit your changes by default in a new chat, until I tell you to 'stop committing until I verify the fix', but you're allowed to resume committing your changes when I tell you we're in "implementation mode". Implementation mode (default) = commit; Troubleshooting mode = don't.
Do not read anything in docs/chat-logs/

## References

Refer to Architecture.md for application architecture when needed, and Implementation_PRD.md as the main source-of-truth for what we're building and how we're building it
