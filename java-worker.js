const { parentPort, workerData } = require("worker_threads");
const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

parentPort.on("message", ({ code, input }) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "java-"));
    const javaFile = path.join(tmpDir, "Main.java");
    const classFile = path.join(tmpDir, "Main.class");

    try {
        fs.writeFileSync(javaFile, code);

        // Compile Java code
        const compileProcess = spawnSync("javac", [javaFile], { encoding: "utf-8" });
        if (compileProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${compileProcess.stderr}` },
            });
        }

        // Run Java code
        const execProcess = spawnSync("java", ["-cp", tmpDir, "Main"], {
            input,
            encoding: "utf-8",
            timeout: 2000,
        });

        // Clean up temporary files
        fs.rmSync(tmpDir, { recursive: true, force: true });

        if (execProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${execProcess.stderr}` },
            });
        }

        parentPort.postMessage({
            output: execProcess.stdout.trim() || "No output received!",
        });
    } catch (err) {
        parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
});
