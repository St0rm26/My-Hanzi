# Add Character

```
reaction addCharacter

when Tagging.generateTaggedItemID (user, collection: Tag, character: Item) : (ID)

then
    Tagging.addItemTag (user, collection: Tag, character: Item)
    Sharing.shareItem (user, ID, {})
```
