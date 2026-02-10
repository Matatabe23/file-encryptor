<template>
	<div>
		<v-dialog
			v-if="!isMobile"
			v-model="isOpen"
			:max-width="maxWidth"
		>
			<v-card>
				<slot name="top"></slot>
				<slot></slot>
				<slot name="bottom"></slot>
			</v-card>
		</v-dialog>

		<v-bottom-sheet
			v-else
			v-model="isOpen"
		>
			<v-sheet
				class="pa-4"
				:style="{ minHeight: minHeight }"
			>
				<slot name="top"></slot>
				<slot></slot>
				<slot name="bottom"></slot>
			</v-sheet>
		</v-bottom-sheet>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import { useDisplay } from 'vuetify';

	const { smAndDown } = useDisplay();


	const props = withDefaults(
		defineProps<{
			maxWidth: string
			minHeight: string;
		}>(),
		{
			maxWidth: '60vw',
			minHeight: '50vh'
		}
	);

	const isOpen = defineModel<boolean>('isOpen');

	const isMobile = computed(() => smAndDown.value);
</script>
