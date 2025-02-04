const { parentPort, workerData } = require("worker_threads");
const { createCompiler } = require("janino");
const os = require("os");
const fs = require("fs");
const path = require("path");

(async () => {
    const { code } = workerData;

    // Validate basic Java structure
    if (!code.includes("class") || !code.includes("public static void main")) {
        return parentPort.postMessage({
            error: { fullError: "Invalid Java code structure!" },
        });
    }

    try {
        // Prepare temporary directory and file
        const tmpDir = os.tmpdir();
        const className = `TempClass_${Date.now()}`;
        const sourceFile = path.join(tmpDir, `${className}.java`);

        // Wrap code to ensure it runs safely
        const wrappedCode = `
            import java.io.*;
            public class ${className} {
                public static void main(String[] args) {
                    try {
                        ${code}
                    } catch (Exception e) {
                        System.out.println("Runtime Error: " + e.getMessage());
                    }
                }
            }
        `;

        // Write Java code to a file
        fs.writeFileSync(sourceFile, wrappedCode);

        // Compile using Janino
        const compiler = createCompiler();
        compiler.cook(wrappedCode);

        // Run the compiled Java class
        let output = "";
        try {
            const result = compiler.getMethod(`${className}.main`, [String[]]);
            output = result([]); // Run the compiled main method
        } catch (error) {
            return parentPort.postMessage({
                error: { fullError: `Execution Error: ${error.message}` },
            });
        }

        // Send output back to main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
