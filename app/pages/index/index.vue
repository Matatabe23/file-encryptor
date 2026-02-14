<template>
	<v-container class="py-6">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-h5">Коллекции</h1>
			<v-btn color="primary" @click="isCreateCollectionModal = true">
				{{ $t('main.createCollection') }}
			</v-btn>
		</div>

		<v-row v-if="collections.length">
			<v-col v-for="c in collections" :key="c.id" cols="12" sm="6" md="4">
				<v-card
					:to="`/collection/${c.id}`"
					class="fill-height"
					hover
				>
					<v-card-title class="d-flex align-center gap-2">
						<v-icon>{{ c.type === 'encrypted' ? 'mdi-lock' : 'mdi-folder' }}</v-icon>
						{{ c.name }}
					</v-card-title>
					<v-card-subtitle>
						{{ c.type === 'encrypted' ? 'Зашифрованная коллекция' : 'Хранилище' }}
					</v-card-subtitle>
				</v-card>
			</v-col>
		</v-row>
		<v-alert v-else type="info" variant="tonal" class="mt-4">
			Коллекций пока нет. Нажмите «Создать коллекцию», чтобы добавить первую.
		</v-alert>

		<CreateCollectionModal v-model:isOpen="isCreateCollectionModal" />
	</v-container>
</template>

<script setup lang="ts">
	import CreateCollectionModal from '~/components/main/CreateCollectionModal.vue';
	import { useCollectionsStore } from '~/stores/collections';

	const collectionsStore = useCollectionsStore();
	const isCreateCollectionModal = ref(false);
	const collections = computed(() => collectionsStore.collections);
</script>
