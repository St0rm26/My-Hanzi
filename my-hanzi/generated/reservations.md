<!-- Generated from the Reservations assembly. Do not edit. -->
<!-- Manifest producer: @mit-sdg/sync-engine@1.1.0; concept specification: sync-engine.concept-specification@1; renderer: @mit-sdg/sync-engine@1.1.0. -->

# Reservations — assembled read-back

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
- `editInfoField(item: Item, infoField: InfoField, description: Information) : returns (infoField: InfoField)`
- `deleteInfoField(item: Item, infoField: InfoField) : returns ()`

#### Queries

- `_allInformation(item: Item) : many (information: Information)`
- `_information(item: Item, fieldName: String) : one (information: Information)`

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
- `renameTag(user: User, tag: Tag, newName: String) : returns (tag: Tag)`
- `deleteTag(user: User, tag: Tag) : returns ()`
- `addItemTag(user: User, tag: Tag, item: Item, date: Date) : returns ()`
- `removeItemTag(user: User, tag: Tag, item: Item) : returns ()`
- `generateTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemsID(user: User, tag: Tag) : returns (ids: IDs)`

#### Queries

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

## Endpoint input contracts

Before recording an action ask, the boundary rejects a body that is not an
object or lacks a required key. The response uses `INVALID_INPUT` and names
the path or missing key. A declared default fills an absent key. Endpoints
not listed here have no explicit input contract.

- `/reservations/cancel` — requires `reservation`
- `/reservations/reserve` — requires `user`, `resource`
