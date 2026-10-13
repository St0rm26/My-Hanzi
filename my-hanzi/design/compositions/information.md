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

The app can [add an info field](reaction:information.AddField) for an item.

```endpoints
information.AddField at /information/add-field
```

Only the app can [update an info field](reaction:information.UpdateField) for an item by sending its field name and new information. If the field does not exist for that item, the endpoint returns not found.

```endpoints
information.UpdateField at /information/update-field
```
