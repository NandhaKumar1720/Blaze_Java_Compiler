const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const os = require("os");
const path = require("path");

const javaCompilerPath = "javac";
const javaExecutorPath = "java";

// Worker logic
(async () => {
    const { code, input } = workerData;

    try {
        // Run the Java code in-memory without writing it to a file
        exec(`${javaCompilerPath} -Xlint:all -g:none -cp ${os.tmpdir()} -d ${os.tmpdir()} -sourcepath ${os.tmpdir()} -encoding UTF-8`, (err, stdout, stderr) => {
            if (err) {
                return parentPort.postMessage({
                    error: { fullError: `Compilation Error:\n${stderr}` },
                });
            }

            // Execute the Java program after compilation
            exec(`${javaExecutorPath} -cp ${os.tmpdir()} Main`, { input }, (runErr, output, runStderr) => {
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
