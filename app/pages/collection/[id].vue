<template>
	<v-container class="py-6">
		<div v-if="!collection" class="text-center py-8">
			<v-progress-circular indeterminate color="primary" />
			<p class="mt-4">Загрузка...</p>
		</div>

		<template v-else>
			<v-card v-if="collection.type === 'encrypted' && !sessionPassword" class="pa-6">
				<v-card-title>{{ $t('collections.enterPassword') }}</v-card-title>
				<v-card-text>
					<p class="text-caption text-medium-emphasis mb-3">
						{{ $t('collections.passwordHint') }}
					</p>
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
					<v-btn
						icon
						variant="text"
						color="error"
						:title="$t('collections.deleteCollection')"
						@click="confirmDeleteCollectionPage"
					>
						<v-icon>mdi-delete-outline</v-icon>
					</v-btn>
				</div>

				<div class="d-flex flex-wrap gap-2 mb-4">
					<v-btn color="primary" :loading="addingFile" @click="addFile">
						<v-icon start>mdi-plus</v-icon>
						{{ $t('collections.addFile') }}
					</v-btn>
					<v-btn
						variant="outlined"
						:loading="exporting"
						:disabled="!files.length"
						@click="openExportDialog"
					>
						<v-icon start>mdi-folder-zip-outline</v-icon>
						{{ $t('collections.downloadCollection') }}
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
							<div class="list-item-prepend">
								<div v-if="getFileKind(f.name) === 'image'" class="file-thumb file-thumb--square">
									<img v-if="mediaCache[f.id]?.url" :src="mediaCache[f.id].url" alt="">
									<v-icon v-else class="file-thumb-placeholder" size="small">mdi-image</v-icon>
								</div>
								<div v-else-if="getFileKind(f.name) === 'video'" class="file-thumb file-thumb--square">
									<video v-if="mediaCache[f.id]?.url" :src="mediaCache[f.id].url" muted autoplay loop playsinline />
									<v-icon v-else class="file-thumb-placeholder" size="small">mdi-video</v-icon>
								</div>
								<v-icon v-else-if="getFileKind(f.name) === 'audio'">mdi-music</v-icon>
								<v-icon v-else>mdi-file-document-outline</v-icon>
							</div>
						</template>
						<template #append>
							<v-btn icon variant="text" size="small" @click.stop="confirmDelete(f)">
								<v-icon>mdi-delete-outline</v-icon>
							</v-btn>
						</template>
					</v-list-item>
				</v-list>
				<p v-else class="text-medium-emphasis">{{ $t('collections.noFiles') }}</p>

				<v-dialog v-model="previewDialog" max-width="90vw" max-height="90vh" persistent scrollable @click:outside="closePreview">
					<v-card class="preview-dialog-card">
						<v-card-title class="d-flex align-center">
							<span class="flex-grow-1 text-truncate">{{ previewName }}</span>
							<v-btn icon variant="text" @click="closePreview">
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</v-card-title>
						<v-card-text class="preview-dialog-content">
							<div v-if="previewLoading" class="preview-loading">
								<v-progress-circular indeterminate color="primary" size="48" />
								<span class="mt-2">Загрузка...</span>
							</div>
							<img
								v-else-if="previewType === 'image' && previewUrl"
								:src="previewUrl"
								alt=""
								class="preview-media preview-media--image"
							>
							<video
								v-else-if="previewType === 'video' && previewUrl"
								:src="previewUrl"
								controls
								class="preview-media preview-media--video"
							/>
							<audio
								v-else-if="previewType === 'audio' && previewUrl"
								:src="previewUrl"
								controls
								class="preview-media preview-media--audio"
							/>
						</v-card-text>
						<v-card-actions>
							<v-spacer />
							<v-btn color="primary" @click="downloadPreview">
								<v-icon start>mdi-download</v-icon>
								Скачать
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>

				<v-dialog v-model="confirmDeleteDialog" max-width="400" persistent>
					<v-card>
						<v-card-title>Удалить файл?</v-card-title>
						<v-card-actions>
							<v-btn variant="text" @click="confirmDeleteDialog = false">Отмена</v-btn>
							<v-btn color="error" variant="text" @click="doDelete">Удалить</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>

				<v-dialog v-model="confirmDeleteCollectionDialog" max-width="400" persistent>
					<v-card>
						<v-card-title>{{ $t('collections.deleteCollection') }}</v-card-title>
						<v-card-text>
							<p class="mb-3">{{ $t('collections.deleteCollectionConfirm', { name: collection.name }) }}</p>
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

				<v-dialog v-model="exportDialog" max-width="400" persistent>
					<v-card>
						<v-card-title>{{ $t('collections.downloadCollection') }}</v-card-title>
						<v-card-text>
							<v-checkbox
								v-model="exportDeleteAfter"
								:label="$t('collections.downloadCollectionConfirm')"
								hide-details
								density="compact"
							/>
						</v-card-text>
						<v-card-actions>
							<v-btn variant="text" @click="exportDialog = false">{{ $t('common.cancel') }}</v-btn>
							<v-btn color="primary" :loading="exporting" @click="doExportCollection">
								{{ $t('collections.downloadCollection') }}
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</template>
		</template>
	</v-container>
</template>

<script setup lang="ts">
	import JSZip from 'jszip';
	import { useCollectionsStore } from '~/stores/collections';
	import { readAppFile, saveFileToCollection, deleteAppFile } from '~/helpers/tauri/file';
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
	const exporting = ref(false);
	const exportDialog = ref(false);
	const exportDeleteAfter = ref(false);
	const confirmDeleteDialog = ref(false);
	const fileToDelete = ref<CollectionFile | null>(null);
	const confirmDeleteCollectionDialog = ref(false);
	const deleteCollectionFiles = ref(false);
	const deletingCollection = ref(false);

	const previewDialog = ref(false);
	const previewUrl = ref<string | null>(null);
	const previewType = ref<'image' | 'video' | 'audio' | null>(null);
	const previewName = ref('');
	const previewBlob = ref<Blob | null>(null);
	const previewLoading = ref(false);

	/** Кэш расшифрованных медиа в памяти: по клику открытие мгновенное. Очищается при выходе и при блокировке. */
	const mediaCache = ref<Record<string, { blob: Blob; url: string }>>({});
	const preloadAbort = ref(false);

	const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'heic', 'heif']);
	const VIDEO_EXT = new Set(['mp4', 'mkv', 'mov', 'avi', 'webm', 'm4v', '3gp', 'flv', 'wmv']);
	const AUDIO_EXT = new Set(['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'aiff']);

	function getFileKind(fileName: string): 'image' | 'video' | 'audio' | 'document' {
		const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
		if (IMAGE_EXT.has(ext)) return 'image';
		if (VIDEO_EXT.has(ext)) return 'video';
		if (AUDIO_EXT.has(ext)) return 'audio';
		return 'document';
	}

	function clearMediaCache() {
		for (const entry of Object.values(mediaCache.value)) {
			URL.revokeObjectURL(entry.url);
		}
		mediaCache.value = {};
	}

	/** Предзагрузка медиа в память (расшифровка в фоне) для мгновенного открытия. */
	async function preloadMedia() {
		const c = collection.value;
		const list = files.value;
		if (!c || !list.length) return;
		const pwd = c.type === 'encrypted' ? sessionPassword.value : null;
		if (c.type === 'encrypted' && !pwd) return;
		preloadAbort.value = false;
		for (const f of list) {
			if (preloadAbort.value) break;
			const kind = getFileKind(f.name);
			if (kind !== 'image' && kind !== 'video' && kind !== 'audio') continue;
			if (mediaCache.value[f.id]) continue;
			try {
				let bytes = await readAppFile(f.path);
				if (f.encrypted && pwd) bytes = await decryptWithPassword(pwd, bytes);
				const blob = new Blob([bytes]);
				const url = URL.createObjectURL(blob);
				mediaCache.value = { ...mediaCache.value, [f.id]: { blob, url } };
			} catch (_) {}
		}
	}

	function closePreview() {
		if (previewUrl.value) {
			URL.revokeObjectURL(previewUrl.value);
			previewUrl.value = null;
		}
		previewBlob.value = null;
		previewType.value = null;
		previewName.value = '';
		previewDialog.value = false;
	}

	function downloadPreview() {
		if (previewBlob.value && previewName.value) {
			downloadBlob(previewBlob.value, previewName.value);
			toast.success('Файл скачивается');
		}
	}

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
				const relativePath = await saveFileToCollection(collection.value.id, fileName, { contents: encrypted });
				collectionsStore.addFileToCollection(collection.value.id, relativePath, fileName, true);
			} else {
				if (path.startsWith('content:')) {
					const data = await readFile(path);
					const contents = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data);
					const relativePath = await saveFileToCollection(collection.value.id, fileName, { contents });
					collectionsStore.addFileToCollection(collection.value.id, relativePath, fileName, false);
				} else {
					const relativePath = await saveFileToCollection(collection.value.id, fileName, { sourcePath: path });
					collectionsStore.addFileToCollection(collection.value.id, relativePath, fileName, false);
				}
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
		const kind = getFileKind(file.name);
		const cached = mediaCache.value[file.id];

		if (kind === 'image' || kind === 'video' || kind === 'audio') {
			if (cached) {
				closePreview();
				previewUrl.value = URL.createObjectURL(cached.blob);
				previewType.value = kind;
				previewName.value = file.name;
				previewBlob.value = cached.blob;
				previewLoading.value = false;
				previewDialog.value = true;
				return;
			}
			closePreview();
			previewLoading.value = true;
			previewName.value = file.name;
			previewType.value = kind;
			previewDialog.value = true;
			try {
				let bytes = await readAppFile(file.path);
				if (file.encrypted && collection.value?.type === 'encrypted') {
					const pwd = sessionPassword.value;
					if (!pwd) {
						toast.error('Нужен пароль');
						previewLoading.value = false;
						return;
					}
					bytes = await decryptWithPassword(pwd, bytes);
				}
				const blob = new Blob([bytes]);
				const urlForPreview = URL.createObjectURL(blob);
				const urlForCache = URL.createObjectURL(blob);
				previewUrl.value = urlForPreview;
				previewBlob.value = blob;
				mediaCache.value = { ...mediaCache.value, [file.id]: { blob, url: urlForCache } };
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				toast.error(msg);
				previewDialog.value = false;
			} finally {
				previewLoading.value = false;
			}
			return;
		}

		try {
			let bytes: Uint8Array = await readAppFile(file.path);
			if (file.encrypted && collection.value?.type === 'encrypted') {
				const pwd = sessionPassword.value;
				if (!pwd) {
					toast.error('Нужен пароль');
					return;
				}
				bytes = await decryptWithPassword(pwd, bytes);
			}
			downloadBlob(new Blob([bytes]), file.name);
			toast.success('Файл скачивается');
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		}
	}

	function downloadBlob(blob: Blob, name: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = name;
		a.click();
		URL.revokeObjectURL(url);
	}

	function openExportDialog() {
		exportDeleteAfter.value = false;
		exportDialog.value = true;
	}

	async function doExportCollection() {
		if (!collection.value || !files.value.length) return;
		exporting.value = true;
		try {
			const zip = new JSZip();
			const manifest = {
				name: collection.value.name,
				type: collection.value.type,
				passwordHash: collection.value.passwordHash ?? null,
				files: files.value.map((f) => ({ name: f.name, encrypted: f.encrypted })),
			};
			zip.file('manifest.json', JSON.stringify(manifest, null, 2));

			for (const f of files.value) {
				const bytes = await readAppFile(f.path);
				zip.file(f.name, bytes);
			}

			const blob = await zip.generateAsync({ type: 'blob' });
			downloadBlob(blob, `${collection.value.name}.zip`);

			if (exportDeleteAfter.value) {
				for (const f of files.value) {
					try {
						await deleteAppFile(f.path);
					} catch (_) {}
				}
				collectionsStore.removeCollection(collection.value.id);
				exportDialog.value = false;
				toast.success('Коллекция скачана и удалена');
				router.push('/');
				return;
			}
			exportDialog.value = false;
			toast.success('Коллекция скачана');
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		} finally {
			exporting.value = false;
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

	function confirmDeleteCollectionPage() {
		deleteCollectionFiles.value = false;
		confirmDeleteCollectionDialog.value = true;
	}

	async function doDeleteCollection() {
		const c = collection.value;
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
			confirmDeleteCollectionDialog.value = false;
			toast.success('Коллекция удалена');
			router.push('/');
		} finally {
			deletingCollection.value = false;
		}
	}

	watch(id, () => {
		sessionPassword.value = '';
		passwordInput.value = '';
		passwordError.value = '';
		preloadAbort.value = true;
		clearMediaCache();
		closePreview();
	});
	watch(collection, (c) => {
		if (!c) router.replace('/');
	}, { immediate: true });

	watch(
		() => [files.value.length, sessionPassword.value, collection.value?.type] as const,
		() => {
			if (collection.value?.type === 'encrypted' && !sessionPassword.value) return;
			preloadMedia();
		},
		{ immediate: true },
	);

	onBeforeUnmount(() => {
		preloadAbort.value = true;
		clearMediaCache();
		closePreview();
	});
</script>

<style scoped>
.preview-dialog-card {
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 90vw;
	max-height: 90vh;
}

.preview-dialog-content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	max-height: 70vh;
	padding: 16px;
	overflow: auto;
}

.preview-media {
	display: block;
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.preview-media--image {
	width: auto;
	height: auto;
	max-height: 70vh;
}

.preview-media--video {
	width: 100%;
	height: auto;
	max-height: 70vh;
}

.preview-media--audio {
	width: 100%;
	min-width: 280px;
}

.preview-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	color: rgba(var(--v-theme-on-surface), 0.7);
}

.file-thumb {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.06);
}

.file-thumb--square {
	width: 56px;
	height: 56px;
	border-radius: 8px;
}

.file-thumb--square img,
.file-thumb--square video {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.file-thumb-placeholder {
	opacity: 0.6;
}

.list-item-prepend {
	margin-right: 12px;
}
</style>
