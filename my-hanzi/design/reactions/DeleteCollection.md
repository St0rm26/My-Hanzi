# Delete Collection

```
reaction deleteCollection

when Tagging.findTaggedItemsId (user, collection: Tag) : (IDs)

then
    Tagging.deleteTag (user, collection: Tag)
    Sharing.deleteItems (user, IDs)
```
