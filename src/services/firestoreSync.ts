import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ChatSession, Project } from '../types';

/**
 * Recursively removes any undefined properties from objects and arrays,
 * preventing Firestore "Unsupported field value: undefined" errors.
 */
function sanitizeData<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        res[key] = sanitizeData(val);
      }
    }
    return res;
  }
  return obj;
}

/**
 * Real-time listener for user chats stored in Firestore
 */
export function subscribeToUserChats(
  userId: string,
  onChatsUpdate: (chats: ChatSession[]) => void
) {
  const path = `users/${userId}/chats`;
  try {
    const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats: ChatSession[] = [];
        snapshot.forEach((docSnap) => {
          chats.push(docSnap.data() as ChatSession);
        });
        onChatsUpdate(chats);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

/**
 * Real-time listener for user projects stored in Firestore
 */
export function subscribeToUserProjects(
  userId: string,
  onProjectsUpdate: (projects: Project[]) => void
) {
  const path = `users/${userId}/projects`;
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projects: Project[] = [];
        snapshot.forEach((docSnap) => {
          projects.push(docSnap.data() as Project);
        });
        onProjectsUpdate(projects);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

/**
 * Save or update chat session in cloud Firestore
 */
export async function saveChatToCloud(userId: string, chat: ChatSession) {
  const path = `users/${userId}/chats/${chat.id}`;
  try {
    const sanitized = sanitizeData({
      ...chat,
      userId,
    });
    await setDoc(doc(db, 'users', userId, 'chats', chat.id), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete chat session from cloud Firestore
 */
export async function deleteChatFromCloud(userId: string, chatId: string) {
  const path = `users/${userId}/chats/${chatId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update project in cloud Firestore
 */
export async function saveProjectToCloud(userId: string, project: Project) {
  const path = `users/${userId}/projects/${project.id}`;
  try {
    const sanitized = sanitizeData({
      ...project,
      userId,
    });
    await setDoc(doc(db, 'users', userId, 'projects', project.id), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete project from cloud Firestore
 */
export async function deleteProjectFromCloud(userId: string, projectId: string) {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save user profile info to Firestore on login
 */
export async function syncUserProfile(user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null }) {
  const path = `users/${user.uid}`;
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      sanitizeData({
        displayName: user.displayName || 'Astrolabe User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
