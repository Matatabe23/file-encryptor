<template>
	<v-app>
		<v-app-bar app>
			<div class="flex gap-2 ml-auto mr-4 items-center">
				<LanguageSelect />
				<ThemeToggle />
			</div>
		</v-app-bar>

		<v-main>
			<slot />
		</v-main>
	</v-app>
</template>

<script setup></script>
