import { invoke } from '@tauri-apps/api/core'

export interface CheckUpdateResult {
  has_update: boolean
  version: string
  download_url: string | null
  body: string | null
}

/**
 * Проверяет наличие обновления в GitHub Releases.
 * Учитывает платформу: Windows → .exe, Android → .apk и т.д.
 */
export async function checkForUpdate(): Promise<CheckUpdateResult | null> {
  try {
    return await invoke<CheckUpdateResult>('check_for_update')
  } catch {
    return null
  }
}

/**
 * Скачивает обновление по URL во временную папку и возвращает путь к файлу.
 * После этого можно открыть файл через @tauri-apps/plugin-opener (установщик/APK).
 */
export async function downloadUpdate(downloadUrl: string): Promise<string> {
  return await invoke<string>('download_update', { downloadUrl })
}
