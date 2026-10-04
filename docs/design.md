# Design

## Problem Framing and Stakeholders

### Domain

A fundamental part of learning the Mandarin language is knowing how to read and write **Chinese characters** (_Hànzì/汉字/漢字_). As with learning any language, practice makes perfect, and it is no different in Mandarin Chinese. Learners need to memorize thousands of characters to perform tasks such as writing letters or reading menu items at a high proficiency. Chinese characters can look complex, have strange stroke order, or even look nearly identical, so mastering these skills is essential to becoming fluent.

An important feature of these characters is that they are made up of semantic and phonetic components called **radicals**, which provide information about the meaning and pronunciation of a character. For example, the character for mother, 媽 (_mā_), can be broken down as such:

- Semantic component on left-side: 女, which means _woman/female_
- Phonetic component on right-side: 馬 (_mǎ_)

Mandarin, however, is not the only language with characters, as other Chinese languages such as **Cantonese** and **Hakka** do as well, along with **Japanese Kanji** (_漢字_). However, this domain will just focus on Mandarin Chinese.

### Stakeholders

- **Mandarin learners**: They are the largest stakeholders as they want to study Hanzi effectively to achieve proficiency
- **Mandarin instructors**: They want a centralized place to reference new Hanzi when creating lessons
- **Mandarin language institutions**: They want to simplify the process of users identifying which Hanzi to study
- **Hanzi enthusiasts/researchers**: They want to study/examine the breakdown of different characters and the relationships they have with one another and organize them

### Bad Situations

- Learners who do not use an app to study (e.g. textbooks) struggle to keep track of and organize studied characters as well as visually documenting progress on each. They rely on manually writing characters in a journal or flashcards, or refer to the textbook glossary if there even exists one. This approach can be slow, inconvenient, and unorganized.

- Learners who use language apps might not be able to simply just study characters in the app. There are likely features that are similar and "half-do" the job, such as a flashcard study feature for both characters and words made up of many characters that focus less on the stroke order or character breakdown, for example.

- Learners must do extra work to figure out what characters they still need to study at their level or common characters they still do not know if their study resource does not provide a native feature for this. The [HSK (Chinese Proficiency Test)](https://www.chinesetest.cn/hsk), as of 2025, defines 9 levels, each accompanied with characters learners must know how to recognize and write. Thus, knowing which characters you still need to study is essential to pass these tests.

- Learners/instructors/institutions must manually type out characters they want to share with others for studying. In addition, the medium through which they send out these collections requires work on the recipient's end to dive deeper into the characters (e.g. plain text in email or announcement still requires manual lookup of each character)

- Hanzi enthusiasts must manually organize characters by whatever categorization they are interested in researching. Hanzi dictionaries are exceptional at providing detailed descriptions and histories of each character but there often does not exist a native method to treat them as objects that can be categorized

### Corroboration

Looking at the most popular Mandarin Chinese learning apps (Chinese-focused and supplemntary) and their features:

- **Duolingo**: Does not have a native glossary feature. According to one [Reddit comment](https://www.reddit.com/r/duolingo/comments/1297ld3/comment/jem7zj9/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button), users must painfully navigate through _doume.eu_ and manually filter the vocabulary to only show what they have learned so far.
- **HelloChinese**: No universal glossary/dictionary feature. However, users can learn characters from collections they select.

<img src="hello_chinese.png" alt="HelloChinese Character Collection" width="200" />

- **Anki**: No built-in categorization. Relies on user to input characters, definitions, and other useful information.

### Workarounds and Comparables

Learners often have to use another app, such as a flashcard app like Anki, or their own journal to keep track of studied Chinese characters along with other useful information (e.g. HSK level, stroke order, radicals). Although these apps do address the bad situation and can allow collection sharing, it requires a lot of manual work and do not meet every requirement. For example, incorporating stroke order in online flashcards is difficult. As for handwritten journals, the main struggle is time and organization. For example, keeping a neat journal of all learned characters, sorted in alphabetical order, is impossible as one learns more Hanzi. In addition, depending on the amount of information you want to store, you might want to sort characters by HSK level or organize by radical components, demanding a lot of time.

### Solution Sketch

Create a web application that, at its core, allows users to keep track of characters they have learned and assess their confidence on each in collections. To save time, users do not need to manually input the character, its meaning, stroke order, sound, etc. They simply search it up and add the character to a collection in their local library from a database. Each character comes with its definition, stroke order, pinyin (written-out sounds), radicals, and useful categorization tags (e.g. most common 100 characters).

If the user wants to import all characters from a common resource, say the entire Duolingo Chinese course or all taught characters from the first 5 units of a popular Mandarin Chinese textbook, they can search up an appropriate collection. On the other hand, the user can share their collection in a study group, for example. In summary, the collections are mostly created and shared by users bar certain default ones. For example, HSK level and the "Most Common _n_ Characters" benchmarks are built into the app for universal progress tracking. This app is not meant to be a study tool but rather a tracker so learners know what they need to study.

## Application Pitch

When studying Mandarin Chinese, it is crucial to master reading, writing, and understanding Chinese characters, but current teaching resources often do not provide a built-in character tracking system along with detailed information about each. _My Hanzi_ solves this problem; it is a centralized app that takes away the heavy burden of manually tracking studied Hanzi. Our app supports Character Descriptions, which provides each character with a heavy description: pronunciation, meaning, stroke order, radicals, etc., to help learners study the structure and meaning of each character by itself. For instructors, the descriptions can serve as an excellent reference when designing lessons and helping students identify the structural meaning within each character. In addition, there is a Character Collection feature to allow all app users (learners, instructors, institutions, character enthusiasts/nerds) to create collections of characters for personal use or to distribute to others. Collections help learners organize study plans and track learned characters that need more practice. They allow instructors and institutions to create and share character lists for an upcoming exam or universal benchmark, for example, so that learners can track their progress. Finally, collections can be used for categorizing characters to notice patterns or similarities for enthusiasts and learning purposes. One last important feature is Character Confidence. This is geared toward learners to help them decide where their studying efforts should go by assigning a confidence level to each character and then filtering accordingly. This pairs well with instructor- and institution- shared collections, as learners can assess their confidence on the characters they need to know for a benchmark or test.

## Concept Specifications & Reactions

### Concepts

```
concept Authenticating

purpose confirm a user's claimed identity

principle after a user registers with a username and password, they are able to authenticate with those same credentials and be treated as the same user

state
    a set of Users with
        a username String
        a password String

actions
    register (username: String, password: String) : return (user: User)
        where a user with this username does not exist
        then create a new user with this username and password, and return it

    authenticate (username: String, password: String) : return (user: User)
        where the username exists and the password matches
        then return the corresponding user
```

```
concept Tagging [User, Item]

purpose label items to indicate the groups it belongs to for personal convenience

principle when a user tags items, it implies a common grouping between the tagged items

state
    a set of identifier IDs

    a set of Users with
        a set of Tags with
            a name String
            a set of TaggedItems with
                an identifier ID
                an added date Date
                an Item

actions
    createTag (user: User, name: String) : return (tag: Tag)
        where the user exists and there does not exist a tag under the user with the given name
        then create a new tag with the given name and an empty set of items; assign it under the given user

    renameTag (user: User, tag: Tag, newName: String) : return (tag: Tag)
        where the user exists and the tag exists under the given user
        then rename the tag with the new name

    deleteTag (user: User, tag: Tag)
        where the user exists and the tag exists under the given user
        then delete the tag

    addItemTag (user: User, tag: Tag, item: Item, date: Date)
        where the user exists, the tag exists under the user, the item exists, and the tag does not have the given item in its current item set
        then adds the given item to the given tag's tagged item set under the given user with the current date

    removeItemTag (user: User, tag: Tag, item: Item)
        where the user exists, the tag exists under the user, and the item exists in the tag's  item set
        then removes the given item from the given tag's item set under the given user

    generateTaggedItemID (user: User, tag: Tag, item: Item) : return (id: ID)
        where the user exists, the tag exists under the user, and the item exists in the tag's item set
        then randomly generate a unique ID for the tagged item, paired with the given item, under the user's tag's tagged items set

    findTaggedItemID (user: User, tag: Tag, item: Item) : return (id: ID)
        where the user exists, the tag exists under the user, and the item and ID exists in the tag's item set
        then return the ID of the given item

    findTaggedItemsID (user: User, tag: Tag) : return (ids: set of IDs)
        where the user exists, the tag exists under the user, and tag's item set exists
        then return a set of all IDs of items in the tagged items set
```

<!-- ```
concept InformationTemplateCreating

purpose create a template info field to store information for related items

principle after specifying what info fields an item type needs, the template lists the required fields to prevent manual user input

state
    a set of Templates
``` -->

```
concept InformationCollecting [Item, Information]

purpose store information about an item, separated by fields

principle the author specifies desired info fields and information for each item

state
    a set of Items with
        a set of InfoFields with
            a name String
            a description Information

actions
    addInfoField (item: Item, fieldName: String, description: Information) : return (infoField: InfoField)
        where the item exists and the field name does not already exist under the item
        then create a new info field under the given item with the given field name and information

    editInfoField (item: Item, infoField: InfoField, description: Information) : return (infoField: InfoField)
        where the item exists and the info field exists under the item
        then edit the info field under the given item with the new information

    deleteInfoField (item: Item, infoField: InfoField)
        where the item exists and the info field exists under the item
        then delete the info field under the given item
```

```
concept Sharing [User, Item]

purpose share an item with others for viewing purposes

principle the author selects the audience they want to share an item to, who can now view the item

state
    a set of author Users with
        a set of Items with
            a set of shared Users

actions
    shareItem (user: User, item: Item, audience: set of Users)
        then create a new author user and item if needed, and share the item with the given audience

    deleteItem (user: User, item: Item)
        where the user and item exists under the user
        then remove the item and revoke access for shared users

    deleteItems (user: User, items: set of Items)
        where the user and set of items exist under the user
        then remove the items and revoke accesses for shared users
```

```
concept PersonalRating [User, Item, Rating]

purpose identify how well an item fulfills a parameter for private use

principle raters rate items on a scale, depending on where they believe it belongs best

state
    a set of defined Ratings

    a set of Users with
        a set of Items with
            a Rating

actions
    addDefinedRatings (ratings: set of Ratings) : return (ratings: set of Ratings)
        then union the exsiting defined ratings set with the new given set

    removeDefinedRating (rating: Rating)
        where the rating exists in the defined ratings set
        then remove the rating from the set and from all items with this rating

    addRating (user: User, item: Item, rating: Rating)
        where the rating exists in the defined ratings set
        then add the given rating to the item under the user, creating a new user and item if needed

    changeRating (user: User, item: Item, rating: Rating)
        where the user exists, item exists with a rating, and the given rating is different than the current item rating and exists in the defined ratings set
        then modify the given rating of the item

    deleteRating (user: User, item: Item)
        where the user exists and the item exists with a rating
        then remove the rating from the item
```

### Reactions

```
reaction initialize

when Authenticating.register () : (user)

then Tagging.createTag (user, "Studied")
```

```
reaction generateCharacterID

when Requesting.addCharacterToCollection (user, collection: Tag, character: Item)

then Tagging.generateTaggedItemID (user, collection: Tag, character: Item) : (ID)
```

```
reaction addCharacter

when Tagging.generateTaggedItemID (user, collection: Tag, character: Item) : (ID)

then
    Tagging.addItemTag (user, collection: Tag, character: Item)
    Sharing.shareItem (user, ID, {})
```

```
reaction findCharacterID

when Requesting.removeCharacterFromCollection (user, collection: Tag, character: Item)

then Tagging.findTaggedItemID (user, collection: Tag, character: Item) : (ID)
```

```
reaction removeCharacter

when Tagging.findTaggedItemID (user, collection: Tag, character: Item) : (ID)

then
    Tagging.removeItemTag (user, collection: Tag, character: Item)
    Sharing.deleteItem (user, ID)
```

```
reaction findTaggedCharactersIds

when Requesting.deleteCollection (user, collection: Tag)

then
    Tagging.findTaggedItemsId (user, collection: Tag) : (IDs)
```

```
reaction deleteCollection

when Tagging.findTaggedItemsId (user, collection: Tag) : (IDs)

then
    Tagging.deleteTag (user, collection: Tag)
    Sharing.deleteItems (user, IDs)
```

### Note

After the user successfully registers through the `Authenticating` concept, they gain access to:

- All actions of the `Tagging` concept except for `generateTaggedItemID`, `findTaggedItemID`, and `findTaggedItemsID`
- All actions of the `Sharing` concept
- All actions of the `Rating` concept except for `addDefinedRatings` and `removeDefinedRating`

The actions registered users cannot access is for the server only. In the context of the app, the excluded `Tagging` actions are used to store and share hidden IDs that are used to communicate changes in shared collections so that access can be revoked/granted as needed. For the excluded `Rating` actions, the server defines ratings, which is character confidence level, for every user. Finally, the `InformationCollecting` concept is server-only as the server populates character data with information (e.g. pronunciation and meaning).

How the concepts and reactions work together in the app:

- `Authenticating` allows personalizable character collections and sharing them with people you know
- `Tagging` represents storing characters in collection. Each collection is a tag, allowing characters to be a part of multiple collections. The date is stored for every tagged item for sorting purposes within the collection
- `InformationCollecting`, as stated earlier, provides detailed information about each character
- `Sharing` allows users to share their collections with each other
- `PersonalRating` lets users mark each character with a confidence level on a predefined scale. Ratings are universal; same across all collections
- The first reaction initializes the user with a "Studied" collection. Although users are free to make their own collections, the main purpose of the app is to track studied characters. In addition, the studied collection is solely how the app's built-in benchmarks determines where the user is. For the app, the `Tagging` concept will not allow `deleteTag` for the default studied collection and not allow `createTag` to create an equivalent studied collection. This is left out of the concept to keep its generality
- Most of the reactions handle modifying collections and might be a little bit more complicated than expected for synchronization purposes for shared collections. When the author adds or removes a character, there must be some way to update what items are shared in `Sharing` concept. This is handled with unique item IDs

## UI Sketches

## User Journey
