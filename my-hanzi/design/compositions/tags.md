# Tags

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use`, which returns the user, and is refused with `NOT_SIGNED_IN` otherwise. The user is never read from the request's inputs, so people can only see, change, and share their own collections.

When a user registers, [a reaction creates a tag called "Studied"](reaction:tags.Initialize) for them. The [collections list](reaction:tags.List) returns all tags the signed-in user has.

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

The user can share their tag with a specific audience using [the share endpoint](reaction:tags.Share). The endpoint captures the current audience and tagged item IDs with `Tagging.captureTagSharing`, revokes the previous shares, and replaces the tag's audience; [a reaction shares the tagged items with each new audience member](reaction:tags.ShareCollection).

```endpoints
tags.Share at /tags/share
```

The user can view the usernames and identities in a tag's current sharing audience before editing it with [the audience endpoint](reaction:tags.Audience).

```endpoints
tags.Audience at /tags/audience
```

The user can [edit their own tag](reaction:tags.EditTag) as long as the tag exists.

```endpoints
tags.EditTag at /tags/edit-tag
```

The user can [delete a tag other than the default "Studied" collection](reaction:tags.DeleteTag) with [the delete endpoint](reaction:tags.DeleteTag). The endpoint captures the tag's audience and tagged item IDs with `Tagging.captureTagForDeletion`, revokes sharing, and then deletes the tag.

```endpoints
tags.DeleteTag at /tags/delete-tag
```

From a character detail page, the user can [add the character to a collection](reaction:tags.AddItem). The server records when it was added.

```endpoints
tags.AddItem at /tags/add-item
```

The character detail page can also [load the collections that already contain that character](reaction:tags.ItemMembership).

```endpoints
tags.ItemMembership at /tags/item-membership
```

After adding a tag to an item, reactions [check whether to update benchmarks](reaction:tags.AddCharacter) and [share the item with the collection's audience](reaction:tags.ShareCharacter).

When the user [removes a character from a collection with the remove endpoint](reaction:tags.RemoveItem), the endpoint captures its ID and audience with `Tagging.captureItemSharing`, revokes sharing, and then deletes the membership. A reaction [checks whether to update benchmarks](reaction:tags.RemoveCharacter).

```endpoints
tags.RemoveItem at /tags/remove-item
```
