export interface UserProfile {
  uid: string;
  email: string;
  companyName: string;
  industry: string;
  companySize: string;
  sectionsToManage: string[];
  onboardingCompleted: boolean;
  createdAt: any;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
}

export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Board {
  id: string;
  spaceId: string;
  name: string;
  type: 'task' | 'crm' | 'sprint' | 'form' | 'blank';
  description?: string;
  columns: ColumnDefinition[];
}

export interface ColumnDefinition {
  id: string;
  title: string;
  type: string;
  settings?: any;
}

export interface Group {
  id: string;
  boardId: string;
  name: string;
  color: string;
  order: number;
}

export interface Item {
  id: string;
  groupId: string;
  boardId: string;
  name: string;
  values: Record<string, any>;
  order: number;
  assignees: string[];
}

export interface Update {
  id: string;
  itemId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export interface Activity {
  id: string;
  boardId: string;
  itemId?: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  createdAt: any;
}
