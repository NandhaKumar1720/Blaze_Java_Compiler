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
            // Ignore errors (for files that may not exist)
        }
    });
}

// Worker logic
(async () => {
    const { code } = workerData;

    // Paths for temporary Java files
    const tmpDir = os.tmpdir();
    const javaFile = path.join(tmpDir, `TempProgram_${Date.now()}.java`);
    const outputFile = path.join(tmpDir, `TempProgram_${Date.now()}`);

    try {
        // Write the Java code to the source file
        fs.writeFileSync(javaFile, code);

        // Compile the Java file using GraalVM's native-image
        try {
            execSync(`native-image -cp ${tmpDir} -H:Name=${outputFile} -H:Class=TempProgram`, {
                encoding: "utf-8",
                stdio: "pipe",
            });
        } catch (error) {
            cleanupFiles(javaFile);
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${error.message}` },
            });
        }

        // Execute the compiled binary
        let output = "";
        try {
            output = execSync(outputFile, { encoding: "utf-8" });
        } catch (error) {
            cleanupFiles(javaFile, outputFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up files
        cleanupFiles(javaFile, outputFile);

        // Send the output back to the main thread
        parentPort.postMessage({ output: output || "No output received!" });

    } catch (err) {
        cleanupFiles(javaFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
