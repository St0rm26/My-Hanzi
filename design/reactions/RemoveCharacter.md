# Remove Character

```
reaction removeCharacter

when Tagging.removeItemTag (user, collection: Tag, character: Item)

where tag is the default "Studied" tag and there exists a benchmark with the item (repeat for every benchmark with the item)
    then Benchmarking.uncheckBenchmarkItem (benchmark, character: Item)
```
