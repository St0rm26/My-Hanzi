# Tags

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only see and change their own collections.

When a user registers, [a reaction creates a tag called "Studied"](reaction:tags.Initialize) for them (see also [Initialize](../reactions/Initialize.md)). The [collections list](reaction:tags.List) returns all tags the signed-in user has.

```endpoints
tags.List at /tags/list
```

The user can [view the items under one of their tags](reaction:tags.Items), ordered by newest added first.

```endpoints
tags.Items at /tags/items
```

The user can [create a tag](reaction:tags.CreateTag) for themselves as long as the name hasn't already been used.

```endpoints
tags.CreateTag at /tags/create-tag
```

The user can [edit their own tag](reaction:tags.EditTag) as long as the tag exists.

```endpoints
tags.EditTag at /tags/edit-tag
```

The user can [delete a tag](reaction:tags.DeleteTag) other than the default "Studied" collection.

```endpoints
tags.DeleteTag at /tags/delete-tag
```

After deleting a tag, there is a reaction that finds the unique IDs of all items with that tag, then executes another reaction that [removes the tag from each item and revokes access from its shared audience](../reactions/DeleteCollection.md).

From a character detail page, the user can [add the character to a collection](reaction:tags.AddItem). The server records when it was added.

```endpoints
tags.AddItem at /tags/add-item
```

The character detail page can also [load the collections that already contain that character](reaction:tags.ItemMembership).

```endpoints
tags.ItemMembership at /tags/item-membership
```

After adding a tag to an item, a reaction [generates a unique ID](../reactions/GenerateCharacterId.md) for the tagged item and then [shares the tagged item](../reactions/AddCharacter.md) with no one.

From a character detail page, the user can also [remove the character from a collection](reaction:tags.RemoveItem).

```endpoints
tags.RemoveItem at /tags/remove-item
```

After removing a tag from an item, a reaction first [finds the item's unique ID](../reactions/FindCharacterId.md), then [removes the tagged item and revokes access from its shared audience](../reactions/RemoveCharacter.md).
