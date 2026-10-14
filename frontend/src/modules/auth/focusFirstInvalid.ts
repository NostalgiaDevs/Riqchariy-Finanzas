/**
 * Lleva el foco al primer campo con error (en el orden del formulario). Sin esto el foco se queda
 * en el botón y quien usa teclado o lector de pantalla no sabe qué corregir.
 * Las claves de `errors` son los `name` de los inputs.
 */
export function focusFirstInvalid<T extends object>(form: HTMLFormElement, errors: T) {
  const messages = errors as Partial<Record<string, string>>
  for (const element of Array.from(form.elements)) {
    if (element instanceof HTMLInputElement && messages[element.name]) {
      element.focus()
      return
    }
  }
}
