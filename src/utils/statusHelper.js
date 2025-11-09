// Helper to centralize status descriptions and responsible assignment
import { serverTimestamp } from 'firebase/firestore'

const LOCALIZED = {
  es: {
    Edición: 'En edición por el autor',
    Terminado: 'Listo para revisión por el equipo de editores',
    Publicado: 'Publicado en el sitio',
    Desactivado: 'Desactivado por el editor'
  },
  en: {
    Edición: 'In editing by the author',
    Terminado: 'Ready for review by the editorial team',
    Publicado: 'Published on the site',
    Desactivado: 'Disabled by the editor'
  }
}

export function getLocalizedDescription(status, locale = 'es') {
  return (LOCALIZED[locale] && LOCALIZED[locale][status]) || status || ''
}

export function getStatusMeta(status, user = {}, author = {}, locale = 'es') {
  const desc = getLocalizedDescription(status, locale)

  switch (status) {
    case 'Edición':
      return {
        statusDescription: desc,
        responsibleId: user.uid || author.authorId || null,
        responsibleName: user.displayName || user.email || author.authorName || author.authorEmail || null,
        responsibleRole: 'Reportero'
      }
    case 'Terminado':
      return {
        statusDescription: desc,
        responsibleId: null,
        responsibleName: 'Equipo de editores',
        responsibleRole: 'Editor'
      }
    case 'Publicado':
      return {
        statusDescription: desc,
        responsibleId: user.uid || null,
        responsibleName: user.displayName || user.email || null,
        responsibleRole: user.role || 'Editor'
      }
    case 'Desactivado':
      return {
        statusDescription: desc,
        responsibleId: user.uid || null,
        responsibleName: user.displayName || user.email || null,
        responsibleRole: 'Editor'
      }
    default:
      return {
        statusDescription: desc,
        responsibleId: null,
        responsibleName: null,
        responsibleRole: null
      }
  }
}

export function historyEntry({ action, fromStatus = null, toStatus = null, actor = {}, note = '' }) {
  return {
    action,
    fromStatus,
    toStatus,
    actorId: actor.uid || null,
    actorName: actor.displayName || actor.email || null,
    actorRole: actor.role || null,
    note: note || '',
    createdAt: serverTimestamp()
  }
}
