# Find Tagged Characters IDs

```
reaction findTaggedCharactersIds

when Requesting.deleteCollection (user, collection: Tag)

then
    Tagging.findTaggedItemsID (user, collection: Tag) : (IDs)
```
