# Share Collection

```
reaction shareCollection

when Tagging.updateAudience (user, collection: Tag, audience)

then
    Tagging._taggedItems (user, collection: Tag) : (IDs)
    Sharing.deleteItems (user, IDs)
    Sharing.shareItems (user, IDs, audience)
```
