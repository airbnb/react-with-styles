function flattenDown(items, flattenedArray) {
  for (let i = 0; i < items.length; i++) {
    if (Array.isArray(items[i])) {
      flattenDown(items[i], flattenedArray);
    } else {
      flattenedArray.push(items[i]);
    }
  }
}

export default function flatten(items) {
  const flattenedArray = [];
  flattenDown(items, flattenedArray);
  return flattenedArray;
}
