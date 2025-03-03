export const getChromeStorageValue = <T>(key: string, storage: 'local' | 'session'): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage[storage].get([key], (result) => {
      resolve(result[key])
    })
  })
}

export const setChromeStorageValue = async <T>(newValue: T, storage: 'local' | 'session') => {
  if (!chrome.storage?.[storage]) {
    console.warn(`chrome.storage.[${storage}] is not found to set Value in storage`)
    return
  }
  const prev = await chrome.storage[storage].get()
  const newState = {
    ...prev,
    ...newValue,
  }
  if (JSON.stringify(prev) === JSON.stringify(newState)) return
  await chrome.storage[storage].set(newState)
}
