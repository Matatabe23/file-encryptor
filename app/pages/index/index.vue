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

	const isCreateCollectionModal = ref(false);
	const savingFile = ref(false);

	async function pickAndSaveFile() {
		if (savingFile.value) return;
		try {
			savingFile.value = true;
			const savedPath = await saveFile();
			if (savedPath) console.log('Файл сохранён:', savedPath);
		} catch (e) {
			console.error(e);
		} finally {
			savingFile.value = false;
		}
	}
</script>
