<template>
	<v-container class="py-6">
		<div v-if="!collection" class="text-center py-8">
			<v-progress-circular indeterminate color="primary" />
			<p class="mt-4">Загрузка...</p>
		</div>

		<template v-else>
			<!-- Запрос пароля для зашифрованной коллекции -->
			<v-card v-if="collection.type === 'encrypted' && !sessionPassword" class="pa-6">
				<v-card-title>{{ $t('collections.enterPassword') }}</v-card-title>
				<v-card-text>
					<v-text-field
						v-model="passwordInput"
						:label="$t('collections.password')"
						type="password"
						variant="outlined"
						autocomplete="current-password"
						:error-messages="passwordError"
						@keydown.enter="unlock"
					/>
				</v-card-text>
				<v-card-actions>
					<v-btn color="primary" :loading="unlocking" @click="unlock">
						{{ $t('collections.unlock') }}
					</v-btn>
					<v-btn variant="text" :to="'/'">{{ $t('collections.back') }}</v-btn>
				</v-card-actions>
			</v-card>

			<template v-else>
				<div class="d-flex align-center gap-2 mb-4">
					<v-btn icon variant="text" :to="'/'" class="mr-2">
						<v-icon>mdi-arrow-left</v-icon>
					</v-btn>
					<h1 class="text-h5 flex-grow-1">{{ collection.name }}</h1>
					<v-chip v-if="collection.type === 'encrypted'" color="primary" size="small">
						<v-icon start size="small">mdi-lock</v-icon>
						Зашифровано
					</v-chip>
				</div>

				<div class="mb-4">
					<v-btn
						color="primary"
						:loading="addingFile"
						@click="addFile"
					>
						<v-icon start>mdi-plus</v-icon>
						{{ $t('collections.addFile') }}
					</v-btn>
				</div>

				<h2 class="text-subtitle-1 mb-3">{{ $t('collections.files') }}</h2>
				<v-list v-if="files.length" lines="two">
					<v-list-item
						v-for="f in files"
						:key="f.id"
						:title="f.name"
						:subtitle="new Date(f.createdAt).toLocaleString()"
						@click="openFile(f)"
					>
						<template #prepend>
							<v-icon>mdi-file-outline</v-icon>
						</template>
						<template #append>
							<v-btn icon variant="text" size="small" @click.stop="confirmDelete(f)">
								<v-icon>mdi-delete-outline</v-icon>
							</v-btn>
						</template>
					</v-list-item>
				</v-list>
				<p v-else class="text-medium-emphasis">{{ $t('collections.noFiles') }}</p>

				<v-dialog v-model="confirmDeleteDialog" max-width="400" persistent>
					<v-card>
						<v-card-title>Удалить файл?</v-card-title>
						<v-card-actions>
							<v-btn variant="text" @click="confirmDeleteDialog = false">Отмена</v-btn>
							<v-btn color="error" variant="text" @click="doDelete">Удалить</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</template>
		</template>
	</v-container>
</template>

<script setup lang="ts">
	import { useCollectionsStore } from '~/stores/collections';
	import { readAppFile, getSaveFolderTypeFromFileName, saveEncryptedFile } from '~/helpers/tauri/file';
	import { encryptWithPassword, decryptWithPassword, verifyPassword } from '~/helpers/crypto';
	import type { CollectionFile } from '~/types/collections';
	import { useToast } from 'vue-toastification';
	import { open } from '@tauri-apps/plugin-dialog';
	import { readFile } from '@tauri-apps/plugin-fs';
	import { invoke } from '@tauri-apps/api/core';

	const route = useRoute();
	const router = useRouter();
	const collectionsStore = useCollectionsStore();
	const toast = useToast();

	const id = computed(() => route.params.id as string);
	const collection = computed(() => collectionsStore.getCollection(id.value));
	const files = computed(() => (collection.value ? collectionsStore.getFilesForCollection(collection.value.id) : []));

	const sessionPassword = ref('');
	const passwordInput = ref('');
	const passwordError = ref('');
	const unlocking = ref(false);
	const addingFile = ref(false);
	const confirmDeleteDialog = ref(false);
	const fileToDelete = ref<CollectionFile | null>(null);

	async function unlock() {
		if (!collection.value?.passwordHash) return;
		passwordError.value = '';
		unlocking.value = true;
		try {
			const ok = await verifyPassword(passwordInput.value, collection.value.passwordHash);
			if (ok) {
				sessionPassword.value = passwordInput.value;
				passwordInput.value = '';
			} else {
				passwordError.value = 'Неверный пароль';
			}
		} catch (e) {
			passwordError.value = e instanceof Error ? e.message : String(e);
		} finally {
			unlocking.value = false;
		}
	}

	async function addFile() {
		if (!collection.value) return;
		addingFile.value = true;
		try {
			const selected = await open({ multiple: false, directory: false });
			if (selected === null || Array.isArray(selected)) {
				addingFile.value = false;
				return;
			}
			const path = selected as string;
			let fileName: string;
			if (path.startsWith('content:')) {
				fileName = (await invoke<string | null>('get_file_name_from_path', { path })) ?? `file_${Date.now()}`;
			} else {
				fileName = path.split(/[/\\]/).pop() ?? `file_${Date.now()}`;
			}

			if (collection.value.type === 'encrypted') {
				const pwd = sessionPassword.value;
				if (!pwd) {
					toast.error('Введите пароль');
					addingFile.value = false;
					return;
				}
				const data = await readFile(path);
				const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data);
				const encrypted = await encryptWithPassword(pwd, bytes);
				const savedPath = await saveEncryptedFile(encrypted, fileName);
				collectionsStore.addFileToCollection(collection.value.id, savedPath, fileName, true);
			} else {
				const saveType = getSaveFolderTypeFromFileName(fileName);
				const payload: { saveType: string; sourcePath: string | null; contents: number[] | null; fileName: string | null } = {
					saveType,
					sourcePath: path.startsWith('content:') ? null : path,
					contents: null,
					fileName: path.startsWith('content:') ? fileName : null,
				};
				if (path.startsWith('content:')) {
					const data = await readFile(path);
					payload.contents = Array.from(data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data));
					payload.fileName = fileName;
				}
				const savedPath = await invoke<string>('save_file_to_app', payload);
				collectionsStore.addFileToCollection(collection.value.id, savedPath, fileName, false);
			}
			toast.success('Файл добавлен');
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		} finally {
			addingFile.value = false;
		}
	}

	async function openFile(file: CollectionFile) {
		try {
			const bytes = await readAppFile(file.path);
			if (file.encrypted && collection.value?.type === 'encrypted') {
				const pwd = sessionPassword.value;
				if (!pwd) {
					toast.error('Нужен пароль');
					return;
				}
				const decrypted = await decryptWithPassword(pwd, bytes);
				// Скачивание как файл (создаём blob и ссылку)
				const blob = new Blob([decrypted]);
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = file.name;
				a.click();
				URL.revokeObjectURL(url);
			} else {
				const blob = new Blob([bytes]);
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = file.name;
				a.click();
				URL.revokeObjectURL(url);
			}
			toast.success('Файл скачивается');
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		}
	}

	function confirmDelete(f: CollectionFile) {
		fileToDelete.value = f;
		confirmDeleteDialog.value = true;
	}

	function doDelete() {
		if (fileToDelete.value) {
			collectionsStore.removeFile(fileToDelete.value.id);
			fileToDelete.value = null;
			confirmDeleteDialog.value = false;
			toast.success('Файл удалён');
		}
	}

	watch(id, () => {
		sessionPassword.value = '';
		passwordInput.value = '';
		passwordError.value = '';
	});
	watch(collection, (c) => {
		if (!c) router.replace('/');
	}, { immediate: true });
</script>
