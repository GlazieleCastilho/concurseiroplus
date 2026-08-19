export type FeedAuthor = { id: string; firstName: string; lastName: string | null; imageUrl: string | null };

export type FeedPost = {
  id: string;
  content: string;
  createdAt: string | Date;
  userId: string;
  user: FeedAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
};

export type FeedComment = {
  id: string;
  content: string;
  createdAt: string | Date;
  userId: string;
  postId: string;
  parentId: string | null;
  user: FeedAuthor;
  likeCount: number;
  isLiked: boolean;
  replies: FeedComment[];
};
