import print from "./print";

function component() {
    let element = document.createElement("div");

    element.innerHTML = join(["Hello", "Webpack!"], " ");
    element.onclick = print.bind(null, "Hi There!");

    return element;
}

document.body.appendChild(component());
