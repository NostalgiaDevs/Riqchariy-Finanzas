import { useEffect } from 'react'

const APP_NAME = 'Riqchariy'

/**
 * Título de la pestaña: "Banco | Riqchariy". Distingue pestañas e historial, y es lo primero
 * que anuncia un lector de pantalla al cambiar de página. Sin argumento queda solo "Riqchariy".
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
  }, [title])
}
