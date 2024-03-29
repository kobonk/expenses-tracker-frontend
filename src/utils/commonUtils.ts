export const debounce: Function = (func: Function, wait: number, immediate: boolean = false) => {
    let timeout: NodeJS.Timeout = undefined;

	return function() {
        const context = this;
        const args = arguments;

		const later = () => {
            timeout = null;

			if (!immediate) {
                func.apply(context, args);
            }
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);

		timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
	};
};
