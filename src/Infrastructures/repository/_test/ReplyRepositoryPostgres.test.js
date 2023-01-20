/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentTestTableHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of ReplyRepository domain', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'kevin' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
    });

    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addReply function', () => {
      it('addReply function should add database entry for said reply', async () => {
        // arrange
        const newReply = new NewReply({
          commentId: 'comment-123',
          content: 'some content',
          owner: 'user-123',
        });
        const fakeIdGenerator = () => '123';
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        // action
        const addedReply = await replyRepositoryPostgres.addReply(newReply);
        const replies = await RepliesTableTestHelper.getReplyById(
          'reply-123',
        );

        // assert
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: 'some content',
          owner: 'user-123',
        }));
        expect(replies).toHaveLength(1);
      });
    });

    describe('verifyAvailableReply function', () => {
      it('should throw NotFoundError when reply is not available', async () => {
        // arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action & assert
        await expect(replyRepositoryPostgres.verifyAvailableReply('thread-123', 'comment-123', 'reply-123')).rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when reply is available', async () => {
        // arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          owner: 'user-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action & assert
        await expect(replyRepositoryPostgres.verifyAvailableReply('thread-123', 'comment-123', 'reply-123')).resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('verifyReplyOwner function', () => {
      it('should throw AuthorizationError when reply is not owner', async () => {
        // arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          owner: 'user-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action & assert
        await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-321')).rejects.toThrowError(AuthorizationError);
      });

      it('should not throw AuthorizationError when reply is owner', async () => {
        // arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          owner: 'user-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action & assert
        await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
      });
    });

    describe('deleteReply function', () => {
      it('should delete reply from database', async () => {
        // arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          owner: 'user-123',
        });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action
        await replyRepositoryPostgres.deleteReplyById('reply-123');

        // assert
        const replies = await RepliesTableTestHelper.getReplyById('reply-123');
        expect(replies).toHaveLength(1);
        expect(replies[0].is_deleted).toEqual(true);
      });

      it('should throw NotFoundError when reply is not available', async () => {
        // arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action & assert
        await expect(
          replyRepositoryPostgres.deleteReplyById('reply-123'),
        ).rejects.toThrowError(NotFoundError);
      });
    });
  });
});
