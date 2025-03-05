export type Info = {
  title: string;
  description: string;
  version: string;
  license: {
    name: string;
    url: string;
  };
  numOfUsers: number;
  numOfConversations: number;
  numOfMessages: number;
  lastMessageAt: string | undefined;
};

export type Conversation = {
  id: number;
  name: string;
  createdAt: Date;
};
