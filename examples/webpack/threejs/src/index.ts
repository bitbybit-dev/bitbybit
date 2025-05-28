function component() {
    const element = document.createElement('div');
    element.innerHTML = 'Hello WORLD Matas';
    return element;
}

document.body.appendChild(component());