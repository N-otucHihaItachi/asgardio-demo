let messages = [];
let id = 1;
module.exports = {
  add: ({ text, user }) => {
    const m = { id: id++, text, user, ts: Date.now() };
    messages.push(m);
    return m;
  },
  getAll: () => messages
};
