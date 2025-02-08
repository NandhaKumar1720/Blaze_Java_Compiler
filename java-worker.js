const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {}
    });
}

(async () => {
    const { code, input } = workerData;

    // Generate a unique filename
    const tmpDir = os.tmpdir();
    const javaFileName = `Temp${Date.now()}`;
    const javaFilePath = path.join(tmpDir, `${javaFileName}.java`);
    
    try {
        // Write Java code to file
        fs.writeFileSync(javaFilePath, code);

        // Extract the class name (Assumes 'public class <ClassName>')
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        if (!classMatch) {
            cleanupFiles(javaFilePath);
            return parentPort.postMessage({ error: { fullError: "Error: No public class found!" } });
        }
        const className = classMatch[1];

        // Compile Java to native binary
        const nativeBinary = path.join(tmpDir, javaFileName);
        execSync(`native-image --no-fallback -o ${nativeBinary} -cp ${javaFilePath} ${className}`, { encoding: "utf-8" });

        // Run the compiled binary
        let output = "";
        try {
            output = execSync(nativeBinary, { input, encoding: "utf-8" });
        } catch (error) {
            cleanupFiles(javaFilePath, nativeBinary);
            return parentPort.postMessage({ error: { fullError: `Runtime Error:\n${error.message}` } });
        }

        // Cleanup and return output
        cleanupFiles(javaFilePath, nativeBinary);
        parentPort.postMessage({ output: output || "No output received!" });

    } catch (err) {
        cleanupFiles(javaFilePath);
        parentPort.postMessage({ error: { fullError: `Server error: ${err.message}` } });
    }
})();
