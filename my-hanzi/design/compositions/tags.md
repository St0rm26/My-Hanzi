# Tags

When a user registers, the system [creates a tag called "Studied"](../reactions/Initialize.md) for them from a reaction.

Anyone can [create their own tag](reaction:tags.CreateTag) for themselves as long as the name hasn't already been used.

```endpoints
tags.CreateTag at /tags/create-tag
```

Anyone can [edit their own tag](reaction:tags.EditTag) as long as the tag exists.

```endpoints
tags.EditTag at /tags/edit-tag
```

Anyone can [delete a tag](../reactions/FindTaggedCharactersIds.md) from the system as long as it is not the default "Studied" tag. This reaction finds the unique IDs of all items with that tag, then executes another reaction that [removes the tag from each item and revokes access from its shared audience](../reactions/DeleteCollection.md).

Anyone can add a tag to an item. When Tagging adds a tag to an item, it first [generates a unique ID](../reactions/GenerateCharacterId.md) for the tagged item, then [shares the tagged item](../reactions/AddCharacter.md) with no one and adds the tag to the item.

If the user adds an item to "Studied", it [adds the item to the built-in benchmarks](reaction:tags.AddToBenchmark) to show progress.

```endpoints
tags.AddToBenchmark at /tags/add-to-benchmark
```

On the other hand, if the user removes an item from "Studied", it [removes the item from the built-in benchmarks](reaction:tags.RemoveFromBenchmark).

```endpoints
tags.RemoveFromBenchmark at /tags/remove-from-benchmark
```

Anyone can remove a tag from an item. When Tagging removes a tag from an item, it first [finds the item's unique ID](../reactions/FindCharacterId.md), then [removes the tagged item and revokes access from its shared audience](../reactions/RemoveCharacter.md).
