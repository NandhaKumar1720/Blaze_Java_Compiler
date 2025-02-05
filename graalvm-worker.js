app.post("/", (req, res) => {
    const { code, className } = req.body; // Expecting both code and className

    // Validate input
    if (!code || !className) {
        return res.status(400).json({ error: { fullError: "Error: No code or class name provided!" } });
    }

    // Create a worker thread for Java code execution
    const worker = new Worker("./graalvm-worker.js", {
        workerData: { code, className },
    });

    worker.on("message", (result) => {
        res.json(result);
    });

    worker.on("error", (err) => {
        res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
    });

    worker.on("exit", (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});
