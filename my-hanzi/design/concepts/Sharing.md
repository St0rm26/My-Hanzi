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
```

## State

```state
a set of SharedItems with
  an author User
  an item Item
  a sharedUser User
  unique author and item and sharedUser
```

## Actions

```actions
shareItem (author: User, item: Item, audience: Users) : returns ()
  where true
  then
    create a shared item with the author and item if needed, and share the item with the given audience
    returns

revokeItem (author: User, item: Item, audience: Users) : returns ()
  where the author, item, and each user in the audience exists under a shared item
  then
    revoke access to the shared item for each user in the audience by deleting the entire shared item
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
```

## Queries

```queries
_sharedItems(user: User) : many (item: Item)
  Return all items that were shared with the user.
```
