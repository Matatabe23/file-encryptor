<template>
	<v-app>
		<v-app-bar
			app
			:class="{ 'app-bar-mobile': isMobile }"
		>
			<div class="flex gap-2 ml-auto mr-4 items-center">
				<LanguageSelect />
				<ThemeToggle />
			</div>
		</v-app-bar>

		<v-main :class="{ 'v-main-mobile': isMobile }">
			<slot />
		</v-main>
	</v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isMobile = ref(false)
const platform = ref(null) // 'android' | 'ios' | 'windows' | 'macos' | 'linux' | null (браузер)

onMounted(async () => {
	try {
		const { type } = await import('@tauri-apps/plugin-os')
		const osType = type()
		platform.value = osType
		isMobile.value = osType === 'android' || osType === 'ios'
	} catch {
		// Не Tauri (браузер) — определяем по userAgent для отступа в мобильном браузере
		const ua = navigator.userAgent || ''
		const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
		isMobile.value = mobile
		platform.value = mobile ? (ua.includes('Android') ? 'android' : 'ios') : null
	}
})
</script>

<style scoped>
/* Отступ сверху = safe area (челка iPhone, статус-бар Android). env() задаёт ОС автоматически. */
.app-bar-mobile {
	--safe-top: max(env(safe-area-inset-top, 0px), 24px); /* 24px fallback для старых Android */
	padding-top: var(--safe-top) !important;
	min-height: calc(56px + var(--safe-top)) !important;
}

/* Чтобы контент не уходил под шапку: у v-main такой же верхний отступ. */
.v-main-mobile {
	padding-top: calc(56px + max(env(safe-area-inset-top, 0px), 32px)) !important;
}
</style>
