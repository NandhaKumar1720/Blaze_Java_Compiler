const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const os = require("os");

const app = express();
const port = 3000;
const workerPool = [];

app.use(cors());
app.use(bodyParser.json());

function getWorker() {
    return workerPool.length ? workerPool.pop() : new Worker("./java-worker.js");
}

app.post("/", (req, res) => {
    const { code, input } = req.body;
    if (!code) return res.status(400).json({ error: { fullError: "No code provided!" } });

    const worker = getWorker();
    worker.postMessage({ code, input });

    worker.once("message", (result) => {
        res.json(result);
        workerPool.push(worker); // Reuse worker
    });

    worker.once("error", (err) => {
        res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
    });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
