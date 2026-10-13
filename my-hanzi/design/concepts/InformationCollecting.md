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

editInfoField (item: Item, infoField: InfoField, description: Information) : returns (infoField: InfoField)
    where the info field with the item exists
    then
        edit the info field with the new information
        returns infoField

deleteInfoField (item: Item, infoField: InfoField) : returns ()
    where the info field with the item exists
    then
        delete the info field with the given item
        returns
```

## Queries

```queries
_allInformation(item: Item) : one (information: Information)
    Returns an object mapping each info field name to its information, or an empty object when the item has no information

_information(item: Item, fieldName: String) : one (information: Information)
    Returns the information under an item's particular info field/category
```
