const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const os = require("os");
const path = require("path");

const app = express();
const port = 3000;
const maxWorkers = os.cpus().length;
const workerPool = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Pre-initialize workers to keep JVM warm
for (let i = 0; i < maxWorkers; i++) {
    workerPool.push(new Worker(path.join(__dirname, "java-worker.js")));
}

// Function to get a worker from the pool
function getWorker() {
    return workerPool.length ? workerPool.pop() : new Worker(path.join(__dirname, "java-worker.js"));
}

app.post("/", (req, res) => {
    const { code, input } = req.body;
    if (!code) return res.status(400).json({ error: { fullError: "No code provided!" } });

    const worker = getWorker();
    worker.postMessage({ code, input });

    worker.once("message", (result) => {
        res.json(result);
        workerPool.push(worker); // Reuse worker to maintain a warm JVM
    });

    worker.once("error", (err) => {
        res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
    });

    worker.once("exit", (code) => {
        if (code !== 0) console.error(`Worker exited with code ${code}`);
    });
});

app.get("/health", (req, res) => res.status(200).json({ status: "Server is healthy!" }));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
