export function disableGUI() {
  const lilGui = document.getElementsByClassName("lil-gui")[0] as HTMLElement;
  lilGui.style.pointerEvents = "none";
  lilGui.style.opacity = "0.5";
}

export function enableGUI() {
  const lilGui = document.getElementsByClassName("lil-gui")[0] as HTMLElement;
  lilGui.style.pointerEvents = "all";
  lilGui.style.opacity = "1";
}

export function showSpinner() {
  const element = document.createElement("div");
  element.id = "spinner";
  element.className = "lds-ellipsis";
  element.innerHTML = `
    <div></div>
    <div></div>
    <div></div>
`;

  document.body.appendChild(element);
}

export function hideSpinner() {
  const el = document.getElementById("spinner");
  if (el) {
    el.remove();
  }
}
