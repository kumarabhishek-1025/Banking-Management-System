exports.createShareableId = (value) =>
  Buffer.from(value).toString("base64");

exports.decodeShareableId = (value) =>
  Buffer.from(value, "base64").toString("utf-8");

exports.extractCustomerIdFromUrl = (url) => {
  const segments = url.split("/");
  return segments[segments.length - 1];
};
