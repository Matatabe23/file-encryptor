import { en } from 'vuetify/locale';

export default {
	$vuetify: en,
	main: {
		collectionsTitle: 'Collections',
		createCollection: 'Create collection',
		collectionsEmpty: 'No collections yet. Click «Create collection» to add the first one.',
		collectionTypeEncrypted: 'Encrypted collection',
		collectionTypeStorage: 'Storage'
	},
	storage: {
		title: 'Cloud storage',
		connect: 'Connect',
		disconnect: 'Disconnect',
		comingSoon: 'Coming soon',
		yandexTitle: 'Yandex.Disk',
		yandexDescription: 'Coming soon.',
		dropboxTitle: 'Dropbox',
		dropboxDescription: 'Coming soon.'
	},
	common: {
		cancel: 'Cancel',
		save: 'Save',
		loading: 'Loading...'
	},
	collections: {
		name: 'Collection name',
		type: 'Collection type',
		typeStorage: 'Storage — files as-is',
		typeEncrypted: 'Encrypted — only via app with password',
		password: 'Access password',
		passwordHint: 'Password is not stored. Decryption key is derived from the password you enter.',
		enterPassword: 'Enter password',
		unlock: 'Unlock',
		addFile: 'Add file',
		files: 'Files',
		noFiles: 'No files yet',
		back: 'Back',
		delete: 'Delete',
		deleteCollection: 'Delete collection',
		deleteCollectionConfirm: 'Delete collection «{name}»? File entries will be removed.',
		deleteCollectionFiles: 'Delete files from device',
		open: 'Open',
		downloadCollection: 'Download collection',
		downloadCollectionConfirm: 'Delete collection and files after download?',
		importCollection: 'Import collection',
		importCollectionHint: 'Select a previously downloaded collection ZIP archive.',
		collectionPassword: 'Collection password',
		deleteFileTitle: 'Delete file?',
		encrypted: 'Encrypted',
		download: 'Download'
	},
	toast: {
		fileDownloading: 'File is downloading',
		fileAdded: 'File added',
		fileDeleted: 'File deleted',
		collectionCreated: 'Collection created',
		collectionImported: 'Collection imported',
		collectionDeleted: 'Collection deleted',
		collectionExported: 'Collection exported',
		collectionExportedAndDeleted: 'Collection exported and deleted'
	},
	errors: {
		wrongPassword: 'Wrong password',
		enterPassword: 'Enter password',
		passwordRequired: 'Password required',
		invalidArchiveFormat: 'Invalid archive format: no manifest.json',
		invalidManifestFormat: 'Invalid manifest format'
	},
	createCollection: {
		enterName: 'Enter collection name',
		enterPasswordForEncrypted: 'Enter password for encrypted collection',
		passwordMinLength: 'Password must be at least 4 characters'
	}
};
