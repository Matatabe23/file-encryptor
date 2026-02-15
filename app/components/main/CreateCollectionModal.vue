<template>
	<UniversalModel v-model:isOpen="isOpen">
		<template #top>
			<span>{{ $t('main.createCollection') }}</span>
		</template>

		<template #default>
			<div class="flex flex-col gap-4">
				<v-text-field
					v-model="name"
					:label="$t('collections.name')"
					variant="outlined"
					density="comfortable"
					autofocus
					:error-messages="nameError"
					@update:model-value="nameError = ''"
				/>
				<div>
					<span class="text-body-2 text-medium-emphasis mb-2 block">{{ $t('collections.type') }}</span>
					<v-radio-group v-model="type" hide-details density="compact">
						<v-radio
							:label="$t('collections.typeStorage')"
							value="storage"
							color="primary"
						/>
						<v-radio
							:label="$t('collections.typeEncrypted')"
							value="encrypted"
							color="primary"
						/>
					</v-radio-group>
				</div>
				<v-text-field
					v-if="type === 'encrypted'"
					v-model="password"
					:label="$t('collections.password')"
					type="password"
					variant="outlined"
					density="comfortable"
					:error-messages="passwordError"
					autocomplete="new-password"
					@update:model-value="passwordError = ''"
				/>
			</div>
		</template>

		<template #bottom>
			<div class="flex gap-2 w-full">
				<v-btn
					class="flex-1"
					text
					@click="close"
				>
					{{ $t('common.cancel') }}
				</v-btn>
				<v-btn
					class="flex-1"
					color="primary"
					:loading="saving"
					@click="onSave"
				>
					{{ $t('common.save') }}
				</v-btn>
			</div>
		</template>
	</UniversalModel>
</template>

<script setup lang="ts">
	import UniversalModel from '../UniversalModel.vue';
	import { useCollectionsStore } from '~/stores/collections';
	import { hashPassword } from '~/helpers/crypto';
	import type { CollectionType } from '~/types/collections';
	import { useToast } from 'vue-toastification';
	import { useI18n } from 'vue-i18n';

	const isOpen = defineModel<boolean>('isOpen');
	const router = useRouter();
	const collectionsStore = useCollectionsStore();
	const toast = useToast();
	const { t } = useI18n();

	const name = ref('');
	const type = ref<CollectionType>('storage');
	const password = ref('');
	const nameError = ref('');
	const passwordError = ref('');
	const saving = ref(false);

	function close() {
		isOpen.value = false;
		name.value = '';
		type.value = 'storage';
		password.value = '';
		nameError.value = '';
		passwordError.value = '';
	}

	async function onSave() {
		const trimmed = name.value.trim();
		if (!trimmed) {
			nameError.value = t('createCollection.enterName');
			return;
		}
		if (type.value === 'encrypted' && !password.value) {
			passwordError.value = t('createCollection.enterPasswordForEncrypted');
			return;
		}
		if (type.value === 'encrypted' && password.value.length < 4) {
			passwordError.value = t('createCollection.passwordMinLength');
			return;
		}

		saving.value = true;
		try {
			let passwordHash: string | undefined;
			if (type.value === 'encrypted') {
				passwordHash = await hashPassword(password.value);
			}
			const collection = collectionsStore.addCollection(trimmed, type.value, passwordHash);
			toast.success(t('toast.collectionCreated'));
			close();
			isOpen.value = false;
			await router.push(`/collection/${collection.id}`);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(msg);
		} finally {
			saving.value = false;
		}
	}

	watch(isOpen, (open) => {
		if (!open) close();
	});
</script>
