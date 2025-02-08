const { parentPort } = require("worker_threads");
const { spawn } = require("child_process");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");

parentPort.on("message", async ({ code, input }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "java-"));
    const javaFile = path.join(tmpDir, "Main.java");

    try {
        await fs.writeFile(javaFile, code);

        // ⚡ Compile Java Code (Optimized)
        const compile = spawn("javac", ["-d", tmpDir, javaFile]);
        await new Promise((resolve, reject) => {
            compile.on("exit", code => code === 0 ? resolve() : reject("Compilation Failed"));
        });

        // ⚡ Run Java Code with Optimized JVM Startup
        const exec = spawn("java", ["-Xshare:on", "-cp", tmpDir, "Main"], {
            input,
            encoding: "utf-8"
        });

        let output = "";
        exec.stdout.on("data", data => output += data.toString());
        exec.stderr.on("data", err => console.error(`Error: ${err.toString()}`));

        exec.on("exit", async () => {
            await fs.rm(tmpDir, { recursive: true, force: true });
            parentPort.postMessage({ output: output.trim() || "No output!" });
        });
    } catch (err) {
        parentPort.postMessage({ error: { fullError: `Server error: ${err.message}` } });
    }
});
