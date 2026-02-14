<template>
	<v-col cols="12" sm="6" md="4">
		<v-card variant="outlined" class="h-full d-flex flex-column">
			<v-card-text class="flex-grow-1">
				<div class="d-flex align-center gap-3 mb-3">
					<v-avatar :color="connected ? 'success' : 'surface-variant'" size="48" rounded>
						<v-icon :icon="icon" size="28" />
					</v-avatar>
					<div>
						<v-card-title class="text-h6 pa-0">{{ title }}</v-card-title>
						<v-card-subtitle v-if="email" class="pa-0 text-caption">{{ email }}</v-card-subtitle>
					</div>
				</div>
				<p class="text-body2 text-medium-emphasis mb-0">{{ description }}</p>
			</v-card-text>
			<v-card-actions>
				<v-btn
					v-if="connected"
					color="error"
				 variant="outlined"
				 size="small"
				 :disabled="disabled"
				 @click="$emit('disconnect')"
				>
					{{ $t('storage.disconnect') }}
				</v-btn>
				<v-btn
					v-else
					color="primary"
				 variant="flat"
				 size="small"
				 :loading="loading"
				 :disabled="disabled"
				 @click="$emit('connect')"
				>
					{{ disabled ? $t('storage.comingSoon') : $t('storage.connect') }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-col>
</template>

<script setup lang="ts">
	defineProps<{
		title: string;
		description: string;
		icon: string;
		connected: boolean;
		email?: string;
		loading?: boolean;
		disabled?: boolean;
	}>();

	defineEmits<{
		connect: [];
		disconnect: [];
	}>();
</script>
