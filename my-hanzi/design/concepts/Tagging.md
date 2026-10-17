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

external Audience
    A set of users with whom a tag is shared.

opaque IDs
    A set of tagged-item identifiers.
```

## State

```state
a set of Tags with
    an author User
    a name String
    an audience Audience

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
    where the tag already exists with the given user as an author
    then
        refuses TAG_ALREADY_EXISTS "This user already has a tag with that name."

renameTag (user: User, tag: Tag, newName: String) : returns (tag: Tag)
    where the tag exists with the given user and the new name isn't the name of another tag the user already has
    then
        rename the tag with the new name
        returns tag
    where the tag does not exist with the given user
    then
        refuses TAG_NOT_FOUND "There is no such tag."
    where another tag has the new name under the given user
    then
        refuses TAG_ALREADY_EXISTS "This user already has a tag with that name."

deleteTag (user: User, tag: Tag) : returns ()
    where the tag's name is "Studied"
    then
        refuses DEFAULT_TAG_CANNOT_BE_DELETED "The default \"Studied\" tag cannot be deleted."
    where the tag exists with the given user
    then
        delete the tag
        returns
    where the tag does not exist with the given user
    then
        refuses TAG_NOT_FOUND "There is no such tag."

captureTagForDeletion (user: User, tag: Tag) : returns (audience: Audience, ids: IDs)
    where the tag exists with the given user and its name is not "Studied"
    then
        give the tag's audience and the identifiers of its tagged items
        returns audience, ids
    where the tag's name is "Studied"
    then
        refuses DEFAULT_TAG_CANNOT_BE_DELETED "The default \"Studied\" tag cannot be deleted."

captureTagSharing (user: User, tag: Tag) : returns (audience: Audience, ids: IDs)
    where the tag exists with the given user
    then
        give the tag's audience and the identifiers of its tagged items
        returns audience, ids

captureItemSharing (user: User, tag: Tag, item: Item) : returns (audience: Audience, ids: IDs)
    where the tag and tagged item exist with the given user
    then
        give the tagged item's identifier if one exists and the tag's audience
        returns audience, ids

addItemTag (user: User, tag: Tag, item: Item, date: Date) : returns ()
    where the tag exists with the given user, the item exists, and the tagged items set does not have an item with the given tag
    then
        adds the given item to the tagged item set with the given tag and current date
        returns
    where the tagged items set already has an item with the given tag
    then
        refuses ITEM_ALREADY_TAGGED "This item already has the given tag."

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

updateAudience (user: User, tag: Tag, audience: Audience) : returns ()
    where the tag exists with the given user
    then
        update the audience for the given tag, replacing the old one
        returns
```

## Queries

```queries
_tags (user: User) : many (tag: Tag, name: String)
    Returns every tag owned by the user, ordered by name.

_tagsContainingItem (user: User, item: Item) : many (tag: Tag)
    Returns the user's tags that contain the given item.

_taggedItems (user: User, tag: Tag) : many (item: Item, addedDate: Date)
  Returns every item under the user's tag, newest added first.

_tagOfItem (user: User, id: ID) : optional (tag: Tag)
  Returns the tag of the given item with the specified ID for the user if it exists.

_audience (user: User, tag: Tag) : many (audience: Audience)
  Returns the audience with which the user's tag is shared.
```
