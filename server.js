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

// Thread pool setup
const workers = [];
const maxWorkers = 4; // Adjust based on available resources

// Function to create a new worker
function createWorker() {
    return new Worker("./java-worker.js");
}

// Function to get a worker from the pool
function getWorker() {
    if (workers.length > 0) {
        return workers.pop();
    } else if (workers.length < maxWorkers) {
        return createWorker();
    } else {
        throw new Error("No available workers");
    }
}

// Function to release a worker back to the pool
function releaseWorker(worker) {
    if (workers.length < maxWorkers) {
        workers.push(worker);
    } else {
        worker.terminate();
    }
}

// POST endpoint for Java code execution
app.post("/", (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ error: { fullError: "Error: No code provided!" } });
    }

    try {
        // Get a worker from the pool
        const worker = getWorker();

        // Send code to the worker for execution
        worker.postMessage({ code, input });

        worker.on("message", (result) => {
            res.json(result);
            releaseWorker(worker);  // Release worker back to the pool
        });

        worker.on("error", (err) => {
            res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
            releaseWorker(worker);  // Release worker back to the pool
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    } catch (err) {
        res.status(500).json({ error: { fullError: `Server error: ${err.message}` } });
    }
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
}, 1 * 60 * 1000); // Ping every minute

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
