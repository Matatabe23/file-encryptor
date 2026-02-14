import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

/**
 * Открывает диалог выбора файла и сохраняет его в папку приложения.
 * На Android (content:// URI) читает файл и сохраняет по байтам.
 * Возвращает путь сохранённого файла или null при отмене/ошибке.
 */
export async function pickAndSaveFile(): Promise<string | null> {
	const selected = await open({
		multiple: false,
		directory: false,
	})
	if (selected === null || Array.isArray(selected)) return null

	const path = selected as string
	let savedPath: string

	// На Android диалог возвращает content:// URI — читаем файл и сохраняем байтами в папку «Фото»
	if (path.startsWith('content:')) {
		const file_name =
			(await invoke<string | null>('get_file_name_from_path', { path })) ?? `file_${Date.now()}`
		const data = await readFile(path)
		const contents = Array.from(
			data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data),
		)
		savedPath = await invoke<string>('save_file_to_app', {
			sourcePath: null,
			contents,
			fileName: file_name,
		})
	} else {
		savedPath = await invoke<string>('save_file_to_app', {
			sourcePath: path,
			contents: null,
			fileName: null,
		})
	}

	return savedPath
}
