# Benchmarks

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only update their own benchmarks.

When a user registers, [a reaction creates benchmarks for character lists from HSK levels 1-6](reaction:tags.Initialize) for them (see also [Initialize](../reactions/Initialize.md)).

The user can [view all items of a benchmark](reaction:benchmarks.Items), ordered in alphabetical order.

```endpoints
benchmarks.Items at /benchmarks/items
```

Within those items, the user can also [which ones are completed](reaction:benchmarks.Completed) and [which ones are not completed](reaction:benchmarks.NotCompleted).

```endpoints
benchmarks.Completed at /benchmarks/completed
benchmarks.NotCompleted at /benchmarks/not-completed
```
