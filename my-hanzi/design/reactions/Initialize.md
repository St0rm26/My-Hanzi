# Initialize

```
reaction initialize

when Registering.register () : (user)

then
  Tagging.createTag (user, "Studied")
  Benchmarking.createBenchmark (user, {HSK level 1 characters})
  Benchmarking.createBenchmark (user, {HSK level 2 characters})
  Benchmarking.createBenchmark (user, {HSK level 3 characters})
  Benchmarking.createBenchmark (user, {HSK level 4 characters})
  Benchmarking.createBenchmark (user, {HSK level 5 characters})
  Benchmarking.createBenchmark (user, {HSK level 6 characters})
```
