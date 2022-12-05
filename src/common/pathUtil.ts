export function replacePathExtension(path:string, newExtension:string):string {
  if (!newExtension.startsWith('.')) newExtension = `.${newExtension}`;
  let filenamePos = path.lastIndexOf('/') + 1;
  const extensionPos = path.indexOf('.', filenamePos);
  if (extensionPos === -1) return `${path}${newExtension}`;
  return `${path.substring(0, extensionPos)}${newExtension}`;
}