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

- `Authenticating` — instance of `Authenticating` — [Application types](../design/types.md), line 25.
  - `User` is `Name` — [Application types](../design/types.md), line 26.

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

- `CommonsFederating` — instance of `Federating` — [Application types](../design/types.md), line 28.
  - `User` is `Name` — [Application types](../design/types.md), line 29.

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

- `InformationCollecting` — instance of `InformationCollecting` — [Application types](../design/types.md), line 31.
  - `Information` is `InformationText` — [Application types](../design/types.md), line 33.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 32.

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

- `PersonalRating` — instance of `PersonalRating` — [Application types](../design/types.md), line 35.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 37.
  - `Rating` is `RatingName` — [Application types](../design/types.md), line 38.
  - `User` is `Name` — [Application types](../design/types.md), line 36.

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

- `Registering` — instance of `Registering` — [Application types](../design/types.md), line 23.

### Sessioning

Defined in [Sessioning](../design/concepts/Sessioning.md), line 1.

#### Actions

- `start(subject: Subject) : returns (session: Session, expiresAt: DateTime)`
- `use(session: Session) : returns (subject: Subject)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.
- `end(session: Session) : returns (session: Session)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.

#### Instances

- `Sessioning` — instance of `Sessioning` — [Application types](../design/types.md), line 40.
  - `Subject` is `Name` — [Application types](../design/types.md), line 41.

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

- `Sharing` — instance of `Sharing` — [Application types](../design/types.md), line 43.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 45.
  - `User` is `Name` — [Application types](../design/types.md), line 44.

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
  - Refuses `ITEM_ALREADY_TAGGED`: This item already has the given tag.
- `removeItemTag(user: User, tag: Tag, item: Item) : returns ()`
- `generateTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemsID(user: User, tag: Tag) : returns (ids: IDs)`

#### Queries

- `_tags(user: User) : many (tag: Tag, name: String)`
- `_tagsContainingItem(user: User, item: Item) : many (tag: Tag)`
- `_taggedItems(user: User, tag: Tag) : many (item: Item, addedDate: Date)`

#### Instances

- `Tagging` — instance of `Tagging` — [Application types](../design/types.md), line 47.
  - `ID` is `TagName` — [Application types](../design/types.md), line 50.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 49.
  - `User` is `Name` — [Application types](../design/types.md), line 48.

## Application types

Concrete types:

- `InformationText` — [Application types](../design/types.md), line 15.
- `ItemName` — [Application types](../design/types.md), line 9.
- `Name` — [Application types](../design/types.md), line 6.
- `RatingName` — [Application types](../design/types.md), line 12.
- `TagName` — [Application types](../design/types.md), line 18.

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### all an item's information

```former
Former "all an item's information" — inputs (item); bindings (information); promises exactly one record — forms:
  a record of
    information: the information of the first InformationCollecting._allInformation (item) has (information)
```

### the items in a user's collection

```former
Former "the items in a user's collection" — inputs (user, tag); bindings (item, addedDate); promises exactly one record — forms:
  each Tagging._taggedItems (tag, user) has (addedDate, item)
    form a record of
      addedDate
      item
```

### the tags owned by a user

```former
Former "the tags owned by a user" — inputs (user); bindings (tag, name); promises exactly one record — forms:
  each Tagging._tags (user) has (name, tag)
    form a record of
      name
      tag
```

### the user's collections containing an item

```former
Former "the user's collections containing an item" — inputs (user, item); bindings (tag); promises exactly one record — forms:
  each Tagging._tagsContainingItem (item, user) has (tag)
    form a record of
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

### information.AddField

Authored path: `information.AddField`.
- Covered by [Information](../design/compositions/information.md), line 11.
- Covered by [Information](../design/compositions/information.md), line 14.

```reaction
when RequestBoundary.request (description, fieldName, item, path: "/information/add-field", requestId, session)
then
  Sessioning.use (session)
```

### information.AddField#2

Authored path: `information.AddField`.
- Covered by [Information](../design/compositions/information.md), line 11.
- Covered by [Information](../design/compositions/information.md), line 14.

```reaction
when Sessioning.use (session), asked by information.AddField
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/add-field", requestId, session)
then
  InformationCollecting.addInfoField (description, fieldName, item)
```

### information.AddField#3

Authored path: `information.AddField`.
- Covered by [Information](../design/compositions/information.md), line 11.
- Covered by [Information](../design/compositions/information.md), line 14.

```reaction
when InformationCollecting.addInfoField (description, fieldName, item, infoField), asked by information.AddField#2
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/add-field", requestId, session)
then
  RequestBoundary.respond (infoField, requestId)
```

### information.UpdateField

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 23.
- Covered by [Information](../design/compositions/information.md), line 26.

```reaction
when RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId, session)
then
  Sessioning.use (session)
```

### information.UpdateField:found#2

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 23.
- Covered by [Information](../design/compositions/information.md), line 26.

```reaction
when Sessioning.use (session), asked by information.UpdateField
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId, session)
  InformationCollecting._infoField (fieldName, item) has (infoField)
then
  InformationCollecting.editInfoField (description, infoField, item)
```

### information.UpdateField:found#3

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 23.
- Covered by [Information](../design/compositions/information.md), line 26.

```reaction
when InformationCollecting.editInfoField (description, infoField, item), asked by information.UpdateField:found#2
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId, session)
then
  RequestBoundary.respond (requestId)
```

### information.UpdateField:missing#2

Authored path: `information.UpdateField`.
- Covered by [Information](../design/compositions/information.md), line 23.
- Covered by [Information](../design/compositions/information.md), line 26.

```reaction
when Sessioning.use (session), asked by information.UpdateField
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/update-field", requestId, session)
  no InformationCollecting._infoField (fieldName, item)
then
  RequestBoundary.respond (error: "INFO_FIELD_NOT_FOUND", requestId)
```

### information.View

Authored path: `information.View`.
- Covered by [Information](../design/compositions/information.md), line 5.
- Covered by [Information](../design/compositions/information.md), line 8.

```reaction
when RequestBoundary.request (item, path: "/information/view", requestId, session)
then
  Sessioning.use (session)
```

### information.View#2

Authored path: `information.View`.
- Covered by [Information](../design/compositions/information.md), line 5.
- Covered by [Information](../design/compositions/information.md), line 8.

```reaction
when Sessioning.use (session), asked by information.View
where
  earlier, RequestBoundary.request (item, path: "/information/view", requestId, session)
then
  RequestBoundary.respond (information: former "all an item's information" with (item), requestId)
```

### information.ViewField

Authored path: `information.ViewField`.
- Covered by [Information](../design/compositions/information.md), line 17.
- Covered by [Information](../design/compositions/information.md), line 20.

```reaction
when RequestBoundary.request (fieldName, item, path: "/information/view-field", requestId, session)
then
  Sessioning.use (session)
```

### information.ViewField#2

Authored path: `information.ViewField`.
- Covered by [Information](../design/compositions/information.md), line 17.
- Covered by [Information](../design/compositions/information.md), line 20.

```reaction
when Sessioning.use (session), asked by information.ViewField
where
  earlier, RequestBoundary.request (fieldName, item, path: "/information/view-field", requestId, session)
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

### tags.AddItem

Authored path: `tags.AddItem`.
- Covered by [Tags](../design/compositions/tags.md), line 37.
- Covered by [Tags](../design/compositions/tags.md), line 40.

```reaction
when RequestBoundary.request (item, path: "/tags/add-item", requestId, session, tag)
where
  date is the current flow's instant
then
  Sessioning.use (session)
```

### tags.AddItem#2

Authored path: `tags.AddItem`.
- Covered by [Tags](../design/compositions/tags.md), line 37.
- Covered by [Tags](../design/compositions/tags.md), line 40.

```reaction
when Sessioning.use (session, subject: user), asked by tags.AddItem
where
  earlier, RequestBoundary.request (item, path: "/tags/add-item", requestId, session, tag)
  date is the current flow's instant
then
  Tagging.addItemTag (date, item, tag, user)
```

### tags.AddItem#3

Authored path: `tags.AddItem`.
- Covered by [Tags](../design/compositions/tags.md), line 37.
- Covered by [Tags](../design/compositions/tags.md), line 40.

```reaction
when Tagging.addItemTag (date, item, tag, user), asked by tags.AddItem#2
where
  earlier, RequestBoundary.request (item, path: "/tags/add-item", requestId, session, tag)
then
  RequestBoundary.respond (requestId)
```

### tags.CreateTag

Authored path: `tags.CreateTag`.
- Covered by [Tags](../design/compositions/tags.md), line 17.
- Covered by [Tags](../design/compositions/tags.md), line 20.

```reaction
when RequestBoundary.request (name, path: "/tags/create-tag", requestId, session)
then
  Sessioning.use (session)
```

### tags.CreateTag#2

Authored path: `tags.CreateTag`.
- Covered by [Tags](../design/compositions/tags.md), line 17.
- Covered by [Tags](../design/compositions/tags.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by tags.CreateTag
where
  earlier, RequestBoundary.request (name, path: "/tags/create-tag", requestId, session)
then
  Tagging.createTag (name, user)
```

### tags.CreateTag#3

Authored path: `tags.CreateTag`.
- Covered by [Tags](../design/compositions/tags.md), line 17.
- Covered by [Tags](../design/compositions/tags.md), line 20.

```reaction
when Tagging.createTag (name, user, tag), asked by tags.CreateTag#2
where
  earlier, RequestBoundary.request (name, path: "/tags/create-tag", requestId, session)
then
  RequestBoundary.respond (requestId, tag)
```

### tags.DeleteTag

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 29.
- Covered by [Tags](../design/compositions/tags.md), line 32.

```reaction
when RequestBoundary.request (path: "/tags/delete-tag", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.DeleteTag#2

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 29.
- Covered by [Tags](../design/compositions/tags.md), line 32.

```reaction
when Sessioning.use (session, subject: user), asked by tags.DeleteTag
where
  earlier, RequestBoundary.request (path: "/tags/delete-tag", requestId, session, tag)
then
  Tagging.deleteTag (tag, user)
```

### tags.DeleteTag#3

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 29.
- Covered by [Tags](../design/compositions/tags.md), line 32.

```reaction
when Tagging.deleteTag (tag, user), asked by tags.DeleteTag#2
where
  earlier, RequestBoundary.request (path: "/tags/delete-tag", requestId, session, tag)
then
  RequestBoundary.respond (requestId)
```

### tags.EditTag

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when RequestBoundary.request (name, path: "/tags/edit-tag", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.EditTag#2

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when Sessioning.use (session, subject: user), asked by tags.EditTag
where
  earlier, RequestBoundary.request (name, path: "/tags/edit-tag", requestId, session, tag)
then
  Tagging.renameTag (newName: name, tag, user)
```

### tags.EditTag#3

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when Tagging.renameTag (newName: name, tag, user), asked by tags.EditTag#2
where
  earlier, RequestBoundary.request (name, path: "/tags/edit-tag", requestId, session, tag)
then
  RequestBoundary.respond (requestId, tag)
```

### tags.Initialize

Authored path: `tags.Initialize`.
- Covered by [Tags](../design/compositions/tags.md), line 5.

```reaction
when Registering.register (user)
then
  Tagging.createTag (name: "Studied", user)
```

### tags.ItemMembership

Authored path: `tags.ItemMembership`.
- Covered by [Tags](../design/compositions/tags.md), line 43.
- Covered by [Tags](../design/compositions/tags.md), line 46.

```reaction
when RequestBoundary.request (item, path: "/tags/item-membership", requestId, session)
then
  Sessioning.use (session)
```

### tags.ItemMembership#2

Authored path: `tags.ItemMembership`.
- Covered by [Tags](../design/compositions/tags.md), line 43.
- Covered by [Tags](../design/compositions/tags.md), line 46.

```reaction
when Sessioning.use (session, subject: user), asked by tags.ItemMembership
where
  earlier, RequestBoundary.request (item, path: "/tags/item-membership", requestId, session)
then
  RequestBoundary.respond (requestId, tags: former "the user's collections containing an item" with (item, user))
```

### tags.Items

Authored path: `tags.Items`.
- Covered by [Tags](../design/compositions/tags.md), line 11.
- Covered by [Tags](../design/compositions/tags.md), line 14.

```reaction
when RequestBoundary.request (path: "/tags/items", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.Items#2

Authored path: `tags.Items`.
- Covered by [Tags](../design/compositions/tags.md), line 11.
- Covered by [Tags](../design/compositions/tags.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by tags.Items
where
  earlier, RequestBoundary.request (path: "/tags/items", requestId, session, tag)
then
  RequestBoundary.respond (items: former "the items in a user's collection" with (tag, user), requestId)
```

### tags.List

Authored path: `tags.List`.
- Covered by [Tags](../design/compositions/tags.md), line 5.
- Covered by [Tags](../design/compositions/tags.md), line 8.

```reaction
when RequestBoundary.request (path: "/tags/list", requestId, session)
then
  Sessioning.use (session)
```

### tags.List#2

Authored path: `tags.List`.
- Covered by [Tags](../design/compositions/tags.md), line 5.
- Covered by [Tags](../design/compositions/tags.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by tags.List
where
  earlier, RequestBoundary.request (path: "/tags/list", requestId, session)
then
  RequestBoundary.respond (requestId, tags: former "the tags owned by a user" with (user))
```

### tags.RemoveItem

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 51.
- Covered by [Tags](../design/compositions/tags.md), line 54.

```reaction
when RequestBoundary.request (item, path: "/tags/remove-item", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.RemoveItem#2

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 51.
- Covered by [Tags](../design/compositions/tags.md), line 54.

```reaction
when Sessioning.use (session, subject: user), asked by tags.RemoveItem
where
  earlier, RequestBoundary.request (item, path: "/tags/remove-item", requestId, session, tag)
then
  Tagging.removeItemTag (item, tag, user)
```

### tags.RemoveItem#3

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 51.
- Covered by [Tags](../design/compositions/tags.md), line 54.

```reaction
when Tagging.removeItemTag (item, tag, user), asked by tags.RemoveItem#2
where
  earlier, RequestBoundary.request (item, path: "/tags/remove-item", requestId, session, tag)
then
  RequestBoundary.respond (requestId)
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
- `/information/add-field` — requires `session`, `item`, `fieldName`, `description`
- `/information/update-field` — requires `session`, `item`, `fieldName`, `description`
- `/information/view` — requires `session`, `item`
- `/information/view-field` — requires `session`, `item`, `fieldName`
- `/tags/add-item` — requires `session`, `tag`, `item`
- `/tags/create-tag` — requires `session`, `name`
- `/tags/delete-tag` — requires `session`, `tag`
- `/tags/edit-tag` — requires `session`, `tag`, `name`
- `/tags/item-membership` — requires `session`, `item`
- `/tags/items` — requires `session`, `tag`
- `/tags/list` — requires `session`
- `/tags/remove-item` — requires `session`, `tag`, `item`
