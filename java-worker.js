const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// Generate unique filenames for security
const uniqueId = Date.now();
const javaFileName = `Temp${uniqueId}.java`;
const classFileName = `Temp${uniqueId}`;
const javaFilePath = path.join("/tmp", javaFileName);

// Write the Java code to a temporary file
fs.writeFileSync(javaFilePath, workerData.code);

// Compile the Java file
exec(`javac ${javaFilePath}`, (compileErr, compileStdout, compileStderr) => {
    if (compileErr) {
        parentPort.postMessage({ error: compileStderr });
        return;
    }

    // Execute the compiled Java class
    const command = `java -cp /tmp ${classFileName}`;
    exec(command, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
        if (runErr) {
            parentPort.postMessage({ error: runStderr });
            return;
        }

        // Send back the execution result
        parentPort.postMessage({ output: runStdout.trim() });

        // Cleanup: Delete the temp files
        fs.unlinkSync(javaFilePath);
        fs.unlinkSync(path.join("/tmp", `${classFileName}.class`));
    });
});
