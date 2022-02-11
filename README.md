# zenn-metadata-updater
[![npm version](https://badge.fury.io/js/zenn-metadata-updater.svg)](https://badge.fury.io/js/zenn-metadata-updater)

Update metadata in Zenn markdown file for npm.

## Install
```console
npm install zenn-metadata-updater
```

## Usage

hoge-zenn-article.md
```markdown
---
title: "Productivity Weekly (20xx-xx-xx号)"
emoji: "😇"
type: "idea"
topics: ["ProductivityWeekly", "生産性向上"]
published: false
---
# Content start

```

### Update metadata

#### Single param
```ts
const markdownPath = "hoge-zenn-article.md"
const markdown = readFileSync(markdownPath);

const updater = new Updater();
await updater.load(markdown);

updater.updateProperty("published", true);

console.log(updater.getUpdatedContent());
/*
---
title: "Productivity Weekly (20xx-xx-xx号)"
emoji: "😇"
type: "idea"
topics: ["ProductivityWeekly", "生産性向上"]
published: false
---
# Content start
 */
```

#### Multi param
```ts
const markdownPath = "hoge-zenn-article.md"
const markdown = readFileSync(markdownPath);

const updater = new Updater();
await updater.load(markdown);

const param: ZennMetadata = {
  title: "hoge",
  emoji: "㊙️",
  type: "tech",
  topics: ["fuga", "bar"],
  published: false,
};

updater.updateProperty(param);

console.log(updater.getUpdatedContent());
/*
---
title: "hoge"
emoji: "㊙️"
type: "tech"
topics: ["fuga", "bar"]
published: false
---
# Content start
 */
```

### Validate metadata

invalid-zenn-article.md
```markdown
---
title: ""
emoji: ""
type: "hoge"
topics: ["ProductivityWeekly", "生産性向上"]
published: ""
---
# Content start
```

```ts
const markdownPath = "invalid-zenn-article.md"
const markdown = readFileSync(markdownPath);

const updater = new Updater();
updater.load(markdown);
updater.validateProperty();
// Invalid metadata: type, emoji, title, boolean
```
