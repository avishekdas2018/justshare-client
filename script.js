const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn")
const fileinput = document.querySelector("#fileinput");

const bgProgress = document.querySelector(".bg-progress");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");
const fileUrlInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const toast = document.querySelector(".toast");

const emailForm = document.querySelector("#emailForm");

const host = "https://appjustshare.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;
const maxAllowedSize = 200 * 1024 * 1024;

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();

    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if (files.length) {
        fileinput.files = files;
        uploadFile();
    }
    
});


fileinput.addEventListener("change", () => {
    uploadFile();
})

browseBtn.addEventListener("click", () => {
    fileinput.click();
});

copyBtn.addEventListener("click", () => {
    fileUrlInput.select();
    document.execCommand("copy");
    showToast("🎉Copied!🎉")
})

const uploadFile = () => {
    
    if (fileinput.files.length > 1) {
        fileinput.value = "";
        showToast("Only Upload One File!")
        return;
    }
    const file = fileinput.files[0];

    if ( file.size > maxAllowedSize) {
        showToast("Can't upload more than 200MB!")
        fileinput.value = "";
        return;
    }

    progressContainer.style.display = "block";
    
    const formData = new FormData();
    formData.append("myfile", file);


    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = () => {
        fileinput.value = "";
        showToast(`Error on upload: ${xhr.statusText}`);
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData);
}

const updateProgress = (e) => {
    const percent = Math.round((e.loaded) / (e.total) * 100);
    //console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
}

const onUploadSuccess = ({file: url}) => {
    //console.log(url);
    emailForm[2].removeAttribute("disabled");
    fileinput.value = "";
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileUrlInput.value = url;
}


emailForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const url = fileUrlInput.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((res) => res.json())
        .then(({success}) => {
            if (success) {
                sharingContainer.style.display = "none";
                showToast("Email Sent🚀");
            }
        })
});

let toastTimer
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%, 160px)";
    }, 2000);
};