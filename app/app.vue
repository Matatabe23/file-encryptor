<template>
	<NuxtLayout>
		<NuxtPage />

		<v-overlay
			:model-value="isLoading"
			absolute
			class="flex justify-center items-center"
		>
			<v-progress-circular
				indeterminate
				size="64"
				color="primary"
			/>
		</v-overlay>

		<v-dialog
			v-model="updateDialogVisible"
			persistent
			max-width="480"
			@after-leave="updateInfo = null"
		>
			<v-card>
				<v-card-title class="text-h6">
					{{ $t('update.title') }}
				</v-card-title>
				<v-card-text>
					<p class="mb-2">
						{{ $t('update.message', { version: updateInfo?.version ?? '' }) }}
					</p>
					<p
						v-if="updateInfo?.body"
						class="text-body2 text-medium-emphasis mt-2"
					>
						{{ updateInfo.body }}
					</p>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn
						variant="text"
						@click="updateDialogVisible = false"
					>
						{{ $t('update.later') }}
					</v-btn>
					<v-btn
						color="primary"
						:loading="updateDownloading"
						:disabled="!updateInfo?.download_url"
						@click="onDownloadUpdate"
					>
						{{ $t('update.download') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import { useAppStore } from '~/stores/app';
	import { checkForUpdate, downloadUpdate } from '~/helpers/tauri';
	import type { CheckUpdateResult } from '~/helpers/tauri';

	const appStore = useAppStore();
	const { locale, availableLocales } = useI18n();
	const router = useRouter();
	const route = useRoute();
	const switchLocalePath = useSwitchLocalePath();

	const isLoading = ref(true);
	const updateInfo = ref<CheckUpdateResult | null>(null);
	const updateDialogVisible = ref(false);
	const updateDownloading = ref(false);

	async function onDownloadUpdate() {
		const info = updateInfo.value;
		if (!info?.download_url) return;
		updateDownloading.value = true;
		try {
			const localPath = await downloadUpdate(info.download_url);
			const { open } = await import('@tauri-apps/plugin-opener');
			await open(localPath);
			updateDialogVisible.value = false;
		} catch (e) {
			// Fallback: открыть URL в браузере
			const { open } = await import('@tauri-apps/plugin-opener');
			await open(info.download_url);
			updateDialogVisible.value = false;
		} finally {
			updateDownloading.value = false;
		}
	}

	onMounted(async () => {
		isLoading.value = true;

		const hasPrefix = availableLocales.some((l) => route.path.startsWith(`/${l}`));
		if (!hasPrefix) {
			const path = switchLocalePath(locale.value);
			router.replace(path);
		}

		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme === 'dark') appStore.isDark = true;
			if (savedTheme === 'light') appStore.isDark = false;
		}

		isLoading.value = false;

		// Проверка обновлений (только в Tauri)
		try {
			const result = await checkForUpdate();
			if (result?.has_update && result.download_url) {
				updateInfo.value = result;
				updateDialogVisible.value = true;
			}
		} catch {
			// не Tauri или сеть недоступна
		}
	});
</script>

<style scoped>
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
</style>
