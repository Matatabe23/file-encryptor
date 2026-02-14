export type CollectionType = 'storage' | 'encrypted'

export interface Collection {
	id: string
	name: string
	type: CollectionType
	/** SHA-256 hash of password for verification (only for encrypted) */
	passwordHash?: string
	createdAt: string
}

export interface CollectionFile {
	id: string
	collectionId: string
	/** Display name (original or decrypted filename) */
	name: string
	/** Stored path in app dir (e.g. files/documents/...) */
	path: string
	encrypted: boolean
	createdAt: string
}
