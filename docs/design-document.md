# Design Document

This document outlines the most significant and important design choices, decisions, and observations made whilst building the `MyHanzi` application.

The current design of the app differs significantly from the original design, outlined [here](./p1-design.md).

## Concept Design Changes

This section will break down the changes within concepts from P1 to now as well as new concepts that were introduced into the app. For many concept states, the representation used nested sets. However, they were modified to be a set of the most specific item with "parent fields."

### Authenticating

The current `Authenticating` concept spec is located [here](../design/concepts/Authenticating.md). The big change(s) are:

- Separating registering into its own concept: `Registering`.

### Benchmarking

The current `Benchmarking` concept spec is located [here](../design/concepts/Benchmarking.md). The big change(s) are:

- Was not an initial concept in P1.
- Created after I realized that it was a fundamentally different concept than `Tagging`. This is because while `Tagging` allows users to manually categorize items, `Benchmarking` sets a goal for users to reach and is not fulfilled with manual categorizations.

### Federating

The current `Federating` concept spec is located [here](../design/concepts/Federating.md). The big change(s) are:

- Was not an initial concept in P1.
- Created to allow students to sign in with their Commons account.

### InformationCollecting

The current `InformationCollecting` concept spec is located [here](../design/concepts/InformationCollecting.md). The big change(s) are:

- No big changes.

### Personal Rating

The current `PersonalRating` concept spec is located [here](../design/concepts/PersonalRating.md). The big change(s) are:

- No big changes.

### Registering

The current `Registering` concept spec is located [here](../design/concepts/Registering.md). The big change(s) are:

- Was not an initial concept in P1.
- As stated in the [`Authenticating`](#authenticating) section, it was created after realizing the old `register` action under the `Authenticating` concept is fundamentally different.

### Sessioning

The current `Sessioning` concept spec is located [here](../design/concepts/Sessioning.md). The big change(s) are:

- Was not an initial concept in P1.
- Created to prevent users from requiring to log in repeatedly.

### Sharing

The current `Sharing` concept spec is located [here](../design/concepts/Sharing.md). The big change(s) are:

- Modified the concept state to differentiate items that are shared with an audience and items that are public: `SharedItems` and `PublicItems` respectively
  - Naturally, added actions to support making collections public and adding/deleting items in a public collection
- Added actions to revoke a user's access to a shared item. Previously, the only actions I had that would remove access were `deleteItem` and `deleteItems`, but I realized this removed access for all audience members of an item; not just one.
- Prevent sharing empty collections as the state would not support this. This is because individual items are shared with users, not collections. Thus, there is no way to represent sharing an empty collection in the state.

### Tagging

The current `Tagging` concept spec is located [here](../design/concepts/Tagging.md). The big change(s) are:

- Added new `capture...` actions which are necessary to record details of a tag to be deleted or shared so that we can propagate relevant changes to the tag's shared items with the audience members in reactions between the `Sharing` and `Tagging` concepts. Thus, we can grant/revoke access as needed.
- Added a tag's `audience` to the state so that it is easier to query a tag for its audience and then share accordingly through a reaction.
  - Specifically added an `updateAudience` action to change a tag's audience.
  - Previously, tags did not store audience, but rather its items would store this information. However, this meant more work would be needed when adding a character to a shared collection or changing a collection's audience.

## Visual Changes

This section will dive into the visual changes made from P3 to now. The current visual design [color](./visual-design-study-colors.png) and [typography](./visual-design-study-typography.png) collages are located in `docs/`. The first version of these collages are at this [commit](https://github.com/St0rm26/My-Hanzi/pull/7/changes/ac96bb68a188c6d1bf97577e1af079e263719cbe#diff-c355c1e6c15cb86249464b7b10a117a92106c1d4457a9155b8cc0295bf171ab2).

### Colors

The color palette has remained relatively unchanged from the first version. I went for the same theme as the colors put together in the first collage.

### Typography

The typography palette has went through several iterations. In the initial collage, I wanted to go with a round, curved, and somewhat thick font family. However, during the font family-selecting process, I considered many different options after encountering problems with the previous selection:

1. `Gotham Rounded`. This was the font family I wanted to initially use in my first collage. I also looked at other similar fonts on Adobe Fonts such as [Proxima Soft](https://fonts.adobe.com/fonts/proxima-soft) and [Houschka](https://fonts.adobe.com/fonts/houschka-rounded). However, I realized that I failed to consider that my app would not be in English only. Thus, this font would not support my needs.
2. `HelloFont ID Yi Yuan`. Thus, I began browsing Chinese fonts in Adobe Fonts and encountered [this one](https://fonts.adobe.com/fonts/hellofont-id-yi-yuan), which I really liked. I updated the typography collage and [committed](https://github.com/St0rm26/My-Hanzi/pull/7/changes/8e8341a6ade8d30a496fc1bebb4923b7b0fb923c). However, I realized that this font was not freely available for personal web development.
3. `Hunnin`. I then moved to Google Fonts and found [this one](https://fonts.google.com/specimen/Huninn), which I thought was perfect. However, I soon realized that this font family only supported traditional characters, whilst my app would use both simplified and traditional characters. Finding a suitable font became harder than I imagined.
4. `Resource Han Rounded`. After a lot of searching, I finally found a font I was satisfied with, located at [this repository](https://github.com/CyanoHao/Resource-Han-Rounded). This font supports both simplified and traditional characters and various different weights. I made my last significant [commit](https://github.com/St0rm26/My-Hanzi/pull/7/changes/5fb68af9d9551be055e05b71323390266aa0b7d2) to the typography collage with this font family.
