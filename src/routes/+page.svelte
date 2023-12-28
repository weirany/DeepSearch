<script>
	import { Heading, Button, ButtonGroup, Input, Span, Avatar, Card, Alert } from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';
	import { OPENAI_API_KEY } from './keys.js';
	import { prompt_body } from './comfyUI.js';

	// node 26 is the image save node in the comfyUI workflow
	const OUTPUT_NODE = 26;

	let searchTerm = '';

	// states
	let isGettingSuggestions = false;
	let isGeneratingImages = false;

	let suggestions = [];

	// simulate api call latency
	async function stall(stallTime = 5000) {
		await new Promise((resolve) => setTimeout(resolve, stallTime));
	}

	function setSuggestionsMock() {
		suggestions = [
			// {
			// 	term: 'Daybed',
			// 	description: 'A daybed is a sofa that can be made into a bed.'
			// },
			// {
			// 	term: 'Sofa Bed',
			// 	description: 'A sofa bed is a sofa that can be made into a bed.'
			// },
			{
				term: 'Sofa Table',
				description: 'A sofa table is a table that is placed behind a sofa.'
			},
			{
				term: 'Sofa Slipcover',
				description: 'A sofa slipcover is a cover that is placed over a sofa.'
			},
			{
				term: 'Sofa Cover',
				description: 'A sofa cover is a cover that is placed over a sofa.'
			},
			{
				term: 'Sofa Set',
				description: 'A sofa set is a set of sofas.'
			},
			{
				term: 'Sofa Chair',
				description: 'A sofa chair is a chair that is made for one person.'
			}
		];
	}

	async function search() {
		isGettingSuggestions = true;
		// const jsonStr = await callOpenAI(searchTerm);
		// const suggestionsObj = JSON.parse(jsonStr);
		// const suggestions = suggestionsObj.suggestions;
		// console.log(`total suggestions: ${suggestions.length}`);
		// suggestions.forEach((suggestion) => {
		// 	console.log(`term: ${suggestion.term}`);
		// 	console.log(`description: ${suggestion.description}`);
		// 	generateImage(`${suggestion.term}: ${suggestion.description}`);
		// });
		await stall();
		setSuggestionsMock();
		isGettingSuggestions = false;

		isGeneratingImages = true;
		await generateImages();

		while (true) {
			await hydrateAllImageUrls();

			let allImagesUpdated = suggestions.every((suggestion) => !!suggestion.image);
			if (allImagesUpdated) {
				break;
			}
			console.log('waiting for all images to be updated...');
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		isGeneratingImages = false;
	}

	async function generateImages() {
		// trigger image generation
		for (let i = 0; i < suggestions.length; i++) {
			let prompt = `${suggestions[i].term}: ${suggestions[i].description}`;
			let promptId = await triggerGenerateImage(prompt);
			suggestions[i].promptId = promptId;
			console.log(`generated image for prompt: ${prompt} with promptId: ${promptId}`);
		}
	}

	async function hydrateAllImageUrls() {
		for (let i = 0; i < suggestions.length; i++) {
			if (suggestions[i].image) {
				continue;
			}
			let promptId = suggestions[i].promptId;
			const url = `http://127.0.0.1:8188/history/${promptId}`;
			const headers = {
				'Content-Type': 'application/json'
			};
			const response = await fetch(url, { method: 'GET', headers });
			const data = await response.json();

			if (data && data[promptId]) {
				let filename = data[promptId].outputs[OUTPUT_NODE].images[0].filename;
				console.log(`filename: ${filename}`);
				suggestions[i].image = `http://127.0.0.1:8188/view?filename=${filename}&type=output`;
			}
		}
	}

	// given a prompt, generate an image, returns the prompt id
	async function triggerGenerateImage(prompt) {
		const url = 'http://127.0.0.1:8188/prompt';
		const headers = {
			'Content-Type': 'application/json'
		};
		const body = prompt_body(prompt);

		const response = await fetch(url, { method: 'POST', headers, body });
		const data = await response.json();
		const promptId = data.prompt_id;
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

{#if isGettingSuggestions}
	<div class="p-3">
		<Alert color="primary">Getting suggestions...</Alert>
	</div>
{/if}

{#if isGeneratingImages}
	<div class="p-3">
		<Alert color="primary">Generating images...</Alert>
	</div>
{/if}

{#if !isGettingSuggestions && !isGeneratingImages && suggestions.length > 0}
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
{/if}
