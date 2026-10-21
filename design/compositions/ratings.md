# Rating

Every endpoint below requires a signed-in session, as described in [accounts](accounts.md). Each one passes the session to `Sessioning.use` and is refused with `NOT_SIGNED_IN` otherwise. The user's identity always comes from that session.

The user can [rate a character](reaction:ratings.Rate). If they have already rated it, the old rating is replaced.

```endpoints
ratings.Rate at /rating/rate
```

The user can [remove their rating for a character](reaction:ratings.Remove) if a rating exists.

```endpoints
ratings.Remove at /rating/remove
```

The user can also [view their rating for a character](reaction:ratings.View). The endpoint returns the `ItemRating` record when a rating exists, or `null` when it does not.

```endpoints
ratings.View at /rating/view
```

The app can [add defined ratings for users to use](reaction:ratings.AddDefinedRatings). The endpoint accepts a list and adds its values to the existing definitions.

The defined personal ratings are, in order, "Mastered", "Confident", "Medium", "Hard", and "Difficult". On a character detail page, the user can open the personal rating picker, which presents those choices. Selecting a choice adds or replaces the user's rating for that character. In benchmarks and collections, characters display their personal rating or "None", and users can filter the characters by rating.

```endpoints
ratings.AddDefinedRatings at /rating/add-defined-ratings
```
