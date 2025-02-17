export const getStorageValue = <T>(key: string): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

export const setStorageValue = async <T>(newValue: T) => {
  if (!chrome.storage?.local) {
    console.warn(`chrome.storage.local is not found to set Value in storage`)
    return
  }
  const prev = await chrome.storage.local.get()
  const newState = {
    ...prev,
    ...newValue,
  }
  chrome.storage.local.set(newState, () => {
    console.log('Updated chrome.storage', { newState })
  })
}
