import {
  NotEnoughPropertyError,
  ZennMetadata,
  Updater,
  InvalidMetadataError,
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
title: "hoge"
emoji: "㊙️"
type: "tech"
topics: ["fuga", "bar"]
published: false
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
title: "Productivity Weekly (20xx-xx-xx号)"
emoji: "😇"
type: "idea"
topics: ["ProductivityWeekly", "生産性向上"]
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
title: "Productivity Weekly (20xx-xx-xx号)"
emoji: "😇"
type: "idea"
topics: ["ProductivityWeekly", "生産性向上"]
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
