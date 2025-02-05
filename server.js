const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const http = require("http");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Middleware for JSON parsing
app.use(bodyParser.json());

// POST endpoint for Java code execution
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


// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "Server is healthy!" });
});

// Self-pinging mechanism to keep the server alive
setInterval(() => {
    http.get(`http://localhost:${port}/health`, (res) => {
        console.log("Health check pinged!");
    });
}, 1 * 60 * 1000); // Ping every 1 minute

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
