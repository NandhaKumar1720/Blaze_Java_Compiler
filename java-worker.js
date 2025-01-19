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
    const { code, input } = workerData;

    // Paths for temporary Java files
    const tmpDir = os.tmpdir();
    const javaFile = path.join(tmpDir, `TempProgram_${Date.now()}.java`);
    const classFile = javaFile.replace(".java", ".class");

    try {
        // Write the Java code to the source file
        fs.writeFileSync(javaFile, code);

        // Compile the Java code
        try {
            execSync(`javac ${javaFile}`, { encoding: "utf-8" });
        } catch (error) {
            cleanupFiles(javaFile);
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${error.message}` },
            });
        }

        // Execute the compiled Java program
        let output = "";
        try {
            const className = path.basename(javaFile, ".java");
            output = execSync(`java -cp ${tmpDir} ${className}`, {
                input, // Pass input to the Java program
                encoding: "utf-8",
            });
        } catch (error) {
            cleanupFiles(javaFile, classFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up temporary files
        cleanupFiles(javaFile, classFile);

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        cleanupFiles(javaFile, classFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
