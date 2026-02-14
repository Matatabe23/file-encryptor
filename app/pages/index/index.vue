<template>
	<v-container>
		<v-btn @click="isCreateCollectionModal = true">{{ $t('main.createCollection') }}</v-btn>
		<v-btn class="ml-4" :loading="savingFile" @click="pickAndSaveFile">
			Выбрать файл
		</v-btn>

		<CreateCollectionModal v-model:isOpen="isCreateCollectionModal" />
	</v-container>
</template>

<script setup lang="ts">
	import CreateCollectionModal from '~/components/main/CreateCollectionModal.vue';
	import { pickAndSaveFile as saveFile } from '~/helpers/tauri';
	import { useToast } from 'vue-toastification';

	const toast = useToast();
	const isCreateCollectionModal = ref(false);
	const savingFile = ref(false);

	async function pickAndSaveFile() {
		if (savingFile.value) return;
		try {
			savingFile.value = true;
			const savedPath = await saveFile();
			if (savedPath) {
				toast.success(`Файл сохранён:`,);
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			console.error(e);
			toast.error(`Ошибка сохранения: ${msg}`);
		} finally {
			savingFile.value = false;
		}
	}
</script>
