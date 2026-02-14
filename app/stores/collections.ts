import { defineStore } from 'pinia'
import type { Collection, CollectionFile, CollectionType } from '~/types/collections'

const STORAGE_KEY = 'file-encryptor-collections'

function loadState(): { collections: Collection[]; files: CollectionFile[] } {
	if (typeof window === 'undefined') return { collections: [], files: [] }
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return { collections: [], files: [] }
		const data = JSON.parse(raw)
		return {
			collections: Array.isArray(data.collections) ? data.collections : [],
			files: Array.isArray(data.files) ? data.files : [],
		}
	} catch {
		return { collections: [], files: [] }
	}
}

function saveState(collections: Collection[], files: CollectionFile[]) {
	if (typeof window === 'undefined') return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ collections, files }))
	} catch (e) {
		console.error('Failed to persist collections', e)
	}
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const useCollectionsStore = defineStore('collections', () => {
	const state = reactive(loadState())

	function persist() {
		saveState(state.collections, state.files)
	}

	function addCollection(
		name: string,
		type: CollectionType,
		passwordHash?: string,
	): Collection {
		const collection: Collection = {
			id: generateId(),
			name: name.trim(),
			type,
			createdAt: new Date().toISOString(),
		}
		if (type === 'encrypted' && passwordHash) collection.passwordHash = passwordHash
		state.collections.push(collection)
		persist()
		return collection
	}

	function getCollection(id: string): Collection | undefined {
		return state.collections.find((c) => c.id === id)
	}

	function getFilesForCollection(collectionId: string): CollectionFile[] {
		return state.files
			.filter((f) => f.collectionId === collectionId)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
	}

	function addFileToCollection(
		collectionId: string,
		path: string,
		name: string,
		encrypted: boolean,
	): CollectionFile {
		const file: CollectionFile = {
			id: generateId(),
			collectionId,
			name,
			path,
			encrypted,
			createdAt: new Date().toISOString(),
		}
		state.files.push(file)
		persist()
		return file
	}

	function removeFile(fileId: string) {
		state.files = state.files.filter((f) => f.id !== fileId)
		persist()
	}

	function removeCollection(id: string) {
		state.collections = state.collections.filter((c) => c.id !== id)
		state.files = state.files.filter((f) => f.collectionId !== id)
		persist()
	}

	const collections = computed(() => [...state.collections])
	const files = computed(() => [...state.files])

	return {
		collections,
		files,
		addCollection,
		getCollection,
		getFilesForCollection,
		addFileToCollection,
		removeFile,
		removeCollection,
	}
})
