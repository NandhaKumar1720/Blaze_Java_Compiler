const { parentPort } = require("worker_threads");
const { spawn } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

parentPort.on("message", ({ code, input }) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "java-"));
    const javaFile = path.join(tmpDir, "Main.java");

    fs.writeFileSync(javaFile, code);

    const compile = spawn("javac", [javaFile]);
    compile.on("close", (code) => {
        if (code !== 0) {
            return parentPort.postMessage({ error: { fullError: "Compilation error" } });
        }

        const exec = spawn("java", ["-cp", tmpDir, "Main"], { input });

        let output = "";
        exec.stdout.on("data", (data) => (output += data.toString()));

        exec.on("close", () => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
            parentPort.postMessage({ output: output.trim() || "No output received!" });
        });
    });
});
