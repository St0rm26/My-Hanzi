# Share Collection

```
reaction shareCollection

when Tagging.updateAudience (user, collection: Tag, audience)

then
    Tagging.findTaggedItemsID (user, collection: Tag) : (IDs)
    Sharing.shareItems (user, IDs, audience)
```
