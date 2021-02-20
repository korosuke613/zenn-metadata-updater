import { loadFront } from "yaml-front-matter";
import { dump, DumpOptions } from "js-yaml";

export class NotEnoughPropertyError extends Error {
  constructor(
    message = "Needs properties `title`, `emoji`, `type`, `topics` and `publish`."
  ) {
    super(message);
    this.name = "NotEnoughPropertyError";
  }
}

export class NotLoadedMetadataError extends Error {
  constructor(
    message = "The md has not been loaded. Please use the load function to load md first."
  ) {
    super(message);
    this.name = "NotLoadedMetadataError";
  }
}

export interface ZennMetadata {
  [p: string]: any;
  title: string;
  emoji: string;
  type: "idea" | "tech";
  topics: string[];
  published: boolean;
  __content?: string;
}
const isZennMetadata = (item: any): item is ZennMetadata =>
  item.title !== undefined;

export class Updater {
  private metadata: ZennMetadata | undefined;
  private dumpOptions: DumpOptions = {
    flowLevel: 1,
    quotingType: '"',
    forceQuotes: true,
  };
  private content: string | Buffer | undefined;

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

  updateProperty(param: ZennMetadata): void;
  updateProperty(
    key: keyof ZennMetadata,
    value: string | string[] | boolean
  ): void;
  public updateProperty(
    paramOrKey: ZennMetadata | keyof ZennMetadata,
    value?: string | string[] | boolean
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

  public dump(dumpOptions = this.dumpOptions): string {
    if (!this.metadata) {
      throw new NotLoadedMetadataError();
    }
    return dump(this.metadata, dumpOptions);
  }

  public get(): ZennMetadata {
    if (!this.metadata) {
      throw new NotLoadedMetadataError();
    }

    return this.metadata;
  }

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

    const regex = /(---)[\n\S\s]*(---)/;
    const replacedMarkdown = markdown.replace(
      regex,
      `$1\n${this.dump(dumpOptions)}$2`
    );

    if (isBuffer) {
      return Buffer.from(replacedMarkdown);
    }
    return replacedMarkdown;
  }
}
