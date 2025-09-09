export const fetchJSON = async <T extends unknown>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const json = await response.json()
  return json as T
}
