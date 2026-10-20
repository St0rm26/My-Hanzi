# Accounts

Every user is created by `Registering.register`, which stores the username other people type to find them. `Sessioning.use` returns a session's user on each request. Neither concept refers to the other. Each way of signing in is a composition of its own: it registers or looks up a user, then calls `Sessioning.start`. To reuse accounts, copy this composition with one or more ways of signing in, such as [passwords](passwords.md) and [Commons](commons.md); the frontend calls them through `frontend/src/ui/session.ts`.

The [me endpoint](reaction:accounts.identifying.Me) passes the session to `Sessioning.use`, which returns the user, then responds with the user's username from `Registering._username`. Every endpoint that requires a session starts the same way: `Sessioning.use` returns the session's user, or the request is refused with `NOT_SIGNED_IN`. Each endpoint reads the user from the session, never from the request's inputs. Each way of signing in responds with the user, and the page then calls the me endpoint for the username.

```endpoints
accounts.identifying.Me at /auth/me
```

The [sign-out endpoint](reaction:accounts.leaving.SignOut) ends the session with Sessioning, and the HTTP server clears the cookie. If the person is also signed in on another computer, they stay signed in there.

```endpoints
accounts.leaving.SignOut at /auth/logout
```

The user can search for other registered users by a case-insensitive username substring using [the search endpoint](reaction:accounts.SearchUsers). The search excludes the signed-in user and returns at most 25 matches.

```endpoints
accounts.SearchUsers at /users/search
```
