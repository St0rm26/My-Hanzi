# Generate Character ID

```
reaction generateCharacterID

when Requesting.addCharacterToCollection (user, collection: Tag, character: Item)

then Tagging.generateTaggedItemID (user, collection: Tag, character: Item) : (ID)
```
