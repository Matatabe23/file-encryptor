import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

/** Тип папки для сохранения: одна и та же структура на ПК и телефоне (files/pictures, files/videos и т.д.) */
export type SaveFolderType = 'pictures' | 'videos' | 'audio' | 'documents' | 'other'

const EXT_TO_FOLDER: Record<string, SaveFolderType> = {
	// картинки
	jpg: 'pictures',
	jpeg: 'pictures',
	png: 'pictures',
	gif: 'pictures',
	webp: 'pictures',
	heic: 'pictures',
	heif: 'pictures',
	bmp: 'pictures',
	svg: 'pictures',
	ico: 'pictures',
	// видео
	mp4: 'videos',
	mkv: 'videos',
	mov: 'videos',
	avi: 'videos',
	webm: 'videos',
	m4v: 'videos',
	'3gp': 'videos',
	flv: 'videos',
	wmv: 'videos',
	// аудио
	mp3: 'audio',
	wav: 'audio',
	ogg: 'audio',
	m4a: 'audio',
	flac: 'audio',
	aac: 'audio',
	wma: 'audio',
	aiff: 'audio',
	// документы
	pdf: 'documents',
	doc: 'documents',
	docx: 'documents',
	xls: 'documents',
	xlsx: 'documents',
	txt: 'documents',
	rtf: 'documents',
	odt: 'documents',
	ods: 'documents',
	ppt: 'documents',
	pptx: 'documents',
}

/**
 * Определяет папку сохранения по имени файла (по расширению).
 */
export function getSaveFolderTypeFromFileName(fileName: string): SaveFolderType {
	const ext = fileName.split('.').pop()?.toLowerCase()
	return (ext && EXT_TO_FOLDER[ext]) || 'other'
}

/**
 * Открывает диалог выбора файла и сохраняет в папку приложения.
 * Папка (pictures/videos/audio/documents/other) выбирается автоматически по типу файла.
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
	let fileName: string

	if (path.startsWith('content:')) {
		fileName =
			(await invoke<string | null>('get_file_name_from_path', { path })) ?? `file_${Date.now()}`
	} else {
		fileName = path.split(/[/\\]/).pop() ?? `file_${Date.now()}`
	}

	const saveType = getSaveFolderTypeFromFileName(fileName)

	const payload = {
		saveType,
		sourcePath: null as string | null,
		contents: null as number[] | null,
		fileName: null as string | null,
	}

	if (path.startsWith('content:')) {
		const data = await readFile(path)
		const contents = Array.from(
			data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data),
		)
		payload.contents = contents
		payload.fileName = fileName
	} else {
		payload.sourcePath = path
	}

	const savedPath = await invoke<string>('save_file_to_app', payload)
	return savedPath
}
