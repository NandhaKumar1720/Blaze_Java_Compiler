const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const os = require("os");

const app = express();
const port = 3000;
const maxWorkers = os.cpus().length; // Use CPU cores for concurrency

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.post("/", (req, res) => {
    const { code, input } = req.body;
    if (!code) return res.status(400).json({ error: { fullError: "No code provided!" } });

    const worker = new Worker("./java-worker.js", { workerData: { code, input } });

    worker.on("message", (result) => res.json(result));
    worker.on("error", (err) => res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } }));
    worker.on("exit", (code) => {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
});

app.get("/health", (req, res) => res.status(200).json({ status: "Server is healthy!" }));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
