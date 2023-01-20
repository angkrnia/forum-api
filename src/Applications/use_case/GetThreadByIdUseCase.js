class getThreadByIdUseCase {
  constructor({ commentRepository, threadRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._likeUnlikeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    let comments = await this._commentRepository.getCommentsByThreadId(
      threadId,
    );
    const replies = await this._threadRepository.getRepliesByThreadId(
      threadId,
    );
    const likesCount = await this._likeUnlikeRepository.getLikeCountComment(
      threadId,
    );

    comments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted
        ? '**komentar telah dihapus**'
        : comment.content,
      likeCount: likesCount.filter(
        (like) => like.comment_id === comment.id,
      ).length,
      replies: replies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.is_deleted
            ? '**balasan telah dihapus**'
            : reply.content,
          date: reply.date,
          username: reply.username,
        })),
    }));

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = getThreadByIdUseCase;
