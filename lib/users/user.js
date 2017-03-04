module.exports = class User {
  constructor(props) {
    Object.keys(props).forEach(prop => {
      Object.defineProperty(this, prop, {
        get: () => props[prop]
      });
    });
  }
};
