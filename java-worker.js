const { parentPort } = require("worker_threads");
const net = require("net");

parentPort.on("message", ({ code }) => {
    const client = new net.Socket();
    let output = "";

    client.connect(5555, "127.0.0.1", () => {
        client.write(code + "\n__EOF__\n");
    });

    client.on("data", (data) => {
        output += data.toString();
        if (output.includes("__END__")) {
            parentPort.postMessage({ output: output.replace("__END__", "").trim() });
            client.destroy();
        }
    });

    client.on("error", (err) => {
        parentPort.postMessage({ error: { fullError: `Server error: ${err.message}` } });
    });
});
