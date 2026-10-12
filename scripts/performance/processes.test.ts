// We starten hier kleine echte Node-programma's, zonder webserver of wijncontent.
// Daarmee testen we juist de grens waar gewone functies geen controle over hebben:
// uitvoer die later arriveert, een mislukte start en een programma dat niet wil stoppen.
import { spawn } from "node:child_process";
import { once, EventEmitter } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ChildProcess } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { command, stopProcess } from "./processes";

const directories: string[] = [];
const children: ChildProcess[] = [];
async function logFile() {
  const directory = await mkdtemp(path.join(tmpdir(), "oeno-process-test-"));
  directories.push(directory);
  return path.join(directory, "command.log");
}

afterEach(async () => {
  await Promise.all(children.splice(0).map((child) => stopProcess(child, 50)));
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("benchmark child processes", () => {
  it("waits for pipe closure, including output arriving after the direct child exits", async () => {
    const file = await logFile();
    // Het tweede programma houdt de uitvoerpijp nog even open nadat het eerste stopt.
    // Wachten op alleen 'exit' zou hier de tweede helft van het JSON-antwoord missen.
    const delayed = "setTimeout(() => process.stdout.write('true}'), 100)";
    const script = `const {spawn}=require('node:child_process'); process.stdout.write('{"complete":'); spawn(process.execPath, ['-e', ${JSON.stringify(delayed)}], {stdio:['ignore',1,2]}).unref();`;
    const result = await command(["-e", script], process.cwd(), file);
    expect(JSON.parse(result.stdout)).toEqual({ complete: true });
    expect(await readFile(file, "utf8")).toContain('{"complete":true}');
  });

  it("decodes characters correctly when UTF-8 bytes arrive separately", async () => {
    const script =
      "process.stdout.write(Buffer.from([0xc3])); setTimeout(()=>process.stdout.write(Buffer.from([0xa9])),50);";
    const result = await command(["-e", script], process.cwd(), await logFile());
    expect(result.stdout).toBe("é");
  });

  it("rejects failed commands and retains their diagnostic output", async () => {
    const file = await logFile();
    await expect(
      command(["-e", "console.error('expected failure');process.exitCode=7"], process.cwd(), file),
    ).rejects.toThrow(/Command failed \(7\)/);
    expect(await readFile(file, "utf8")).toContain("expected failure");
  });

  it("rejects a failed spawn without hanging", async () => {
    const file = await logFile();
    await expect(command([], process.cwd(), file, `${file}-missing-program`)).rejects.toMatchObject(
      { code: "ENOENT" },
    );
  });

  it("stops a running child and also accepts an already signal-terminated child", async () => {
    const child = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"]);
    children.push(child);
    await once(child, "spawn");
    await stopProcess(child);
    expect(child.signalCode).toBe("SIGTERM");
    await stopProcess(child);
  });

  it("accepts a child that could not start", async () => {
    const child = spawn("/oeno-program-does-not-exist");
    await once(child, "error");
    await stopProcess(child);
  });

  it("forces shutdown when the child ignores SIGTERM", async () => {
    const child = spawn(process.execPath, [
      "-e",
      "process.on('SIGTERM',()=>{}); console.log('ready'); setInterval(()=>{},1000)",
    ]);
    children.push(child);
    await once(child.stdout!, "data");
    await stopProcess(child, 50);
    expect(child.signalCode).toBe("SIGKILL");
  });

  it("reports a failure rather than waiting forever if no termination event arrives", async () => {
    // Alleen deze onmogelijke procesreactie bootsen we na. Een echt onstopbaar proces
    // zouden we na de test immers ook niet veilig kunnen opruimen.
    const child = Object.assign(new EventEmitter(), {
      pid: 123,
      exitCode: null,
      signalCode: null,
      kill: () => true,
    }) as unknown as ChildProcess;
    await expect(stopProcess(child, 5, 5)).rejects.toThrow(/did not stop/);
    expect(child.listenerCount("exit")).toBe(0);
    expect(child.listenerCount("error")).toBe(0);
  });
});
