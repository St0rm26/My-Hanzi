# Authenticating

## Purpose

Confirm a user's claimed identity.

## Principle

After a user registers with a username and password, they are able to authenticate with those same credentials and be treated as the same user.

## Types

```types
external User
    The person a username and password belongs to.
```

## State

```state
a set of Users with
    a username String
    a password String
```

## Actions

```actions
register (username: String, password: String) : returns (user: User)
    where a user with this username does not exist
    then
        create a new user with this username and password
        returns user

authenticate (username: String, password: String) : returns (user: User)
    where the username exists and the password matches
    then
        returns user
```

## Queries

```queries

```
