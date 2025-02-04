const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const http = require("http");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/", (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "No code provided!" });
    }

    const worker = new Worker("./java-worker.js", { workerData: { code } });

    worker.on("message", (result) => {
        res.json(result);
    });

    worker.on("error", (err) => {
        res.status(500).json({ error: `Worker error: ${err.message}` });
    });

    worker.on("exit", (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "Server is healthy!" });
});

setInterval(() => {
    http.get(`http://localhost:${port}/health`, () => console.log("Health check pinged!"));
}, 5 * 60 * 1000);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
