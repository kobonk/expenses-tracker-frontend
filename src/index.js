import "./style.sass";

function getComponent() {
    return import(/* webpackChunkName: "lodash" */ "lodash")
    .then(({ default: _ }) => {
        let element = document.createElement("pre");

        console.log("Started at:", new Date());
    
        element.innerHTML = "Hello webpack!";
        element.classList.add("hello");
    
        return element;
    })
    .catch(error => {
        console.log("An error occured:", error);
    })
}

getComponent()
.then(component => {
    document.body.appendChild(component)
});