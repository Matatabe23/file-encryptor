import { ru } from 'vuetify/locale';

export default {
	$vuetify: ru,

	success: 'Успешно',
	create: 'Создать',
	save: 'Сохранить',
	cancel: 'Отмена',
	delete: 'Удалить',
	edit: 'редактировать',

	state: {
		create: 'Создан',
		active: 'Активен',
		loading: 'Загружается...',
		assemblyRequired: 'Необходима сборка'
	},

	profile: {
		label: 'Профили',
		createProfile: 'Создать профиль',

		createProfileModel: {
			label: 'Создание профиля',
			name: 'Название профиля',
			displayName: 'Отображаемое имя',
			descriptionProfile: 'Описание профиля',
			minecraftVersion: 'Версия игры',
			gameLoader: 'Загрузчик',
			loaderVersion: 'Версия загрузчика'
		},

		editPhotoModal: {
			label: 'Редактирование заставок',
            icon: 'Иконка',
            background: 'Задний фон'
		},

		table: {
			headers: {
				name: 'Название',
				minecraftVersion: 'версия',
				gameLoader: 'Загрузчик',
				priority: 'Приоритет',
				state: 'Статус'
			},

			filters: {
				name: 'Название профиля...',
				minecraftVersion: 'версия профиля...',
				gameLoader: 'Загрузчик профиля...',
				priority: 'Приоритет профиля...',
				state: 'Статус профиля...'
			},

			buttons: {
				card: 'Карточка игрока',
				ban: 'Бан по железу',
				delete: 'Удалить'
			}
		},

		infoSettings: {
			main: 'Основные',
			client: 'Клиент',

			isEnabled: 'Отображение профиля в лаунчере',
			displayName: 'Отображаемое имя',
			descriptionProfile: 'Описание профиля',

			jvmArguments: 'JVM аргументы',
			gameArguments: 'Game аргументы',
			priority: 'Приоритет',
			recommendedRam: 'Рекомендуемая оперативная память'
		}
	},

	auth: {
		login: 'Авторизация',
		register: 'Регистрация',
		username: 'Логин',
		email: 'Email',
		password: 'Пароль',
		repeatPassword: 'Повтор пароля',
		signIn: 'Войти',
		signUp: 'Зарегистрироваться',
		backToLogin: 'Назад ко входу'
	},

	navigation: {
		profiles: 'Профили',
		integrations: 'Интеграции',
		players: 'Игроки',
		settings: 'Настройки',
		settingsChildren: {
			general: 'Общие'
		}
	},

	menu: {
		profiles: 'Профили',
		logout: 'Выйти'
	},

	validation: {
		required: 'Обязательно для заполнения',
		email: 'Не корректный email',
		min: 'Должен быть не менее {length} символов',
		max: 'Должен быть не более {length} символов',
		confirmed: 'Пароли не совпадают',
		invalid: 'Неверное значение',
		alphanumeric: 'Допустимы только латинские буквы и цифры'
	},

	players: {
		warning:
			'У вас выбран внешний тип аутентификации. Данный список работает только при внутренней аутентификации(При входе через внешнюю аутентификацию, данные игроков будут сохраняться в данную таблицу.).',

		userCreate: {
			name: 'Логин',
			email: 'Email',
			create: 'Создать'
		},

		table: {
			headers: {
				id: 'ID',
				name: 'Логин',
				uuid: 'uuid',
				email: 'Email'
			},

			filters: {
				id: 'id игрока...',
				name: 'Логин игрока...',
				uuid: 'uuid игрока...',
				email: 'Email ирока...'
			},

			buttons: {
				card: 'Карточка игрока',
				ban: 'Бан по железу',
				delete: 'Удалить'
			}
		},

		createUserModal: {
			title: 'Игрок:',
			name: 'Логин',
			password: 'Пароль',
			close: 'Закрыть',
			copyData: 'Скопировать данные в буфер'
		}
	},

	settings: {
		allowRegistration: {
			title: 'Регистрация новых пользователей',
			description: 'Управляет возможностью регистрации новых пользователей на сайте'
		}
	}
};
