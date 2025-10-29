export const BACKEND_IMAGE_URL = import.meta.env.VITE_BACKEND_URL_IMAGE || 'http://localhost:5000'; // TODO: change to the actual backend image url
export const getImageUrl = (imagePath) => {
  console.log("====================", `${BACKEND_IMAGE_URL}/static/leaf/${imagePath}`)
  return `${BACKEND_IMAGE_URL}/leaf/${imagePath}`;
}
export const getFileNameFromPath = (filePath) => {
  console.log('filePath', filePath.split("/").pop() || filePath);
  return filePath.split("/").pop() || filePath;
};
