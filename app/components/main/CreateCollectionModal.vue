<template>
	<UniversalModel v-model:isOpen="isOpen">
		<template #top>
			<span>{{ $t('main.createCollection') }}</span>
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
					@click="isOpen = false"
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
</template>

<script setup lang="ts">
	import UniversalModel from '../UniversalModel.vue';

	const isOpen = defineModel<boolean>('isOpen');
</script>
