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
		deleteCollectionConfirm: 'Удалить коллекцию «{name}»? Записи о файлах будут удалены (файлы на устройстве не трогаются).',
		open: 'Открыть',
		downloadCollection: 'Скачать коллекцию',
		downloadCollectionConfirm: 'Удалить коллекцию и файлы после скачивания?',
		importCollection: 'Загрузить коллекцию',
		importCollectionHint: 'Выберите ранее скачанный ZIP-архив коллекции.'
	}
};
