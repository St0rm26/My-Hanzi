# Find Tagged Characters IDs

```
reaction findTaggedCharactersIds

when Requesting.deleteCollection (user, collection: Tag)

where the collection is not "Studied"

then
    Tagging.findTaggedItemsId (user, collection: Tag) : (IDs)
```
