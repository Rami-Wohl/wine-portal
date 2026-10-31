import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

// Each generated directory has exactly one server-only repository that may read it. The
// repository's server-only marker then protects every transitive client import, including
// via re-exports.
const generatedBoundaries = [
  {
    directory: path.join(root, "src/generated/content") + path.sep,
    repository: path.join(root, "src/content/repository.ts"),
    messageId: "repositoryOnly",
  },
  {
    directory: path.join(root, "src/generated/geography") + path.sep,
    repository: path.join(root, "src/content/geography.ts"),
    messageId: "geographyRepositoryOnly",
  },
];

const contentBoundaries = {
  rules: {
    "generated-content": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          repositoryOnly:
            "Read generated content through the server-only content repository; pass small, serializable results to client components.",
          geographyRepositoryOnly:
            "Read generated Atlas scenes through the server-only geography repository (src/content/geography.ts); pass one serialized scene view to components.",
        },
      },
      create(context) {
        const filename = path.resolve(context.filename);
        function check(node, source) {
          if (!source || typeof source.value !== "string") return;
          const specifier = source.value;
          const target = specifier.startsWith("@/")
            ? path.resolve(root, "src", specifier.slice(2))
            : specifier.startsWith(".") || path.isAbsolute(specifier)
              ? path.resolve(path.dirname(filename), specifier)
              : null;
          if (!target) return;
          for (const boundary of generatedBoundaries) {
            if (target.startsWith(boundary.directory) && filename !== boundary.repository) {
              context.report({ node, messageId: boundary.messageId });
            }
          }
        }
        return {
          ImportDeclaration: (node) => check(node, node.source),
          ExportNamedDeclaration: (node) => check(node, node.source),
          ExportAllDeclaration: (node) => check(node, node.source),
          ImportExpression: (node) => check(node, node.source),
          CallExpression: (node) => {
            if (node.callee.type === "Identifier" && node.callee.name === "require") {
              check(node, node.arguments[0]);
            }
          },
        };
      },
    },
  },
};

export default contentBoundaries;
