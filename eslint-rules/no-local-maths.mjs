const HALF_TURN_DEGREES = 180;
const HALF_TURN_NAME = /^(?:HALF_TURN|HALF_TURN_DEGREES|DEGREES_PER_HALF_TURN|STRAIGHT_ANGLE)$/;

const GENERIC_NAMES = new Set([
    "add2", "add3", "subtract", "subtract2", "subtract3", "scale2", "scale3", "dot", "dot2", "dot3", "cross", "cross2", "cross3",
    "plus", "minus", "length2", "length3", "magnitude", "normalize", "normalized", "normalize2", "normalize3", "unit", "unitOf", "unit2", "unit3", "distance", "distance2", "distance3",
    "lerp", "between", "midpoint", "clamp", "clamp01", "smoothstep", "fract", "remap", "polar", "polar2", "rotated", "rotated2", "rotate2",
    "rotatePoint", "degToRad", "radToDeg", "toRadians", "toDegrees", "radiansOf", "degreesOf", "transformPoint", "movedPoint",
    "applyMatrix", "angleBetween",
]);

const WHERE = {
    degrees: "`math.degToRad` and `math.radToDeg` (helpers/geometry/scalars `radiansOf`, `degreesOf`)",
    acos: "`vector.angleBetween` (helpers/geometry/scalars `angleOfCosine`)",
    dot: "`vector.dot` (helpers/geometry/vectors `dot2`, `dot3`)",
    cross: "`vector.cross` (helpers/geometry/vectors `cross2`, `cross3`)",
    length: "`vector.length` and `point.distance` (helpers/geometry/vectors `length2`, `length3`)",
    componentwise: "`vector.add`, `vector.sub`, `vector.mul`, `vector.lerp` and `point.translatePoints` (helpers/geometry/vectors `add3`, `subtract3`, `scale3`)",
    matrix: "`point.transformPoint` (helpers/geometry/matrices)",
    name: "the services and `services/helpers` of `@bitbybit-dev/base`",
};

const MATRIX_COLUMNS = [[0, 4, 8], [1, 5, 9], [2, 6, 10]];

const ARITHMETIC = ["+", "-", "*", "/"];

function unwrapped(node) {
    let current = node;
    while (current && (current.type === "TSNonNullExpression" || current.type === "TSAsExpression" || current.type === "TSTypeAssertion")) {
        current = current.expression;
    }
    return current;
}

function isMathMember(node, name) {
    const target = unwrapped(node);
    return target?.type === "MemberExpression" && !target.computed && target.object.type === "Identifier"
        && target.object.name === "Math" && target.property.type === "Identifier" && target.property.name === name;
}

function isMathCall(node, name) {
    return node.type === "CallExpression" && isMathMember(node.callee, name);
}

function isNumber(node, value) {
    const target = unwrapped(node);
    if (target?.type === "UnaryExpression" && target.operator === "-") {
        return isNumber(target.argument, -value);
    }
    return target?.type === "Literal" && target.value === value;
}

function boundedRest(node, name, bound) {
    const target = unwrapped(node);
    if (target?.type !== "CallExpression" || !isMathMember(target.callee, name) || target.arguments.length !== 2) {
        return undefined;
    }
    const [first, second] = target.arguments;
    return isNumber(first, bound) ? second : isNumber(second, bound) ? first : undefined;
}

function isClampedCosine(node) {
    const belowOne = boundedRest(node, "min", 1);
    if (belowOne !== undefined && boundedRest(belowOne, "max", -1) !== undefined) {
        return true;
    }
    const aboveMinusOne = boundedRest(node, "max", -1);
    return aboveMinusOne !== undefined && boundedRest(aboveMinusOne, "min", 1) !== undefined;
}

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow writing vector, matrix and angle arithmetic that `@bitbybit-dev/base` already provides",
        },
        schema: [],
        messages: {
            localMaths:
                "This is {{ what }}, which base already provides: {{ where }}. Call it rather than writing the arithmetic here; if base lacks what you need, add it to base's services/helpers with tests and a public service method (packages/dev/CLAUDE.md, \"Maths lives once, in base\").",
        },
    },
    create(context) {
        const text = (node) => context.sourceCode.getText(unwrapped(node));

        const indexOf = (node) => {
            const target = unwrapped(node);
            if (target?.type !== "MemberExpression" || !target.computed) {
                return undefined;
            }
            const property = unwrapped(target.property);
            return property.type === "Literal" && Number.isInteger(property.value) ? { object: text(target.object), index: property.value } : undefined;
        };

        const report = (node, kind, what) => context.report({ node, messageId: "localMaths", data: { what, where: WHERE[kind] } });

        const chainOf = (node, operators) => {
            const target = unwrapped(node);
            if (target.type === "BinaryExpression" && operators.includes(target.operator)) {
                const right = chainOf(target.right, operators).map((term) => ({ ...term, negative: target.operator === "-" ? !term.negative : term.negative }));
                return [...chainOf(target.left, operators), ...right];
            }
            return [{ node: target, negative: false }];
        };

        const isOutermost = (node, operators) => {
            const parent = node.parent;
            return !(parent?.type === "BinaryExpression" && operators.includes(parent.operator));
        };

        const productIndexes = (node) => {
            const target = unwrapped(node);
            if (target.type !== "BinaryExpression" || target.operator !== "*") {
                return undefined;
            }
            const left = indexOf(target.left);
            const right = indexOf(target.right);
            return left && right ? [left, right] : undefined;
        };

        const dotRunAt = (terms, start) => {
            const products = [];
            for (let at = start; at < terms.length && products.length < 3; at++) {
                const product = terms[at].negative ? undefined : productIndexes(terms[at].node);
                const [first] = products;
                const continues = product !== undefined && product[0].index === products.length && product[1].index === products.length
                    && (first === undefined || (product[0].object === first[0].object && product[1].object === first[1].object));
                if (!continues) {
                    break;
                }
                products.push(product);
            }
            return products.length;
        };

        const isDot = (terms) => terms.some((_, start) => dotRunAt(terms, start) >= 2);

        const isMatrixRow = (terms) => {
            if (terms.length < 3) {
                return false;
            }
            const matrixIndexes = new Map();
            for (const term of terms) {
                const target = unwrapped(term.node);
                if (target.type !== "BinaryExpression" || target.operator !== "*") {
                    continue;
                }
                for (const factor of [target.left, target.right]) {
                    const indexed = indexOf(factor);
                    if (indexed) {
                        matrixIndexes.set(indexed.object, [...(matrixIndexes.get(indexed.object) ?? []), indexed.index]);
                    }
                }
            }
            return [...matrixIndexes.values()].some((indexes) => MATRIX_COLUMNS.some((column) => column.every((index) => indexes.includes(index))));
        };

        const isSquare = (node) => {
            const target = unwrapped(node);
            if (target.type === "BinaryExpression" && target.operator === "**") {
                const exponent = unwrapped(target.right);
                return exponent.type === "Literal" && exponent.value === 2;
            }
            return target.type === "BinaryExpression" && target.operator === "*" && text(target.left) === text(target.right);
        };

        const isSumOfSquares = (terms) => terms.length >= 2 && terms.length <= 3 && terms.every((term) => isSquare(term.node));

        const isComponentOf = (node, index) => {
            const target = unwrapped(node);
            const indexed = indexOf(target);
            if (indexed) {
                return indexed.index === index;
            }
            if (target.type === "BinaryExpression" && target.operator === "-") {
                const left = indexOf(target.left);
                const right = indexOf(target.right);
                return left?.index === index && right?.index === index;
            }
            return false;
        };

        const componentPattern = (node, index) => {
            const target = unwrapped(node);
            if (target.type !== "BinaryExpression" || !ARITHMETIC.includes(target.operator)) {
                return undefined;
            }
            let usesIndex = false;
            let foreignIndex = false;
            const source = context.sourceCode.getText(target);
            const pattern = source.replace(/\[(\d+)\]/g, (whole, digits) => {
                if (Number(digits) === index) {
                    usesIndex = true;
                    return "[#]";
                }
                foreignIndex = true;
                return whole;
            });
            return usesIndex && !foreignIndex ? pattern : undefined;
        };

        const isCross = (elements) => {
            if (elements.length !== 3) {
                return false;
            }
            return elements.every((element, index) => {
                const target = unwrapped(element);
                if (target?.type !== "BinaryExpression" || target.operator !== "-") {
                    return false;
                }
                const first = productIndexes(target.left);
                const second = productIndexes(target.right);
                const next = (index + 1) % 3;
                const after = (index + 2) % 3;
                return first !== undefined && second !== undefined
                    && first[0].index === next && first[1].index === after && second[0].index === after && second[1].index === next
                    && first[0].object === second[0].object && first[1].object === second[1].object;
            });
        };

        const isFunctionValue = (node) => node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression";

        return {
            BinaryExpression(node) {
                if ((node.operator === "*" || node.operator === "/") && isOutermost(node, ["*", "/"])) {
                    const factors = chainOf(node, ["*", "/"]).map((term) => term.node);
                    const hasPi = factors.some((factor) => isMathMember(factor, "PI"));
                    const hasHalfTurn = factors.some((factor) => (factor.type === "Literal" && factor.value === HALF_TURN_DEGREES) || (factor.type === "Identifier" && HALF_TURN_NAME.test(factor.name)));
                    if (hasPi && hasHalfTurn) {
                        report(node, "degrees", "a conversion between degrees and radians");
                        return;
                    }
                }
                if ((node.operator === "+" || node.operator === "-") && isOutermost(node, ["+", "-"])) {
                    const terms = chainOf(node, ["+", "-"]);
                    const isLength = node.parent?.type === "CallExpression" && isMathCall(node.parent, "sqrt") && isSumOfSquares(chainOf(node, ["+"]));
                    if (isDot(terms) && !isLength) {
                        report(node, "dot", "a dot product");
                    } else if (isMatrixRow(terms)) {
                        report(node, "matrix", "a point or vector multiplied by a 4x4 matrix");
                    }
                }
            },
            CallExpression(node) {
                if (isMathCall(node, "acos") && node.arguments.length === 1 && isClampedCosine(node.arguments[0])) {
                    report(node, "acos", "an angle from a cosine held between -1 and 1");
                    return;
                }
                if (isMathCall(node, "sqrt") && node.arguments.length === 1) {
                    if (isSumOfSquares(chainOf(node.arguments[0], ["+"]))) {
                        report(node, "length", "the length of a vector or the distance between two points");
                    }
                    return;
                }
                if (isMathCall(node, "hypot") && node.arguments.length >= 2 && node.arguments.length <= 3
                    && node.arguments.every((argument, index) => isComponentOf(argument, index))) {
                    report(node, "length", "the length of a vector or the distance between two points");
                }
            },
            ArrayExpression(node) {
                const elements = node.elements;
                if (elements.length < 2 || elements.length > 3 || elements.some((element) => element === null || element.type === "SpreadElement")) {
                    return;
                }
                if (isCross(elements)) {
                    report(node, "cross", "a cross product");
                    return;
                }
                const patterns = elements.map((element, index) => componentPattern(element, index));
                if (patterns.every((pattern) => pattern !== undefined && pattern === patterns[0])) {
                    report(node, "componentwise", "the same arithmetic applied to each component of a vector");
                }
            },
            FunctionDeclaration(node) {
                if (node.id && GENERIC_NAMES.has(node.id.name)) {
                    report(node.id, "name", `a function named \`${node.id.name}\`, generic maths by its name`);
                }
            },
            VariableDeclarator(node) {
                if (node.id.type === "Identifier" && GENERIC_NAMES.has(node.id.name) && isFunctionValue(node.init)) {
                    report(node.id, "name", `a function named \`${node.id.name}\`, generic maths by its name`);
                }
            },
        };
    },
};
