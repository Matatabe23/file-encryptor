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
	import { open } from '@tauri-apps/plugin-dialog';
	import { readFile } from '@tauri-apps/plugin-fs';
	import { invoke } from '@tauri-apps/api/core';

	const isCreateCollectionModal = ref(false);
	const savingFile = ref(false);

	async function pickAndSaveFile() {
		if (savingFile.value) return;
		try {
			savingFile.value = true;
			const selected = await open({
				multiple: false,
				directory: false,
			});
			if (selected === null || Array.isArray(selected)) return;
			const path = selected as string;
			let savedPath: string;
			// На Android диалог возвращает content:// URI — читаем файл и сохраняем байтами в папку «Фото»
			if (path.startsWith('content:')) {
				const file_name =
					(await invoke<string | null>('get_file_name_from_path', { path })) ?? `file_${Date.now()}`;
				const data = await readFile(path);
				const contents = Array.from(data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data));
				savedPath = await invoke<string>('save_file_to_app', {
					sourcePath: null,
					contents,
					fileName: file_name,
				});
			} else {
				savedPath = await invoke<string>('save_file_to_app', {
					sourcePath: path,
					contents: null,
					fileName: null,
				});
			}
			console.log('Файл сохранён:', savedPath);
		} catch (e) {
			console.error(e);
		} finally {
			savingFile.value = false;
		}
	}
</script>
