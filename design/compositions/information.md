# Information

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use` and is refused with `NOT_SIGNED_IN` otherwise.

The user can access an [item's information](reaction:information.View).

```endpoints
information.View at /information/view
```

If they are interested in looking at a certain info field, they can choose to just [view that field](reaction:information.ViewField)

```endpoints
information.ViewField at /information/view-field
```

The information endpoints are read-only: no public endpoint creates or changes fields. Previously stored fields remain available through these endpoints but are not trusted as dictionary data. Character detail pages use the local dictionary instead and do not read or populate the shared information store. For traditional characters without an exact dictionary record, the frontend uses the simplified pronunciation and meaning, and shows "No information available" for radical and stroke count.
