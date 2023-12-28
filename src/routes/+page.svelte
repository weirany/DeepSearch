<script>
	import { Heading, P, Button, ButtonGroup, Input, Span } from 'flowbite-svelte';
	import { OPENAI_API_KEY } from './keys.js';
	import { prompt_body } from './comfyUI.js';

	let searchTerm = '';

	async function search() {
		console.log('searching');
		// const jsonStr = await callOpenAI(searchTerm);
		// const suggestionsObj = JSON.parse(jsonStr);
		// const suggestions = suggestionsObj.suggestions;
		// console.log(`total suggestions: ${suggestions.length}`);
		// suggestions.forEach((suggestion) => {
		// 	console.log(`term: ${suggestion.term}`);
		// 	console.log(`description: ${suggestion.description}`);
		// 	generateImage(`${suggestion.term}: ${suggestion.description}`);
		// });
		const term = 'Industrial Coffee Tables: Often combine wood and metal, rugged look.';
		generateImage(term);
	}

	async function generateImage(prompt) {
		const url = 'http://127.0.0.1:8188/prompt';
		const headers = {
			'Content-Type': 'application/json'
		};
		const body = prompt_body(prompt);

		const response = await fetch(url, { method: 'POST', headers, body });
		const data = await response.json();
		const promptId = data.prompt_id;
		console.log(`prompt_id: ${promptId}`);
		return promptId;
	}

	async function callOpenAI(term) {
		const apiKey = OPENAI_API_KEY;
		const url = 'https://api.openai.com/v1/chat/completions';
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		};
		const body = JSON.stringify({
			model: 'gpt-3.5-turbo-1106',
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content:
						'You are an assistant supporting users on an e-commerce website to refine their search queries.'
				},
				{
					role: 'user',
					content: `A user has searched for "${term}". Please provide a list of popular types of "${term}" in a JSON structure to assist the user in narrowing down their search. Your answer for "Rug" should be formatted like this: {"suggestions":[{"term":"Area Rugs","description":"For larger spaces, often decorative."},{"term":"Runner Rugs","description":"Long, narrow rugs, great for hallways."}]}`
				}
			]
		});

		const response = await fetch(url, { method: 'POST', headers, body });
		const data = await response.json();
		const content = data.choices[0].message.content;
		return content;
	}
</script>

<div class="text-center">
	<Heading tag="h1">Wayfair <Span gradient>Deep</Span>Search</Heading>
	<Heading tag="h5">Help users go deeper into their search intent</Heading>
</div>

<div class="pt-8">
	<ButtonGroup class="w-full">
		<Input
			bind:value={searchTerm}
			id="searchTerm"
			placeholder="what you are looking for? for example, sofa"
		/>
		<Button on:click={search} color="primary">Search</Button>
	</ButtonGroup>
</div>
