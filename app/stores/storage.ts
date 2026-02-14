import { defineStore } from 'pinia'

const STORAGE_KEY = 'file-encryptor-storage'

interface GoogleDriveState {
	connected: boolean
	email?: string
	authCode?: string
}

function loadState(): { googleDrive: GoogleDriveState } {
	if (typeof window === 'undefined') {
		return { googleDrive: { connected: false } }
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return { googleDrive: { connected: false } }
		const data = JSON.parse(raw)
		return {
			googleDrive: data.googleDrive ?? { connected: false },
		}
	} catch {
		return { googleDrive: { connected: false } }
	}
}

function saveState(googleDrive: GoogleDriveState) {
	if (typeof window === 'undefined') return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ googleDrive }))
	} catch (e) {
		console.error('Failed to persist storage state', e)
	}
}

export const useStorageStore = defineStore('storage', () => {
	const state = reactive(loadState())

	const googleDrive = computed(() => state.googleDrive)

	function setGoogleDriveConnected(payload: { authCode: string; email?: string }) {
		state.googleDrive = {
			connected: true,
			authCode: payload.authCode,
			email: payload.email,
		}
		saveState(state.googleDrive)
	}

	function disconnect(provider: string) {
		if (provider === 'google_drive') {
			state.googleDrive = { connected: false }
			saveState(state.googleDrive)
		}
	}

	return {
		googleDrive,
		setGoogleDriveConnected,
		disconnect,
	}
})
