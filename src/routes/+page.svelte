<script>
	import { Heading, P, Button, ButtonGroup, Input } from 'flowbite-svelte';
</script>

<div class="text-center">
	<Heading tag="h1">Wayfair Deep Search</Heading>
	<Heading tag="h5">Help users go deeper into their search intent</Heading>
</div>

<div class="pt-8">
	<ButtonGroup class="w-full">
		<Input id="searchTerm" placeholder="what you are looking for? for example, sofa" />
		<Button color="primary">Search</Button>
	</ButtonGroup>
</div>
