import { uid } from '../utils/id'

const catInternal = uid()
const catDocs = uid()
const catMisc = uid()

export const DEFAULT_CATEGORIES = [
  { id: catInternal, name: 'Outils internes' },
  { id: catDocs, name: 'Documentation' },
  { id: catMisc, name: 'Divers' },
]

export const DEFAULT_LINKS = [
  { id: uid(), categoryId: catInternal, title: 'Gmail', url: 'https://mail.google.com', icon: null },
  { id: uid(), categoryId: catInternal, title: 'Google Agenda', url: 'https://calendar.google.com', icon: null },
  { id: uid(), categoryId: catInternal, title: 'Google Drive', url: 'https://drive.google.com', icon: null },
  { id: uid(), categoryId: catDocs, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: null },
  { id: uid(), categoryId: catDocs, title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: null },
  { id: uid(), categoryId: catDocs, title: 'GitHub', url: 'https://github.com', icon: null },
  { id: uid(), categoryId: catMisc, title: 'YouTube', url: 'https://youtube.com', icon: null },
  { id: uid(), categoryId: catMisc, title: 'Notion', url: 'https://notion.so', icon: null },
].map((link, index) => ({ ...link, order: index }))

export const DEFAULT_NOTES = [
  {
    id: uid(),
    title: 'Bienvenue',
    content: "Ceci est votre première note. Créez-en d'autres avec le bouton +, à gauche.",
    updatedAt: Date.now(),
  },
]

// status: 'todo' | 'doing' | 'done' — the three Kanban columns.
export const DEFAULT_TODOS = [
  { id: uid(), text: 'Glissez une tâche vers une autre colonne', status: 'todo', createdAt: Date.now() },
  { id: uid(), text: 'Ajoutez vos propres tâches ci-dessous', status: 'doing', createdAt: Date.now() },
  { id: uid(), text: 'Bienvenue sur votre tableau Kanban', status: 'done', createdAt: Date.now() },
]
