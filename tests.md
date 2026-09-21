# 1. Key idea: make the script testable

Right now your script is **not test-friendly by default** because it:

* Executes `node`, `git`, `vi`, `less`
* Reads/writes real files in the same directory as script
* Uses global side effects (`stat`, `sed -i`, etc.)
* Depends on `.mjs` files

👉 So in Bats you should:

* override `PATH`
* mock `node`, `git`, `vi`, etc.
* use a temporary directory (`BATS_TMPDIR`)
* point `projectdir` to a test fixture

# 5. Example Bats test file

## tests/control.bats

```bash
#!/usr/bin/env bats

setup() {
  export PROJECT_ROOT="$BATS_TEST_TMPDIR/project"
  mkdir -p "$PROJECT_ROOT"

  # copy script into temp area
  cp "$BATS_TEST_DIRNAME/../control.sh" "$PROJECT_ROOT/"
  cp "$BATS_TEST_DIRNAME/../stdlib.bash" "$PROJECT_ROOT/"
  cp "$BATS_TEST_DIRNAME/../history.bash" "$PROJECT_ROOT/"

  # create fake files
  echo "repo1" > "$PROJECT_ROOT/.config"
  echo "1" >> "$PROJECT_ROOT/.config"

  touch "$PROJECT_ROOT/dashboard.txt"
  echo "mock dashboard content" > "$PROJECT_ROOT/dashboard.txt"
}
```

# 6. Test: default behavior (main dashboard)

```bash
@test "shows dashboard when today" {
  run bash "$PROJECT_ROOT/control.sh"

  [ "$status" -eq 0 ]
  [[ "$output" == *"dashboard"* ]]
}
```

# 7. Mock external commands (VERY important)

Your script calls:

* `node`
* `git`
* `vi`
* `less`

So you must mock them.

## Example: mock node

```bash
setup() {
  export PATH="$BATS_TEST_TMPDIR/bin:$PATH"
  mkdir -p "$BATS_TEST_TMPDIR/bin"

  cat > "$BATS_TEST_TMPDIR/bin/node" <<'EOF'
#!/usr/bin/env bash
echo "node called with: $@"
EOF
  chmod +x "$BATS_TEST_TMPDIR/bin/node"
}
```

# 8. Test `update` command

```bash
@test "update runs node script" {
  run bash "$PROJECT_ROOT/control.sh" update

  [ "$status" -eq 0 ]
  [[ "$output" == *"Updating"* ]]
  [[ "$output" == *"node called"* ]]
}
```

# 9. Test `in-work`

You must mock file existence:

```bash
@test "in-work shows job file" {
  echo "current job content" > "$PROJECT_ROOT/current_job.txt"

  run bash "$PROJECT_ROOT/control.sh" in-work

  [ "$status" -eq 0 ]
  [[ "$output" == *"current job content"* ]]
}
```

# 10. Test missing job file

```bash
@test "in-work when no job exists" {
  rm -f "$PROJECT_ROOT/current_job.txt"

  run bash "$PROJECT_ROOT/control.sh" in-work

  [ "$status" -eq 0 ]
  [[ "$output" == *"don't have current job"* ]]
}
```

# 11. Test `to-work` (with mocking validation + node)

You need to mock:

* `start_job`
* `node`
* `control_dashboard_mark_current_job`

Example:

```bash
setup() {
  export PATH="$BATS_TEST_TMPDIR/bin:$PATH"
  mkdir -p "$BATS_TEST_TMPDIR/bin"

  cat > "$BATS_TEST_TMPDIR/bin/node" <<'EOF'
#!/usr/bin/env bash
echo "node to-work executed"
EOF
  chmod +x "$BATS_TEST_TMPDIR/bin/node"
}
```

Then:

```bash
@test "to-work writes config and calls node" {
  run bash "$PROJECT_ROOT/control.sh" to-work repo1 123

  [ "$status" -eq 0 ]
  [[ -f "$PROJECT_ROOT/.config" ]]
  [[ "$(head -1 "$PROJECT_ROOT/.config")" == "repo1" ]]
  [[ "$(tail -1 "$PROJECT_ROOT/.config")" == "123" ]]
}
```

## P0 — State is too tightly coupled to the real filesystem

This is the most important weakness in the project, and it is the reason many tests are harder than they need to be.

The project stores the current work state in files such as `dashboard.txt`, `current_job.txt`, `.history`, `.estimate`, and `.config`. That means the behavior of the CLI depends on the current working directory and on real on-disk files. In a simple script this can work, but it creates several serious problems:

1. Hidden global state
   - The script is not just reading arguments; it is also reading and writing shared files.
   - The behavior of one command depends on whatever is already stored on disk.
   - That makes the project harder to reason about and harder to run in parallel.

2. Tests become fragile
   - A test must set up and clean up files carefully.
   - If a file is left behind or the working directory is wrong, the tests can fail for the wrong reason.
   - This is exactly the type of problem described in the earlier note: the script was not test-friendly by default.

3. Real environment leaks into logic
   - The app is no longer just a function of input; it is also a function of the machine state.
   - Different machines, different directories, or different users can produce different results.
   - That makes bugs harder to reproduce.

4. Production reliability drops
   - If a file is missing, corrupted, or unreadable, the command may fail unexpectedly.
   - The script has no clean boundary between runtime state and business logic.
   - Recovery, validation, and error handling become more complex.

5. It blocks cleaner testing
   - The right way to test a CLI like this is to keep state in a controlled, injected place.
   - Instead of using the real project directory, tests should run with a temporary directory or a configurable state location.
   - That way tests can be deterministic and independent.

### Why this is the top priority

This is not just a test issue; it is a design issue.

The CLI is mixing three separate concerns:

- command parsing and shell behavior
- business logic for repository/jobs/issues
- persistence on the local filesystem

Those concerns should be separated. A better architecture is:

- keep state access in one place
- expose file paths or state location via env vars or arguments
- avoid hidden writes to the repository root
- make tests use a temp directory and then assert on behavior, not on a shared global workspace

### Practical fix direction

A good next step would be:

- define a single state layer for project files
- centralize all reads/writes in a small API
- allow the state directory to be supplied via env var like `CONTROL_STATE_DIR`
- default to the current directory only for production, but override in tests
- refactor the shell scripts to call that layer instead of writing directly to fixed paths

This would reduce hidden side effects, remove a lot of test setup complexity, and make the project much easier to verify in CI.

In short: the project is not failing because the tests are missing; it is failing because the program is tightly coupled to real machine state. That is the main thing to fix first.

I’ve narrowed it to the most important risks: state management, testability, and missing edge-case coverage. I’m turning that into a concrete priority list with the highest-impact fixes first.

## Priority list: biggest weaknesses, in order

Based on the code and test layout in `README.md`, `tests.md`, `Makefile`, `index.test.js`, and `control.bash.bats`, these are the main weak spots.

---

### P0 — State is too tightly coupled to the real filesystem

This is the biggest problem.

Why it matters:

- The project reads and writes local files such as dashboard/current job state.
- The scripts appear to assume a fixed directory layout.
- That makes tests fragile and production behavior harder to reason about.

Evidence:

- `tests.md` explicitly says the original script was “not test-friendly by default”
- the project stores working state in files like `current_job.txt` and `dashboard.txt` as described in `README.md`

What to fix first:

1. Create a single state layer for:
   - current job
   - dashboard
   - history
   - estimate
2. Inject the file paths via env vars or parameters instead of hardcoded script-local paths.
3. Make each command operate on a temp directory in tests.

This should be your top priority because it improves both reliability and testability.

### P1 — The tests are too mock-heavy

The JS suite in `index.test.js` mocks a lot of core behavior:

- fs calls
- path utilities
- GitHub API
- console output

Why this is weak:

- It makes tests fast, but also less realistic.
- It can pass even when real file behavior or API integration is broken.
- This is the classic “test the mock, not the real behavior” problem.

What to fix:

1. Keep unit tests for pure logic, but add a small number of real integration-style tests.
2. Use temp directories for file writes instead of mocking fs for everything.
3. Keep mocks only at the boundary: external HTTP calls or OS commands, not internal logic.

This is the second priority because it raises confidence in the actual app behavior.

### P2 — Coverage is uneven and likely misses many failure modes

The existing tests cover some command flows, but they do not appear to cover the whole system evenly.

Most likely missing areas:

- empty state / missing files
- malformed config contents
- invalid repository names
- invalid issue numbers
- GitHub API failures
- rate limits
- missing token
- permission errors
- corrupted history data
- repeated or stale jobs

Why it matters:

- CLI tooling usually breaks in exactly these edge cases.
- A project like this can look “tested” while still failing in reality.

What to fix:

1. Add a test matrix by command:
   - update
   - in-work
   - to-work
   - done
   - todo
   - history
   - estimate
   - skip
   - local
2. Add “bad input” and “missing state” tests for each.

### P3 — The architecture still mixes concerns

The shell scripts seem to do several jobs at once:

- state management
- GitHub fetch logic
- output rendering
- command dispatch
- file editing / editor launching

This makes the code harder to test and maintain.

What to fix:

1. Separate:
   - business logic
   - file I/O
   - CLI argument parsing
   - external command execution
2. Let the shell script be thin and the logic be more testable.

This is a structural issue, but it matters a lot long term.

### P4 — The test intent is clear, but the quality bar is still not high

The project has real tests now:

- JS tests in `index.test.js`
- Bats tests in `control.bash.bats`
- runner targets in `Makefile`
- dev dependencies in `package.json`

That is good progress.

But the quality gap is that the tests feel like they were added after the code was written, not designed around a stable contract.

What to fix:

- define the expected behavior of each command
- test that contract directly
- use snapshots or data fixtures only where they help, not as a substitute for real behavior

---

## Recommended order of work

1. Fix state management and file paths
2. Reduce heavy mocking in the JS suite
3. Add edge-case tests for invalid input and missing state
4. Clarify command contracts
5. Improve CI enforcement through `Makefile`

---

## My honest verdict

This project is much better than the “no tests at all” state described in `tests.md`, but it is still not yet a strong testable architecture.

The biggest gap is not “missing tests” — it is “the code is still structured in a way that makes testing harder than it needs to be.”

If you want, I can do one of these next:

1. write a concrete “test improvement plan” for this repo
2. identify exactly which commands are under-tested
3. suggest a refactor pattern to make the code easier to test without breaking behavior
