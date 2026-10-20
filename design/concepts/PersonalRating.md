# PersonalRating

## Purpose

Identify how well an item fulfills a parameter for private use.

## Principle

Raters rate items on a scale, depending on where they believe it belongs best.

## Types

```types
external User
    The person who is assigning these personal ratings.

external Item
    The object being rated.

external Rating
    The rating the user wants to give.
```

## State

```state
a set of DefinedRatings

a set of PersonalRatings with
    a user User
    an item Item
    a rating Rating
    unique user and item
```

## Actions

```actions
addDefinedRatings (ratings: Ratings) : returns (ratings: Ratings)
    where true
    then
        union the existing defined ratings set with the new given set
        returns ratings

removeDefinedRating (rating: Rating) : returns ()
    where the rating exists in the defined ratings set
    then
        remove the rating from the set and from all items with this rating
        returns
    where the rating does not exist in the defined ratings set
    then
        refuses RATING_NOT_DEFINED "This rating is not defined."

addRating (user: User, item: Item, rating: Rating) : returns ()
    where the rating exists in the defined ratings set
    then
        add the given rating to the item with the user, creating a new user and item if needed
        returns
    where the rating does not exist in the defined ratings set
    then
        refuses RATING_NOT_DEFINED "That rating is not defined."
    where the user and item already have a personal rating
    then
        refuses ALREADY_RATED "User has already rated this item. Change the rating instead."

changeRating (user: User, item: Item, rating: Rating) : returns ()
    where a personal rating exists with the user, item, and a rating; the given rating exists in the defined ratings set
    then
        modify the given rating of the item
        returns
    where the rating does not exist in the defined ratings set
    then
        refuses RATING_NOT_DEFINED "That rating is not defined."
    where no personal rating exists for the user and item
    then
        refuses PERSONAL_RATING_NOT_FOUND "User has not rated this item."

deleteRating (user: User, item: Item) : returns ()
    where the user exists and the item is paired with the user and has a rating
    then
        remove the rating from the item
        returns
    where no personal rating exists for the user and item
    then
        refuses PERSONAL_RATING_NOT_FOUND "User has not rated this item."
```

## Queries

```queries
_rating(user: User, item: Item) : optional (rating: Rating)
    Return the user's rating of the particular item.
```
