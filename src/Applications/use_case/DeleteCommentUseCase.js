class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { commentId, threadId, owner } = useCasePayload;
    await this._commentRepository.verifyAvailableCommentInThread(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(
      commentId,
      owner,
    );
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
