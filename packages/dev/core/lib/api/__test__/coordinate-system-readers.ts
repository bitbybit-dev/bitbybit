import { createRequire } from "node:module";
import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type * as TypeScript from "typescript";

const ts = createRequire(import.meta.url)("typescript") as typeof TypeScript;

export type OperationRoot = { prefix: string; file: string; className: string; operations?: readonly string[] | undefined };

const SETTING = "coordinateSystem";
const SOURCES_CONDITION = "@bitbybit-dev/source";
const NOT_SOURCES = ["__test__", "__mocks__", "node_modules"];
const DEEPEST_PATH = 6;

const sourcesUnder = (packages: string, directory: string): string[] => readdirSync(resolve(packages, directory)).flatMap((name) => {
    const path = `${directory}${name}`;
    if (statSync(resolve(packages, path)).isDirectory()) {
        return NOT_SOURCES.includes(name) ? [] : sourcesUnder(packages, `${path}/`);
    }
    return name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".d.ts") ? [resolve(packages, path)] : [];
});

type Callable = TypeScript.MethodDeclaration | TypeScript.FunctionDeclaration | TypeScript.AccessorDeclaration | TypeScript.ConstructorDeclaration
    | TypeScript.VariableDeclaration | TypeScript.PropertyDeclaration;

const holdsAFunction = (node: TypeScript.VariableDeclaration | TypeScript.PropertyDeclaration): boolean =>
    node.initializer !== undefined && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer));

const isCallable = (node: TypeScript.Node): node is Callable => ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)
    || ts.isGetAccessor(node) || ts.isSetAccessor(node) || ts.isConstructorDeclaration(node)
    || ((ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) && holdsAFunction(node));

const enclosingCallable = (node: TypeScript.Node): Callable | undefined => {
    let parent = node.parent;
    while (parent !== undefined && !isCallable(parent)) {
        parent = parent.parent;
    }
    return parent;
};

const readsTheSetting = (node: TypeScript.Node): boolean => (ts.isPropertyAccessExpression(node) && node.name.text === SETTING)
    || (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression) && node.argumentExpression.text === SETTING)
    || (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent) && (node.propertyName ?? node.name).getText() === SETTING);

const isHidden = (member: TypeScript.ClassElement): boolean => (ts.getCombinedModifierFlags(member) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) !== 0
    || (member.name !== undefined && ts.isPrivateIdentifier(member.name));

export function operationsReachingTheSetting(packages: string, scanned: readonly string[], roots: readonly OperationRoot[]): Map<string, string> {
    const program = ts.createProgram(scanned.flatMap((name) => sourcesUnder(packages, `${name}/lib/`)), {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        customConditions: [SOURCES_CONDITION],
        target: ts.ScriptTarget.ES2020,
        experimentalDecorators: true,
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        types: [],
    });
    const checker = program.getTypeChecker();
    const isOwn = (file: TypeScript.SourceFile): boolean => file.fileName.startsWith(packages) && !file.fileName.includes("/node_modules/") && !file.isDeclarationFile;
    const idOf = (node: Callable | TypeScript.ClassDeclaration): string => {
        const file = node.getSourceFile().fileName.slice(packages.length + 1);
        const owner = ts.isClassLike(node.parent) ? `${node.parent.name?.text ?? "anonymous"}.` : "";
        const name = ts.isConstructorDeclaration(node) ? "constructor" : node.name !== undefined && ts.isIdentifier(node.name) ? node.name.text : "anonymous";
        return `${file}#${owner}${name}`;
    };

    const callers = new Map<string, Set<string>>();
    const reaching = new Set<string>();
    program.getSourceFiles().filter(isOwn).forEach((file) => {
        const visit = (node: TypeScript.Node): void => {
            const within = enclosingCallable(node);
            if (within !== undefined && readsTheSetting(node)) {
                reaching.add(idOf(within));
            }
            const named = ts.isPropertyAccessExpression(node) ? node.name : ts.isIdentifier(node) ? node : undefined;
            const symbol = named === undefined || within === undefined ? undefined : checker.getSymbolAtLocation(named);
            const target = symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(symbol) : symbol;
            (target?.declarations ?? []).filter((declaration) => isCallable(declaration) && isOwn(declaration.getSourceFile())).forEach((declaration) => {
                const callee = idOf(declaration as Callable);
                const known = callers.get(callee) ?? new Set<string>();
                known.add(idOf(within as Callable));
                callers.set(callee, known);
            });
            ts.forEachChild(node, visit);
        };
        visit(file);
    });
    const pending = [...reaching];
    while (pending.length > 0) {
        const callee = pending.pop() as string;
        (callers.get(callee) ?? new Set<string>()).forEach((caller) => {
            if (!reaching.has(caller)) {
                reaching.add(caller);
                pending.push(caller);
            }
        });
    }

    const classOf = (type: TypeScript.Type): TypeScript.ClassDeclaration | undefined => type.getSymbol()?.declarations
        ?.find((declaration): declaration is TypeScript.ClassDeclaration => ts.isClassDeclaration(declaration) && isOwn(declaration.getSourceFile()));
    const operations = new Map<string, string>();
    const walk = (declaration: TypeScript.ClassDeclaration, path: string, root: OperationRoot, seen: ReadonlySet<TypeScript.ClassDeclaration>): void => {
        if (seen.has(declaration) || path.split(".").length > DEEPEST_PATH) {
            return;
        }
        const along = new Set(seen).add(declaration);
        declaration.members.filter((member) => !isHidden(member) && member.name !== undefined && ts.isIdentifier(member.name)).forEach((member) => {
            const name = (member.name as TypeScript.Identifier).text;
            if (ts.isMethodDeclaration(member)) {
                const operation = `${path}${name}`;
                const listed = root.operations === undefined || root.operations.includes(operation);
                if (listed && reaching.has(idOf(member))) {
                    operations.set(`${root.prefix}${operation}`, idOf(member));
                }
            } else if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) {
                const service = classOf(checker.getTypeAtLocation(member));
                if (service !== undefined) {
                    walk(service, `${path}${name}.`, root, along);
                }
            }
        });
        const extended = declaration.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
        const parent = extended === undefined ? undefined : classOf(checker.getTypeAtLocation(extended));
        if (parent !== undefined) {
            walk(parent, path, root, seen);
        }
    };
    roots.forEach((root) => {
        const file = program.getSourceFile(resolve(packages, root.file));
        const declaration = file?.statements.find((statement): statement is TypeScript.ClassDeclaration => ts.isClassDeclaration(statement) && statement.name?.text === root.className);
        if (declaration === undefined) {
            throw new Error(`${root.className} is not declared in ${root.file}`);
        }
        walk(declaration, "", root, new Set());
    });
    return operations;
}
