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

When dictionary data becomes available for a character after placeholder values were saved, the frontend uses the dictionary values instead of the known unavailable placeholders. For traditional characters, an exact dictionary record takes precedence over values previously populated from a simplified character; other saved information remains unchanged. If no exact traditional record exists, the frontend uses the simplified pronunciation and meaning, and shows "No information available" for radical and stroke count as those are the only fields dependent on the traditional character's structure.
