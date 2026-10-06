import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const repository = path.join(root, "src/content/repository.ts");
const generatedDirectory = path.join(root, "src/generated/content") + path.sep;

// The repository is the single runtime entry to generated data. Its server-only
// marker then protects every transitive client import, including via re-exports.
export default {
  rules: {
    "generated-content": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          repositoryOnly:
            "Read generated content through the server-only content repository; pass small, serializable results to client components.",
        },
      },
      create(context) {
        const filename = path.resolve(context.filename);
        if (filename === repository) return {};
        function check(node, source) {
          if (!source || typeof source.value !== "string") return;
          const specifier = source.value;
          const target = specifier.startsWith("@/")
            ? path.resolve(root, "src", specifier.slice(2))
            : specifier.startsWith(".") || path.isAbsolute(specifier)
              ? path.resolve(path.dirname(filename), specifier)
              : null;
          if (target?.startsWith(generatedDirectory)) {
            context.report({ node, messageId: "repositoryOnly" });
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
