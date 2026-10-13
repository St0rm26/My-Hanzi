<!-- Generated from the My Hanzi assembly. Do not edit. -->
<!-- Manifest producer: @mit-sdg/sync-engine@1.1.0; concept specification: sync-engine.concept-specification@1; renderer: @mit-sdg/sync-engine@1.1.0. -->

# My Hanzi — assembled read-back

_Assembled by sync-engine from registered concepts and composition. Edit the concept_
_specifications and composition source, then regenerate this file._

## Concepts

### Authenticating

Defined in [Authenticating](../design/concepts/Authenticating.md), line 1.

#### Actions

- `set(user: User, password: String) : returns (user: User)`
  - Refuses `INVALID_PASSWORD`: A password must have 8 to 128 characters.
  - Refuses `PASSWORD_SET`: This account already has a password.
- `authenticate(user: User, password: String) : returns (user: User)`
  - Refuses `INVALID_CREDENTIALS`: The username or password is incorrect.

#### Queries

- `_acceptable(password: String) : one (acceptable: Flag)`

#### Instances

- `Authenticating` — instance of `Authenticating` — [Application types](../design/types.md), line 28.
  - `User` is `Name` — [Application types](../design/types.md), line 29.

### Federating

Defined in [Federating](../design/concepts/Federating.md), line 1.

#### Actions

- `start() : returns (attempt: Attempt, expiresAt: DateTime, address: String)`
- `finish(attempt: Attempt, nonce: String, code: String) : returns (username: String)`
  - Refuses `SIGN_IN_EXPIRED`: This sign-in has expired. Start again.
  - Refuses `SIGN_IN_REFUSED`: The other site didn't confirm this sign-in. Start again.
- `link(attempt: Attempt, user: User) : returns (user: User)`
  - Refuses `NOT_CONFIRMED`: This sign-in hasn't been confirmed.
  - Refuses `ALREADY_LINKED`: This account on the other site is already linked.

#### Queries

- `_user(attempt: Attempt) : optional (user: User)`
- `_linkable(attempt: Attempt) : one (linkable: Flag)`

#### Instances

- `CommonsFederating` — instance of `Federating` — [Application types](../design/types.md), line 31.
  - `User` is `Name` — [Application types](../design/types.md), line 32.

### InformationCollecting

Defined in [InformationCollecting](../design/concepts/InformationCollecting.md), line 1.

#### Actions

- `addInfoField(item: Item, fieldName: String, description: Information) : returns (infoField: InfoField)`
  - Refuses `ALREADY_COLLECTED_INFORMATION`: This item already has an info field with that name. Edit it instead.
- `editInfoField(item: Item, infoField: InfoField, description: Information) : returns (infoField: InfoField)`
  - Refuses `INFO_FIELD_NOT_FOUND`: This item does not have that info field.
- `deleteInfoField(item: Item, infoField: InfoField) : returns ()`

#### Queries

- `_allInformation(item: Item) : many (information: Information)`
- `_information(item: Item, fieldName: String) : one (information: Information)`
- `_infoField(item: Item, fieldName: String) : many (infoField: InfoField)`

#### Instances

- `InformationCollecting` — instance of `InformationCollecting` — [Application types](../design/types.md), line 34.
  - `Information` is `InformationText` — [Application types](../design/types.md), line 36.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 35.

### PersonalRating

Defined in [PersonalRating](../design/concepts/PersonalRating.md), line 1.

#### Actions

- `addDefinedRatings(ratings: Ratings) : returns (ratings: Ratings)`
- `removeDefinedRating(rating: Rating) : returns ()`
- `addRating(user: User, item: Item, rating: Rating) : returns ()`
- `changeRating(user: User, item: Item, rating: Rating) : returns ()`
- `deleteRating(user: User, item: Item) : returns ()`

#### Queries

- `_rating(user: User, item: Item) : one (rating: Rating)`

#### Instances

- `PersonalRating` — instance of `PersonalRating` — [Application types](../design/types.md), line 38.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 40.
  - `Rating` is `RatingName` — [Application types](../design/types.md), line 41.
  - `User` is `Name` — [Application types](../design/types.md), line 39.

### Registering

Defined in [Registering](../design/concepts/Registering.md), line 1.

#### Actions

- `register(username: String) : returns (user: User)`
  - Refuses `INVALID_USERNAME`: A username must have 3 to 32 letters, digits, underscores, or hyphens.
  - Refuses `USERNAME_TAKEN`: That username is taken.

#### Queries

- `_byUsername(username: String) : optional (user: User)`
- `_username(user: User) : optional (username: String)`

#### Instances

- `Registering` — instance of `Registering` — [Application types](../design/types.md), line 26.

### Reserving

Defined in [Reserving](../design/concepts/Reserving.md), line 1.

#### Actions

- `reserve(user: User, resource: Resource) : returns (reservation: Reservation)`
  - Refuses `ALREADY_RESERVED`: That resource is already reserved.
- `cancel(reservation: Reservation) : returns (reservation: Reservation)`
  - Refuses `NO_SUCH_RESERVATION`: There is no such reservation.

#### Queries

- `_all() : many (reservation: Reservation, user: User, resource: Resource)`

#### Instances

- `Reserving` — instance of `Reserving` — [Application types](../design/types.md), line 55.
  - `Resource` is `Table` — [Application types](../design/types.md), line 57.
  - `User` is `Name` — [Application types](../design/types.md), line 56.

### Sessioning

Defined in [Sessioning](../design/concepts/Sessioning.md), line 1.

#### Actions

- `start(subject: Subject) : returns (session: Session, expiresAt: DateTime)`
- `use(session: Session) : returns (subject: Subject)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.
- `end(session: Session) : returns (session: Session)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.

#### Instances

- `Sessioning` — instance of `Sessioning` — [Application types](../design/types.md), line 43.
  - `Subject` is `Name` — [Application types](../design/types.md), line 44.

### Sharing

Defined in [Sharing](../design/concepts/Sharing.md), line 1.

#### Actions

- `shareItem(author: User, item: Item, audience: Users) : returns ()`
- `revokeItem(author: User, item: Item, audience: Users) : returns ()`
- `deleteItem(author: User, item: Item) : returns ()`
- `deleteItems(author: User, items: Items) : returns ()`

#### Queries

- `_sharedItems(user: User) : many (item: Item)`

#### Instances

- `Sharing` — instance of `Sharing` — [Application types](../design/types.md), line 46.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 48.
  - `User` is `Name` — [Application types](../design/types.md), line 47.

### Tagging

Defined in [Tagging](../design/concepts/Tagging.md), line 1.

#### Actions

- `createTag(user: User, name: String) : returns (tag: Tag)`
  - Refuses `TAG_ALREADY_EXISTS`: This user already has a tag with that name.
- `renameTag(user: User, tag: Tag, newName: String) : returns (tag: Tag)`
  - Refuses `TAG_NOT_FOUND`: There is no such tag.
  - Refuses `TAG_ALREADY_EXISTS`: This user already has a tag with that name.
- `deleteTag(user: User, tag: Tag) : returns ()`
  - Refuses `DEFAULT_TAG_CANNOT_BE_DELETED`: The default "Studied" tag cannot be deleted.
  - Refuses `TAG_NOT_FOUND`: There is no such tag.
- `addItemTag(user: User, tag: Tag, item: Item, date: Date) : returns ()`
- `removeItemTag(user: User, tag: Tag, item: Item) : returns ()`
- `generateTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemsID(user: User, tag: Tag) : returns (ids: IDs)`

#### Queries

- `_tags(user: User) : many (tag: Tag, name: String)`
- `_getTaggedItems(tag: Tag) : many (item: Item)`

#### Instances

- `Tagging` — instance of `Tagging` — [Application types](../design/types.md), line 50.
  - `ID` is `TagName` — [Application types](../design/types.md), line 53.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 52.
  - `User` is `Name` — [Application types](../design/types.md), line 51.

## Application types

Concrete types:

- `InformationText` — [Application types](../design/types.md), line 18.
- `ItemName` — [Application types](../design/types.md), line 12.
- `Name` — [Application types](../design/types.md), line 6.
- `RatingName` — [Application types](../design/types.md), line 15.
- `Table` — [Application types](../design/types.md), line 9.
- `TagName` — [Application types](../design/types.md), line 21.

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### all an item's information

```former
Former "all an item's information" — inputs (item); bindings (information); promises exactly one record — forms:
  a record of
    information: the information of the first InformationCollecting._allInformation (item) has (information)
```

### the reservation book

Authored path: `Reservations.ReservationBook`.
- Covered by [Reservations](../design/compositions/Reservations.md), line 4.

```former
Former "the reservation book" — inputs (); bindings (reservation, user, resource); promises exactly one record — forms:
  a record of
    reservations: each Reserving._all () has (reservation, resource, user)
      form a record of
        reservation
        resource
        user
```

### the tags owned by a user

```former
Former "the tags owned by a user" — inputs (user); bindings (tag, name); promises exactly one record — forms:
  each Tagging._tags (user) has (name, tag)
    form a record of
      name
      tag
```

## Reactions

### DeliverFaultToAsker

```reaction
when any action is faulted, not asked by DeliverFaultToAsker
where
  earlier, RequestBoundary.request (requestId)
then
  RequestBoundary.respondFramework (error: "INTERNAL_ERROR", requestId)
```

### DeliverRefusalToAsker

```reaction
when any action is refused (message), except RequestBoundary
where
  earlier, RequestBoundary.request (requestId)
then
  RequestBoundary.respond (error: message, requestId)
```

### Reservations.Cancel

Authored path: `Reservations.Cancel`.
- Covered by [Reservations](../design/compositions/Reservations.md), line 11.
- Covered by [Reservations](../design/compositions/Reservations.md), line 15.

```reaction
when RequestBoundary.request (path: "/reservations/cancel", requestId, reservation)
then
  Reserving.cancel (reservation)
```

### Reservations.Cancel#2

Authored path: `Reservations.Cancel`.
- Covered by [Reservations](../design/compositions/Reservations.md), line 11.
- Covered by [Reservations](../design/compositions/Reservations.md), line 15.

```reaction
when Reserving.cancel (reservation), asked by Reservations.Cancel
where
  earlier, RequestBoundary.request (path: "/reservations/cancel", requestId, reservation)
then
  RequestBoundary.respond (requestId, reservation)
```

### Reservations.List

Authored path: `Reservations.List`.
- Covered by [Reservations](../design/compositions/Reservations.md), line 3.
- Covered by [Reservations](../design/compositions/Reservations.md), line 7.

```reaction
when RequestBoundary.request (path: "/reservations/list", requestId)
then
  RequestBoundary.respond (book: former "the reservation book", requestId)
```

### Reservations.Reserve

Authored path: `Reservations.Reserve`.
- Covered by [Reservations](../design/compositions/Reservations.md), line 10.
- Covered by [Reservations](../design/compositions/Reservations.md), line 14.

```reaction
when RequestBoundary.request (path: "/reservations/reserve", requestId, resource, user)
then
  Reserving.reserve (resource, user)
```

### Reservations.Reserve#2

Authored path: `Reservations.Reserve`.
- Covered by [Reservations](../design/compositions/Reservations.md), line 10.
- Covered by [Reservations](../design/compositions/Reservations.md), line 14.

```reaction
when Reserving.reserve (resource, user, reservation), asked by Reservations.Reserve
where
  earlier, RequestBoundary.request (path: "/reservations/reserve", requestId, resource, user)
then
  RequestBoundary.respond (requestId, reservation)
```

### accounts.identifying.Me

Authored path: `accounts.identifying.Me`.
- Covered by [Accounts](../design/compositions/accounts.md), line 5.
- Covered by [Accounts](../design/compositions/accounts.md), line 8.

```reaction
when RequestBoundary.request (path: "/auth/me", requestId, session)
then
  Sessioning.use (session)
```

### accounts.identifying.Me#2

Authored path: `accounts.identifying.Me`.
- Covered by [Accounts](../design/compositions/accounts.md), line 5.
- Covered by [Accounts](../design/compositions/accounts.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by accounts.identifying.Me
where
  Registering._username (user) has (username)
  earlier, RequestBoundary.request (path: "/auth/me", requestId, session)
then
  RequestBoundary.respond (requestId, username)
```

### accounts.leaving.SignOut

Authored path: `accounts.leaving.SignOut`.
- Covered by [Accounts](../design/compositions/accounts.md), line 11.
- Covered by [Accounts](../design/compositions/accounts.md), line 14.

```reaction
when RequestBoundary.request (path: "/auth/logout", requestId, session)
then
  Sessioning.end (session)
```

### accounts.leaving.SignOut#2

Authored path: `accounts.leaving.SignOut`.
- Covered by [Accounts](../design/compositions/accounts.md), line 11.
- Covered by [Accounts](../design/compositions/accounts.md), line 14.

```reaction
when Sessioning.end (session), asked by accounts.leaving.SignOut
where
  earlier, RequestBoundary.request (path: "/auth/logout", requestId, session)
then
  RequestBoundary.respond (requestId)
```

### commons.finishing.ChooseUsername:expired

Authored path: `commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 26.

```reaction
when RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
where
  CommonsFederating._linkable (attempt) has (linkable: false)
then
  RequestBoundary.respond (error: "SIGN_IN_EXPIRED", requestId)
```

### commons.finishing.ChooseUsername:linkable

Authored path: `commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 26.

```reaction
when RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
where
  CommonsFederating._linkable (attempt) has (linkable: true)
then
  Registering.register (username)
```

### commons.finishing.ChooseUsername:linkable#2

Authored path: `commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 26.

```reaction
when Registering.register (username, user), asked by commons.finishing.ChooseUsername:linkable
where
  earlier, RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
then
  CommonsFederating.link (attempt, user)
```

### commons.finishing.ChooseUsername:linkable#3

Authored path: `commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 26.

```reaction
when CommonsFederating.link (attempt, user), asked by commons.finishing.ChooseUsername:linkable#2
then
  Sessioning.start (subject: user)
```

### commons.finishing.ChooseUsername:linkable#4

Authored path: `commons.finishing.ChooseUsername`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 22.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 26.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by commons.finishing.ChooseUsername:linkable#3
where
  earlier, RequestBoundary.request (attempt, path: "/auth/commons/choose", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### commons.finishing.FinishCommons

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when RequestBoundary.request (attempt, code, path: "/auth/commons/finish", requestId, state)
then
  CommonsFederating.finish (attempt, code, nonce: state)
```

### commons.finishing.FinishCommons:new#2

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when CommonsFederating.finish (attempt, code, nonce: state, username), asked by commons.finishing.FinishCommons
where
  no CommonsFederating._user (attempt)
then
  Registering.register (username)
```

### commons.finishing.FinishCommons:new#3

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when Registering.register (username, user), asked by commons.finishing.FinishCommons:new#2
where
  earlier, CommonsFederating.finish (attempt, code, nonce: state, username), asked by commons.finishing.FinishCommons
then
  CommonsFederating.link (attempt, user)
```

### commons.finishing.FinishCommons:new#4

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when CommonsFederating.link (attempt, user), asked by commons.finishing.FinishCommons:new#3
then
  Sessioning.start (subject: user)
```

### commons.finishing.FinishCommons:new#5

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by commons.finishing.FinishCommons:new#4
where
  earlier, RequestBoundary.request (attempt, code, path: "/auth/commons/finish", requestId, state)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### commons.finishing.FinishCommons:returning#2

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when CommonsFederating.finish (attempt, code, nonce: state, username), asked by commons.finishing.FinishCommons
where
  CommonsFederating._user (attempt) has (user)
then
  Sessioning.start (subject: user)
```

### commons.finishing.FinishCommons:returning#3

Authored path: `commons.finishing.FinishCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 15.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 25.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by commons.finishing.FinishCommons:returning#2
where
  earlier, RequestBoundary.request (attempt, code, path: "/auth/commons/finish", requestId, state)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### commons.starting.StartCommons

Authored path: `commons.starting.StartCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 7.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 10.

```reaction
when RequestBoundary.request (path: "/auth/commons/start", requestId)
then
  CommonsFederating.start ()
```

### commons.starting.StartCommons#2

Authored path: `commons.starting.StartCommons`.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 7.
- Covered by [Signing in with Commons](../design/compositions/commons.md), line 10.

```reaction
when CommonsFederating.start (address, attempt, expiresAt), asked by commons.starting.StartCommons
where
  earlier, RequestBoundary.request (path: "/auth/commons/start", requestId)
then
  RequestBoundary.respond (address, attempt, expiresAt, requestId)
```

### information.UpdateField:found

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 15.
- Covered by [Information](../design/compositions/information.md), line 18.

```reaction
when RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId)
where
  InformationCollecting._infoField (fieldName, item) has (infoField)
then
  InformationCollecting.editInfoField (description, infoField, item)
```

### information.UpdateField:found#2

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 15.
- Covered by [Information](../design/compositions/information.md), line 18.

```reaction
when InformationCollecting.editInfoField (description, infoField, item), asked by information.UpdateField:found
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId)
then
  RequestBoundary.respond (requestId)
```

### information.UpdateField:missing

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 15.
- Covered by [Information](../design/compositions/information.md), line 18.

```reaction
when RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId)
where
  no InformationCollecting._infoField (fieldName, item)
then
  RequestBoundary.respond (error: "INFO_FIELD_NOT_FOUND", requestId)
```

### information.View

Authored path: `information.View`.
- Covered by [Information](../design/compositions/information.md), line 3.
- Covered by [Information](../design/compositions/information.md), line 6.

```reaction
when RequestBoundary.request (item, path: "/information/view", requestId)
then
  RequestBoundary.respond (information: former "all an item's information" with (item), requestId)
```

### information.ViewField

Authored path: `information.ViewField`.
- Covered by [Information](../design/compositions/information.md), line 9.
- Covered by [Information](../design/compositions/information.md), line 12.

```reaction
when RequestBoundary.request (fieldName, item, path: "/information/view-field", requestId)
where
  InformationCollecting._information (fieldName, item) has (information)
then
  RequestBoundary.respond (information, requestId)
```

### passwords.entering.Register:accepted

Authored path: `passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/passwords.md), line 12.

```reaction
when RequestBoundary.request (password, path: "/auth/register", requestId, username)
where
  Authenticating._acceptable (password) has (acceptable: true)
then
  Registering.register (username)
```

### passwords.entering.Register:accepted#2

Authored path: `passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/passwords.md), line 12.

```reaction
when Registering.register (username, user), asked by passwords.entering.Register:accepted
where
  earlier, RequestBoundary.request (password, path: "/auth/register", requestId, username)
then
  Authenticating.set (password, user)
```

### passwords.entering.Register:accepted#3

Authored path: `passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/passwords.md), line 12.

```reaction
when Authenticating.set (password, user), asked by passwords.entering.Register:accepted#2
then
  Sessioning.start (subject: user)
```

### passwords.entering.Register:accepted#4

Authored path: `passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/passwords.md), line 12.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by passwords.entering.Register:accepted#3
where
  earlier, RequestBoundary.request (password, path: "/auth/register", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### passwords.entering.Register:refused

Authored path: `passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/passwords.md), line 12.

```reaction
when RequestBoundary.request (password, path: "/auth/register", requestId, username)
where
  Authenticating._acceptable (password) has (acceptable: false)
then
  RequestBoundary.respond (error: "INVALID_PASSWORD", requestId)
```

### passwords.entering.SignIn:known

Authored path: `passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/passwords.md), line 13.

```reaction
when RequestBoundary.request (password, path: "/auth/login", requestId, username)
where
  Registering._byUsername (username) has (user)
then
  Authenticating.authenticate (password, user)
```

### passwords.entering.SignIn:known#2

Authored path: `passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/passwords.md), line 13.

```reaction
when Authenticating.authenticate (password, user), asked by passwords.entering.SignIn:known
then
  Sessioning.start (subject: user)
```

### passwords.entering.SignIn:known#3

Authored path: `passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/passwords.md), line 13.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by passwords.entering.SignIn:known#2
where
  earlier, RequestBoundary.request (password, path: "/auth/login", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### passwords.entering.SignIn:unknown

Authored path: `passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/passwords.md), line 13.

```reaction
when RequestBoundary.request (password, path: "/auth/login", requestId, username)
where
  no Registering._byUsername (username)
then
  RequestBoundary.respond (error: "INVALID_CREDENTIALS", requestId)
```

### tags.CreateTag

Authored path: `tags.CreateTag`.
- Covered by [Tags](../design/compositions/tags.md), line 9.
- Covered by [Tags](../design/compositions/tags.md), line 12.

```reaction
when RequestBoundary.request (name, path: "/tags/create-tag", requestId, user)
then
  Tagging.createTag (name, user)
```

### tags.CreateTag#2

Authored path: `tags.CreateTag`.
- Covered by [Tags](../design/compositions/tags.md), line 9.
- Covered by [Tags](../design/compositions/tags.md), line 12.

```reaction
when Tagging.createTag (name, user, tag), asked by tags.CreateTag
where
  earlier, RequestBoundary.request (name, path: "/tags/create-tag", requestId, user)
then
  RequestBoundary.respond (requestId, tag)
```

### tags.DeleteTag

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 21.
- Covered by [Tags](../design/compositions/tags.md), line 24.

```reaction
when RequestBoundary.request (path: "/tags/delete-tag", requestId, tag, user)
then
  Tagging.deleteTag (tag, user)
```

### tags.DeleteTag#2

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 21.
- Covered by [Tags](../design/compositions/tags.md), line 24.

```reaction
when Tagging.deleteTag (tag, user), asked by tags.DeleteTag
where
  earlier, RequestBoundary.request (path: "/tags/delete-tag", requestId, tag, user)
then
  RequestBoundary.respond (requestId)
```

### tags.EditTag

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 15.
- Covered by [Tags](../design/compositions/tags.md), line 18.

```reaction
when RequestBoundary.request (name, path: "/tags/edit-tag", requestId, tag, user)
then
  Tagging.renameTag (newName: name, tag, user)
```

### tags.EditTag#2

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 15.
- Covered by [Tags](../design/compositions/tags.md), line 18.

```reaction
when Tagging.renameTag (newName: name, tag, user), asked by tags.EditTag
where
  earlier, RequestBoundary.request (name, path: "/tags/edit-tag", requestId, tag, user)
then
  RequestBoundary.respond (requestId, tag)
```

### tags.List

Authored path: `tags.List`.
- Covered by [Tags](../design/compositions/tags.md), line 3.
- Covered by [Tags](../design/compositions/tags.md), line 6.

```reaction
when RequestBoundary.request (path: "/tags/list", requestId, user)
then
  RequestBoundary.respond (requestId, tags: former "the tags owned by a user" with (user))
```

## Endpoint input contracts

Before recording an action ask, the boundary rejects a body that is not an
object or lacks a required key. The response uses `INVALID_INPUT` and names
the path or missing key. A declared default fills an absent key. Endpoints
not listed here have no explicit input contract.

- `/auth/commons/choose` — requires `attempt`, `username`
- `/auth/commons/finish` — requires `attempt`, `code`, `state`
- `/auth/login` — requires `password`, `username`
- `/auth/logout` — requires `session`
- `/auth/me` — requires `session`
- `/auth/register` — requires `password`, `username`
- `/information/update-field` — requires `item`, `fieldName`, `description`
- `/information/view` — requires `item`
- `/information/view-field` — requires `item`, `fieldName`
- `/reservations/cancel` — requires `reservation`
- `/reservations/reserve` — requires `user`, `resource`
- `/tags/create-tag` — requires `user`, `name`
- `/tags/delete-tag` — requires `user`, `tag`
- `/tags/edit-tag` — requires `user`, `tag`, `name`
- `/tags/list` — requires `user`
