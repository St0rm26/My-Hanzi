# Sharing

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only share their own collections and view only collections shared with them.

The user can [view all items shared with them along with their collection tags](reaction:shares.Shared).

```endpoints
shares.Shared at /shares/shared
```

Note: Compositions regarding sharing collections with others are located in the [tags composition file](./tags.md).
