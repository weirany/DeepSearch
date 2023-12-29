<script>
	import {
		Heading,
		Button,
		ButtonGroup,
		Input,
		Span,
		Avatar,
		Card,
		Alert,
		Progressbar
	} from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';
	import { sineOut } from 'svelte/easing';
	import { OPENAI_API_KEY } from './keys.js';
	import { prompt_body } from './comfyUI.js';

	// node 26 is the image save node in the comfyUI workflow
	const OUTPUT_NODE = 26;
	// if LLM is not returning valid suggestions, stop at max 5 attempts
	const MAX_ATTEMPTS = 5;

	let searchTerm = '';

	// states
	let isGettingSuggestions = false;
	let isGeneratingImages = false;
	let isShowingAlert = false;
	let imageGenerationProgress = '0';
	let attempts = 0;
	let suggestions = [];

	function closeAlert() {
		isShowingAlert = false;
	}

	async function searchAgain(term) {
		isGettingSuggestions = false;
		isGeneratingImages = false;
		isShowingAlert = false;
		imageGenerationProgress = '0';
		attempts = 0;
		suggestions = [];

		searchTerm = term;
		await search();
	}

	async function search() {
		attempts++;

		// generate suggestions
		isGettingSuggestions = true;
		const jsonStr = await callOpenAI(searchTerm);
		const suggestionsObj = JSON.parse(jsonStr);
		suggestions = suggestionsObj.suggestions;

		// validate suggestions, if not valid, give it another try
		if (
			!suggestions ||
			suggestions.length === 0 ||
			!suggestions[0].term ||
			!suggestions[0].description
		) {
			console.log('invalid suggestions, retrying...');
			if (attempts >= MAX_ATTEMPTS) {
				console.log(`max attempts reached, giving up`);
				isGettingSuggestions = false;
				isShowingAlert = true;
				attempts = 0;
				return;
			}
			await search();
			return;
		}

		console.log(`total suggestions: ${suggestions.length}`);
		isGettingSuggestions = false;

		// generate images
		isGeneratingImages = true;
		await generateImages();

		while (true) {
			await hydrateAllImageUrls();
			let allImagesUpdated = suggestions.every((suggestion) => !!suggestion.image);
			if (allImagesUpdated) {
				break;
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		isGeneratingImages = false;
	}

	async function generateImages() {
		// trigger image generation for each suggestion
		for (let i = 0; i < suggestions.length; i++) {
			let prompt = `${suggestions[i].term}: ${suggestions[i].description}`;
			let promptId = await triggerGenerateImage(prompt);
			suggestions[i].promptId = promptId;
			console.log(`triggered image generation for prompt: ${prompt} with promptId: ${promptId}`);
		}
	}

	async function hydrateAllImageUrls() {
		let imageCount = 0;
		for (let i = 0; i < suggestions.length; i++) {
			if (suggestions[i].image) {
				imageCount++;
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
		imageGenerationProgress = `${(imageCount / suggestions.length) * 100}`;
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
		<Button on:click={searchAgain(searchTerm)} color="primary">Search</Button>
	</ButtonGroup>
</div>

{#if isShowingAlert}
	<div class="p-3">
		<Alert dismissable on:close={closeAlert}
			>LLM wasn't able to generate valid suggestions with multiple attempts
		</Alert>
	</div>
{/if}

{#if isGettingSuggestions}
	<div class="p-3">
		<Alert color="primary">Getting suggestions...</Alert>
	</div>
{/if}

{#if isGeneratingImages}
	<div class="p-3">
		<Progressbar
			progress={imageGenerationProgress}
			animate
			labelOutside="Generating images..."
			labelInside
			tweenDuration={1500}
			easing={sineOut}
			size="h-6"
			labelInsideClass="bg-blue-600 text-blue-100 text-base font-medium text-center p-1 leading-none rounded-full"
			class="mb-8"
		/>
	</div>
{/if}

{#if !isGettingSuggestions && !isGeneratingImages && suggestions.length > 0}
	<div class="flex flex-wrap p-3">
		{#each suggestions as suggestion (suggestion.term)}
			<button type="button" on:click={() => searchAgain(suggestion.term)}>
				<Card class="m-3 w-96">
					<div class="flex items-center space-x-4 p-1">
						<Avatar size="xl" src={suggestion.image} />
						<div class="space-y-1 font-medium">
							<div>{suggestion.term}</div>
							<div class="text-sm text-gray-400">
								{suggestion.description}
							</div>
							<div>
								<a
									href={`https://www.wayfair.com/keyword.php?keyword=${suggestion.term}&skip_fw=true`}
									class="inline-flex items-center text-primary-600 hover:underline"
									target="_blank"
								>
									See Products
									<ArrowUpRightFromSquareOutline class="ms-2.5 h-3 w-3" />
								</a>
							</div>
						</div>
					</div>
				</Card>
			</button>
		{/each}
	</div>
{/if}
