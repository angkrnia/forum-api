/* eslint-disable max-len */
/* istanbul ignore file */
const ServerTestHelper = {
  async getAccessTokenAndUserIdHelper({ server, username = 'dicoding' }) {
    const userPayload = {
      username: Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5),
      password: 'secret',
    };

    const responseUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'placeholder fullname',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const { id: userId } = JSON.parse(responseUser.payload).data.addedUser;
    const { accessToken } = JSON.parse(responseAuth.payload).data;
    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
