# Add Character

```
reaction addCharacter

when Tagging.addItemTag (user, collection: Tag, character: Item)

where tag is the default "Studied" tag and there exists a benchmark with the item (repeat for every benchmark with the item)
    then Benchmarking.checkBenchmarkItem (benchmark, character: Item)
```
