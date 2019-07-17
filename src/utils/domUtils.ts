export const getFirstParentOfType = (element : HTMLElement, type : string) : HTMLElement => {
    if (!element) {
        return null;
    }

    const pattern = new RegExp(type, "i");

    if (pattern.test(element.tagName)) {
        return element;
    }

    if (!element.parentElement) {
        return null;
    }

    let parent = element.parentElement;

    while (parent && !pattern.test(parent.tagName)) {
        parent = parent.parentElement;
    }

    return parent;
};
