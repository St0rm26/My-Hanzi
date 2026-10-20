# Sharing

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only share their own collections and view only collections shared with them.

The user can view the distinct collections shared with them using [the collections endpoint](reaction:shares.Collections), including each collection's name and author username, in alphabetical order.

```endpoints
shares.Collections at /shares/collections
```

The user can view public collections using [the public collections endpoint](reaction:shares.PublicCollections), including each collection's name and author username, in alphabetical order. Public collections are not included in the shared-with-me list.

```endpoints
shares.PublicCollections at /shares/public-collections
```

The user can view the characters in a collection shared with them using [the collection items endpoint](reaction:shares.CollectionItems), ordered by newest added date.

```endpoints
shares.CollectionItems at /shares/collection-items
```

The user can view the characters in a public collection using [the public collection items endpoint](reaction:shares.PublicCollectionItems), ordered by newest added date.

```endpoints
shares.PublicCollectionItems at /shares/public-collection-items
```

Note: Compositions regarding sharing collections with others are located in the [tags composition file](./tags.md).
