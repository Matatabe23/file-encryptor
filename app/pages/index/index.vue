<template>
	<v-container class="py-6">
		<div class="d-flex flex-wrap align-center gap-3 mb-6">
			<h1 class="text-h5">Коллекции</h1>
			<v-btn color="primary" @click="isCreateCollectionModal = true">
				{{ $t('main.createCollection') }}
			</v-btn>
			<v-btn variant="outlined" :loading="importing" @click="triggerImport">
				<v-icon start>mdi-upload</v-icon>
				{{ $t('collections.importCollection') }}
			</v-btn>
			<input ref="importInputRef" type="file" accept=".zip" class="d-none" @change="onImportFile">
		</div>

		<v-row v-if="collections.length">
			<v-col v-for="c in collections" :key="c.id" cols="12" sm="6" md="4">
				<v-card class="fill-height d-flex flex-column">
					<div
						class="flex-grow-1 cursor-pointer pa-4"
						@click="goToCollection(c.id)"
					>
						<v-card-title class="d-flex align-center gap-2 px-0">
							<v-icon>{{ c.type === 'encrypted' ? 'mdi-lock' : 'mdi-folder' }}</v-icon>
							<span class="flex-grow-1">{{ c.name }}</span>
						</v-card-title>
						<v-card-subtitle class="px-0">
							{{ c.type === 'encrypted' ? 'Зашифрованная коллекция' : 'Хранилище' }}
						</v-card-subtitle>
					</div>
					<div class="d-flex justify-end pa-2 pt-0">
						<v-btn
							icon
							variant="text"
							size="small"
							color="error"
							:title="$t('collections.deleteCollection')"
							@click="confirmDeleteCollection(c)"
						>
							<v-icon>mdi-delete-outline</v-icon>
						</v-btn>
					</div>
				</v-card>
			</v-col>
		</v-row>
		<v-alert v-else type="info" variant="tonal" class="mt-4">
			Коллекций пока нет. Нажмите «Создать коллекцию», чтобы добавить первую.
		</v-alert>

		<v-dialog v-model="confirmDeleteCollectionDialog" max-width="400" persistent>
			<v-card>
				<v-card-title>{{ $t('collections.deleteCollection') }}</v-card-title>
				<v-card-text>
					<p class="mb-3">{{ collectionToDelete ? $t('collections.deleteCollectionConfirm', { name: collectionToDelete.name }) : '' }}</p>
					<v-checkbox
						v-model="deleteCollectionFiles"
						:label="$t('collections.deleteCollectionFiles')"
						hide-details
						density="compact"
					/>
				</v-card-text>
				<v-card-actions>
					<v-btn variant="text" @click="confirmDeleteCollectionDialog = false">
						{{ $t('common.cancel') }}
					</v-btn>
					<v-btn color="error" variant="text" :loading="deletingCollection" @click="doDeleteCollection">
						{{ $t('collections.delete') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="importPasswordDialog" max-width="400" persistent>
			<v-card>
				<v-card-title>Пароль коллекции</v-card-title>
				<v-card-text>
					<v-text-field
						v-model="importPassword"
						:label="$t('collections.password')"
						type="password"
						variant="outlined"
						autocomplete="current-password"
						@keydown.enter="confirmImportWithPassword"
					/>
				</v-card-text>
				<v-card-actions>
					<v-btn variant="text" @click="cancelImport">{{ $t('common.cancel') }}</v-btn>
					<v-btn color="primary" :loading="importing" @click="confirmImportWithPassword">
						{{ $t('collections.unlock') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<CreateCollectionModal v-model:isOpen="isCreateCollectionModal" />
	</v-container>
</template>

<script setup lang="ts">
	import CreateCollectionModal from '~/components/main/CreateCollectionModal.vue';
	import { useCollectionsStore } from '~/stores/collections';
	import { saveFileToCollection, deleteAppFile } from '~/helpers/tauri/file';
	import { hashPassword } from '~/helpers/crypto';
	import type { Collection } from '~/types/collections';
	import { useToast } from 'vue-toastification';

	interface ImportManifest {
		name: string;
		type: string;
		passwordHash?: string | null;
		files: { name: string; encrypted: boolean }[];
	}

	const router = useRouter();
	const collectionsStore = useCollectionsStore();
	const toast = useToast();
	const isCreateCollectionModal = ref(false);
	const collections = computed(() => collectionsStore.collections);
	const confirmDeleteCollectionDialog = ref(false);
	const collectionToDelete = ref<Collection | null>(null);
	const deleteCollectionFiles = ref(false);
	const deletingCollection = ref(false);

	const importInputRef = ref<HTMLInputElement | null>(null);
	const importing = ref(false);
	const importPasswordDialog = ref(false);
	const importPassword = ref('');
	const pendingImport = ref<{ zip: unknown; manifest: ImportManifest } | null>(null);

	function goToCollection(id: string) {
		router.push(`/collection/${id}`);
	}

	function triggerImport() {
		importInputRef.value?.click();
	}

	function cancelImport() {
		importPasswordDialog.value = false;
		pendingImport.value = null;
		importPassword.value = '';
	}

	async function onImportFile(ev: Event) {
		const input = ev.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		importing.value = true;
		try {
			const { default: JSZip } = await import('jszip');
			const zip = await JSZip.loadAsync(file);
			const manifestEntry = zip.file('manifest.json');
			if (!manifestEntry) {
				toast.error('Неверный формат архива: нет manifest.json');
				return;
			}
			const manifestJson = await manifestEntry.async('string');
			const manifest = JSON.parse(manifestJson) as ImportManifest;
			if (!manifest.name || !manifest.files || !Array.isArray(manifest.files)) {
				toast.error('Неверный формат manifest.json');
				return;
			}
			if (manifest.type === 'encrypted') {
				pendingImport.value = { zip, manifest };
				importPasswordDialog.value = true;
				importing.value = false;
				return;
			}
			await doImport(zip, manifest, null);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		} finally {
			importing.value = false;
		}
	}

	async function confirmImportWithPassword() {
		if (!pendingImport.value || !importPassword.value) return;
		importing.value = true;
		try {
			await doImport(pendingImport.value.zip, pendingImport.value.manifest, importPassword.value);
			cancelImport();
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		} finally {
			importing.value = false;
		}
	}

	async function doImport(zip: unknown, manifest: ImportManifest, password: string | null) {
		const passwordHash = manifest.type === 'encrypted' && password ? await hashPassword(password) : undefined;
		const collection = collectionsStore.addCollection(manifest.name, manifest.type as 'storage' | 'encrypted', passwordHash ?? undefined);

		const zipObj = zip as { file: (n: string) => { async: (t: string) => Promise<ArrayBuffer | string> } | null };
		for (const entry of manifest.files) {
			const fileEntry = zipObj.file(entry.name);
			if (!fileEntry) continue;
			const raw = await fileEntry.async('arraybuffer') as ArrayBuffer;
			const bytes = new Uint8Array(raw);
			const relativePath = await saveFileToCollection(collection.id, entry.name, { contents: bytes });
			collectionsStore.addFileToCollection(collection.id, relativePath, entry.name, manifest.type === 'encrypted');
		}

		toast.success('Коллекция загружена');
		router.push(`/collection/${collection.id}`);
	}

	function confirmDeleteCollection(c: Collection) {
		collectionToDelete.value = c;
		deleteCollectionFiles.value = false;
		confirmDeleteCollectionDialog.value = true;
	}

	async function doDeleteCollection() {
		const c = collectionToDelete.value;
		if (!c) return;
		deletingCollection.value = true;
		try {
			if (deleteCollectionFiles.value) {
				const filesToDelete = collectionsStore.getFilesForCollection(c.id);
				for (const f of filesToDelete) {
					try {
						await deleteAppFile(f.path);
					} catch (_) {}
				}
			}
			collectionsStore.removeCollection(c.id);
			collectionToDelete.value = null;
			confirmDeleteCollectionDialog.value = false;
			toast.success('Коллекция удалена');
		} finally {
			deletingCollection.value = false;
		}
	}
</script>
