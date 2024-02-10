import {
  InvalidMetadataError,
  NotEnoughPropertyError,
  Updater,
  ZennMetadata,
} from "../Updater";

const errorInput = `---
post: title one
anArray:
 - one
 - two
subObject:
 prop1: cool
 prop2: two
reg: !!js/regexp /pattern/gim
fun: !!js/function function() {  }
---
content
more`;

const input = `---
title: "Productivity Weekly (20xx-xx-xx号)"
emoji: "😇"
type: "idea"
topics: ["ProductivityWeekly", "生産性向上"]
published: false
---
# Content start


---
aaa
`;

const invalidInput = `---
title: ""
emoji: ""
type: "hoge"
topics: ["ProductivityWeekly", "生産性向上"]
published: ""
---
# Content start


---
aaa
`;

const invalidInput2 = `---
title: "hoge"
emoji: "😎"
type: "tech"
topics: ["ProductivityWeekly", "生産性向上"]
published: false
published_at: "2023-09-09 12:23"
---
# Content start


---
aaa
`;

const invalidInput3 = `---
title: "hoge"
emoji: "😎"
type: "tech"
topics: ["ProductivityWeekly", "生産性向上"]
published: true
published_at: "hoge"
---
# Content start


---
aaa
`;

test("throw error because load dummy metadata", () => {
  const updater = new Updater();
  expect(() => {
    updater.load(errorInput);
  }).toThrow(NotEnoughPropertyError);
});

test("load metadata", () => {
  const updater = new Updater();
  updater.load(input);
});

test("update property for key value", () => {
  const updater = new Updater();
  updater.load(input);
  updater.updateProperty("published", true);
  expect(updater.get().published).toEqual(true);
});

test("update property for param", () => {
  const updater = new Updater();
  updater.load(input);
  const param: ZennMetadata = {
    title: "hoge",
    emoji: "㊙️",
    type: "tech",
    topics: ["fuga", "bar"],
    published: false,
  };
  updater.updateProperty(param);
  const expected = `---
title: hoge
emoji: ㊙️
type: tech
topics:
  - fuga
  - bar
published: false
---
# Content start


---
aaa
`;
  const actual = updater.getUpdatedContent();
  expect(actual).toEqual(expected);
});

test("update property for param 2", () => {
  const updater = new Updater();
  updater.load(input);
  const param: ZennMetadata = {
    title: "hoge",
    emoji: "㊙️",
    type: "tech",
    topics: ["fuga", "bar"],
    published: true,
    published_at: "2023-09-09 12:23",
  };
  updater.updateProperty(param);
  const expected = `---
title: hoge
emoji: ㊙️
type: tech
topics:
  - fuga
  - bar
published: true
published_at: 2023-09-09 12:23
---
# Content start


---
aaa
`;
  const actual = updater.getUpdatedContent();
  expect(actual).toEqual(expected);
});

test("update property for nested param", () => {
  const updater = new Updater();
  updater.load(input);
  const param: ZennMetadata = {
    title: "hoge",
    emoji: "㊙️",
    type: "tech",
    topics: ["fuga", "bar"],
    published: true,
    published_at: "2023-09-09 12:23",
    user_defined: {
      publish_link:
        "https://zenn.dev/cybozu_ept/articles/productivity-weekly-20240124",
      note: `_本項の執筆者: [@korosuke613](https://zenn.dev/korosuke613)_
_本項の執筆者: [@defaultcf](https://zenn.dev/defaultcf)_
_本項の執筆者: [@Kesin11](https://zenn.dev/kesin11)_
_本項の執筆者: [@r4mimu](https://zenn.dev/r4mimu)_
_本項の執筆者: [@uta8a](https://zenn.dev/uta8a)_
`,
    },
  };
  updater.updateProperty(param);
  const expected = `---
title: hoge
emoji: ㊙️
type: tech
topics:
  - fuga
  - bar
published: true
published_at: 2023-09-09 12:23
user_defined:
  publish_link: https://zenn.dev/cybozu_ept/articles/productivity-weekly-20240124
  note: |
    _本項の執筆者: [@korosuke613](https://zenn.dev/korosuke613)_
    _本項の執筆者: [@defaultcf](https://zenn.dev/defaultcf)_
    _本項の執筆者: [@Kesin11](https://zenn.dev/kesin11)_
    _本項の執筆者: [@r4mimu](https://zenn.dev/r4mimu)_
    _本項の執筆者: [@uta8a](https://zenn.dev/uta8a)_
---
# Content start


---
aaa
`;
  const actual = updater.getUpdatedContent();
  expect(actual).toEqual(expected);
});

test("write file for string", () => {
  const updater = new Updater();
  updater.load(input);
  updater.updateProperty("published", true);
  const expected = `---
title: Productivity Weekly (20xx-xx-xx号)
emoji: 😇
type: idea
topics:
  - ProductivityWeekly
  - 生産性向上
published: true
---
# Content start


---
aaa
`;
  const actual = updater.getUpdatedContent();
  expect(actual).toEqual(expected);
});

test("write file for buffer", () => {
  const updater = new Updater();
  updater.load(Buffer.from(input));
  updater.updateProperty("published", true);
  const expected = `---
title: Productivity Weekly (20xx-xx-xx号)
emoji: 😇
type: idea
topics:
  - ProductivityWeekly
  - 生産性向上
published: true
---
# Content start


---
aaa
`;
  const actual = updater.getUpdatedContent();
  expect(actual).toEqual(Buffer.from(expected));
});

test("validate valid metadata", () => {
  const updater = new Updater();
  updater.load(Buffer.from(input));
  updater.validateProperty();
});

test("validate invalid metadata", () => {
  const updater = new Updater();
  updater.load(Buffer.from(invalidInput));
  expect(() => {
    updater.validateProperty();
  }).toThrowError(new InvalidMetadataError("type, emoji, title, boolean"));
});

test("validate invalid published_at: published false", () => {
  const updater = new Updater();
  updater.load(Buffer.from(invalidInput2));
  expect(() => {
    updater.validateProperty();
  }).toThrowError(new InvalidMetadataError("published_at"));
});

test("validate invalid published_at: invalid format", () => {
  const updater = new Updater();
  updater.load(Buffer.from(invalidInput3));
  expect(() => {
    updater.validateProperty();
  }).toThrowError(new InvalidMetadataError("published_at"));
});
