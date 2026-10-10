# Find Tagged Characters IDs

```
reaction findTaggedCharactersIds

when Requesting.deleteCollection (user, collection: Tag)

then
    Tagging.findTaggedItemsId (user, collection: Tag) : (IDs)
```
