const { parentPort } = require("worker_threads");
const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

const JAVA_OPTS = ["-Xcomp", "-XX:+TieredCompilation", "-XX:+AggressiveOpts"]; // Optimized flags
const tmpDir = path.join(os.tmpdir(), "java-cache"); // Use persistent temp directory

// Ensure temp directory exists (avoiding re-creation overhead)
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

parentPort.on("message", ({ code, input }) => {
    const javaFile = path.join(tmpDir, "Main.java");
    const classFile = path.join(tmpDir, "Main.class");

    try {
        fs.writeFileSync(javaFile, code);

        // Compile Java code with GraalVM and aggressive optimizations
        const compileProcess = spawnSync("javac", [javaFile, "-d", tmpDir], { encoding: "utf-8" });
        if (compileProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${compileProcess.stderr}` },
            });
        }

        // Run Java code with GraalVM
        const execProcess = spawnSync("java", [...JAVA_OPTS, "-cp", tmpDir, "Main"], {
            input,
            encoding: "utf-8",
            timeout: 1500, // Reduce timeout to force quick execution
        });

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
