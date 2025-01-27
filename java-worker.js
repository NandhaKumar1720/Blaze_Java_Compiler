const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const os = require("os");
const path = require("path");

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Use temporary directory for in-memory compilation
        const tmpDir = os.tmpdir();
        const javaFile = path.join(tmpDir, "Main.java");

        // Write the Java code to the Main.java file
        require('fs').writeFileSync(javaFile, code);

        // Compile the Java code using GraalVM
        exec(
            `javac -cp ${tmpDir} ${javaFile}`,  // GraalVM is used for faster compilation
            (err, stdout, stderr) => {
                if (err) {
                    return parentPort.postMessage({
                        error: { fullError: `Compilation Error:\n${stderr}` },
                    });
                }

                // Execute the Java program using GraalVM
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
            }
        );
    } catch (err) {
        parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
