import print from "./print";
import { join } from "lodash";

function component(): HTMLElement {
    let element:HTMLElement = document.createElement("div");

    element.innerHTML = join(["Hello", "once", "again", "TypeScript!"], " ");
    element.onclick = print.bind(null, "I'm here!");

    return element;
}

document.body.appendChild(component());