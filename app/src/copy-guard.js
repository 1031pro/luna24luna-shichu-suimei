const EDITABLE_SELECTOR = "input, textarea, select, button, [contenteditable='true']";

function isEditableTarget(target) {
  return target instanceof Element && Boolean(target.closest(EDITABLE_SELECTOR));
}

function preventOutsideEditable(event) {
  if (isEditableTarget(event.target)) return;
  event.preventDefault();
}

document.addEventListener("contextmenu", preventOutsideEditable);
document.addEventListener("copy", preventOutsideEditable);
document.addEventListener("cut", preventOutsideEditable);
document.addEventListener("dragstart", preventOutsideEditable);
document.addEventListener("selectstart", preventOutsideEditable);

document.addEventListener("keydown", (event) => {
  if (isEditableTarget(event.target)) return;

  const key = event.key.toLowerCase();
  const withModifier = event.ctrlKey || event.metaKey;
  const blockedKeys = ["c", "s", "u", "p"];

  if (withModifier && blockedKeys.includes(key)) {
    event.preventDefault();
  }
});
