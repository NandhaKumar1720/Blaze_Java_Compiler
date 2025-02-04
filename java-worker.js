const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

(async () => {
    const { code } = workerData;

    // Validate basic Java structure
    if (!code.includes("class") || !code.includes("public static void main")) {
        return parentPort.postMessage({
            error: { fullError: "Invalid Java code structure!" },
        });
    }

    try {
        const tmpDir = os.tmpdir();
        const className = `TempClass_${Date.now()}`;
        const sourceFile = path.join(tmpDir, `${className}.java`);

        // Wrap the code
        const wrappedCode = `
            import org.codehaus.janino.SimpleCompiler;

            public class ${className} {
                public static void main(String[] args) throws Exception {
                    String javaCode = "public class DynamicClass { public static void run() { " + args[0] + " } }";
                    SimpleCompiler compiler = new SimpleCompiler();
                    compiler.cook(javaCode);
                    Class<?> compiledClass = compiler.getClassLoader().loadClass("DynamicClass");
                    compiledClass.getMethod("run").invoke(null);
                }
            }
        `;

        // Write Java code to a file
        fs.writeFileSync(sourceFile, wrappedCode);

        // Run Java with Janino JAR
        let output = "";
        try {
            output = execSync(`java -cp /app/lib/janino.jar:. ${className}`, {
                encoding: "utf-8",
            });
        } catch (error) {
            return parentPort.postMessage({
                error: { fullError: `Execution Error: ${error.message}` },
            });
        }

        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
