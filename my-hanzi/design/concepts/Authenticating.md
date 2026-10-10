# Authenticating

## Purpose

Confirm a user's claimed identity.

## Principle

After a user registers with a username and password, they are able to authenticate with those same credentials and be treated as the same user.

## Types

```types
external User
    The person a username and password belongs to.

opaque Secret
    A password verifier derived with a random salt; the implementer chooses how to represent it.
```

## State

```state
a set of Users with
    a verifier Secret

Rule: Authenticating stores only a verifier derived from the password, never the password itself.
```

## Actions

```actions
register (user: User, password: String) : returns (user: User)
    where the user already has a verifier
    then
        refuses PASSWORD_SET "This account already has a password."
    where a user with this username does not exist
    then
        create a new user with this username and password
        returns user

authenticate (user: User, password: String) : returns (user: User)
    where the username exists and the password matches
    then
        returns user
```

## Queries

```queries

```
