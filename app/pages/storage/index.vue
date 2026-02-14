<template>
	<v-container class="py-6">
		<h1 class="text-h5 mb-6">{{ $t('storage.title') }}</h1>

		<v-row>
			<!-- Карточки провайдеров — легко добавить новые -->
			<StorageProviderCard
				v-for="provider in providerCards"
				:key="provider.id"
				:title="provider.title"
				:description="provider.description"
				:icon="provider.icon"
				:connected="provider.connected"
				:email="provider.email"
				:loading="provider.loading"
				:disabled="provider.disabled"
				@connect="provider.onConnect?.()"
				@disconnect="provider.onDisconnect?.()"
			/>
		</v-row>
	</v-container>
</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, computed } from 'vue';
	import { useRuntimeConfig } from '#app';
	import { openUrl } from '@tauri-apps/plugin-opener';
	import { onOpenUrl, getCurrent } from '@tauri-apps/plugin-deep-link';
	import { useStorageStore } from '~/stores/storage';
	import { getGoogleOAuthUrl, parseGoogleCallbackUrl } from '~/helpers/cloud';
	import { useToast } from 'vue-toastification';
	import type { UnlistenFn } from '@tauri-apps/api/event';
	import StorageProviderCard from '~/components/storage/StorageProviderCard.vue';

	const config = useRuntimeConfig();
	const storageStore = useStorageStore();
	const toast = useToast();

	const connectingGoogle = ref(false);
	let unlistenDeepLink: UnlistenFn | null = null;

	function handleGoogleCallback(url: string) {
		const parsed = parseGoogleCallbackUrl(url);
		if (!parsed) return;
		storageStore.setGoogleDriveConnected({ authCode: parsed.code });
		connectingGoogle.value = false;
		toast.success('Google Диск подключён');
	}

	async function connectGoogleDrive() {
		try {
			const clientId = config.public.googleClientId as string;
			const url = getGoogleOAuthUrl(clientId);
			connectingGoogle.value = true;
			await openUrl(url);
		} catch (e) {
			connectingGoogle.value = false;
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		}
	}

	function disconnectGoogleDrive() {
		storageStore.disconnect('google_drive');
		toast.success('Google Диск отключён');
	}

	const providerCards = computed(() => [
		{
			id: 'google_drive',
			title: 'Google Drive',
			description: 'Файлы будут сохраняться в папку приложения на вашем Google Диске.',
			icon: 'mdi-google-drive',
			connected: !!storageStore.googleDrive?.connected,
			email: storageStore.googleDrive?.email,
			loading: connectingGoogle.value,
			disabled: false,
			onConnect: connectGoogleDrive,
			onDisconnect: disconnectGoogleDrive,
		},
		{
			id: 'yandex_disk',
			title: 'Яндекс.Диск',
			description: 'Скоро будет доступно.',
			icon: 'mdi-cloud-outline',
			connected: false,
			disabled: true,
		},
		{
			id: 'dropbox',
			title: 'Dropbox',
			description: 'Скоро будет доступно.',
			icon: 'mdi-dropbox',
			connected: false,
			disabled: true,
		},
	]);

	onMounted(async () => {
		unlistenDeepLink = await onOpenUrl((urls) => {
			const url = urls?.[0];
			if (url?.includes('oauth/google')) handleGoogleCallback(url);
		});
		const current = await getCurrent();
		if (current?.[0]?.includes('oauth/google')) handleGoogleCallback(current[0]);
	});

	onUnmounted(() => {
		unlistenDeepLink?.();
	});
</script>
