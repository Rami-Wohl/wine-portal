export class AtlasBuildError extends Error {
  constructor(public readonly issues: string[]) {
    super(
      `Atlas display build failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:\n\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
    );
    this.name = "AtlasBuildError";
  }
}

/** A failure of one scene; the build collects these per scene file into an AtlasBuildError. */
export class SceneBuildError extends Error {}
