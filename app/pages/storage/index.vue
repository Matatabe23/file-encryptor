<template>
	<v-container class="py-6">
		<h1 class="text-h5 mb-6">{{ $t('storage.title') }}</h1>

		<v-row>
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
	import { computed } from 'vue';
	import { useI18n } from 'vue-i18n';
	import StorageProviderCard from '~/components/storage/StorageProviderCard.vue';

	const { t, locale } = useI18n();

	const providerCards = computed(() => {
		locale.value; // reactivity to locale change
		return [
		{
			id: 'yandex_disk',
			title: t('storage.yandexTitle'),
			description: t('storage.yandexDescription'),
			icon: 'mdi-cloud-outline',
			connected: false,
			disabled: true,
		},
		{
			id: 'dropbox',
			title: t('storage.dropboxTitle'),
			description: t('storage.dropboxDescription'),
			icon: 'mdi-dropbox',
			connected: false,
			disabled: true,
		},
		];
	});
</script>
