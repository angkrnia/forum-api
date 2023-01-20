const LikeUnlikeUseCase = require('../../../../Applications/use_case/LikeUnlikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeUnlikeHandler = this.putLikeUnlikeHandler.bind(this);
  }

  async putLikeUnlikeHandler(request, h) {
    const likeUnlikeUseCase = this._container.getInstance(LikeUnlikeUseCase.name);

    const useCasePayload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      userId: request.auth.credentials.id,
    };

    await likeUnlikeUseCase.execute(useCasePayload);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
