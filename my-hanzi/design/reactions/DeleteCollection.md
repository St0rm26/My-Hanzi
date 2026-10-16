# Delete Collection

```
reaction deleteCollection

when Tagging.deleteTag (user, collection: Tag)

then
    Tagging._audience (user, collection: Tag) : (audience)
    Tagging.findTaggedItemsID (user, collection: Tag) : (IDs)
    Sharing.revokeItems (user, IDs, audience)
    Sharing.deleteItems (user, IDs)
```
