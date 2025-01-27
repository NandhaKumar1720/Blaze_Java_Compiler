const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const os = require("os");
const path = require("path");

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Path for in-memory file handling
    const tmpDir = os.tmpdir();
    const javaFile = path.join(tmpDir, "Main.java");

    try {
        // Write the Java code to the Main.java file
        const fs = require("fs");
        fs.writeFileSync(javaFile, code);

        // Compile and run the Java code using child_process in a more optimized way
        exec(`javac ${javaFile}`, (compileErr, stdout, stderr) => {
            if (compileErr) {
                return parentPort.postMessage({
                    error: { fullError: `Compilation Error:\n${stderr}` },
                });
            }

            // Execute the Java program
            exec(`java -cp ${tmpDir} Main`, { input }, (runErr, output, runStderr) => {
                if (runErr) {
                    return parentPort.postMessage({
                        error: { fullError: `Runtime Error:\n${runStderr}` },
                    });
                }

                // Send the output back to the main thread
                parentPort.postMessage({
                    output: output || "No output received!",
                });
            });
        });

    } catch (err) {
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
