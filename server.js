const express = require("express");
const { Worker } = require("worker_threads");

const app = express();
app.use(express.json());

app.post("/run", (req, res) => {
    const code = req.body.code;

    const worker = new Worker("./java-worker.js");
    worker.postMessage({ code });

    worker.on("message", (message) => {
        res.json({ output: message.output });
    });

    worker.on("error", (err) => {
        res.status(500).json({ error: err.message });
    });
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
