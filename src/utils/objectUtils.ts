const _ = require("lodash");

const hasMethods = (object: object, methods: Array<string>): boolean => {
    return _.every(_.map(methods, (methodName: string) => _.isFunction(_.get(object, methodName))));
};

export { hasMethods };
