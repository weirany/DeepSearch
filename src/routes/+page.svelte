<script>
	import { Heading, Button, ButtonGroup, Input, Span, Avatar, Card } from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';
	import { OPENAI_API_KEY } from './keys.js';
	import { prompt_body } from './comfyUI.js';

	let searchTerm = '';
	let suggestions = [
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa',
			description: 'A sofa is a piece of furniture that a few people can sit on together.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sectional Sofa',
			description: 'A sectional sofa is a sofa that is made up of several separate pieces.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sleeper Sofa',
			description: 'A sleeper sofa is a sofa that can be made into a bed.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Reclining Sofa',
			description: 'A reclining sofa is a sofa that has a back that can be tilted back.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Loveseat',
			description: 'A loveseat is a sofa that is made for two people.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Chesterfield Sofa',
			description: 'A chesterfield sofa is a sofa with a back and arms that are the same height.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Settee',
			description: 'A settee is a sofa that is made for two people.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Chaise Lounge',
			description: 'A chaise lounge is a sofa that is made for one person.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Futon',
			description: 'A futon is a sofa that can be made into a bed.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Daybed',
			description: 'A daybed is a sofa that can be made into a bed.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa Bed',
			description: 'A sofa bed is a sofa that can be made into a bed.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa Table',
			description: 'A sofa table is a table that is placed behind a sofa.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa Slipcover',
			description: 'A sofa slipcover is a cover that is placed over a sofa.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa Cover',
			description: 'A sofa cover is a cover that is placed over a sofa.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa Set',
			description: 'A sofa set is a set of sofas.'
		},
		{
			image: 'http://127.0.0.1:8188/view?filename=wayfair_00005_.png&type=output',
			term: 'Sofa Chair',
			description: 'A sofa chair is a chair that is made for one person.'
		}
	];

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

<div class="p-3 text-center">
	<Heading tag="h1" class="p-2">Wayfair <Span gradient>Deep</Span>Search</Heading>
	<Heading tag="h5">Unleash the Power of User Intent Deep Dive</Heading>
</div>

<div>
	<ButtonGroup class="w-full p-3">
		<Input
			bind:value={searchTerm}
			id="searchTerm"
			placeholder="what you are looking for? for example, sofa"
		/>
		<Button on:click={search} color="primary">Search</Button>
	</ButtonGroup>
</div>

<div class="flex flex-wrap p-3">
	{#each suggestions as suggestion (suggestion.term)}
		<Card class="m-3 w-96">
			<div class="flex items-center space-x-4 p-1">
				<Avatar size="xl" src={suggestion.image} />
				<div class="space-y-1 font-medium">
					<div>{suggestion.term}</div>
					<div class="text-sm text-gray-400">
						{suggestion.description}
					</div>
					<div>
						<a href="/" class="inline-flex items-center text-primary-600 hover:underline">
							See Products
							<ArrowUpRightFromSquareOutline class="ms-2.5 h-3 w-3" />
						</a>
					</div>
				</div>
			</div>
		</Card>
	{/each}
</div>
