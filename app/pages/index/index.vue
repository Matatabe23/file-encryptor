<template>
	<v-container>
		<v-btn @click="isCreateCollectionModal = true">{{ $t('main.createCollection') }}</v-btn>

		<UniversalModel v-model:isOpen="isCreateCollectionModal">
			<template #top>
				<span>Создание коллекции</span>
			</template>

			<template #default>
				<span>
					Здесь основной контент модалки. Можно вставлять любые элементы, формы и текст.
				</span>
			</template>

			<template #bottom>
				<div class="flex gap-2 w-full">
					<v-btn
						class="flex-1"
						text
						@click="isCreateCollectionModal = false"
						>Отмена</v-btn
					>
					<v-btn
						class="flex-1"
						color="primary"
						>Сохранить</v-btn
					>
				</div>
			</template>
		</UniversalModel>
	</v-container>
</template>

<script setup lang="ts">
	const isCreateCollectionModal = ref(true);
</script>
