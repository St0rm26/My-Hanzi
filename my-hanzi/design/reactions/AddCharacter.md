# Add Character

```
reaction addCharacter

when Tagging.addItemTag (user, collection: Tag, character: Item)

where tag is the default "Studied" tag and there exists a benchmark with the item (repeat for every benchmark with the item)
    then Benchmarking.checkBenchmarkItem (benchmark, character: Item)

where the item does not have an ID
    then Tagging.generateTaggedItemID (user, collection: Tag, character: Item) : (ID)

where the item has an ID
    then Tagging.findTaggedItemID (user, collection: Tag, character: Item) : (ID)

then
    Tagging._audience (user, collection: Tag) : (audience)
    Sharing.shareItem (user, ID, audience)
```
