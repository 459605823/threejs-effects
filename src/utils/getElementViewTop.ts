export default function getElementViewTop(element: HTMLElement) {
  let actualTop = element.offsetTop;
  let current = element.offsetParent;

  while (current !== null) {
    actualTop += (current as HTMLElement).offsetTop;
    current = (current as HTMLElement).offsetParent;
  }

  let elementScrollTop;

  if (document.compatMode === 'BackCompat') {
    elementScrollTop = document.body.scrollTop;
  } else if (document.documentElement.scrollTop === 0) {
    elementScrollTop = document.body.scrollTop;
  } else {
    elementScrollTop = document.documentElement.scrollTop;
  }

  return actualTop - elementScrollTop;
}
