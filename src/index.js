import print from "./print";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
        .then(registration => {
            console.log("SW registered!");
        })
        .catch(registrationError => {
            console.log("SW registration FAILED:", registrationError);
        });
    })
}

function component() {
    let element = document.createElement("div");

    element.innerHTML = join(["Hello", "Webpack!"], " ");
    element.onclick = print.bind(null, "Hi There!");

    return element;
}

document.body.appendChild(component());
