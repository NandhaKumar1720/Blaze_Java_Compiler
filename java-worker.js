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

        // Compile the Java code in-memory (without creating a file on disk)
        exec(
            `javac -Xlint:all -g:none -cp ${tmpDir} -d ${tmpDir} -sourcepath ${tmpDir} -encoding UTF-8`,
            (err, stdout, stderr) => {
                if (err) {
                    return parentPort.postMessage({
                        error: { fullError: `Compilation Error:\n${stderr}` },
                    });
                }

                // Execute the Java program after compilation
                exec(`${tmpDir}/Main`, { input }, (runErr, output, runStderr) => {
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
