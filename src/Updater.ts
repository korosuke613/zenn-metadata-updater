import { loadFront } from "yaml-front-matter";
import { dump, DumpOptions } from "js-yaml";

export class NotEnoughPropertyError extends Error {
  constructor(
    message = "Needs properties `title`, `emoji`, `type`, `topics` and `publish`.",
  ) {
    super(message);
    this.name = "NotEnoughPropertyError";
  }
}

export class NotLoadedMetadataError extends Error {
  constructor(
    message = "The md has not been loaded. Please use the load function to load md first.",
  ) {
    super(message);
    this.name = "NotLoadedMetadataError";
  }
}

export class InvalidMetadataError extends Error {
  constructor(metadataType: string) {
    const message = `Invalid metadata: ${metadataType}`;
    super(message);
    this.name = "InvalidMetadataError";
  }
}

export interface ZennMetadata {
  [p: string]: any;
  title: string;
  emoji: string;
  type: "idea" | "tech";
  topics: string[];
  published: boolean;
  published_at?: string;
  __content?: string;
}

const isZennMetadata = (item: any): item is ZennMetadata =>
  item.title !== undefined;

export class Updater {
  private metadata: ZennMetadata | undefined;
  private dumpOptions: DumpOptions = {
    flowLevel: -1,
    quotingType: '"',
    forceQuotes: false,
  };
  private content: string | Buffer | undefined;
  private readonly MAX_TITLE_LENGTH = 70;

  // Read Zenn markdown.
  public load(content: string | Buffer) {
    const loadObject = loadFront(content);
    if (
      loadObject.title === undefined ||
      loadObject.emoji === undefined ||
      loadObject.type === undefined ||
      loadObject.topics === undefined ||
      loadObject.published === undefined
    ) {
      throw new NotEnoughPropertyError();
    }
    this.content = content;
    this.metadata = loadFront(content) as ZennMetadata;
    delete this.metadata.__content;
  }

  public validateProperty() {
    if (!this.metadata) {
      throw new NotLoadedMetadataError();
    }

    const metadataTypes: string[] = [];

    if (this.metadata.type !== "idea" && this.metadata.type !== "tech") {
      metadataTypes.push("type");
    }

    if (this.metadata.emoji === "") {
      metadataTypes.push("emoji");
    }

    if (
      this.metadata.title === "" &&
      this.metadata.title.length <= this.MAX_TITLE_LENGTH // https://github.com/zenn-dev/zenn-editor/blob/07b2c80465466e8830e6486d0f2b0c7a8d4bee45/packages/zenn-model/src/utils.ts#L36-L44
    ) {
      console.debug(
        `\`title\` is empty or too long (> ${this.MAX_TITLE_LENGTH}).`,
      );
      metadataTypes.push("title");
    }

    if (typeof this.metadata.published !== "boolean") {
      metadataTypes.push("boolean");
    }

    if (this.metadata.published === false && this.metadata.published_at) {
      console.debug("`published_at` needs `published` to be true.");
      metadataTypes.push("published_at");
    }

    if (!this.validPublishedAt(this.metadata.published_at)) {
      metadataTypes.push("published_at");
    }

    if (metadataTypes.length !== 0) {
      const stringTypes = metadataTypes.join(", ");
      throw new InvalidMetadataError(stringTypes);
    }
  }

  validPublishedAt(publishedAt: string | undefined) {
    if (publishedAt === undefined) {
      return true;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateWithTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

    return dateRegex.test(publishedAt) || dateWithTimeRegex.test(publishedAt);
  }

  // Update property of Zenn markdown.
  updateProperty(param: ZennMetadata): void;
  updateProperty(
    key: keyof ZennMetadata,
    value: string | string[] | boolean,
  ): void;
  public updateProperty(
    paramOrKey: ZennMetadata | keyof ZennMetadata,
    value?: string | string[] | boolean,
  ): void {
    if (!this.metadata) {
      throw new NotLoadedMetadataError();
    }
    if (isZennMetadata(paramOrKey)) {
      this.metadata = paramOrKey;
      return;
    }
    this.metadata[paramOrKey] = value;
  }

  private dump(dumpOptions = this.dumpOptions): string {
    if (!this.metadata) {
      throw new NotLoadedMetadataError();
    }
    return dump(this.metadata, dumpOptions);
  }

  // Get ZennMetadata
  public get(): ZennMetadata {
    if (!this.metadata) {
      throw new NotLoadedMetadataError();
    }

    return this.metadata;
  }

  // Get updated Zenn markdown.
  public getUpdatedContent(dumpOptions = this.dumpOptions): string | Buffer {
    if (this.content === undefined) {
      throw new NotLoadedMetadataError();
    }

    let markdown: string;
    let isBuffer = true;
    if (typeof this.content !== "string") {
      markdown = this.content.toString();
    } else {
      markdown = this.content;
      isBuffer = false;
    }

    const regex = /(---)[\S\s\w\W]*?(---)/;
    const replacedMarkdown = markdown.replace(
      regex,
      `$1\n${this.dump(dumpOptions)}$2`,
    );

    if (isBuffer) {
      return Buffer.from(replacedMarkdown);
    }
    return replacedMarkdown;
  }
}
