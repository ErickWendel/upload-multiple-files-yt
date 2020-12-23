let bytesAmount = 0;
const API_URL = "http://localhost:3000"
const ON_UPLOAD_EVENT = "file-uploaded"



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
    const text = `Pending Bytes to upload: <strong>${formatBytes(size)}</strong>`;
    document.getElementById("size").innerHTML = text;
}

function showSize() {
    const { files: fileElements } = document.getElementById("file");
    if (!fileElements.length) return;

    const files = Array.from(fileElements)

    const { size } = files
        .reduce((prev, next) => ({ size: prev.size + next.size }), { size: 0 });


    bytesAmount = size
    updateStatus(size);

    // const interval = setInterval(() => {
    //     console.count() 
    //     const result = bytesAmount - 5e6;
    //     bytesAmount = result < 0 ? 0 : result 
    //     updateStatus(bytesAmount);
    //     if(bytesAmount === 0) clearInterval(interval)
    // }, 50);
};


const configureForm = (targetUrl) => {
    const form = document.getElementById('form')
    form.action = targetUrl
    form.addEventListener('reset', () => updateStatus(0))
}

const updateMessage = (message) => {
    const msg = document.getElementById('msg')
    msg.innerText = message

    msg.classList.add('alert', 'alert-primary')

    setTimeout(() => {
        msg.hidden = true
    }, 3000);
}

const showMessages = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serverMessage = urlParams.get('msg')
    if (!serverMessage) return;

    updateMessage(serverMessage)

}

const onload = () => {
    showMessages()

    const ioClient = io.connect(API_URL, { withCredentials: false });
    ioClient.on("connect", (msg) => {
        console.log("connected!", ioClient.id)
        const targetUrl = API_URL + `?socketId=${ioClient.id}`
        configureForm(targetUrl)
    });

    ioClient.on(ON_UPLOAD_EVENT, (bytesReceived) => {
        // console.log("uploaded!", msg);
        bytesAmount = bytesAmount - bytesReceived;
        updateStatus(bytesAmount);
    });

    updateStatus(0)
}


window.showSize = showSize;
window.onload = onload;

