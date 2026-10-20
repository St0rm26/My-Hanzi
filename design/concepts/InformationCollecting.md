# InformationCollecting

## Purpose

Store information about an item, separated by fields.

## Principle

The author specifies desired info fields and information for each item.

## Types

```types
external Item
    The object that carries information.

external Information
    A description of an object. Can be in any format.
```

## State

```state
a set of InfoFields with
    an item Item
    a name String
    a description Information
```

## Actions

```actions
addInfoField (item: Item, fieldName: String, description: Information) : returns (infoField: InfoField)
    where the item exists and the field name does not already exist with the item
    then
        create a new info field with the given item, field name, and information
        returns infoField
    where the item already has an info field with that name
    then
        refuses ALREADY_COLLECTED_INFORMATION "This item already has an info field with that name. Edit it instead."

editInfoField (item: Item, infoField: InfoField, description: Information) : returns (infoField: InfoField)
    where the info field with the item exists
    then
        edit the info field with the new information
        returns infoField
    where the info field does not exist with the item
    then
        refuses INFO_FIELD_NOT_FOUND "This item does not have that info field."

deleteInfoField (item: Item, infoField: InfoField) : returns ()
    where the info field with the item exists
    then
        delete the info field with the given item
        returns
```

## Queries

```queries
_allInformation(item: Item) : many (information: Information)
    Returns one row containing an object that maps each info field name to its information, or an empty object when the item has no information

_information(item: Item, fieldName: String) : one (information: Information)
    Returns the information under an item's particular info field/category

_infoField(item: Item, fieldName: String) : many (infoField: InfoField)
    Returns the identity of the item's named info field, or no rows when it does not exist; field names are unique per item
```
