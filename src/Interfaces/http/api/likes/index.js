const routes = require('./routes');
const LikesHandler = require('./handler');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { container }) => {
    const likesHandler = new LikesHandler(container);
    server.route(routes(likesHandler));
  },
};
