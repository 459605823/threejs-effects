/* eslint-disable no-restricted-properties */
const PI = Math.PI / 180;
const R = 6378137;

function degreesToRadians(d: number) {
  return d * PI;
}

function formatLineArray(polyline: any) {
  const lnglats = polyline.getCoordinates();
  return lnglats.map((lnglat: any) => lnglat.toArray());
}
function distance(c1: any, c2: any) {
  if (!c1 || !c2) {
    return 0;
  }
  if (!Array.isArray(c1)) {
    c1 = c1.toArray();
  }
  if (!Array.isArray(c2)) {
    c2 = c2.toArray();
  }
  let b = degreesToRadians(c1[1]);
  const d = degreesToRadians(c2[1]);
  const e = b - d;
  const f = degreesToRadians(c1[0]) - degreesToRadians(c2[0]);
  b =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(e / 2), 2) +
          Math.cos(b) * Math.cos(d) * Math.pow(Math.sin(f / 2), 2)
      )
    );
  b *= R;
  return Math.round(b * 1e5) / 1e5;
}

function lineLength(polyline: any) {
  let lnglatArray = polyline;
  if (!Array.isArray(polyline)) {
    lnglatArray = formatLineArray(polyline);
  }
  let l = 0;
  for (let i = 0, len = lnglatArray.length; i < len - 1; i++) {
    l += distance(lnglatArray[i], lnglatArray[i + 1]);
  }
  return l;
}
export default lineLength;
