const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('a LikeUnlikeCommentUseCase use case', () => {
  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeComment = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockLikeRepository.unlikeComment = jest.fn().mockImplementation(() => Promise.resolve(1));

    const likeUnlikeComment = new LikeUnlikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const isLike = await likeUnlikeComment.execute(useCasePayload);

    // Assert
    expect(isLike).toEqual(1);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockLikeRepository.checkLikeComment).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(useCasePayload);
  });

  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeComment = jest.fn().mockImplementation(() => Promise.resolve(0));
    mockLikeRepository.likeComment = jest.fn().mockImplementation(() => Promise.resolve(1));

    const likeUnlikeComment = new LikeUnlikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const isUnlike = await likeUnlikeComment.execute(useCasePayload);

    // Assert
    expect(isUnlike).toEqual(1);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockLikeRepository.checkLikeComment).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.likeComment).toBeCalledWith(useCasePayload);
  });
});
