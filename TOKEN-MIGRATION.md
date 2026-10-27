# Moving your branch onto the design tokens

For anyone whose branch started before the token system landed.

You run two prompts. The agent does the git, the merge and the conversion.
You answer three questions along the way. You should not need to type a git
command unless something goes wrong.

Budget an afternoon. Nothing here can damage your work — the first thing
the agent does is make a copy, and everything happens on the copy.

---

## Three ground rules

**1. Nothing is ever pushed to `main`.** Not by you, not by the agent. You
push your copy branch at the end; Nahid reviews and merges.

**2. The merge only goes one way: `main` → your copy.**

**3. This changes how values are written, not how anything behaves.**
`#034EA2` becoming `var(--blue-brand)` is the same colour with a name. If
anything looks or works differently afterwards, that is a mistake to
report — not something to accept.

---

## Why the order matters

**`main` is merged in first, then your code is converted.**

Once `main` is in, every shared page — homepage, hero, navbar — arrives
*already converted*. The only hard-coded values left anywhere are the ones
you wrote. So nobody has to judge "is this bit mine?" — after the merge,
whatever the checker flags is yours by definition.

The other way round, the agent reconverts the entire homepage, which is
already done, and you fight the same conflicts twice.

---

## Before you start

Check Node is installed — in a terminal, `node -v` should print v20 or
higher. If it says "command not found", install Node 20 from nodejs.org.

Then open the project in your agent (Claude Code, Cursor, whatever you
use) and paste **Prompt 1**.

---

## What happens

| | who | what |
|---|---|---|
| **Prompt 1** | agent | makes the copy branch, lists your files, proposes your scope |
| **Checkpoint 1** | **you** | confirm or correct the scope |
| | agent | merges `main`, sorts the conflicts, stops |
| **Checkpoint 2** | **you** | decide the contested files (see below) |
| **Prompt 2** | agent | resolves conflicts, converts your values to tokens |
| **Checkpoint 3** | **you** | click through the site and confirm it looks the same |
| | you | push the copy branch, tell Nahid |

---

### Checkpoint 1 — your scope

The agent will propose something like:

```
I OWN: the search experience, including its mobile variants
MY FILES: src/components/search/**, src/components/ui/DoctorCard.tsx
```

It builds this from the files you touched, which **over-counts** — it
includes files you only wired your feature into. Cut those.

**Owning a file means you would be the person to fix it if it broke.**
Touching the homepage to plug your feature in does not make the homepage
yours. If you genuinely cannot tell, call it not-yours: taking `main`'s
version of something that was actually yours is one command to undo, the
other way round quietly deletes someone's week.

### Checkpoint 2 — the contested files

The agent sorts every conflict into three buckets:

- **A — not yours** → takes `main`'s version
- **B — yours, `main` left it alone** → keeps yours
- **C — yours, and `main` changed it too** → **stops and asks you**

C means two people built on the same thing. No rule resolves that, and an
agent that picks a side silently destroys someone's work. **Take the C list
to Nahid.** Do not work through it alone, especially if it is long.

### Checkpoint 3 — does it still look right?

The agent gives you a URL (it will be `localhost:3005`). Click through your
feature. This was a swap of values for names, so it should look identical.
If something shifted, tell the agent which element — a "near" token was not
near enough, and it should restore the original with a `token-ok` note.

`localhost:3005/ds-lab` shows every token with its live value.

---

# The prompts

Use them as written. The restrictions are the point — an agent given
"tokenise my branch" without them will add tokens, reconvert finished
files, and adjust your design to make the check pass.

## Prompt 1 — set up and merge

```
Read TOKEN-MIGRATION.md in the repo root and follow it. You are moving my
branch onto this project's design-token system.

Do these in order and STOP where it says stop.

1. Tell me which branch I am on and whether I have uncommitted changes. If
   I do, stop and ask me what to do with them.

2. Find the git remote whose URL contains NHHerov4 and use that name
   throughout (probably "origin"). Fetch its main.

3. Create a copy branch named <my-current-branch>-tokens and switch to it.
   This copy is the safety net: my original branch must stay untouched for
   the rest of this.

4. Show me the files I have changed, grouped by folder with counts:
   git diff --name-only $(git merge-base <remote>/main HEAD)...HEAD

5. From that, propose my scope in this form, then STOP and wait:
      I OWN: <my feature, in plain words>
      MY FILES: <paths>
   That list over-counts — it includes files I only wired my feature into,
   which are NOT mine. Owning a file means I would be the one to fix it if
   it broke. Wait for me to confirm or correct it before going on.

6. Once I confirm, merge <remote>/main into the copy branch.

7. Sort every conflicted file into:
   A. Not mine -> take main's version of the whole file. This always
      includes src/app/globals.css, whatever my scope says.
   B. Mine, and main did not change it -> keep mine.
   C. Mine AND main changed the same feature -> do not touch it. A human
      decides.
   Show me a table of every conflicted file and its bucket, with the C
   files listed separately under "NEEDS A HUMAN DECISION". Then STOP.

Never push to main. Never use reset --hard, force push, or anything else
that can discard work. If you are unsure which bucket a file is, it is C.
If anything looks wrong, stop and tell me rather than working around it.
```

## Prompt 2 — resolve and convert

```
Continue the token migration. Read TOKEN-MIGRATION.md if you have not.

1. Resolve the bucket A and B conflicts as agreed. Leave every bucket C
   file exactly as it is unless I have told you otherwise. Commit the
   merge.

2. Run: npm install && npm run check:tokens
   Tell me how many files it lists. If it is far more than my own file
   list from the setup step, STOP — the merge went wrong and I need to
   look before you edit anything.

3. The files it lists are the whole job. Edit those and nothing else, even
   if you notice hard-coded values elsewhere — that work is already done.

Rules:
- Never add a token to src/app/globals.css. If nothing fits, leave the
  value and put /* token-ok: <why> */ above it, then list it for me.
  Flagging is the right outcome, not a failure.
- Use the nearest EXISTING token; prefer semantic (--color-text-secondary)
  over primitive (--slate-600). The checker names the match — use it.
- Nothing may look different. If the nearest token would visibly shift a
  colour, size or spacing, do not use it — token-ok it instead.
- Opacity composes: rgba(var(--white-rgb), 0.08). Do not invent alphas.
- Framer Motion cannot read CSS variables — import from src/lib/motion.ts.
  Literals are correct in shader props and SVG attributes (stroke=,
  stopColor=); mark those token-ok.

Work one file at a time, re-running npm run check:tokens after each, and
show me the result before moving on.

4. When it prints "OK — nothing that already has a name is written out
   longhand", start the dev server and give me the URL so I can look.

5. Do not push anything. Tell me when it is ready and I will push it
   myself.
```

---

## Reasonable things to worry about

**"Will merging `main` overwrite my search / booking flow?"** Not if your
scope is right at checkpoint 1 — your files are bucket B and are kept. The
real risk is bucket C, where the agent stops rather than guesses.

**"Later, when my branch goes into `main`, does this undo my feature?"**
No. That merge is separate, after review, and carries your feature *into*
`main` — the point of having built it.

**"I don't know tokens well enough to judge the replacements."** You do not
need to. The checker names the exact token every time. Your judgement is
needed for one question, at checkpoint 3: does it still look right?

**"The agent wants to add a token because nothing fits."** Say no. A
`token-ok` comment is the correct outcome and takes ten seconds. A new
token two shades off an existing one is how a design system stops being
one — and that is Nahid's call, not the agent's.

---

## If something goes wrong

Escape hatches, for when the agent is stuck or you want out:

| problem | type this |
|---|---|
| the merge is a mess, start it over | `git merge --abort` |
| start the whole thing over | `git merge --abort`, then `git checkout YOUR-BRANCH` and delete the copy |
| "Cannot compare against..." | `git fetch origin main`, then retry |
| agent lists hundreds of files | the merge did not finish — `git merge --abort` and redo |
| the page looks different | tell the agent which element; it restores the value with `token-ok` |

Starting over costs an hour. It never costs your work — that is what the
copy branch is for.

Never run `npm run check:tokens:all` — it scans the whole codebase,
including work already finished, and buries yours.
