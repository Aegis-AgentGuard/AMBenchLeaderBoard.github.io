# AMBench Leaderboard

Interactive leaderboard for [AMBench](https://github.com/Aegis-AgentGuard/agent-risk-benchmark), a benchmark for evaluating tool-using agents under goal, context, and constraint underspecification.

The published site reports Completion, Compliance, and joint Success for each model and harness configuration. Versioned leaderboard records live in [`data.json`](data.json).

## Local preview

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>.
