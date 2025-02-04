const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Function to clean up temporary files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            // Ignore errors
        }
    });
}

(async () => {
    const { code } = workerData;

    // Create temporary Java file
    const tmpDir = os.tmpdir();
    const className = `TempJava${Date.now()}`;
    const javaFile = path.join(tmpDir, `${className}.java`);
    const classFile = path.join(tmpDir, `${className}.class`);

    try {
        // Java program template
        const javaCode = `
            public class ${className} {
                public static void main(String[] args) {
                    ${code}
                }
            }
        `;

        // Write Java code to file
        fs.writeFileSync(javaFile, javaCode);

        // Compile using OpenJ9
        execSync(`javac -J-XX:+UseJIT ${javaFile}`, { cwd: tmpDir });

        // Run the compiled Java program
        let output = execSync(`java -Xquickstart -cp ${tmpDir} ${className}`, {
            encoding: "utf-8",
        });

        // Cleanup temporary files
        cleanupFiles(javaFile, classFile);

        // Send output to main thread
        parentPort.postMessage({ output: output.trim() || "No output!" });
    } catch (error) {
        cleanupFiles(javaFile, classFile);
        parentPort.postMessage({ error: `Runtime Error:\n${error.message}` });
    }
})();
