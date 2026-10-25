# Benchmarks

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only update their own benchmarks.

When a user registers, [a reaction](reaction:benchmarks.Initialize) creates benchmarks for character lists from HSK levels 1-6 and the simplified HanziCraft frequency ranges 1-100, 101-200, 201-300, 301-400, 401-500, and 501-1000. HSK lists are sourced from [HanziDB](http://hanzidb.org/character-list/hsk); the frequency list is sourced from [HanziCraft](https://hanzicraft.com/lists/frequency). Existing users receive missing/new benchmarks when their benchmark list is loaded. A reaction [marks Studied characters complete in these new benchmarks](reaction:benchmarks.CompleteStudiedItems).

On the home page, the user sees their HSK 1-6 benchmarks below the Collections section, followed by the frequency benchmarks. Selecting a card opens its characters, ordered alphabetically by pinyin; selecting a character opens its detail page. A benchmark character has a gray background until it has been studied, then the color of their rating is shown (or white if no rating has been assigned).

The user can [view their benchmarks](reaction:benchmarks.List), including each benchmark's identifier and name.

```endpoints
benchmarks.List at /benchmarks/list
```

The user can [view all items of one of their benchmarks](reaction:benchmarks.Items), ordered alphabetically by pinyin in the frontend.

```endpoints
benchmarks.Items at /benchmarks/items
```

Within those items, the user can also view which ones are [completed](reaction:benchmarks.Completed) and [not completed](reaction:benchmarks.NotCompleted).

```endpoints
benchmarks.Completed at /benchmarks/completed
benchmarks.NotCompleted at /benchmarks/not-completed
```

When an item is added to the default "Studied" collection, [a reaction marks it complete in every benchmark that contains it](reaction:benchmarks.AddCharacter). When the item is removed, [a reaction marks it incomplete in every benchmark that contains it](reaction:benchmarks.RemoveCharacter). Other collections do not change benchmark progress.
