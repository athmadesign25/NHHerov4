# Moving your branch onto the design tokens

For everyone with a feature branch started before the token system landed.
You do not need to understand the token system to follow this. The tools
will tell you what to change, and your agent will do most of the typing.

Budget an afternoon. Nothing here can damage your work — step 1 makes a
copy and everything happens on the copy.

---

## Three ground rules

**1. You never push to `main`. Not once, not at the end.**
You push your copy branch. Nahid reviews it and merges. If an agent offers
to push to `main`, say no.

**2. The merge only ever goes one way: `main` → your copy.**
You are pulling the token system *into* your branch. Nothing you do here
travels to `main` until someone reviews it.

**3. This changes how values are written, not how anything behaves.**
Converting `#034EA2` to `var(--blue-brand)` is the same colour with a name.
Your search flow, your booking flow, your layouts all work exactly as
before. If something looks or behaves differently afterwards, that is a
mistake to report, not a thing you have to accept.

---

## The one idea that makes this easy

**Merge `main` into your branch first. Tokenise second.**

That order does the hard thinking for you. Once `main` is merged in, every
shared page — the homepage sections, the hero, the navbar — arrives
*already converted*. The only hard-coded values left anywhere will be the
ones you wrote yourself.

So you never have to answer "is this bit mine or Nahid's?" After the merge,
anything the checker still complains about is yours by definition. Do it in
the other order and your agent will happily re-convert the entire homepage,
which is already done and will just cause conflicts later.

---

## Before you start

Open a terminal in the project folder.

```bash
node -v
```

You need **v20 or higher**. If it says "command not found", install Node 20
from nodejs.org first.

```bash
git remote -v
```

Look for the line containing `NHHerov4`. The first word on that line is your
remote name. It is almost certainly `origin` — if it is something else, use
that instead of `origin` everywhere below.

---

## Step 1 — Make a safety copy

```bash
git checkout YOUR-BRANCH
git pull
git checkout -b YOUR-BRANCH-tokens
```

Replace `YOUR-BRANCH` with your actual branch name, e.g. `chetan_work`.

You are now on a copy. Your original branch is frozen exactly as it was. If
any of this goes wrong, you delete the copy and nothing is lost.

---

## Step 2 — Bring `main` in

```bash
git fetch origin main
git merge origin/main
```

Git will stop and list files it could not merge by itself. This is normal
and expected — those are files that both you and `main` changed.

Roughly what to expect, measured on 27 Oct:

| branch | files you changed | likely to conflict |
|---|---|---|
| `chetan_work` | 62 | 27 |
| `toshib_work` | 117 | 73 |
| `aditya3_work` | 130 | 29 |
| `aditya_work` | 10 | 10 |
| `aditya2_branch` | 4 | 3 |

If it goes badly at any point:

```bash
git merge --abort
```

That puts you back to the start of step 2 with nothing lost.

---

## Step 3 — Write down what you own

Before touching a conflict, fill this in. It is three lines and it is the
single most important thing you do today — every decision after this
follows from it. Keep it open; you will paste it into both prompts.

```
I OWN:        the search experience, including its mobile variants
MY FILES:     src/components/search/**, src/components/home/SearchBand.tsx
I DID NOT BUILD: everything else in this repo.
```

Be honest about the second line. "Everything I touched" is wrong — you
touched the homepage to wire your feature in; that does not make the
homepage yours. **Owning a file means you would be the person to fix it if
it broke.**

If you genuinely cannot tell, list it as not-yours. Taking `main`'s version
of something that was actually yours is recoverable in one command. The
other way round quietly deletes someone's week.

---

## Step 4 — Resolve the conflicts

Paste **Prompt A** (below) into your agent, with your three lines from step
3 pasted into it. The rules it follows:

- **Not in your scope** — take `main`'s version whole. It is already
  tokenised and it is what everyone else is building on.
- **In your scope, and `main` did not touch it** — keep yours. It gets
  tokenised in step 6.
- **In your scope, and `main` changed it too** — **stop and ask a human.**

That third case is the one that matters. It means two people built on the
same thing: your search iteration and the search work already in `main`,
for instance. No rule can resolve that, and an agent that picks a side will
silently throw away one person's work. The prompt makes it list these and
wait. Take that list to Nahid.

When the conflicts are done:

```bash
git add -A
git commit -m "Merge main into YOUR-BRANCH-tokens"
```

---

## Step 5 — See what is actually left

```bash
npm install
npm run check:tokens
```

The first line tells you your scope:

```
Design-token check — 14 file(s) vs origin/main
```

**Those files are your work and only your work.** The checker compares
against `main`, so anything already converted is invisible to it. If that
number is in the hundreds, something went wrong in step 2 — ask Nahid
before continuing.

It sorts findings into four kinds:

| grade | meaning | what to do |
|---|---|---|
| **EXACT** | the value has a token with exactly this value | **must fix** — this is the only one that fails the check |
| **NEAR** | very close to an existing token | use the suggested token unless it visibly changes the design |
| **NEW** | you added a token to `globals.css` | don't — see the rules below |
| **CHANNEL** | an `rgba()` whose colour has no `-rgb` variant | leave it, mention it to Nahid |

Do **not** run `npm run check:tokens:all`. That scans the whole codebase
including everything already done, and buries your work in thousands of
pre-existing findings.

---

## Step 6 — Tokenise

Paste **Prompt B** (below) into your agent. Then run the check again:

```bash
npm run check:tokens
```

Repeat until it prints:

```
OK — nothing that already has a name is written out longhand.
```

---

## Step 7 — Look at it

```bash
npm run dev
```

Open **http://localhost:3005** (note: 3005, not 3000).

Click through your feature. Tokens are a find-and-replace on values, so it
should look *identical* to before. If something shifted, the agent picked a
"near" token that was not near enough — tell it which element and have it
put the original value back with a `token-ok` note.

**http://localhost:3005/ds-lab** shows every token with its live value, if
you want to see what you are choosing from.

---

## Step 8 — Push the copy

```bash
git push -u origin YOUR-BRANCH-tokens
```

Tell Nahid it is ready. Your original branch is still untouched, so if the
copy turns out wrong, nothing has been lost.

---

# The prompts

Use these two, as written. Do not summarise them into "tokenise my branch"
— the restrictions are the whole point, and an agent given the goal without
them will add tokens, convert files that are already done, and adjust your
design to make the check pass.

Both prompts open by telling the agent to read this file, so it gets the
full context rather than only the paragraph you pasted. That works from
step 4 onwards: this file arrives in your branch with the `main` merge in
step 2, so by the time you need it, it is sitting in your repo.

Paste them into whatever you use — Claude Code, Cursor, the Copilot chat.
The wording does not need adapting per tool.

One habit worth keeping: when an agent says it has finished, run
`npm run check:tokens` yourself rather than believing it. The check takes
two seconds and is the only thing that actually knows.

---

## Prompt A — resolve the merge conflicts

Replace the three CAPITALISED lines with your own from step 3. Change
nothing else.

```
Read TOKEN-MIGRATION.md in the repo root before you do anything. It
explains what we are doing and why; follow it.

I have merged origin/main into my branch and there are conflicts.
main is the source of truth for all shared code. It has been converted to
the design-token system; my branch has not.

MY SCOPE
I OWN: <WHAT YOU OWN, IN PLAIN WORDS>
MY FILES: <PATHS AND GLOBS YOU BUILT>
I DID NOT BUILD: everything else in this repo.

Sort every conflicted file into one of three buckets:

A. OUTSIDE my scope -> take main's version of the whole file. Do not merge
   my changes into it. Do not preserve my hard-coded values. This includes
   src/app/globals.css ALWAYS, whatever my scope says — that file is the
   token system itself.

B. INSIDE my scope, and the conflict is only because my branch is old ->
   keep my version of the conflicting lines, and take main's for anything
   I did not deliberately change in that file.

C. INSIDE my scope AND main has also changed the same feature -> STOP.
   Do not resolve it. Do not choose. Two people have built on the same
   thing and a human has to decide which survives.

Your first reply is a table of every conflicted file and its bucket, with
one line of reasoning each, and the bucket C files listed separately at the
end under "NEEDS A HUMAN DECISION". Then stop and wait. Do not resolve
anything until I reply.

Once I confirm, resolve buckets A and B only. Leave every bucket C file
conflicted and untouched.

Never run a command that can discard work: no reset --hard, no checkout of
my branch, no force push, no push to main. If you are unsure which bucket a
file belongs in, put it in C.
```

## Prompt B — convert my work to tokens

```
Convert my code to this project's design-token system.

First read TOKEN-MIGRATION.md, DESIGN-SYSTEM.md and AGENTS.md in the repo
root. TOKEN-MIGRATION.md explains what we are doing; the other two define
the token system and the rules. Follow all three. Then run:

    npm run check:tokens

That command lists ONLY the files I changed relative to main. Work on
exactly those files and no others. Do not open or edit any file it does not
list, even if you notice hard-coded values there — those belong to work
that is already finished.

Rules, in order of importance:

1. NEVER add a new token to src/app/globals.css. Not one. If a value has no
   good match, leave the value where it is and add a comment above the line:
       /* token-ok: <why no token fits> */
   Then list it for me at the end. A flagged value is a success, not a
   failure — it is a question for the design system owner.

2. Use the nearest EXISTING token. Prefer a semantic token
   (--color-text-secondary) over a primitive (--slate-600). The checker
   prints the closest match for every finding; use what it suggests.

3. Do not change how anything looks. This is a swap of values for their
   names. If the nearest token would visibly shift a colour, size or
   spacing, do NOT use it — flag it with token-ok instead.

4. Colours at partial opacity compose from a channel token:
       rgba(var(--white-rgb), 0.08)
   Do not invent alpha values; use the ones already in the file.

5. Framer Motion cannot read CSS variables. In animate / whileHover /
   transition props, import from src/lib/motion.ts instead. Literals are
   also correct in WebGL shader props and SVG presentation attributes
   (stroke=, stopColor=) — mark those token-ok.

Work through one file at a time. After each file, run npm run check:tokens
again and show me the result before moving to the next.

When everything passes, give me a summary: which files you changed, and
every value you marked token-ok with the reason.
```

---

## Reasonable things to worry about

**"Will merging `main` overwrite my search / booking / whatever flow?"**
Not if you fill in step 3. Your files are bucket B and are kept. The only
real risk is the case where `main` has *also* changed the same feature —
that is bucket C, and the prompt is built to stop rather than guess. If
your bucket C list is long, do not push through it alone; that is a
conversation, not a merge.

**"Later, when my branch goes into `main`, does the token work undo my
feature?"**
No. That merge is a separate step, done after review, and it carries your
feature *into* `main` — which is the point of having built it. All this
process changes is that your feature arrives speaking the same language as
everything else.

**"I don't understand the token system well enough to judge the
replacements."**
You do not need to. The checker names the exact token for every value it
flags. Your judgement is only needed for one question, in step 7: does it
still look right? If yes, it is right.

**"The agent wants to add a token because nothing fits."**
Say no. A flagged value with a `token-ok` comment is the correct outcome
and takes ten seconds. A new token that is two shades off an existing one
is how a design system stops being one — and it is Nahid's call, not the
agent's.

---

## If you get stuck

| problem | fix |
|---|---|
| "Cannot compare against..." | `git fetch origin main`, then try again |
| the checker lists hundreds of files | step 2 did not finish — `git merge --abort` and redo it |
| the page looks different after tokenising | a "near" token was not near enough; put the original value back with `token-ok` |
| the merge is a disaster | `git merge --abort`, or delete the copy branch entirely and start from step 1 |

Deleting the copy and starting over costs you an hour. It never costs you
your work — that is what step 1 is for.
