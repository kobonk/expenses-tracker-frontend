import _ from "lodash";
import printMe from "./print.js";
import "./style.sass";

function component() {
    let element = document.createElement("div");
    let button = document.createElement("button");

    console.log("Started at:", new Date());

    element.innerHTML = _.join(["Hello", "Webpack"], " ");
    element.classList.add("hello");

    button.innerHTML = "Click me!";
    button.onclick = printMe;

    element.appendChild(button);

    return element;
}

document.body.appendChild(component());
