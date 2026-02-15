import { ru } from 'vuetify/locale';

export default {
	$vuetify: ru,

	create: 'Создать',

	main: {
		collectionsTitle: 'Коллекции',
		createCollection: 'Создать коллекцию',
		collectionsEmpty: 'Коллекций пока нет. Нажмите «Создать коллекцию», чтобы добавить первую.',
		collectionTypeEncrypted: 'Зашифрованная коллекция',
		collectionTypeStorage: 'Хранилище'
	},
	storage: {
		title: 'Облачное хранилище',
		connect: 'Подключить',
		disconnect: 'Отключить',
		comingSoon: 'Скоро будет доступно',
		yandexTitle: 'Яндекс.Диск',
		yandexDescription: 'Скоро будет доступно.',
		dropboxTitle: 'Dropbox',
		dropboxDescription: 'Скоро будет доступно.'
	},
	common: {
		cancel: 'Отмена',
		save: 'Сохранить',
		loading: 'Загрузка...'
	},
	collections: {
		name: 'Название коллекции',
		type: 'Тип коллекции',
		typeStorage: 'Просто хранилище — файлы как есть',
		typeEncrypted: 'Зашифрованная — только через приложение с паролем',
		password: 'Пароль доступа',
		passwordHint: 'Пароль не хранится. Ключ расшифровки получается из введённого пароля.',
		enterPassword: 'Введите пароль',
		unlock: 'Открыть',
		addFile: 'Добавить файл',
		files: 'Файлы',
		noFiles: 'Пока нет файлов',
		back: 'Назад',
		delete: 'Удалить',
		deleteCollection: 'Удалить коллекцию',
		deleteCollectionConfirm: 'Удалить коллекцию «{name}»? Записи о файлах будут удалены.',
		deleteCollectionFiles: 'Удалить файлы с устройства',
		open: 'Открыть',
		downloadCollection: 'Скачать коллекцию',
		downloadCollectionConfirm: 'Удалить коллекцию и файлы после скачивания?',
		importCollection: 'Загрузить коллекцию',
		importCollectionHint: 'Выберите ранее скачанный ZIP-архив коллекции.',
		collectionPassword: 'Пароль коллекции',
		deleteFileTitle: 'Удалить файл?',
		encrypted: 'Зашифровано',
		download: 'Скачать'
	},
	toast: {
		fileDownloading: 'Файл скачивается',
		fileAdded: 'Файл добавлен',
		fileDeleted: 'Файл удалён',
		collectionCreated: 'Коллекция создана',
		collectionImported: 'Коллекция загружена',
		collectionDeleted: 'Коллекция удалена',
		collectionExported: 'Коллекция скачана',
		collectionExportedAndDeleted: 'Коллекция скачана и удалена'
	},
	errors: {
		wrongPassword: 'Неверный пароль',
		enterPassword: 'Введите пароль',
		passwordRequired: 'Нужен пароль',
		invalidArchiveFormat: 'Неверный формат архива: нет manifest.json',
		invalidManifestFormat: 'Неверный формат manifest.json'
	},
	createCollection: {
		enterName: 'Введите название коллекции',
		enterPasswordForEncrypted: 'Введите пароль для зашифрованной коллекции',
		passwordMinLength: 'Пароль не менее 4 символов'
	}
};
