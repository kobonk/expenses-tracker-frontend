import _ from "lodash";

function component() {
    let element = document.createElement("div");
    let button = document.createElement("button");
    let br = document.createElement("br");

    button.innerHTML = "CLICK ME!";
    element.appendChild(br);
    element.appendChild(button);

    button.onclick = () => {
        import(/* webpackChunkName: "print" */ "./print")
        .then(module => {
            let print = module.default;

            print()
        })
    };

    return element;
}

document.body.appendChild(component());