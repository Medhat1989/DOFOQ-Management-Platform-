import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const boardService = {
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  },

  getWorkspaces(callback: (workspaces: any[]) => void) {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'workspaces'),
      where('members', 'array-contains', auth.currentUser.uid)
    );
    // Also need to check ownerId, but Firestore doesn't support OR in array-contains easily without multiple queries
    // For now, we'll assume members includes owner for simplicity in this MVP
    return onSnapshot(collection(db, 'workspaces'), (snapshot) => {
      const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(workspaces);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'workspaces'));
  },

  getSpaces(workspaceId: string, callback: (spaces: any[]) => void) {
    const path = `workspaces/${workspaceId}/spaces`;
    return onSnapshot(collection(db, path), (snapshot) => {
      const spaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(spaces);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  getBoards(workspaceId: string, callback: (boards: any[]) => void) {
    const path = `workspaces/${workspaceId}/boards`;
    return onSnapshot(collection(db, path), (snapshot) => {
      const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(boards);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  getGroups(workspaceId: string, boardId: string, callback: (groups: any[]) => void) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/groups`;
    const q = query(collection(db, path), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(groups);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  getItems(workspaceId: string, boardId: string, callback: (items: any[]) => void) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/items`;
    const q = query(collection(db, path), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  async createItem(workspaceId: string, boardId: string, item: any) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/items`;
    try {
      return await addDoc(collection(db, path), {
        ...item,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateItem(workspaceId: string, boardId: string, itemId: string, updates: any) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`;
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addUpdate(workspaceId: string, boardId: string, itemId: string, content: string) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/updates`;
    try {
      return await addDoc(collection(db, path), {
        itemId,
        content,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getUpdates(workspaceId: string, boardId: string, itemId: string, callback: (updates: any[]) => void) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/updates`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(updates);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  async createGroup(workspaceId: string, boardId: string, group: any) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/groups`;
    try {
      return await addDoc(collection(db, path), {
        ...group,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateGroup(workspaceId: string, boardId: string, groupId: string, updates: any) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/groups/${groupId}`;
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async logActivity(workspaceId: string, boardId: string, activity: any) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/activities`;
    try {
      await addDoc(collection(db, path), {
        ...activity,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getActivities(workspaceId: string, boardId: string, callback: (activities: any[]) => void) {
    const path = `workspaces/${workspaceId}/boards/${boardId}/activities`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(activities);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  }
};
