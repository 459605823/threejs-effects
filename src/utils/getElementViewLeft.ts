export default function getElementViewLeft(element: HTMLElement) {
  let actualLeft = element.offsetLeft;
  let current = element.offsetParent;

  while (current !== null) {
    actualLeft += (current as HTMLElement).offsetLeft;
    current = (current as HTMLElement).offsetParent;
  }
  let elementScrollLeft;
  if (document.compatMode === 'BackCompat') {
    elementScrollLeft = document.body.scrollLeft;
  } else if (document.documentElement.scrollTop === 0) {
    elementScrollLeft = document.body.scrollLeft;
  } else {
    elementScrollLeft = document.documentElement.scrollLeft;
  }

  return actualLeft - elementScrollLeft;
}
