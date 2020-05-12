module.exports = () => {
  let resolve;
  let resolved = false;
  const promise = new Promise((r) => {
    resolve = r;
  });
  promise.resolve = (value) => {
    resolved = true;
    resolve(value);
  };
  promise.resolved = () => resolved;
  return promise;
};
