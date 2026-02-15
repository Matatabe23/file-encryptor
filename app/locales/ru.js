import { ru } from 'vuetify/locale';

export default {
	$vuetify: ru,

	create: 'Создать',

	main: {
		createCollection: 'Создать коллекцию'
	},
	storage: {
		title: 'Облачное хранилище'
	},
	common: {
		cancel: 'Отмена',
		save: 'Сохранить'
	},
	update: {
		title: 'Доступно обновление',
		message: 'Вышла новая версия {version}. Скачать и установить?',
		download: 'Скачать',
		later: 'Позже'
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
		importCollectionHint: 'Выберите ранее скачанный ZIP-архив коллекции.'
	}
};
