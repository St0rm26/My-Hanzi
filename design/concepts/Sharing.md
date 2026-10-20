# Sharing

## Purpose

Share an item with others for viewing purposes.

## Principle

The author selects the audience they want to share an item to, who can now view the item.

## Types

```types
external User
  A person one can share things with.

external Item
  The thing being shared with the user.

external Tag
  The tag a specific item belongs to.

external Boolean
  Whether a collection is public.
```

## State

```state
a set of SharedItems with
  an author User
  an item Item
  a sharedUser User
  unique author and item and sharedUser

a set of PublicItems with
  an author User
  a tag Tag
  an item Item
  unique author and tag and item

```

## Actions

```actions
shareItem (author: User, item: Item, audience: Users) : returns ()
  where true
  then
    create a shared item with the author and item if needed, and share the item with the given audience
    returns

shareItems (author: User, items: Items, audience: Users) : returns ()
  where true
  then
    create shared items with the author and each item if needed, and share the items with the given audience
    returns

revokeItem (author: User, item: Item, audience: Users) : returns ()
  where the author, item, and each user in the audience exists under a shared item
  then
    revoke access to the shared item for each user in the audience by deleting the entire shared item
    returns

revokeItems (author: User, items: Items, audience: Users) : returns ()
  where the author, each item in the set of items, and each user in the audience exists under a shared item
  then
    revoke access to the shared items for each user in the audience by deleting the entire shared items
    returns
  where the items are not distinct
  then
    refuses SHARED_ITEMS_NOT_DISTINCT "All items must be distinct."

setPublic (author: User, tag: Tag, items: Items) : returns ()
  where the author owns the tag and the items are not empty
  then
    create a public item for each item in the tag
    returns
  where the items are empty
  then
    refuses PUBLIC_ITEMS_EMPTY "Add at least one item before making this collection public."

setPrivate (author: User, tag: Tag) : returns ()
  where the author exists and owns the tag
  then
    remove all public items in the tag
    returns

addPublicItems (author: User, tag: Tag, items: Items) : returns ()
  where the author and items exist, the author owns the tag, and the tag is public
  then
    make each item in the tag public
    returns
  where the tag is not public
  then
    refuses TAG_NOT_PUBLIC "The tag is not public."

addPublicItem (author: User, tag: Tag, item: Item) : returns ()
  where the author and item exist, the author owns the tag, and the tag is public
  then
    make the item public in the tag
    returns
  where the tag is not public
  then
    refuses TAG_NOT_PUBLIC "The tag is not public."

removePublicItems (author: User, tag: Tag, items: Items) : returns ()
  where the author exists, owns the tag, and the items exist under the given tag
  then
    remove public access to the given items in the tag
    returns

deleteItem (author: User, item: Item) : returns ()
  where the author and item exists under a shared item
  then
    remove the item and revoke access for shared users
    returns

deleteItems (author: User, items: Items) : returns ()
  where the author and each item in the set of items exist under a shared item
  then
    remove the items and revoke accesses for shared users
    returns
  where the items are not distinct
  then
    refuses SHARED_ITEMS_NOT_DISTINCT "All items must be distinct."
```

## Queries

```queries
_sharedItems(user: User) : many (item: Item)
  Return all items that were shared with the user.

_publicItems(tag: Tag) : many (author: User, item: Item)
  Return all public items in the tag.

_publicCollections(user: User) : many (author: User, tag: Tag)
  Return tags containing public items.

_publicStatus(author: User, tag: Tag) : many (isPublic: Boolean)
  Return whether the tag is public.
```
