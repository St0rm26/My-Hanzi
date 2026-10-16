# Benchmarks

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only update their own benchmarks.

When a user registers, [a reaction creates benchmarks for character lists from HSK levels 1-6](reaction:benchmarks.Initialize) for them. The lists are sourced from [HanziDB](http://hanzidb.org/character-list/hsk).

The user can [view all items of one of their benchmarks](reaction:benchmarks.Items), ordered in alphabetical order.

```endpoints
benchmarks.Items at /benchmarks/items
```

Within those items, the user can also view which ones are [completed](reaction:benchmarks.Completed) and [not completed](reaction:benchmarks.NotCompleted).

```endpoints
benchmarks.Completed at /benchmarks/completed
benchmarks.NotCompleted at /benchmarks/not-completed
```

When an item is added to the default "Studied" collection, [a reaction marks it complete in every benchmark that contains it](reaction:benchmarks.AddCharacter). When the item is removed, [a reaction marks it incomplete in every benchmark that contains it](reaction:benchmarks.RemoveCharacter). Other collections do not change benchmark progress.
