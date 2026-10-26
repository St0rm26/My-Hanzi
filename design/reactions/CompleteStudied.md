# Complete Studied Items

```
reaction CompleteStudiedItems

when Benchmarking.ensureBenchmark (user, items, name: String) : (benchmark)

where tag is the default "Studied" tag and there exists a benchmark with the uncompleted item; then for every item
    then Benchmarking.checkBenchmarkItem (benchmark, item)
```
