const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, owner, commentId } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, commentId, owner, content, date],
    };

    const { rows } = await this._pool.query(query);

    return new AddedReply({ ...rows[0], content, owner });
  }

  async verifyAvailableReply(threadId, commentId, replyId) {
    const query = {
      text: `SELECT 1 
            FROM replies
            INNER JOIN comments ON replies.comment_id = comments.id
            WHERE replies.id = $1
            AND replies.comment_id = $2
            AND comments.thread_id = $3
            AND replies.is_deleted = false`,
      values: [replyId, commentId, threadId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return rowCount;
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError(
        'Anda tidak berhak mengakses resource ini',
      );
    }

    return rowCount;
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted=TRUE WHERE id=$1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return rowCount;
  }
}

module.exports = ReplyRepositoryPostgres;
