# Moving your branch onto the design tokens

For everyone with a feature branch started before the token system landed.
You do not need to understand the token system to follow this — the tools
name every change, and your agent does the typing.

Budget an afternoon. Nothing here can damage your work: step 1 makes a copy
and everything happens on the copy.

---

## Three ground rules

**1. You never push to `main`.** You push your copy branch; Nahid reviews
and merges. If an agent offers to push to `main`, say no.

**2. The merge only goes one way: `main` → your copy.** Nothing you do here
reaches `main` until someone reviews it.

**3. This changes how values are written, not how anything behaves.**
`#034EA2` becoming `var(--blue-brand)` is the same colour with a name. If
something looks or works differently afterwards, that is a mistake to
report — not something you have to accept.

---

## The one idea that makes this easy

**Merge `main` in first. Tokenise second.**

Once `main` is merged, every shared page — homepage, hero, navbar — arrives
*already converted*. The only hard-coded values left anywhere are the ones
you wrote. So you never have to answer "is this bit mine?" — after the
merge, anything the checker flags is yours by definition.

Do it the other way round and your agent will cheerfully reconvert the
entire homepage, which is already done, and you will fight the conflicts
twice.

---

## Before you start

```bash
node -v          # needs v20+. If "command not found", install Node 20.
git remote -v    # find the line with NHHerov4 — that first word is your
                 # remote name. Almost certainly `origin`.
```

---

## Step 1 — Make a safety copy

```bash
git checkout YOUR-BRANCH
git pull
git checkout -b YOUR-BRANCH-tokens
```

Your original branch is now frozen. If any of this goes wrong you delete
the copy and lose nothing.

---

## Step 2 — Write down what you own

**Do this before merging, while your branch is still clean.** Afterwards it
is a pile of conflicts and much harder to see what was yours.

Git will list what you have touched:

```bash
git fetch origin main
git diff --name-only $(git merge-base origin/main HEAD)...HEAD \
  | grep -E '\.(tsx|ts|module\.css)$' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
```

That prints your folders with a file count each. Use it to fill in:

```
I OWN:           the search experience, including its mobile variants
MY FILES:        src/components/search/**, src/components/ui/DoctorCard.tsx
I DID NOT BUILD: everything else in this repo.
```

The list is a starting point, not the answer — it includes files you only
wired your feature into. **Owning a file means you would be the person to
fix it if it broke.** Touching the homepage to plug your feature in does
not make the homepage yours.

If you genuinely cannot tell, call it not-yours. Taking `main`'s version of
something that was actually yours is one command to undo. The other way
round quietly deletes someone's week.

Keep these three lines open — you paste them into Prompt A.

---

## Step 3 — Bring `main` in

```bash
git merge origin/main
```

Git stops and lists what it could not merge alone. That is normal — those
are files both you and `main` changed. Roughly what to expect:

| branch | your files | likely conflicts |
|---|---|---|
| `chetan_work` | 62 | 27 |
| `toshib_work` | 117 | 73 |
| `aditya3_work` | 130 | 29 |
| `aditya_work` | 10 | 10 |
| `aditya2_branch` | 4 | 3 |

Escape hatch at any point: `git merge --abort` puts you back to the start
of this step with nothing lost.

---

## Step 4 — Resolve the conflicts

Paste **Prompt A**, with your three lines from step 2 in it. Its rules:

- **Not yours** → take `main`'s version whole.
- **Yours, `main` left it alone** → keep yours.
- **Yours, and `main` changed it too** → **stop and ask a human.**

That last case is the one that matters: two people built on the same thing.
No rule resolves it, and an agent that picks a side silently destroys
someone's work. The prompt makes it list these and wait. Bring that list to
Nahid.

```bash
git add -A
git commit -m "Merge main into YOUR-BRANCH-tokens"
```

---

## Step 5 — See what is left

```bash
npm install
npm run check:tokens
```

The first line is your scope:

```
Design-token check — 14 file(s) vs origin/main
```

**Those files are your work and only your work.** If that number is in the
hundreds, step 3 did not finish — ask Nahid before continuing.

| grade | meaning | what to do |
|---|---|---|
| **EXACT** | a token has exactly this value | **must fix** — the only grade that fails |
| **NEAR** | very close to a token | use it unless it visibly changes the design |
| **NEW** | you added a token to `globals.css` | don't — see Prompt B rule 1 |
| **CHANNEL** | `rgba()` of a colour with no `-rgb` variant | leave it, mention it to Nahid |

Do **not** run `check:tokens:all` — that scans everything, including work
already finished, and buries yours.

---

## Step 6 — Tokenise

Paste **Prompt B**. Then re-run `npm run check:tokens` until it prints:

```
OK — nothing that already has a name is written out longhand.
```

---

## Step 7 — Look at it

```bash
npm run dev
```

**http://localhost:3005** — note 3005, not 3000. Click through your
feature. This was a swap of values for names, so it should look identical.
If something shifted, a "near" token was not near enough: tell the agent
which element and have it restore the original with a `token-ok` note.

**/ds-lab** shows every token with its live value.

---

## Step 8 — Push the copy

```bash
git push -u origin YOUR-BRANCH-tokens
```

Tell Nahid. Your original branch is still untouched.

---

# The prompts

Use them as written — the restrictions are the point. An agent given
"tokenise my branch" without them will add tokens, reconvert finished
files, and nudge your design to make the check pass.

Both start by reading this file, so the agent gets the full context rather
than only what you pasted. When an agent says it is done, run
`npm run check:tokens` yourself — it takes two seconds and is the only
thing that actually knows.

## Prompt A — resolve the merge conflicts

Replace the two CAPS lines with yours from step 2.

```
Read TOKEN-MIGRATION.md in the repo root and follow it.

I merged origin/main into my branch and there are conflicts. main is the
source of truth for shared code — it is on the design-token system, my
branch is not.

I OWN: <WHAT YOU OWN, IN PLAIN WORDS>
MY FILES: <PATHS YOU BUILT>
Everything else in the repo is not mine.

Sort every conflicted file:
A. Not mine -> take main's version of the whole file. This always includes
   src/app/globals.css, whatever my scope says.
B. Mine, and main did not change it -> keep mine.
C. Mine AND main changed it too -> STOP. Do not choose. Leave it
   conflicted and untouched.

Reply first with a table of every conflicted file and its bucket, with the
C files listed separately under "NEEDS A HUMAN DECISION". Then wait for me.

After I confirm, resolve A and B only. If unsure, it is C.

Never run anything that can discard work: no reset --hard, no force push,
no push to main.
```

## Prompt B — convert my work to tokens

```
Convert my code to this project's design tokens.

Read TOKEN-MIGRATION.md, DESIGN-SYSTEM.md and AGENTS.md in the repo root
first, then run:

    npm run check:tokens

It lists only the files I changed versus main. Edit those and nothing else,
even if you spot hard-coded values elsewhere — that work is already done.

Rules:
1. Never add a token to globals.css. If nothing fits, leave the value and
   put /* token-ok: <why> */ above it, then list it for me. Flagging is the
   right outcome, not a failure.
2. Use the nearest EXISTING token; prefer semantic (--color-text-secondary)
   over primitive (--slate-600). The checker names the match — use it.
3. Nothing may look different. If the nearest token would visibly shift a
   colour, size or spacing, do not use it — token-ok it instead.
4. Opacity composes: rgba(var(--white-rgb), 0.08). Do not invent alphas.
5. Framer Motion cannot read CSS variables — import from src/lib/motion.ts.
   Literals are correct in shader props and SVG attributes (stroke=,
   stopColor=); mark those token-ok.

One file at a time. Re-run the check after each and show me before moving
on. At the end: the files you changed, and every token-ok with its reason.
```

---

## Reasonable things to worry about

**"Will merging `main` overwrite my search / booking flow?"** Not if you
did step 2. Your files are bucket B and are kept. The real risk is where
`main` changed the same feature — bucket C, where the prompt stops rather
than guesses. If your C list is long, do not push through it alone.

**"Later, when my branch goes into `main`, does this undo my feature?"**
No. That merge is separate, after review, and carries your feature *into*
`main` — the point of having built it.

**"I don't know tokens well enough to judge the replacements."** You do not
need to. The checker names the exact token every time. Your judgement is
needed for one question, in step 7: does it still look right?

**"The agent wants to add a token because nothing fits."** Say no. A
`token-ok` comment is the correct outcome and takes ten seconds. A new
token two shades off an existing one is how a design system stops being
one — and that is Nahid's call, not the agent's.

---

## If you get stuck

| problem | fix |
|---|---|
| "Cannot compare against..." | `git fetch origin main`, try again |
| checker lists hundreds of files | step 3 did not finish — `git merge --abort` and redo |
| page looks different after tokenising | a "near" token was not near enough; restore the original with `token-ok` |
| the merge is a disaster | `git merge --abort`, or delete the copy and start from step 1 |

Starting over costs an hour. It never costs your work — that is what step 1
is for.
