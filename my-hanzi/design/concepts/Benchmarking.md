# Benchmarking

## Purpose

Let people keep track of where they are in fulfilling a universal goal and what needs to be completed.

## Principle

Someone checks off tasks that they have completed for a certain goal and can see which ones they still need to do to complete the goal.

## Types

```types
external User
  The person the benchmark is specific to.

external Item
  Something that can be marked as complete.

external Boolean
  Either true or false.
```

## State

```state
a set of Benchmarks with
    a user User
    a name String

a set of BenchmarkedItems with
  a benchmark Benchmark
  an item Item
  a finished Boolean
```

## Actions

```actions
createBenchmark (user: User, items: Items, name: String) : returns (benchmark: Benchmark)
  where the user exists and the number of items is at least one and all distinct
  then
    create a benchmark with the given user and benchmarked items with every item and a false finished field
    returns benchmark

deleteBenchmark (benchmark: Benchmark) : returns ()
  where the benchmark exists
  then
    delete the benchmark and all benchmarked items with this benchmark
    returns

checkBenchmarkItem (benchmark: Benchmark, item: Item) : returns ()
  where there exists a benchmarked item with the given benchmark, the given item, and a false finished boolean
  then
    remove change the finished boolean to true in the identified benchmarked item
    returns

uncheckBenchmarkItem (benchmark: Benchmark, item: Item) : returns ()
  where there exists a benchmarked item with the given benchmark, the given item, and a true finished boolean
  then
    remove change the finished boolean to false in the identified benchmarked item
    returns
```

## Queries

```queries
_items(benchmark: Benchmark) : many (item: Item)
  Return all items of benchmarked items with this benchmark

_finishedItems(benchmark: Benchmark) : many (item: Item)
  Return all items of benchmarked items with this benchmark that have a true finished field

_unfinishedItems(benchmark: Benchmark) : many (item: Item)
  Return all items of benchmarked items with this benchmark that have a false finished field
```
