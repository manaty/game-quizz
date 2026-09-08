// Keep live question images, focused controls and running animations in place.
// Only a new question's data-scene key replaces its card and starts an entrance.
export function patchView(root, markup) {
  const template = document.createElement('template');
  template.innerHTML = markup;
  function patch(old, next) {
    if (old.nodeType !== next.nodeType || old.nodeName !== next.nodeName ||
        (old.nodeType === 1 && old.getAttribute('data-scene') !== next.getAttribute('data-scene'))) {
      old.parentNode.replaceChild(next.cloneNode(true), old);
      return;
    }
    if (old.nodeType !== 1) {
      if (old.nodeValue !== next.nodeValue) old.nodeValue = next.nodeValue;
      return;
    }
    for (const attr of Array.from(old.attributes)) if (!next.hasAttribute(attr.name)) old.removeAttribute(attr.name);
    for (const attr of Array.from(next.attributes)) if (old.getAttribute(attr.name) !== attr.value) old.setAttribute(attr.name, attr.value);
    children(old, next);
  }
  function children(old, next) {
    const nodes = Array.from(next.childNodes);
    nodes.forEach((node, i) => old.childNodes[i] ? patch(old.childNodes[i], node) : old.appendChild(node.cloneNode(true)));
    while (old.childNodes.length > nodes.length) old.removeChild(old.lastChild);
  }
  children(root, template.content);
}
