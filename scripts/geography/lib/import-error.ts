/** A failure of the geography import; `issues` carries the per-item detail for the CLI. */
export class ImportError extends Error {
  constructor(
    message: string,
    readonly issues: string[] = [],
  ) {
    super(
      issues.length > 0 ? `${message}\n${issues.map((issue) => `- ${issue}`).join("\n")}` : message,
    );
    this.name = "ImportError";
  }
}
