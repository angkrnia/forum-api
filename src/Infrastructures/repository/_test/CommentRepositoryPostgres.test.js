/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentTestTableHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'SomeUser' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    });

    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addComment function', () => {
      it('addComment function should add database entry for said comment', async () => {
        // arrange
        const newComment = new NewComment({
          content: 'some content',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // action
        const addedComment = await commentRepositoryPostgres.addComment(newComment);
        const comments = await CommentsTableTestHelper.getCommentById(
          addedComment.id,
        );

        // assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: newComment.owner,
        }));
        expect(comments).toHaveLength(1);
      });

      it('should return added comment correctly', async () => {
        // arrange
        const newComment = new NewComment({
          content: 'some content',
          threadId: 'thread-123',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // action
        const addedComment = await commentRepositoryPostgres.addComment(newComment);

        // assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: newComment.owner,
        }));
      });
    });

    describe('verifyCommentOwner function', () => {
      it('should return true when comment owner is the same as the payload', async () => {
        const newComment = new NewComment({
          content: 'some content',
          threadId: 'thread-123',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        await commentRepositoryPostgres.addComment(newComment);

        const isCommentOwner = await commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123');

        expect(isCommentOwner).toBeTruthy();
      });

      it('should return Authorizationerror when comment owner is not the same as the payload', async () => {
        const newComment = new NewComment({
          content: 'some content',
          threadId: 'thread-123',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        await commentRepositoryPostgres.addComment(newComment);

        await expect(
          commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-432'),
        ).rejects.toThrowError(AuthorizationError);
      });
    });

    describe('getCommentByThreadId function', () => {
      it('should return all comments from a thread correctly', async () => {
        const firstComment = {
          id: 'comment-123',
          content: 'first comment',
          date: new Date('2023-01-19T00:00:00.000Z'),
        };
        const secondComment = {
          id: 'comment-345',
          content: 'second comment',
          date: new Date('2023-01-19T01:00:00.000Z'),
        };

        await CommentsTableTestHelper.addComment(firstComment);
        await CommentsTableTestHelper.addComment(secondComment);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        let commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        commentDetails = commentDetails.map((comment) => ({
          id: comment.id,
          content: comment.content,
          date: comment.date,
          username: comment.username,
        }));

        expect(commentDetails).toEqual([
          { ...firstComment, username: 'SomeUser' },
          { ...secondComment, username: 'SomeUser' },
        ]);
      });

      it('should return an empty array when no comments exist for the thread', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId(
          'thread-123',
        );
        expect(commentDetails).toStrictEqual([]);
      });
    });

    describe('verifyAvailableCommentInThread function', () => {
      it('should throw NotFoundError when thread is not available', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        await expect(
          commentRepositoryPostgres.verifyAvailableCommentInThread('thread-123', 'comment-123'),
        ).rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment is not available', async () => {
        // await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        await expect(
          commentRepositoryPostgres.verifyAvailableCommentInThread('thread-123', 'comment-123'),
        ).rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when thread and comment are available', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'first comment',
          date: new Date('2023-01-19T00:00:00.000Z'),
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        await expect(
          commentRepositoryPostgres.verifyAvailableCommentInThread(
            'comment-123',
            'thread-123',
          ),
        ).resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('deleteCommentById function', () => {
      it('should throw NotFoundError when comment is not available', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        await expect(
          commentRepositoryPostgres.deleteCommentById('comment-123'),
        ).rejects.toThrowError(NotFoundError);
      });

      it('should delete comment correctly', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'first comment',
          date: new Date('2023-01-19T00:00:00.000Z'),
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
          {},
        );

        await commentRepositoryPostgres.deleteCommentById('comment-123');

        const comment = await CommentsTableTestHelper.getCommentById(
          'comment-123',
        );
        expect(comment[0].is_deleted).toEqual(true);
      });
    });
  });
});
