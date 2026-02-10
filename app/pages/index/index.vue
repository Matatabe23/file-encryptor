<template>
	<v-container>
		<v-btn @click="isCreateCollectionModal = true">{{ $t('main.createCollection') }}</v-btn>

		<CreateCollectionModal v-model:isOpen="isCreateCollectionModal" />
	</v-container>
</template>

<script setup lang="ts">
	import CreateCollectionModal from '~/components/main/CreateCollectionModal.vue';

	const isCreateCollectionModal = ref(true);
</script>
