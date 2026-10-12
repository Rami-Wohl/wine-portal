// Node kan een tweede programma starten: een kindproces. Dat heeft eigen geheugen.
// Hier regelen we het uitlezen en stoppen daarvan; de meetcode kiest wat het uitvoert.
import { spawn, type ChildProcess } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

// `async` betekent dat deze functie op werk kan wachten zonder Node vast te zetten.
// Een Promise is het ontvangstbewijs van dat werk: later volgt een waarde of fout.
export async function command(
  args: string[],
  cwd: string,
  logFile: string,
  executable = process.execPath,
): Promise<{ stdout: string; elapsedMs: number }> {
  const started = performance.now();
  // spawn start een programma. args zijn opdrachtopties, cwd is de werkmap,
  // env geeft instellingen door. stdio kiest onze verbindingen: geen invoer,
  // wel twee pijpen om normale tekst en foutmeldingen te kunnen lezen.
  const child = spawn(executable, args, {
    cwd,
    env: {
      ...process.env,
      TSX_TSCONFIG_PATH: path.join(process.cwd(), "tsconfig.json"),
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "",
    stderr = "";
  // stdout bevat normale uitvoer; stderr bevat foutmeldingen. Ze komen in stukjes.
  // setEncoding bewaart halve UTF-8-tekens tussen stukjes, bijvoorbeeld bij 'é'.
  child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
  child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
  let startError: Error | undefined;
  const code = await new Promise<number | null>((resolve) => {
    child.once("error", (error) => (startError = error));
    // Een event is een melding van Node. 'exit' zegt: programma gestopt.
    // 'close' zegt ook: uitvoerkanalen dicht. Pas dan is onze tekst compleet.
    child.once("close", resolve);
  });
  await writeFile(logFile, `${stdout}\n${stderr}`);
  if (startError) throw startError;
  if (code !== 0) throw new Error(`Command failed (${code}); see ${logFile}`);
  return { stdout, elapsedMs: performance.now() - started };
}

// Stop eerst vriendelijk (SIGTERM), daarna gedwongen (SIGKILL).
// Ook een al gestopt of nooit gestart proces is toegestaan. Zo blijft opruimen veilig.
export async function stopProcess(child: ChildProcess, graceMs = 5_000, killWaitMs = 1_000) {
  // exitCode is null óók na stoppen door een signaal. Daarom controleren we beide.
  if (child.pid === undefined || child.exitCode !== null || child.signalCode !== null) return;
  let killTimer: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let onExit: () => void = () => {};
  let onError: (error: Error) => void = () => {};
  try {
    await new Promise<void>((resolve, reject) => {
      onExit = resolve;
      onError = reject;
      // Luister vóór kill: een snel stoppend programma mag onze melding niet missen.
      child.once("exit", onExit);
      child.once("error", onError);
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), graceMs);
      deadline = setTimeout(
        () => reject(new Error(`Process ${child.pid} did not stop after SIGKILL.`)),
        graceMs + killWaitMs,
      );
    });
  } finally {
    // Timers en luisteraars zijn ook middelen: laat ze niet achter na succes of fout.
    clearTimeout(killTimer);
    clearTimeout(deadline);
    child.removeListener("exit", onExit);
    child.removeListener("error", onError);
  }
}
