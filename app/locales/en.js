import { en } from 'vuetify/locale';

export default {
	$vuetify: en,
	main: {
		createCollection: 'Create collection'
	},
	storage: {
		title: 'Cloud storage'
	},
	common: {
		cancel: 'Cancel',
		save: 'Save'
	},
	update: {
		title: 'Update available',
		message: 'New version {version} is available. Download and install?',
		download: 'Download',
		later: 'Later'
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
		importCollectionHint: 'Select a previously downloaded collection ZIP archive.'
	}
};
