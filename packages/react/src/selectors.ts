export function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const tagName = element.tagName?.toLowerCase();
  if (!tagName) {
    return '';
  }

  // Stop at body — no need to traverse further up
  if (tagName === 'body' || tagName === 'html') {
    return tagName;
  }

  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName) {
    const currentTag = current.tagName.toLowerCase();

    // Stop at body/html — they add no value for CSS selectors
    if (currentTag === 'body' || currentTag === 'html') {
      break;
    }

    if (current.id) {
      path.unshift(`#${current.id}`);
      break;
    }

    let selector = currentTag;

    if (current.classList?.length > 0) {
      const firstClass = current.classList.item(0);
      if (firstClass) {
        selector += `.${firstClass}`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}