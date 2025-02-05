const { parentPort, workerData } = require("worker_threads");
const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

(async () => {
    const { code, input } = workerData;
    const tmpDir = os.tmpdir();
    const javaFile = path.join(tmpDir, "Main.java");
    const classFile = path.join(tmpDir, "Main.class");

    try {
        fs.writeFileSync(javaFile, code);

        // Compile Java Code (Use spawnSync for faster execution)
        const compileProcess = spawnSync("javac", [javaFile], { encoding: "utf-8" });
        if (compileProcess.error || compileProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${compileProcess.stderr}` },
            });
        }

        // Run Java Code (Faster execution, input support)
        const execProcess = spawnSync("java", ["-cp", tmpDir, "Main"], {
            input,
            encoding: "utf-8",
            timeout: 3000, // Avoid long executions
        });

        fs.unlinkSync(javaFile);
        fs.unlinkSync(classFile);

        if (execProcess.error || execProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${execProcess.stderr}` },
            });
        }

        parentPort.postMessage({
            output: execProcess.stdout.trim() || "No output received!",
        });
    } catch (err) {
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
