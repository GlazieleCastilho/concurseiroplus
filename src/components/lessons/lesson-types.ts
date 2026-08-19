export type LessonCommentAuthor = { id: string; firstName: string; lastName: string | null; imageUrl: string | null };

export type LessonCommentItem = {
  id: string;
  content: string;
  createdAt: string | Date;
  userId: string;
  lessonId: string;
  parentId: string | null;
  user: LessonCommentAuthor;
  likeCount: number;
  isLiked: boolean;
  replies: LessonCommentItem[];
};
