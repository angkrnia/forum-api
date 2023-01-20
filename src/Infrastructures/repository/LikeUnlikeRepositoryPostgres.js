const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeUnlikeComment extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkLikeComment(payload) {
    const { commentId, userId } = payload;

    const query = {
      text: 'SELECT 1 FROM likes_comment WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount;
  }

  async likeComment(payload) {
    const { commentId, userId } = payload;
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO likes_comment VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount;
  }

  async unlikeComment(payload) {
    const { commentId, userId } = payload;

    const query = {
      text: 'DELETE FROM likes_comment WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount;
  }

  async getLikeCountComment(threadId) {
    const query = {
      text: 'SELECT comment_id FROM likes_comment WHERE comment_id IN (SELECT id FROM comments WHERE thread_id = $1)',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = LikeUnlikeComment;
