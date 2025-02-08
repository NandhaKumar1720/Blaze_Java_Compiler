const { parentPort } = require("worker_threads");
const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Use RAM-based temp directory on Linux
const TMP_DIR = os.platform() === "linux" ? "/dev/shm" : os.tmpdir();

parentPort.on("message", ({ code, input }) => {
    const tmpDir = fs.mkdtempSync(path.join(TMP_DIR, "java-"));
    const javaFile = path.join(tmpDir, "Main.java");

    try {
        fs.writeFileSync(javaFile, code);

        // 🚀 Compile Java Code with Optimizations
        const compileProcess = spawnSync("javac", ["-J-Xmx64m", "-g:none", "-nowarn", javaFile], { encoding: "utf-8" });
        if (compileProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${compileProcess.stderr}` },
            });
        }

        // 🚀 Run Java Code with Optimizations
        const execProcess = spawnSync("java", ["-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "-Xss512k", "-Xbatch", "-cp", tmpDir, "Main"], {
            input,
            encoding: "utf-8",
            timeout: 1500, // Reduce execution timeout
        });

        // Clean up temp files in RAM (Fast!)
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
