# Remove Character

```
reaction removeCharacter

when Tagging.findTaggedItemID (user, collection: Tag, character: Item) : (ID)

then
    Tagging.removeItemTag (user, collection: Tag, character: Item)
    Sharing.deleteItem (user, ID)
```
