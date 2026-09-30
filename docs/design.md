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

## Concept Specifications & Reactions

## UI Sketches

## User Journey
