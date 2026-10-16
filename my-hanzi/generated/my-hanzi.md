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

- `Authenticating` — instance of `Authenticating` — [Application types](../design/types.md), line 29.
  - `User` is `Name` — [Application types](../design/types.md), line 30.

### Benchmarking

Defined in [Benchmarking](../design/concepts/Benchmarking.md), line 1.

#### Actions

- `createBenchmark(user: User, items: Items, name: String) : returns (benchmark: Benchmark)`
  - Refuses `BENCHMARK_REQUIRES_ITEMS`: A benchmark must contain at least one item.
  - Refuses `BENCHMARK_REQUIRES_DISTINCT_ITEMS`: All items must be distinct.
  - Refuses `BENCHMARK_ALREADY_EXISTS`: This user already has a benchmark with that name.
- `deleteBenchmark(benchmark: Benchmark) : returns ()`
  - Refuses `BENCHMARK_NOT_FOUND`: There is no such benchmark.
- `checkBenchmarkItem(benchmark: Benchmark, item: Item) : returns ()`
  - Refuses `BENCHMARK_NOT_FOUND`: There is no such benchmark.
  - Refuses `BENCHMARK_ITEM_NOT_FOUND`: There is no such item in this benchmark.
  - Refuses `BENCHMARK_ITEM_ALREADY_FINISHED`: This item is already finished.
- `uncheckBenchmarkItem(benchmark: Benchmark, item: Item) : returns ()`
  - Refuses `BENCHMARK_NOT_FOUND`: There is no such benchmark.
  - Refuses `BENCHMARK_ITEM_NOT_FOUND`: There is no such item in this benchmark.
  - Refuses `BENCHMARK_ITEM_NOT_FINISHED`: This item is not finished.

#### Queries

- `_benchmarks(user: User) : many (benchmark: Benchmark, name: String)`
- `_items(benchmark: Benchmark) : many (item: Item)`
- `_finishedItems(benchmark: Benchmark) : many (item: Item)`
- `_unfinishedItems(benchmark: Benchmark) : many (item: Item)`

#### Instances

- `Benchmarking` — instance of `Benchmarking` — [Application types](../design/types.md), line 57.
  - `Boolean` is `CompletionState` — [Application types](../design/types.md), line 60.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 59.
  - `User` is `Name` — [Application types](../design/types.md), line 58.

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

- `CommonsFederating` — instance of `Federating` — [Application types](../design/types.md), line 32.
  - `User` is `Name` — [Application types](../design/types.md), line 33.

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

- `InformationCollecting` — instance of `InformationCollecting` — [Application types](../design/types.md), line 35.
  - `Information` is `InformationText` — [Application types](../design/types.md), line 37.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 36.

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

- `PersonalRating` — instance of `PersonalRating` — [Application types](../design/types.md), line 39.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 41.
  - `Rating` is `RatingName` — [Application types](../design/types.md), line 42.
  - `User` is `Name` — [Application types](../design/types.md), line 40.

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

- `Registering` — instance of `Registering` — [Application types](../design/types.md), line 27.

### Sessioning

Defined in [Sessioning](../design/concepts/Sessioning.md), line 1.

#### Actions

- `start(subject: Subject) : returns (session: Session, expiresAt: DateTime)`
- `use(session: Session) : returns (subject: Subject)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.
- `end(session: Session) : returns (session: Session)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.

#### Instances

- `Sessioning` — instance of `Sessioning` — [Application types](../design/types.md), line 44.
  - `Subject` is `Name` — [Application types](../design/types.md), line 45.

### Sharing

Defined in [Sharing](../design/concepts/Sharing.md), line 1.

#### Actions

- `shareItem(author: User, item: Item, audience: Users) : returns ()`
- `shareItems(author: User, items: Items, audience: Users) : returns ()`
- `revokeItem(author: User, item: Item, audience: Users) : returns ()`
- `revokeItems(author: User, items: Items, audience: Users) : returns ()`
  - Refuses `SHARED_ITEMS_NOT_DISTINCT`: All items must be distinct.
- `deleteItem(author: User, item: Item) : returns ()`
- `deleteItems(author: User, items: Items) : returns ()`
  - Refuses `SHARED_ITEMS_NOT_DISTINCT`: All items must be distinct.

#### Queries

- `_sharedItems(user: User) : many (item: Item)`

#### Instances

- `Sharing` — instance of `Sharing` — [Application types](../design/types.md), line 47.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 49.
  - `User` is `Name` — [Application types](../design/types.md), line 48.

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
- `captureTagForDeletion(user: User, tag: Tag) : returns (audience: Audience, ids: IDs)`
  - Refuses `DEFAULT_TAG_CANNOT_BE_DELETED`: The default "Studied" tag cannot be deleted.
- `captureTagSharing(user: User, tag: Tag) : returns (audience: Audience, ids: IDs)`
- `captureItemSharing(user: User, tag: Tag, item: Item) : returns (audience: Audience, ids: IDs)`
- `addItemTag(user: User, tag: Tag, item: Item, date: Date) : returns ()`
  - Refuses `ITEM_ALREADY_TAGGED`: This item already has the given tag.
- `removeItemTag(user: User, tag: Tag, item: Item) : returns ()`
- `generateTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemID(user: User, tag: Tag, item: Item) : returns (id: ID)`
- `findTaggedItemsID(user: User, tag: Tag) : returns (ids: IDs)`
- `updateAudience(user: User, tag: Tag, audience: Audience) : returns ()`

#### Queries

- `_tags(user: User) : many (tag: Tag, name: String)`
- `_tagsContainingItem(user: User, item: Item) : many (tag: Tag)`
- `_taggedItems(user: User, tag: Tag) : many (item: Item, addedDate: Date)`
- `_audience(user: User, tag: Tag) : many (audience: Audience)`

#### Instances

- `Tagging` — instance of `Tagging` — [Application types](../design/types.md), line 51.
  - `Audience` is `Name` — [Application types](../design/types.md), line 55.
  - `ID` is `TagName` — [Application types](../design/types.md), line 54.
  - `Item` is `ItemName` — [Application types](../design/types.md), line 53.
  - `User` is `Name` — [Application types](../design/types.md), line 52.

## Application types

Concrete types:

- `CompletionState` — [Application types](../design/types.md), line 21.
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

### the completed items in a benchmark

```former
Former "the completed items in a benchmark" — inputs (benchmark); bindings (item); promises exactly one record — forms:
  each Benchmarking._finishedItems (benchmark) has (item)
    arranged by item
    form a record of
      item
```

### the items in a benchmark

```former
Former "the items in a benchmark" — inputs (benchmark); bindings (item); promises exactly one record — forms:
  each Benchmarking._items (benchmark) has (item)
    arranged by item
    form a record of
      item
```

### the items in a user's collection

```former
Former "the items in a user's collection" — inputs (user, tag); bindings (item, addedDate); promises exactly one record — forms:
  each Tagging._taggedItems (tag, user) has (addedDate, item)
    form a record of
      addedDate
      item
```

### the not-completed items in a benchmark

```former
Former "the not-completed items in a benchmark" — inputs (benchmark); bindings (item); promises exactly one record — forms:
  each Benchmarking._unfinishedItems (benchmark) has (item)
    arranged by item
    form a record of
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

### benchmarks.AddCharacter

Authored path: `benchmarks.AddCharacter`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 20.

```reaction
when requested Tagging.addItemTag (date, item, tag, user)
where
  Tagging._tags (user) has (name: "Studied", tag)
  Benchmarking._benchmarks (user) has (benchmark)
  Benchmarking._items (benchmark) has (item)
then
  Benchmarking.checkBenchmarkItem (benchmark, item)
```

### benchmarks.Completed

Authored path: `benchmarks.Completed`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 13.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 16.

```reaction
when RequestBoundary.request (benchmark, path: "/benchmarks/completed", requestId, session)
then
  Sessioning.use (session)
```

### benchmarks.Completed:found#2

Authored path: `benchmarks.Completed`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 13.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 16.

```reaction
when Sessioning.use (session, subject: user), asked by benchmarks.Completed
where
  Benchmarking._benchmarks (user) has (benchmark)
  earlier, RequestBoundary.request (benchmark, path: "/benchmarks/completed", requestId, session)
then
  RequestBoundary.respond (items: former "the completed items in a benchmark" with (benchmark), requestId)
```

### benchmarks.Completed:missing#2

Authored path: `benchmarks.Completed`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 13.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 16.

```reaction
when Sessioning.use (session, subject: user), asked by benchmarks.Completed
where
  earlier, RequestBoundary.request (benchmark, path: "/benchmarks/completed", requestId, session)
  no Benchmarking._benchmarks (user) has (benchmark)
then
  RequestBoundary.respond (error: "BENCHMARK_NOT_FOUND", requestId)
```

### benchmarks.Initialize

Authored path: `benchmarks.Initialize`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 5.

```reaction
when Registering.register (user)
then
  Benchmarking.createBenchmark (items: ["的", "一", "是", "不", "了", "在", "人", "有", "我", "他", "这", "个", "们", "中", "来", "上", "大", "和", "国", "说", "时", "出", "会", "你", "对", "生", "能", "子", "那", "下", "年", "后", "作", "里", "家", "多", "么", "去", "学", "都", "同", "现", "没", "面", "起", "看", "天", "分", "好", "小", "些", "样", "她", "本", "前", "开", "想", "机", "十", "工", "明", "三", "关", "点", "高", "很", "见", "什", "二", "果", "西", "月", "话", "回", "老", "先", "儿", "东", "水", "名", "几", "认", "系", "气", "打", "女", "四", "电", "少", "太", "再", "做", "期", "五", "书", "听", "住", "北", "觉", "师", "今", "院", "识", "候", "飞", "车", "服", "怎", "呢", "叫", "影", "字", "爱", "商", "请", "视", "九", "写", "八", "吗", "吃", "六", "医", "号", "语", "七", "兴", "星", "京", "米", "客", "友", "钱", "热", "坐", "校", "脑", "谁", "哪", "喜", "习", "欢", "冷", "汉", "衣", "妈", "读", "买", "岁", "块", "姐", "亮", "朋", "谢", "钟", "雨", "饭", "睡", "喝", "午", "店", "爸", "桌", "菜", "茶", "狗", "杯", "租", "昨", "漂", "椅", "猫", "喂", "苹"], name: "HSK 1", user)
```

### benchmarks.Initialize#2

Authored path: `benchmarks.Initialize`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 5.

```reaction
when Benchmarking.createBenchmark (items: ["的", "一", "是", "不", "了", "在", "人", "有", "我", "他", "这", "个", "们", "中", "来", "上", "大", "和", "国", "说", "时", "出", "会", "你", "对", "生", "能", "子", "那", "下", "年", "后", "作", "里", "家", "多", "么", "去", "学", "都", "同", "现", "没", "面", "起", "看", "天", "分", "好", "小", "些", "样", "她", "本", "前", "开", "想", "机", "十", "工", "明", "三", "关", "点", "高", "很", "见", "什", "二", "果", "西", "月", "话", "回", "老", "先", "儿", "东", "水", "名", "几", "认", "系", "气", "打", "女", "四", "电", "少", "太", "再", "做", "期", "五", "书", "听", "住", "北", "觉", "师", "今", "院", "识", "候", "飞", "车", "服", "怎", "呢", "叫", "影", "字", "爱", "商", "请", "视", "九", "写", "八", "吗", "吃", "六", "医", "号", "语", "七", "兴", "星", "京", "米", "客", "友", "钱", "热", "坐", "校", "脑", "谁", "哪", "喜", "习", "欢", "冷", "汉", "衣", "妈", "读", "买", "岁", "块", "姐", "亮", "朋", "谢", "钟", "雨", "饭", "睡", "喝", "午", "店", "爸", "桌", "菜", "茶", "狗", "杯", "租", "昨", "漂", "椅", "猫", "喂", "苹"], name: "HSK 1", user), asked by benchmarks.Initialize
then
  Benchmarking.createBenchmark (items: ["为", "到", "以", "要", "就", "可", "也", "得", "着", "过", "道", "所", "然", "事", "经", "动", "还", "进", "但", "因", "从", "日", "意", "它", "长", "第", "公", "已", "情", "知", "正", "外", "两", "间", "问", "最", "手", "体", "等", "新", "身", "表", "给", "次", "门", "常", "教", "比", "员", "真", "走", "条", "题", "别", "报", "务", "场", "件", "便", "司", "眼", "非", "白", "思", "完", "色", "路", "告", "边", "望", "共", "让", "运", "笑", "步", "每", "快", "往", "近", "夫", "准", "始", "远", "备", "百", "离", "病", "息", "火", "早", "找", "吧", "考", "红", "虽", "希", "房", "黑", "足", "孩", "站", "诉", "千", "男", "助", "乐", "球", "错", "晚", "试", "送", "药", "游", "室", "您", "帮", "左", "右", "穿", "哥", "弟", "慢", "忙", "介", "鱼", "跑", "贵", "班", "票", "睛", "旅", "笔", "卖", "旁", "阴", "跳", "雪", "肉", "馆", "牛", "纸", "歌", "床", "玩", "妻", "休", "舞", "姓", "妹", "汽", "课", "懂", "绍", "丈", "洗", "唱", "奶", "宜", "累", "羊", "零", "蛋", "鸡", "宾", "颜", "瓜", "晴", "啡", "篮", "咖", "踢", "泳", "铅"], name: "HSK 2", user)
```

### benchmarks.Initialize#3

Authored path: `benchmarks.Initialize`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 5.

```reaction
when Benchmarking.createBenchmark (items: ["为", "到", "以", "要", "就", "可", "也", "得", "着", "过", "道", "所", "然", "事", "经", "动", "还", "进", "但", "因", "从", "日", "意", "它", "长", "第", "公", "已", "情", "知", "正", "外", "两", "间", "问", "最", "手", "体", "等", "新", "身", "表", "给", "次", "门", "常", "教", "比", "员", "真", "走", "条", "题", "别", "报", "务", "场", "件", "便", "司", "眼", "非", "白", "思", "完", "色", "路", "告", "边", "望", "共", "让", "运", "笑", "步", "每", "快", "往", "近", "夫", "准", "始", "远", "备", "百", "离", "病", "息", "火", "早", "找", "吧", "考", "红", "虽", "希", "房", "黑", "足", "孩", "站", "诉", "千", "男", "助", "乐", "球", "错", "晚", "试", "送", "药", "游", "室", "您", "帮", "左", "右", "穿", "哥", "弟", "慢", "忙", "介", "鱼", "跑", "贵", "班", "票", "睛", "旅", "笔", "卖", "旁", "阴", "跳", "雪", "肉", "馆", "牛", "纸", "歌", "床", "玩", "妻", "休", "舞", "姓", "妹", "汽", "课", "懂", "绍", "丈", "洗", "唱", "奶", "宜", "累", "羊", "零", "蛋", "鸡", "宾", "颜", "瓜", "晴", "啡", "篮", "咖", "踢", "泳", "铅"], name: "HSK 2", user), asked by benchmarks.Initialize#2
then
  Benchmarking.createBenchmark (items: ["地", "而", "于", "自", "发", "用", "行", "种", "成", "方", "法", "如", "当", "定", "其", "主", "理", "心", "只", "实", "者", "力", "把", "又", "业", "重", "物", "应", "向", "头", "文", "相", "被", "或", "己", "加", "特", "信", "化", "世", "位", "声", "提", "解", "口", "平", "更", "变", "总", "数", "安", "才", "结", "目", "感", "接", "必", "市", "直", "山", "空", "决", "马", "界", "放", "像", "且", "难", "记", "南", "求", "据", "张", "该", "万", "清", "带", "风", "根", "干", "极", "办", "议", "元", "单", "调", "算", "需", "花", "城", "级", "复", "满", "越", "容", "照", "须", "包", "片", "史", "乎", "查", "轻", "易", "除", "阿", "李", "图", "历", "突", "周", "较", "注", "选", "响", "参", "半", "节", "护", "音", "跟", "留", "讲", "料", "终", "答", "黄", "奇", "段", "故", "河", "害", "双", "境", "愿", "网", "育", "船", "脸", "刻", "刚", "般", "怕", "假", "久", "拿", "阳", "急", "居", "环", "树", "层", "句", "简", "卡", "担", "静", "检", "差", "角", "皮", "啊", "超", "银", "怪", "香", "铁", "草", "脚", "酒", "顾", "换", "闻", "坏", "楚", "楼", "画", "耳", "短", "遇", "康", "旧", "春", "附", "礼", "板", "婚", "鲜", "词", "择", "健", "借", "园", "牙", "束", "练", "爷", "嘴", "戏", "典", "盘", "忘", "赛", "趣", "迎", "冰", "努", "绿", "街", "灯", "夏", "秋", "末", "蓝", "烧", "哭", "冒", "惯", "鸟", "季", "鼻", "腿", "迟", "辆", "净", "冬", "骑", "叔", "爬", "扫", "箱", "舒", "绩", "饮", "朵", "鞋", "邮", "邻", "聪", "梯", "瓶", "疼", "熊", "帽", "炼", "搬", "刷", "瘦", "斤", "胖", "饿", "聊", "碗", "渴", "饱", "甜", "矮", "裤", "衫", "伞", "姨", "刮", "糕", "裙", "衬", "锻", "澡", "啤", "蕉", "筷"], name: "HSK 3", user)
```

### benchmarks.Initialize#4

Authored path: `benchmarks.Initialize`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 5.

```reaction
when Benchmarking.createBenchmark (items: ["地", "而", "于", "自", "发", "用", "行", "种", "成", "方", "法", "如", "当", "定", "其", "主", "理", "心", "只", "实", "者", "力", "把", "又", "业", "重", "物", "应", "向", "头", "文", "相", "被", "或", "己", "加", "特", "信", "化", "世", "位", "声", "提", "解", "口", "平", "更", "变", "总", "数", "安", "才", "结", "目", "感", "接", "必", "市", "直", "山", "空", "决", "马", "界", "放", "像", "且", "难", "记", "南", "求", "据", "张", "该", "万", "清", "带", "风", "根", "干", "极", "办", "议", "元", "单", "调", "算", "需", "花", "城", "级", "复", "满", "越", "容", "照", "须", "包", "片", "史", "乎", "查", "轻", "易", "除", "阿", "李", "图", "历", "突", "周", "较", "注", "选", "响", "参", "半", "节", "护", "音", "跟", "留", "讲", "料", "终", "答", "黄", "奇", "段", "故", "河", "害", "双", "境", "愿", "网", "育", "船", "脸", "刻", "刚", "般", "怕", "假", "久", "拿", "阳", "急", "居", "环", "树", "层", "句", "简", "卡", "担", "静", "检", "差", "角", "皮", "啊", "超", "银", "怪", "香", "铁", "草", "脚", "酒", "顾", "换", "闻", "坏", "楚", "楼", "画", "耳", "短", "遇", "康", "旧", "春", "附", "礼", "板", "婚", "鲜", "词", "择", "健", "借", "园", "牙", "束", "练", "爷", "嘴", "戏", "典", "盘", "忘", "赛", "趣", "迎", "冰", "努", "绿", "街", "灯", "夏", "秋", "末", "蓝", "烧", "哭", "冒", "惯", "鸟", "季", "鼻", "腿", "迟", "辆", "净", "冬", "骑", "叔", "爬", "扫", "箱", "舒", "绩", "饮", "朵", "鞋", "邮", "邻", "聪", "梯", "瓶", "疼", "熊", "帽", "炼", "搬", "刷", "瘦", "斤", "胖", "饿", "聊", "碗", "渴", "饱", "甜", "矮", "裤", "衫", "伞", "姨", "刮", "糕", "裙", "衬", "锻", "澡", "啤", "蕉", "筷"], name: "HSK 3", user), asked by benchmarks.Initialize#3
then
  Benchmarking.createBenchmark (items: ["之", "部", "无", "与", "民", "此", "使", "性", "全", "将", "由", "并", "美", "利", "合", "内", "度", "任", "海", "通", "原", "及", "论", "处", "各", "入", "活", "尔", "何", "反", "受", "量", "建", "计", "管", "资", "命", "金", "指", "克", "许", "区", "保", "至", "队", "社", "展", "科", "基", "则", "却", "光", "即", "象", "式", "程", "死", "交", "规", "取", "拉", "格", "术", "确", "传", "观", "切", "导", "争", "改", "收", "言", "联", "持", "济", "亲", "林", "士", "证", "失", "转", "存", "台", "具", "流", "连", "深", "质", "价", "整", "况", "亚", "技", "际", "约", "示", "究", "线", "断", "精", "支", "消", "增", "研", "功", "广", "标", "谈", "引", "首", "局", "专", "费", "尽", "另", "仅", "落", "随", "列", "推", "众", "案", "划", "律", "态", "验", "责", "够", "章", "志", "底", "严", "例", "族", "供", "效", "续", "紧", "绝", "察", "母", "批", "按", "围", "江", "纪", "举", "父", "密", "低", "止", "细", "值", "仍", "破", "倒", "职", "速", "否", "毛", "甚", "普", "弹", "苦", "印", "预", "微", "继", "惊", "伤", "适", "省", "卫", "险", "排", "福", "警", "获", "负", "云", "停", "疑", "洲", "竟", "激", "演", "判", "既", "积", "富", "占", "修", "降", "坚", "免", "压", "养", "怀", "乱", "航", "优", "著", "份", "艺", "概", "敢", "户", "洋", "款", "评", "座", "释", "景", "登", "货", "互", "付", "危", "讨", "丽", "序", "永", "呼", "味", "沙", "掉", "杂", "误", "减", "肯", "败", "梦", "散", "温", "困", "封", "缺", "恐", "松", "虑", "幸", "赶", "剧", "叶", "吸", "呀", "顺", "输", "招", "脱", "油", "材", "博", "烟", "授", "禁", "孙", "篇", "遍", "础", "翻", "森", "默", "熟", "伙", "弄", "刀", "窗", "醒", "购", "虎", "扬", "毕", "尤", "竞", "弃", "麻", "申", "售", "针", "抱", "鼓", "植", "页", "折", "尊", "秀", "染", "迷", "诚", "彩", "抽", "浪", "丰", "译", "距", "符", "勇", "厅", "拜", "巧", "戴", "童", "乘", "挂", "奖", "厚", "镜", "烦", "签", "牌", "咱", "奋", "播", "桥", "寒", "聚", "袋", "暂", "估", "拒", "忆", "闹", "厉", "穷", "码", "偶", "稍", "矿", "抬", "倍", "污", "耐", "粗", "悉", "详", "允", "剩", "漫", "酸", "辛", "餐", "挺", "励", "键", "扰", "阅", "汗", "骗", "龄", "惜", "仔", "俩", "籍", "凉", "貌", "猜", "怜", "躺", "钢", "寄", "汤", "肥", "尝", "厌", "脏", "幽", "丢", "泉", "祝", "陪", "贺", "琴", "恼", "敲", "暖", "糖", "擦", "肤", "肚", "赢", "址", "悔", "邀", "羽", "盐", "傅", "帅", "扔", "傲", "拾", "填", "扮", "愉", "慕", "秒", "塑", "羞", "盒", "棵", "谅", "葡", "厨", "鸭", "谊", "歉", "赚", "萄", "脾", "懒", "骄", "聘", "巾", "堵", "棒", "硕", "戚", "笨", "泼", "郊", "饼", "咳", "桶", "辣", "膊", "趟", "匙", "钥", "胳", "咸", "汁", "垃", "烤", "圾", "逛", "膏", "羡", "暑", "嗽", "橡", "厕", "袜", "勺", "柿", "乒", "乓", "饺"], name: "HSK 4", user)
```

### benchmarks.Initialize#5

Authored path: `benchmarks.Initialize`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 5.

```reaction
when Benchmarking.createBenchmark (items: ["之", "部", "无", "与", "民", "此", "使", "性", "全", "将", "由", "并", "美", "利", "合", "内", "度", "任", "海", "通", "原", "及", "论", "处", "各", "入", "活", "尔", "何", "反", "受", "量", "建", "计", "管", "资", "命", "金", "指", "克", "许", "区", "保", "至", "队", "社", "展", "科", "基", "则", "却", "光", "即", "象", "式", "程", "死", "交", "规", "取", "拉", "格", "术", "确", "传", "观", "切", "导", "争", "改", "收", "言", "联", "持", "济", "亲", "林", "士", "证", "失", "转", "存", "台", "具", "流", "连", "深", "质", "价", "整", "况", "亚", "技", "际", "约", "示", "究", "线", "断", "精", "支", "消", "增", "研", "功", "广", "标", "谈", "引", "首", "局", "专", "费", "尽", "另", "仅", "落", "随", "列", "推", "众", "案", "划", "律", "态", "验", "责", "够", "章", "志", "底", "严", "例", "族", "供", "效", "续", "紧", "绝", "察", "母", "批", "按", "围", "江", "纪", "举", "父", "密", "低", "止", "细", "值", "仍", "破", "倒", "职", "速", "否", "毛", "甚", "普", "弹", "苦", "印", "预", "微", "继", "惊", "伤", "适", "省", "卫", "险", "排", "福", "警", "获", "负", "云", "停", "疑", "洲", "竟", "激", "演", "判", "既", "积", "富", "占", "修", "降", "坚", "免", "压", "养", "怀", "乱", "航", "优", "著", "份", "艺", "概", "敢", "户", "洋", "款", "评", "座", "释", "景", "登", "货", "互", "付", "危", "讨", "丽", "序", "永", "呼", "味", "沙", "掉", "杂", "误", "减", "肯", "败", "梦", "散", "温", "困", "封", "缺", "恐", "松", "虑", "幸", "赶", "剧", "叶", "吸", "呀", "顺", "输", "招", "脱", "油", "材", "博", "烟", "授", "禁", "孙", "篇", "遍", "础", "翻", "森", "默", "熟", "伙", "弄", "刀", "窗", "醒", "购", "虎", "扬", "毕", "尤", "竞", "弃", "麻", "申", "售", "针", "抱", "鼓", "植", "页", "折", "尊", "秀", "染", "迷", "诚", "彩", "抽", "浪", "丰", "译", "距", "符", "勇", "厅", "拜", "巧", "戴", "童", "乘", "挂", "奖", "厚", "镜", "烦", "签", "牌", "咱", "奋", "播", "桥", "寒", "聚", "袋", "暂", "估", "拒", "忆", "闹", "厉", "穷", "码", "偶", "稍", "矿", "抬", "倍", "污", "耐", "粗", "悉", "详", "允", "剩", "漫", "酸", "辛", "餐", "挺", "励", "键", "扰", "阅", "汗", "骗", "龄", "惜", "仔", "俩", "籍", "凉", "貌", "猜", "怜", "躺", "钢", "寄", "汤", "肥", "尝", "厌", "脏", "幽", "丢", "泉", "祝", "陪", "贺", "琴", "恼", "敲", "暖", "糖", "擦", "肤", "肚", "赢", "址", "悔", "邀", "羽", "盐", "傅", "帅", "扔", "傲", "拾", "填", "扮", "愉", "慕", "秒", "塑", "羞", "盒", "棵", "谅", "葡", "厨", "鸭", "谊", "歉", "赚", "萄", "脾", "懒", "骄", "聘", "巾", "堵", "棒", "硕", "戚", "笨", "泼", "郊", "饼", "咳", "桶", "辣", "膊", "趟", "匙", "钥", "胳", "咸", "汁", "垃", "烤", "圾", "逛", "膏", "羡", "暑", "嗽", "橡", "厕", "袜", "勺", "柿", "乒", "乓", "饺"], name: "HSK 4", user), asked by benchmarks.Initialize#4
then
  Benchmarking.createBenchmark (items: ["军", "战", "政", "产", "制", "代", "立", "义", "神", "德", "统", "形", "治", "达", "强", "权", "王", "设", "品", "类", "领", "造", "组", "英", "令", "布", "未", "击", "兵", "团", "集", "华", "石", "府", "似", "官", "器", "称", "企", "委", "曾", "农", "装", "显", "念", "青", "武", "势", "古", "构", "土", "投", "某", "维", "革", "敌", "致", "派", "营", "巴", "防", "施", "型", "依", "群", "项", "织", "斗", "采", "杀", "朝", "属", "限", "威", "状", "率", "独", "创", "承", "股", "益", "血", "素", "夜", "初", "源", "食", "待", "述", "陆", "置", "劳", "财", "纳", "雷", "模", "充", "木", "龙", "冲", "射", "略", "范", "村", "哈", "退", "余", "痛", "灵", "配", "征", "挥", "胜", "阶", "沉", "善", "执", "追", "宣", "佛", "控", "税", "背", "阵", "恶", "顿", "守", "岛", "托", "烈", "索", "胡", "靠", "版", "宝", "欧", "核", "暗", "良", "升", "临", "架", "域", "括", "编", "测", "屋", "渐", "救", "枪", "县", "尚", "毫", "移", "娘", "智", "掌", "遗", "固", "席", "秘", "均", "销", "诗", "藏", "损", "忽", "巨", "炮", "录", "乡", "庭", "妇", "归", "含", "摇", "补", "谓", "毒", "疗", "逐", "寻", "厂", "岸", "炸", "载", "避", "抓", "荣", "姑", "逃", "顶", "玉", "迫", "洞", "卷", "坦", "宁", "训", "私", "丝", "握", "骨", "访", "弱", "鬼", "软", "扩", "盖", "雄", "稳", "亿", "刺", "拥", "齐", "虚", "析", "透", "替", "途", "兄", "迅", "套", "贸", "唯", "轮", "库", "迹", "促", "延", "震", "甲", "伟", "缓", "闪", "哲", "络", "纯", "忍", "筑", "贝", "振", "圆", "搞", "狂", "措", "培", "宽", "摆", "伸", "摩", "悲", "拍", "硬", "麦", "操", "阻", "订", "赞", "纷", "喊", "违", "汇", "币", "殊", "献", "裁", "触", "敬", "墙", "召", "罚", "享", "犹", "彻", "描", "妙", "彼", "仿", "闭", "庆", "泪", "朗", "尾", "偷", "虫", "淡", "恨", "繁", "伴", "旦", "潮", "粮", "缩", "挑", "灰", "珍", "幕", "映", "隔", "启", "泛", "偿", "呆", "衡", "舍", "婆", "灾", "胆", "俗", "辩", "胸", "劲", "辑", "恢", "圈", "摸", "润", "堆", "碰", "废", "壁", "吹", "糊", "盾", "乏", "诊", "摄", "凭", "抢", "绪", "肩", "幻", "碎", "综", "返", "薄", "悄", "敏", "碍", "矛", "幅", "颗", "骂", "赏", "贴", "腰", "眉", "恋", "吓", "辞", "尺", "辈", "滑", "绕", "趋", "胁", "插", "慧", "媒", "佩", "豪", "兼", "跃", "肃", "驶", "届", "欣", "惠", "册", "飘", "闲", "频", "递", "撞", "滚", "贡", "疯", "瞧", "燃", "锁", "劝", "搜", "勤", "戒", "驾", "柔", "腐", "幼", "践", "浓", "竹", "逻", "遵", "饰", "贷", "叙", "沟", "扶", "寿", "询", "匆", "奈", "慰", "怨", "躲", "紫", "艰", "慌", "吐", "咬", "挤", "弯", "雾", "屈", "蛇", "鼠", "吨", "池", "冠", "尘", "浅", "喷", "凌", "赔", "涂", "亏", "寂", "煤", "恭", "湿", "秩", "宿", "烂", "抖", "夹", "昆", "猪", "慎", "玻", "齿", "押", "漠", "疲", "醉", "拳", "斜", "档", "豆", "涨", "拼", "歇", "桃", "嘉", "俊", "乙", "妨", "挣", "览", "璃", "滴", "姿", "丑", "劣", "匹", "俱", "蜂", "糟", "谨", "苗", "肠", "挡", "纲", "肌", "膀", "卧", "欠", "夸", "豫", "胃", "睁", "铃", "吻", "脆", "柴", "绳", "眠", "傻", "扇", "柜", "拦", "夕", "姻", "氛", "蜜", "摘", "披", "辅", "盆", "吵", "嗯", "骤", "漏", "悠", "滩", "嫁", "催", "翅", "锅", "拆", "棋", "唉", "孕", "链", "艳", "臭", "趁", "愁", "孝", "冻", "闯", "宴", "矩", "胶", "盼", "脖", "虹", "账", "倡", "猴", "寓", "狮", "抄", "晕", "砍", "剪", "叉", "拐", "捐", "歪", "粘", "陌", "窄", "鞭", "厘", "厦", "恳", "憾", "摔", "愧", "洒", "哎", "钓", "蝶", "讽", "旬", "撕", "谦", "兔", "荐", "炭", "舅", "裹", "瞎", "咨", "宠", "兑", "霉", "塘", "帘", "厢", "乖", "娱", "娶", "嗓", "蹲", "淘", "嫩", "壶", "傍", "勿", "踩", "煮", "逗", "炒", "寞", "甩", "燥", "晒", "屿", "绸", "痒", "耽", "魅", "狡", "匀", "熬", "毯", "梳", "蔬", "捡", "删", "浏", "裔", "浇", "姥", "烫", "惭", "蝴", "梨", "醋", "猾", "皂", "酱", "糙", "屉", "髦", "椒", "桔", "馒", "嚏"], name: "HSK 5", user)
```

### benchmarks.Initialize#6

Authored path: `benchmarks.Initialize`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 5.

```reaction
when Benchmarking.createBenchmark (items: ["军", "战", "政", "产", "制", "代", "立", "义", "神", "德", "统", "形", "治", "达", "强", "权", "王", "设", "品", "类", "领", "造", "组", "英", "令", "布", "未", "击", "兵", "团", "集", "华", "石", "府", "似", "官", "器", "称", "企", "委", "曾", "农", "装", "显", "念", "青", "武", "势", "古", "构", "土", "投", "某", "维", "革", "敌", "致", "派", "营", "巴", "防", "施", "型", "依", "群", "项", "织", "斗", "采", "杀", "朝", "属", "限", "威", "状", "率", "独", "创", "承", "股", "益", "血", "素", "夜", "初", "源", "食", "待", "述", "陆", "置", "劳", "财", "纳", "雷", "模", "充", "木", "龙", "冲", "射", "略", "范", "村", "哈", "退", "余", "痛", "灵", "配", "征", "挥", "胜", "阶", "沉", "善", "执", "追", "宣", "佛", "控", "税", "背", "阵", "恶", "顿", "守", "岛", "托", "烈", "索", "胡", "靠", "版", "宝", "欧", "核", "暗", "良", "升", "临", "架", "域", "括", "编", "测", "屋", "渐", "救", "枪", "县", "尚", "毫", "移", "娘", "智", "掌", "遗", "固", "席", "秘", "均", "销", "诗", "藏", "损", "忽", "巨", "炮", "录", "乡", "庭", "妇", "归", "含", "摇", "补", "谓", "毒", "疗", "逐", "寻", "厂", "岸", "炸", "载", "避", "抓", "荣", "姑", "逃", "顶", "玉", "迫", "洞", "卷", "坦", "宁", "训", "私", "丝", "握", "骨", "访", "弱", "鬼", "软", "扩", "盖", "雄", "稳", "亿", "刺", "拥", "齐", "虚", "析", "透", "替", "途", "兄", "迅", "套", "贸", "唯", "轮", "库", "迹", "促", "延", "震", "甲", "伟", "缓", "闪", "哲", "络", "纯", "忍", "筑", "贝", "振", "圆", "搞", "狂", "措", "培", "宽", "摆", "伸", "摩", "悲", "拍", "硬", "麦", "操", "阻", "订", "赞", "纷", "喊", "违", "汇", "币", "殊", "献", "裁", "触", "敬", "墙", "召", "罚", "享", "犹", "彻", "描", "妙", "彼", "仿", "闭", "庆", "泪", "朗", "尾", "偷", "虫", "淡", "恨", "繁", "伴", "旦", "潮", "粮", "缩", "挑", "灰", "珍", "幕", "映", "隔", "启", "泛", "偿", "呆", "衡", "舍", "婆", "灾", "胆", "俗", "辩", "胸", "劲", "辑", "恢", "圈", "摸", "润", "堆", "碰", "废", "壁", "吹", "糊", "盾", "乏", "诊", "摄", "凭", "抢", "绪", "肩", "幻", "碎", "综", "返", "薄", "悄", "敏", "碍", "矛", "幅", "颗", "骂", "赏", "贴", "腰", "眉", "恋", "吓", "辞", "尺", "辈", "滑", "绕", "趋", "胁", "插", "慧", "媒", "佩", "豪", "兼", "跃", "肃", "驶", "届", "欣", "惠", "册", "飘", "闲", "频", "递", "撞", "滚", "贡", "疯", "瞧", "燃", "锁", "劝", "搜", "勤", "戒", "驾", "柔", "腐", "幼", "践", "浓", "竹", "逻", "遵", "饰", "贷", "叙", "沟", "扶", "寿", "询", "匆", "奈", "慰", "怨", "躲", "紫", "艰", "慌", "吐", "咬", "挤", "弯", "雾", "屈", "蛇", "鼠", "吨", "池", "冠", "尘", "浅", "喷", "凌", "赔", "涂", "亏", "寂", "煤", "恭", "湿", "秩", "宿", "烂", "抖", "夹", "昆", "猪", "慎", "玻", "齿", "押", "漠", "疲", "醉", "拳", "斜", "档", "豆", "涨", "拼", "歇", "桃", "嘉", "俊", "乙", "妨", "挣", "览", "璃", "滴", "姿", "丑", "劣", "匹", "俱", "蜂", "糟", "谨", "苗", "肠", "挡", "纲", "肌", "膀", "卧", "欠", "夸", "豫", "胃", "睁", "铃", "吻", "脆", "柴", "绳", "眠", "傻", "扇", "柜", "拦", "夕", "姻", "氛", "蜜", "摘", "披", "辅", "盆", "吵", "嗯", "骤", "漏", "悠", "滩", "嫁", "催", "翅", "锅", "拆", "棋", "唉", "孕", "链", "艳", "臭", "趁", "愁", "孝", "冻", "闯", "宴", "矩", "胶", "盼", "脖", "虹", "账", "倡", "猴", "寓", "狮", "抄", "晕", "砍", "剪", "叉", "拐", "捐", "歪", "粘", "陌", "窄", "鞭", "厘", "厦", "恳", "憾", "摔", "愧", "洒", "哎", "钓", "蝶", "讽", "旬", "撕", "谦", "兔", "荐", "炭", "舅", "裹", "瞎", "咨", "宠", "兑", "霉", "塘", "帘", "厢", "乖", "娱", "娶", "嗓", "蹲", "淘", "嫩", "壶", "傍", "勿", "踩", "煮", "逗", "炒", "寞", "甩", "燥", "晒", "屿", "绸", "痒", "耽", "魅", "狡", "匀", "熬", "毯", "梳", "蔬", "捡", "删", "浏", "裔", "浇", "姥", "烫", "惭", "蝴", "梨", "醋", "猾", "皂", "酱", "糙", "屉", "髦", "椒", "桔", "馒", "嚏"], name: "HSK 5", user), asked by benchmarks.Initialize#5
then
  Benchmarking.createBenchmark (items: ["斯", "党", "陈", "攻", "苏", "帝", "若", "波", "异", "策", "罪", "州", "宗", "协", "审", "皇", "副", "抗", "犯", "田", "央", "伯", "监", "露", "野", "舰", "湾", "吉", "剑", "亦", "恩", "鲁", "端", "探", "湖", "予", "港", "额", "督", "泽", "灭", "莫", "亡", "圣", "诺", "伦", "奥", "唐", "堂", "宫", "君", "谋", "镇", "凡", "诸", "庄", "祖", "暴", "塔", "隐", "蒙", "欲", "遭", "徒", "姆", "曲", "塞", "侵", "刑", "谷", "川", "潜", "抵", "杰", "郑", "混", "臣", "雅", "盛", "怒", "残", "宇", "猛", "毁", "盟", "丁", "魔", "沿", "啦", "瓦", "援", "夺", "偏", "袭", "侠", "侧", "债", "融", "纵", "障", "讯", "涉", "刊", "爆", "乌", "役", "患", "仙", "症", "倾", "陷", "轰", "撤", "疾", "缘", "杜", "仪", "奔", "珠", "驻", "孔", "翼", "叹", "愈", "罢", "径", "恰", "捕", "裂", "泰", "尖", "忠", "炎", "荒", "横", "孤", "胞", "魂", "洪", "津", "晓", "仁", "贫", "赖", "仰", "艇", "凶", "署", "御", "奉", "旋", "晨", "伏", "隆", "奴", "丧", "渡", "旗", "甘", "扎", "梁", "皆", "宙", "岩", "荡", "蒂", "井", "壮", "殖", "霍", "撒", "液", "番", "郎", "忧", "浮", "艘", "伍", "峰", "黎", "贯", "侦", "券", "崇", "宪", "慈", "枝", "拖", "墨", "箭", "泥", "粉", "氏", "拔", "愤", "扑", "驱", "掩", "尸", "堡", "储", "桑", "惨", "洁", "踪", "勃", "仇", "磨", "拟", "奏", "巡", "剂", "坡", "截", "焦", "殿", "伪", "逼", "颇", "昏", "呈", "牧", "牲", "佳", "稿", "腹", "跌", "垂", "脉", "狱", "惑", "陶", "兽", "帐", "昌", "铺", "惧", "盗", "辉", "扣", "嘛", "董", "迁", "凝", "腾", "埋", "涌", "辖", "晋", "狠", "鉴", "械", "赤", "割", "揭", "悟", "锋", "祥", "阔", "誉", "筹", "丛", "牵", "鸣", "旨", "袖", "猎", "臂", "柱", "抛", "牢", "逊", "迈", "欺", "衰", "诱", "狼", "仗", "粒", "遥", "抚", "纠", "钻", "晶", "岂", "峡", "苍", "耗", "菌", "粹", "扁", "循", "赋", "抑", "哀", "踏", "恒", "纽", "纹", "渔", "磁", "铜", "跨", "怖", "叛", "遣", "弥", "稀", "捷", "疫", "肿", "削", "岗", "晃", "吞", "宏", "癌", "隶", "履", "耀", "扭", "坛", "拨", "沃", "绘", "伐", "堪", "牺", "墓", "雇", "廉", "惩", "捉", "覆", "劫", "嫌", "雕", "闷", "乳", "串", "娃", "缴", "唤", "霸", "妥", "搭", "赴", "岳", "舱", "庞", "耕", "锐", "缝", "宅", "斥", "添", "挖", "呵", "讼", "氧", "酷", "掠", "祸", "贪", "悬", "唇", "仓", "轨", "枚", "庙", "屏", "寺", "愚", "疏", "颤", "寸", "盯", "辱", "辨", "哦", "腔", "郁", "溃", "忌", "溜", "笼", "丘", "滋", "壳", "痕", "穴", "卓", "贤", "膜", "毅", "锦", "茫", "昂", "皱", "舌", "剥", "窝", "携", "陵", "哼", "棉", "饲", "逆", "喘", "罩", "炉", "胎", "蓄", "竭", "浑", "悦", "诞", "泡", "贼", "亭", "酬", "儒", "泄", "杆", "挨", "吟", "狭", "肖", "霞", "驳", "裕", "顽", "畜", "咽", "勾", "疆", "赌", "畏", "泊", "肺", "缠", "瞪", "吊", "斑", "涛", "俘", "卑", "葬", "铭", "蛮", "歧", "廊", "灌", "勉", "盲", "宰", "啥", "胀", "扯", "辽", "抹", "筒", "朴", "咐", "誓", "喉", "妄", "拘", "驰", "栏", "逝", "窃", "纤", "盈", "瞬", "婴", "颈", "倘", "蔽", "畅", "赠", "跪", "颠", "遮", "吁", "辟", "瘤", "嫂", "框", "钦", "庸", "吼", "摊", "嘱", "衷", "娇", "讶", "耸", "摧", "薪", "淋", "耻", "饥", "崩", "逢", "撑", "翔", "枯", "凑", "溪", "蠢", "阐", "旺", "碑", "挪", "脂", "谎", "慨", "掘", "逮", "掏", "晰", "罕", "挽", "舟", "骚", "拓", "坑", "兆", "崖", "刹", "芒", "筋", "棍", "钩", "嚷", "弦", "焰", "耍", "俯", "愣", "饶", "钉", "叠", "惹", "喻", "谱", "煌", "溶", "坠", "滥", "瓷", "浴", "屁", "漆", "巢", "吩", "啸", "滞", "膝", "茂", "恕", "渠", "辰", "舶", "颁", "袍", "嘲", "衔", "倦", "涵", "雀", "僵", "肢", "垄", "侨", "舆", "弊", "凄", "捧", "浸", "砖", "蒸", "陡", "哑", "坟", "眨", "搏", "拢", "昧", "擅", "爽", "搁", "雌", "哨", "巩", "昔", "谬", "谍", "媳", "冤", "鸦", "蓬", "巷", "栽", "沾", "诈", "瞒", "纺", "罐", "壤", "颂", "膨", "谐", "隙", "绑", "嘿", "挫", "辐", "乞", "哇", "绣", "杖", "衍", "攀", "譬", "肆", "泣", "屡", "躁", "椎", "砸", "帆", "窜", "丸", "斩", "堤", "塌", "贩", "掀", "谜", "捏", "滨", "虏", "卸", "沼", "株", "剖", "劈", "哗", "怯", "沫", "竖", "峻", "捞", "鄙", "魄", "兜", "哄", "颖", "屑", "蚁", "渗", "秃", "旱", "谴", "稻", "铸", "恍", "贬", "烛", "朽", "佣", "碌", "迄", "绅", "榜", "诵", "禽", "瞄", "幢", "睹", "贿", "蔑", "缚", "淹", "篷", "勘", "灿", "敞", "蜡", "辜", "垫", "妒", "谣", "枕", "丐", "泌", "叮", "掷", "侮", "蚀", "霜", "蕴", "妆", "捆", "丙", "钞", "犬", "躬", "昼", "奠", "蹈", "陋", "侣", "侄", "虐", "堕", "茎", "喇", "绒", "搅", "缔", "嫉", "灶", "鸽", "纬", "沸", "畴", "遏", "烁", "嗅", "叭", "奢", "拙", "栋", "泻", "晤", "稚", "捣", "尴", "尬", "诧", "嚼", "旷", "芽", "碳", "惕", "汹", "腥", "澄", "萎", "滔", "酿", "诫", "棕", "喧", "伺", "梢", "坝", "敷", "庇", "挠", "搂", "噪", "稼", "寝", "哺", "帜", "揉", "腻", "瘫", "觅", "僻", "蔓", "咋", "嵌", "畔", "涩", "蹦", "叨", "呕", "凸", "熄", "裳", "凹", "膛", "聋", "沮", "萌", "撇", "苟", "蚂", "俭", "帖", "煎", "墅", "伶", "歹", "廓", "讳", "瓣", "枉", "琢", "讥", "呻", "慷", "锤", "桨", "磅", "馈", "溅", "钙", "彰", "眯", "墟", "瞻", "悼", "拣", "渺", "汰", "镶", "趴", "酌", "浊", "撼", "扛", "峭", "磕", "翘", "熏", "缀", "徊", "肪", "涕", "惫", "挚", "绎", "睦", "窍", "粥", "沧", "怠", "咙", "沛", "崭", "鞠", "唾", "洽", "柬", "擎", "疤", "钝", "氓", "杠", "诬", "抒", "侈", "徘", "嗦", "狈", "搓", "赁", "婪", "紊", "兢", "扒", "痪", "宵", "岔", "韧", "憋", "衅", "隘", "濒", "剔", "淀", "缉", "斟", "拧", "蔚", "眶", "瀑", "渣", "辙", "潇", "阱", "哆", "辫", "拽", "滤", "睬", "谤", "捍", "瘾", "磋", "淆", "烘", "赂", "炫", "迸", "嗨", "惰", "椭", "侃", "瞩", "蕾", "炊", "隧", "啃", "舔", "蹬", "袱", "殴", "侥", "酝", "澈", "锈", "稠", "搀", "筛", "痹", "甭", "唠", "徙", "筐", "曝", "嘈", "蔼", "烹", "沐", "掐", "咀", "吝", "肴", "溉", "疙", "揍", "倔", "诽", "攒", "瘩", "殃", "俐", "拌", "橙", "簸", "惋", "惮", "捎", "唆", "榨", "蹋", "叼", "秤", "惦", "藐", "馅", "暧", "辕", "馋", "啬", "踊", "暄", "晾", "瘸", "挎", "阂", "雹", "酗", "拄", "掰", "荤", "饪", "熨", "涮", "锲", "啰"], name: "HSK 6", user)
```

### benchmarks.Items

Authored path: `benchmarks.Items`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 7.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 10.

```reaction
when RequestBoundary.request (benchmark, path: "/benchmarks/items", requestId, session)
then
  Sessioning.use (session)
```

### benchmarks.Items:found#2

Authored path: `benchmarks.Items`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 7.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 10.

```reaction
when Sessioning.use (session, subject: user), asked by benchmarks.Items
where
  Benchmarking._benchmarks (user) has (benchmark)
  earlier, RequestBoundary.request (benchmark, path: "/benchmarks/items", requestId, session)
then
  RequestBoundary.respond (items: former "the items in a benchmark" with (benchmark), requestId)
```

### benchmarks.Items:missing#2

Authored path: `benchmarks.Items`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 7.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 10.

```reaction
when Sessioning.use (session, subject: user), asked by benchmarks.Items
where
  earlier, RequestBoundary.request (benchmark, path: "/benchmarks/items", requestId, session)
  no Benchmarking._benchmarks (user) has (benchmark)
then
  RequestBoundary.respond (error: "BENCHMARK_NOT_FOUND", requestId)
```

### benchmarks.NotCompleted

Authored path: `benchmarks.NotCompleted`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 13.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 17.

```reaction
when RequestBoundary.request (benchmark, path: "/benchmarks/not-completed", requestId, session)
then
  Sessioning.use (session)
```

### benchmarks.NotCompleted:found#2

Authored path: `benchmarks.NotCompleted`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 13.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 17.

```reaction
when Sessioning.use (session, subject: user), asked by benchmarks.NotCompleted
where
  Benchmarking._benchmarks (user) has (benchmark)
  earlier, RequestBoundary.request (benchmark, path: "/benchmarks/not-completed", requestId, session)
then
  RequestBoundary.respond (items: former "the not-completed items in a benchmark" with (benchmark), requestId)
```

### benchmarks.NotCompleted:missing#2

Authored path: `benchmarks.NotCompleted`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 13.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 17.

```reaction
when Sessioning.use (session, subject: user), asked by benchmarks.NotCompleted
where
  earlier, RequestBoundary.request (benchmark, path: "/benchmarks/not-completed", requestId, session)
  no Benchmarking._benchmarks (user) has (benchmark)
then
  RequestBoundary.respond (error: "BENCHMARK_NOT_FOUND", requestId)
```

### benchmarks.RemoveCharacter

Authored path: `benchmarks.RemoveCharacter`.
- Covered by [Benchmarks](../design/compositions/benchmarks.md), line 20.

```reaction
when requested Tagging.removeItemTag (item, tag, user)
where
  Tagging._tags (user) has (name: "Studied", tag)
  Benchmarking._benchmarks (user) has (benchmark)
  Benchmarking._items (benchmark) has (item)
then
  Benchmarking.uncheckBenchmarkItem (benchmark, item)
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
- Covered by [Information](../design/compositions/information.md), line 17.
- Covered by [Information](../design/compositions/information.md), line 20.

```reaction
when RequestBoundary.request (description, fieldName, item, path: "/information/add-field", requestId, session)
then
  Sessioning.use (session)
```

### information.AddField#2

Authored path: `information.AddField`.
- Covered by [Information](../design/compositions/information.md), line 17.
- Covered by [Information](../design/compositions/information.md), line 20.

```reaction
when Sessioning.use (session), asked by information.AddField
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/add-field", requestId, session)
then
  InformationCollecting.addInfoField (description, fieldName, item)
```

### information.AddField#3

Authored path: `information.AddField`.
- Covered by [Information](../design/compositions/information.md), line 17.
- Covered by [Information](../design/compositions/information.md), line 20.

```reaction
when InformationCollecting.addInfoField (description, fieldName, item, infoField), asked by information.AddField#2
where
  earlier, RequestBoundary.request (description, fieldName, item, path: "/information/add-field", requestId, session)
then
  RequestBoundary.respond (infoField, requestId)
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
- Covered by [Information](../design/compositions/information.md), line 11.
- Covered by [Information](../design/compositions/information.md), line 14.

```reaction
when RequestBoundary.request (fieldName, item, path: "/information/view-field", requestId, session)
then
  Sessioning.use (session)
```

### information.ViewField#2

Authored path: `information.ViewField`.
- Covered by [Information](../design/compositions/information.md), line 11.
- Covered by [Information](../design/compositions/information.md), line 14.

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

### tags.AddCharacter

Authored path: `tags.AddCharacter`.
- Covered by [Tags](../design/compositions/tags.md), line 53.

```reaction
when Tagging.addItemTag (item, tag, user)
where
  Tagging._tags (user) has (name: "Studied", tag)
  Benchmarking._benchmarks (user) has (benchmark)
  Benchmarking._items (benchmark) has (item)
then
  Benchmarking.checkBenchmarkItem (benchmark, item)
```

### tags.AddItem

Authored path: `tags.AddItem`.
- Covered by [Tags](../design/compositions/tags.md), line 41.
- Covered by [Tags](../design/compositions/tags.md), line 44.

```reaction
when RequestBoundary.request (item, path: "/tags/add-item", requestId, session, tag)
where
  date is the current flow's instant
then
  Sessioning.use (session)
```

### tags.AddItem#2

Authored path: `tags.AddItem`.
- Covered by [Tags](../design/compositions/tags.md), line 41.
- Covered by [Tags](../design/compositions/tags.md), line 44.

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
- Covered by [Tags](../design/compositions/tags.md), line 41.
- Covered by [Tags](../design/compositions/tags.md), line 44.

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
- Covered by [Tags](../design/compositions/tags.md), line 35.
- Covered by [Tags](../design/compositions/tags.md), line 38.

```reaction
when RequestBoundary.request (path: "/tags/delete-tag", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.DeleteTag#2

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 35.
- Covered by [Tags](../design/compositions/tags.md), line 38.

```reaction
when Sessioning.use (session, subject: user), asked by tags.DeleteTag
where
  earlier, RequestBoundary.request (path: "/tags/delete-tag", requestId, session, tag)
then
  Tagging.captureTagForDeletion (tag, user)
```

### tags.DeleteTag#3

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 35.
- Covered by [Tags](../design/compositions/tags.md), line 38.

```reaction
when Tagging.captureTagForDeletion (tag, user, audience, ids), asked by tags.DeleteTag#2
then
  Sharing.revokeItems (audience, author: user, items: ids)
```

### tags.DeleteTag#4

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 35.
- Covered by [Tags](../design/compositions/tags.md), line 38.

```reaction
when Sharing.revokeItems (audience, author: user, items: ids), asked by tags.DeleteTag#3
where
  earlier, Tagging.captureTagForDeletion (tag, user, audience, ids), asked by tags.DeleteTag#2
then
  Tagging.deleteTag (tag, user)
```

### tags.DeleteTag#5

Authored path: `tags.DeleteTag`.
- Covered by [Tags](../design/compositions/tags.md), line 35.
- Covered by [Tags](../design/compositions/tags.md), line 38.

```reaction
when Tagging.deleteTag (tag, user), asked by tags.DeleteTag#4
where
  earlier, RequestBoundary.request (path: "/tags/delete-tag", requestId, session, tag)
then
  RequestBoundary.respond (requestId)
```

### tags.EditTag

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 29.
- Covered by [Tags](../design/compositions/tags.md), line 32.

```reaction
when RequestBoundary.request (name, path: "/tags/edit-tag", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.EditTag#2

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 29.
- Covered by [Tags](../design/compositions/tags.md), line 32.

```reaction
when Sessioning.use (session, subject: user), asked by tags.EditTag
where
  earlier, RequestBoundary.request (name, path: "/tags/edit-tag", requestId, session, tag)
then
  Tagging.renameTag (newName: name, tag, user)
```

### tags.EditTag#3

Authored path: `tags.EditTag`.
- Covered by [Tags](../design/compositions/tags.md), line 29.
- Covered by [Tags](../design/compositions/tags.md), line 32.

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
- Covered by [Tags](../design/compositions/tags.md), line 47.
- Covered by [Tags](../design/compositions/tags.md), line 50.

```reaction
when RequestBoundary.request (item, path: "/tags/item-membership", requestId, session)
then
  Sessioning.use (session)
```

### tags.ItemMembership#2

Authored path: `tags.ItemMembership`.
- Covered by [Tags](../design/compositions/tags.md), line 47.
- Covered by [Tags](../design/compositions/tags.md), line 50.

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

### tags.RemoveCharacter

Authored path: `tags.RemoveCharacter`.
- Covered by [Tags](../design/compositions/tags.md), line 55.

```reaction
when Tagging.removeItemTag (item, tag, user)
where
  Tagging._tags (user) has (name: "Studied", tag)
  Benchmarking._benchmarks (user) has (benchmark)
  Benchmarking._items (benchmark) has (item)
then
  Benchmarking.uncheckBenchmarkItem (benchmark, item)
```

### tags.RemoveItem

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 55.
- Covered by [Tags](../design/compositions/tags.md), line 58.

```reaction
when RequestBoundary.request (item, path: "/tags/remove-item", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.RemoveItem#2

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 55.
- Covered by [Tags](../design/compositions/tags.md), line 58.

```reaction
when Sessioning.use (session, subject: user), asked by tags.RemoveItem
where
  earlier, RequestBoundary.request (item, path: "/tags/remove-item", requestId, session, tag)
then
  Tagging.captureItemSharing (item, tag, user)
```

### tags.RemoveItem#3

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 55.
- Covered by [Tags](../design/compositions/tags.md), line 58.

```reaction
when Tagging.captureItemSharing (item, tag, user, audience, ids), asked by tags.RemoveItem#2
then
  Sharing.revokeItems (audience, author: user, items: ids)
```

### tags.RemoveItem#4

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 55.
- Covered by [Tags](../design/compositions/tags.md), line 58.

```reaction
when Sharing.revokeItems (audience, author: user, items: ids), asked by tags.RemoveItem#3
where
  earlier, Tagging.captureItemSharing (item, tag, user, audience, ids), asked by tags.RemoveItem#2
then
  Tagging.removeItemTag (item, tag, user)
```

### tags.RemoveItem#5

Authored path: `tags.RemoveItem`.
- Covered by [Tags](../design/compositions/tags.md), line 55.
- Covered by [Tags](../design/compositions/tags.md), line 58.

```reaction
when Tagging.removeItemTag (item, tag, user), asked by tags.RemoveItem#4
where
  earlier, RequestBoundary.request (item, path: "/tags/remove-item", requestId, session, tag)
then
  RequestBoundary.respond (requestId)
```

### tags.Share

Authored path: `tags.Share`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when RequestBoundary.request (audience, path: "/tags/share", requestId, session, tag)
then
  Sessioning.use (session)
```

### tags.Share#2

Authored path: `tags.Share`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when Sessioning.use (session, subject: user), asked by tags.Share
where
  earlier, RequestBoundary.request (audience, path: "/tags/share", requestId, session, tag)
then
  Tagging.captureTagSharing (tag, user)
```

### tags.Share#3

Authored path: `tags.Share`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when Tagging.captureTagSharing (tag, user, audience: previousAudience, ids), asked by tags.Share#2
then
  Sharing.revokeItems (audience: previousAudience, author: user, items: ids)
```

### tags.Share#4

Authored path: `tags.Share`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when Sharing.revokeItems (audience: previousAudience, author: user, items: ids), asked by tags.Share#3
where
  earlier, Tagging.captureTagSharing (tag, user, audience: previousAudience, ids), asked by tags.Share#2
  earlier, RequestBoundary.request (audience, path: "/tags/share", requestId, session, tag)
then
  Tagging.updateAudience (audience, tag, user)
```

### tags.Share#5

Authored path: `tags.Share`.
- Covered by [Tags](../design/compositions/tags.md), line 23.
- Covered by [Tags](../design/compositions/tags.md), line 26.

```reaction
when Tagging.updateAudience (audience, tag, user), asked by tags.Share#4
where
  earlier, RequestBoundary.request (audience, path: "/tags/share", requestId, session, tag)
then
  RequestBoundary.respond (requestId)
```

### tags.ShareCharacter

Authored path: `tags.ShareCharacter`.
- Covered by [Tags](../design/compositions/tags.md), line 53.

```reaction
when Tagging.addItemTag (item, tag, user)
then
  Tagging.generateTaggedItemID (item, tag, user)
```

### tags.ShareCharacter#2

Authored path: `tags.ShareCharacter`.
- Covered by [Tags](../design/compositions/tags.md), line 53.

```reaction
when Tagging.generateTaggedItemID (item, tag, user, id), asked by tags.ShareCharacter
where
  Tagging._audience (tag, user) has (audience)
then
  Sharing.shareItem (audience, author: user, item: id)
```

### tags.ShareCollection

Authored path: `tags.ShareCollection`.
- Covered by [Tags](../design/compositions/tags.md), line 23.

```reaction
when Tagging.updateAudience (audience, tag, user)
then
  Tagging.findTaggedItemsID (tag, user)
```

### tags.ShareCollection#2

Authored path: `tags.ShareCollection`.
- Covered by [Tags](../design/compositions/tags.md), line 23.

```reaction
when Tagging.findTaggedItemsID (tag, user, ids), asked by tags.ShareCollection
where
  earlier, Tagging.updateAudience (audience, tag, user)
then
  Sharing.shareItems (audience, author: user, items: ids)
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
- `/benchmarks/completed` — requires `session`, `benchmark`
- `/benchmarks/items` — requires `session`, `benchmark`
- `/benchmarks/not-completed` — requires `session`, `benchmark`
- `/information/add-field` — requires `session`, `item`, `fieldName`, `description`
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
- `/tags/share` — requires `session`, `tag`, `audience`
