const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            // Ignore errors (file may not exist)
        }
    });
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Paths for temporary Java files
    const tmpDir = os.tmpdir();
    const sourceFile = path.join(tmpDir, `Temp${Date.now()}.java`);
    const classFile = sourceFile.replace(".java", ".class");

    try {
        // Write the Java code to the source file
        fs.writeFileSync(sourceFile, code);

        // Compile the Java code using GraalVM
        const graalCommand = "native-image --no-fallback -o temp_exec";
        execSync(`${graalCommand} -cp ${sourceFile}`, { encoding: "utf-8" });

        // Run the compiled executable
        let output = "";
        try {
            output = execSync("./temp_exec", {
                input, // Pass input to the Java program
                encoding: "utf-8",
            });
        } catch (error) {
            cleanupFiles(sourceFile, classFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up temporary Java files after execution
        cleanupFiles(sourceFile, classFile, "./temp_exec");

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        cleanupFiles(sourceFile, classFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
