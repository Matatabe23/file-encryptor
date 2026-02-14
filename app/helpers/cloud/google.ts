/** Redirect URI для OAuth — приложение откроется по этой ссылке после авторизации в браузере */
export const GOOGLE_OAUTH_REDIRECT_URI = 'fileencryptor://oauth/google/callback'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

/**
 * Собирает URL для авторизации Google (Drive).
 * clientId передаётся из useRuntimeConfig().public.googleClientId (env: NUXT_PUBLIC_GOOGLE_CLIENT_ID).
 */
export function getGoogleOAuthUrl(clientId: string): string {
	if (!clientId) {
		throw new Error(
			'Google Client ID не задан. Добавьте NUXT_PUBLIC_GOOGLE_CLIENT_ID в .env и в Google Cloud Console укажите redirect_uri: fileencryptor://oauth/google/callback',
		)
	}
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
		response_type: 'code',
		scope: GOOGLE_DRIVE_SCOPE,
		access_type: 'offline',
		prompt: 'consent',
	})
	return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/** Парсит code из URL колбэка (fileencryptor://oauth/google/callback?code=...) */
export function parseGoogleCallbackUrl(url: string): { code: string } | null {
	try {
		const u = new URL(url)
		const code = u.searchParams.get('code')
		return code ? { code } : null
	} catch {
		return null
	}
}
