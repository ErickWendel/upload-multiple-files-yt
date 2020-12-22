let bytesAmount = 0;
const API_URL = "http://localhost:3000"
const ioClient = io.connect(API_URL);
const ON_UPLOAD_EVENT = "file-uploaded"

const socketId = console.log("connected", ioClient)
ioClient.on("connect", (msg) => console.log("connected!"));

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    );
}

function updateStatus(size) {
    const text = `Missing upload ${formatBytes(size)}`;
    document.getElementById("size").innerHTML = text;
}

ioClient.on(ON_UPLOAD_EVENT, (msg) => {
    console.log("uploaded!", msg);
    bytesAmount = bytesAmount - msg;
    updateStatus(bytesAmount);
});

const showSize = () => {
    const input = document.getElementById("file");
    const file = input.files[0];
    if (!file) return;

    bytesAmount = file.size;
    updateStatus(file.size);
};

const updateUrl = () => document.getElementById('form').action = API_URL + `?socketId=${ioClient.id}`

window.showSize = showSize;
window.onload = updateUrl;

