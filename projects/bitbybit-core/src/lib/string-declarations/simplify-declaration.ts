export function simplifyDeclaration(declaration: string): string {
    // declaration files for monaco don't need to export anything
    declaration = declaration.replace(/export /g, '');
    // remove all html image data
    const arrayOfLines = declaration.match(/[^\r\n]+/g);
    const noHtml = arrayOfLines.filter(line =>
        !(line.includes('<div>') || line.includes('<img') || line.includes('</div>') || line.includes('import') || line.includes('export'))
    );
    const remainder = noHtml.join('\n');
    return remainder;
}
