/* eslint-disable radix */
const LikeUnlikeRepository = require('../LikeUnlikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentTestTableHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('LikeUnlikeRepositoryPostgres', () => {
  it('should be instance of LikeUnlikeRepository domain', () => {
    const likeUnlikeRepositoryPostgres = new LikeUnlikeRepository({}, {});

    expect(likeUnlikeRepositoryPostgres).toBeInstanceOf(LikeUnlikeRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'SomeUser' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
    });

    afterEach(async () => {
      await LikesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    describe('checkLikeComment function', () => {
      it('should check if comment is liked', async () => {
        // arrange
        const payload = {
          commentId: 'comment-123',
          userId: 'user-123',
        };
        await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
        const likeUnlikeRepositoryPostgres = new LikeUnlikeRepository(pool, {});

        // action
        const isLiked = await likeUnlikeRepositoryPostgres.checkLikeComment(payload);

        // assert
        expect(isLiked).toBeTruthy();
      });

      it('should return false if comment is not liked', async () => {
        // arrange
        const likeUnlikeRepositoryPostgres = new LikeUnlikeRepository(pool, {});

        // action
        const isLiked = await likeUnlikeRepositoryPostgres.checkLikeComment({ commentId: 'comment-123', userId: 'user' });

        // assert
        expect(isLiked).toBeFalsy();
      });
    });

    describe('likeComment function', () => {
      it('should add like to comment', async () => {
        // arrange
        const payload = {
          commentId: 'comment-123',
          userId: 'user-123',
        };
        const fakeIdGenerator = () => '123';
        const likeUnlikeRepositoryPostgres = new LikeUnlikeRepository(pool, fakeIdGenerator);

        // action
        const isLiked = await likeUnlikeRepositoryPostgres.likeComment(payload);

        // assert
        expect(isLiked).toBeTruthy();
      });
    });

    describe('unlikeComment function', () => {
      it('should unlike comment', async () => {
        // arrange
        const payload = {
          commentId: 'comment-123',
          userId: 'user-123',
        };
        await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
        const likeUnlikeRepositoryPostgres = new LikeUnlikeRepository(pool, {});

        // action
        const isLiked = await likeUnlikeRepositoryPostgres.unlikeComment(payload);

        // assert
        expect(isLiked).toBeTruthy();
      });
    });

    describe('getLikeCountComment function', () => {
      it('should return like count of comment', async () => {
        // arrange
        const payload = {
          threadId: 'thread-123',
          commentId: 'comment-123',
          userId: 'user-123',
        };

        await UsersTableTestHelper.addUser({ id: 'user-321', username: 'jhon_doe' });
        await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
        await LikesTableTestHelper.addLike({ id: 'like-124', commentId: 'comment-123', userId: 'user-321' });
        const likeUnlikeRepositoryPostgres = new LikeUnlikeRepository(pool, {});

        // action
        const likeCount = await likeUnlikeRepositoryPostgres.getLikeCountComment(payload.threadId);

        // assert
        expect(likeCount).toStrictEqual([
          {
            comment_id: 'comment-123',
          },
          {
            comment_id: 'comment-123',
          },
        ]);
      });
    });
  });
});
