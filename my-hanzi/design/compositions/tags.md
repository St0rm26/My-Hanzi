# Tags

When a user registers, the system [creates a tag called "Studied"](../reactions/Initialize.md) for them from a reaction. The [collections list](reaction:tags.List) returns all tags a user has.

```endpoints
tags.List at /tags/list
```

Anyone can [create their own tag](reaction:tags.CreateTag) for themselves as long as the name hasn't already been used.

```endpoints
tags.CreateTag at /tags/create-tag
```

Anyone can [edit their own tag](reaction:tags.EditTag) as long as the tag exists.

```endpoints
tags.EditTag at /tags/edit-tag
```

Anyone can [delete a tag](reaction:tags.DeleteTag) other than the default "Studied" collection.

```endpoints
tags.DeleteTag at /tags/delete-tag
```

After deleting a tag, there is a reaction that finds the unique IDs of all items with that tag, then executes another reaction that [removes the tag from each item and revokes access from its shared audience](../reactions/DeleteCollection.md).

From a character detail page, a user can [add the character to a collection](reaction:tags.AddItem). The server records when it was added.

```endpoints
tags.AddItem at /tags/add-item
```

The character detail page can also [load the collections that already contain that character](reaction:tags.ItemMembership).

```endpoints
tags.ItemMembership at /tags/item-membership
```

After adding a tag to an item, a reaction [generates a unique ID](../reactions/GenerateCharacterId.md) for the tagged item and then [shares the tagged item](../reactions/AddCharacter.md) with no one.

From a character detail page, a user can also [remove the character from a collection](reaction:tags.RemoveItem).

```endpoints
tags.RemoveItem at /tags/remove-item
```

After removing a tag from an item, a reaction first [finds the item's unique ID](../reactions/FindCharacterId.md), then [removes the tagged item and revokes access from its shared audience](../reactions/RemoveCharacter.md).
