# Share Character

```
reaction shareCharacter

when Tagging.addItemTag (user, collection: Tag, character: Item)

then
    Tagging.generateTaggedItemID (user, collection: Tag, character: Item) : (ID)
    Tagging._audience (user, collection: Tag) : (audience)
    Sharing.shareItem (user, ID, audience)
```
