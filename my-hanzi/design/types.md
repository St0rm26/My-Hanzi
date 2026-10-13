# Application types

The application uses simple named strings for the user-facing identities and item labels it stores.

```types
concrete Name
  A human-facing name or username.

concrete ItemName
  The label for a tracked item.

concrete RatingName
  The label for a personal rating.

concrete InformationText
  A textual fact or description about an item.

concrete TagName
  A generated identifier for a tag.
```

```instances
instantiate Registering

instantiate Authenticating with
  User is Name

instantiate Federating as CommonsFederating with
  User is Name

instantiate InformationCollecting with
  Item is ItemName
  Information is InformationText

instantiate PersonalRating with
  User is Name
  Item is ItemName
  Rating is RatingName

instantiate Sessioning with
  Subject is Name

instantiate Sharing with
  User is Name
  Item is ItemName

instantiate Tagging with
  User is Name
  Item is ItemName
  ID is TagName
```
