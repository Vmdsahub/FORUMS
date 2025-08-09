export interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  date: string;
  time: string;
  likes: number;
  isLiked: boolean;
  topicId: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  replies: number;
  views: number;
  likes: number;
  isLiked: boolean;
  lastPost: {
    author: string;
    date: string;
    time: string;
  };
  isPinned?: boolean;
  isHot?: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface CreateTopicRequest {
  title: string;
  description: string;
  content: string;
  category: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface LikeResponse {
  likes: number;
  isLiked: boolean;
}

export interface TopicListResponse {
  topics: Omit<Topic, "comments" | "content">[];
  total: number;
  page: number;
  limit: number;
}
