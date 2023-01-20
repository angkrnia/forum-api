class LikeUnlikeComment {
  constructor({ commentRepository, threadRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);
    await this._commentRepository.verifyAvailableCommentInThread(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );

    const isLike = await this._likeRepository.checkLikeComment(useCasePayload);

    if (isLike > 0) {
      return this._likeRepository.unlikeComment(useCasePayload);
    }

    return this._likeRepository.likeComment(useCasePayload);
  }
}

module.exports = LikeUnlikeComment;
