import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { fetchInternalImage } =
  require("next/dist/server/image-optimizer") as typeof import("next/dist/server/image-optimizer");
const { serveStatic } =
  require("next/dist/server/serve-static") as typeof import("next/dist/server/serve-static");

// Deze regressie zit in Next zelf. We gebruiken zijn echte bestandsstream, zodat
// een dependency-upgrade het afhandelen van afgebroken aanvragen blijft bewaken.
// Achtergrond: https://github.com/vercel/next.js/pull/98168
describe("Next image optimizer client disconnects", () => {
  it.each([
    { state: "connected", disconnected: false },
    { state: "already disconnected", disconnected: true },
  ])("finishes reading a public image when the client is $state", async ({ disconnected }) => {
    const directory = await mkdtemp(path.join(tmpdir(), "oeno-image-test-"));
    const file = path.join(directory, "fixture.png");
    const bytes = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64",
    );
    const socket = new Socket();
    const request = new IncomingMessage(socket);
    request.method = "GET";
    const response = new ServerResponse(request);
    let deadline: NodeJS.Timeout | undefined;

    try {
      await writeFile(file, bytes);
      if (disconnected) socket.destroy();
      expect(socket.writable).toBe(!disconnected);

      // Een socket is de verbinding met de browser. De interne bestandslezing
      // moet ook zonder die verbinding aflopen; anders blijft de gedeelde
      // afbeeldingscache wachten en lopen latere bezoekers op dezelfde URL vast.
      const image = await Promise.race([
        fetchInternalImage("/fixture.png", request, response, 1024, (req, res) =>
          serveStatic(req, res, file),
        ),
        new Promise<never>((_, reject) => {
          deadline = setTimeout(
            () => reject(new Error("Internal image fetch did not finish")),
            2000,
          );
        }),
      ]);
      expect(image.buffer).toEqual(bytes);
      expect(image.contentType).toBe("image/png");
    } finally {
      clearTimeout(deadline);
      response.destroy();
      request.destroy();
      socket.destroy();
      await rm(directory, { recursive: true, force: true });
    }
  });
});
