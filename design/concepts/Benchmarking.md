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
    unique user and name

a set of BenchmarkedItems with
    a benchmark Benchmark
    an item Item
    a finished Boolean
    unique benchmark and item
```

## Actions

```actions
createBenchmark (user: User, items: Items, name: String) : returns (benchmark: Benchmark)
    where the user exists and the number of items is at least one and all distinct
    then
        create a benchmark with the given user and benchmarked items with every item and a false finished field
        returns benchmark
    where the number of items is zero
    then
        refuses BENCHMARK_REQUIRES_ITEMS "A benchmark must contain at least one item."
    where not all items are distinct
    then
        refuses BENCHMARK_REQUIRES_DISTINCT_ITEMS "All items must be distinct."
    where the benchmark already exists for the user
    then
        refuses BENCHMARK_ALREADY_EXISTS "This user already has a benchmark with that name."

deleteBenchmark (benchmark: Benchmark) : returns ()
    where the benchmark exists
    then
        delete the benchmark and all benchmarked items with this benchmark
        returns
    where the benchmark does not exist
    then
        refuses BENCHMARK_NOT_FOUND "There is no such benchmark."

checkBenchmarkItem (benchmark: Benchmark, item: Item) : returns ()
    where there exists a benchmarked item with the given benchmark, the given item, and a false finished boolean
    then
        change the finished boolean to true in the identified benchmarked item
        returns
    where the benchmark does not exist
    then
        refuses BENCHMARK_NOT_FOUND "There is no such benchmark."
    where the item is not in the benchmark
    then
        refuses BENCHMARK_ITEM_NOT_FOUND "There is no such item in this benchmark."
    where the item is already finished
    then
        refuses BENCHMARK_ITEM_ALREADY_FINISHED "This item is already finished."

uncheckBenchmarkItem (benchmark: Benchmark, item: Item) : returns ()
    where there exists a benchmarked item with the given benchmark, the given item, and a true finished boolean
    then
        change the finished boolean to false in the identified benchmarked item
        returns
    where the benchmark does not exist
    then
        refuses BENCHMARK_NOT_FOUND "There is no such benchmark."
    where the item is not in the benchmark
    then
        refuses BENCHMARK_ITEM_NOT_FOUND "There is no such item in this benchmark."
    where the item is not finished
    then
        refuses BENCHMARK_ITEM_NOT_FINISHED "This item is not finished."
```

## Queries

```queries
_benchmarks(user: User) : many (benchmark: Benchmark, name: String)
    Return this user's benchmarks, unordered

_items(benchmark: Benchmark) : many (item: Item)
    Return all items of benchmarked items with this benchmark, unordered

_finishedItems(benchmark: Benchmark) : many (item: Item)
    Return all items of benchmarked items with this benchmark that have a true finished field, unordered

_unfinishedItems(benchmark: Benchmark) : many (item: Item)
    Return all items of benchmarked items with this benchmark that have a false finished field, unordered
```
