# Tagging

## Purpose

Label items to indicate the groups it belongs to for personal convenience.

## Principle

When a user tags items, it implies a common grouping between the tagged items.

## Types

```types
external User
    The person who wants to tag an item.

external Item
    The object being tagged.

external ID
    A unique identifier for a tagged item.

opaque IDs
    A set of tagged-item identifiers.
```

## State

```state
a set of Tags with
    an author User
    a name String

a set of TaggedItems with
    a tag Tag
    an optional unique identifier ID
    an addedDate Date
    an item Item
```

## Actions

```actions
createTag (user: User, name: String) : returns (tag: Tag)
    where the tag does not exist with the given user as an author
    then
        create a new tag with the given name and author
        returns tag

renameTag (user: User, tag: Tag, newName: String) : returns (tag: Tag)
    where the tag exists with the given user and the new name isn't the name of another tag the user already has
    then
        rename the tag with the new name
        returns tag

deleteTag (user: User, tag: Tag) : returns ()
    where the tag exists with the given user
    then
        delete the tag
        returns

addItemTag (user: User, tag: Tag, item: Item, date: Date) : returns ()
    where the tag exists with the given user, the item exists, and the tagged items set does not have an item with the given tag
    then
        adds the given item to the tagged item set with the given tag and current date
        returns

removeItemTag (user: User, tag: Tag, item: Item) : returns ()
    where the tag exists with the given user, the item exists, and the tagged items set does have an item with the given tag
    then
        removes the given item from the tagged item set with the given tag
        returns

generateTaggedItemID (user: User, tag: Tag, item: Item) : returns (id: ID)
    where the tag exists with the given user and the tagged items set does have an item with the given tag
    then
        randomly generate a unique ID for the tagged item in the tagged items set
        returns id

findTaggedItemID (user: User, tag: Tag, item: Item) : returns (id: ID)
    where the tag exists with the given user and the tagged items set does have an item and ID with the given tag
    then
        give the ID of the given item
        returns id

findTaggedItemsID (user: User, tag: Tag) : returns (ids: IDs)
    where the tag exists with the given user and the tagged items set exists
    then
        give a set of all IDs of items in the tagged items set
        returns ids
```

## Queries

```queries
_getTaggedItems (tag: Tag) : many (item: Item)
  Returns every item under the given tag. The order of the items is unspecified.
```
