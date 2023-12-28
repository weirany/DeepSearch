export function prompt_body(prompt) {
    return `
    {
"client_id": "f3698304-12b4-4595-a073-83a783a7afab",
"prompt": {
    "5": {
        "inputs": {
            "width": 512,
            "height": 512,
            "batch_size": 1
        },
        "class_type": "EmptyLatentImage",
        "_meta": {
            "title": "Empty Latent Image"
        }
    },
    "6": {
        "inputs": {
            "text": "${prompt}",
            "clip": [
                "20",
                1
            ]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
            "title": "CLIP Text Encode (Prompt)"
        }
    },
    "7": {
        "inputs": {
            "text": "text, watermark",
            "clip": [
                "20",
                1
            ]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
            "title": "CLIP Text Encode (Prompt)"
        }
    },
    "8": {
        "inputs": {
            "samples": [
                "13",
                0
            ],
            "vae": [
                "20",
                2
            ]
        },
        "class_type": "VAEDecode",
        "_meta": {
            "title": "VAE Decode"
        }
    },
    "13": {
        "inputs": {
            "add_noise": true,
            "noise_seed": 0,
            "cfg": 1,
            "model": [
                "20",
                0
            ],
            "positive": [
                "6",
                0
            ],
            "negative": [
                "7",
                0
            ],
            "sampler": [
                "14",
                0
            ],
            "sigmas": [
                "22",
                0
            ],
            "latent_image": [
                "5",
                0
            ]
        },
        "class_type": "SamplerCustom",
        "_meta": {
            "title": "SamplerCustom"
        }
    },
    "14": {
        "inputs": {
            "sampler_name": "euler_ancestral"
        },
        "class_type": "KSamplerSelect",
        "_meta": {
            "title": "KSamplerSelect"
        }
    },
    "20": {
        "inputs": {
            "ckpt_name": "sd_xl_turbo_1.0_fp16.safetensors"
        },
        "class_type": "CheckpointLoaderSimple",
        "_meta": {
            "title": "Load Checkpoint"
        }
    },
    "22": {
        "inputs": {
            "steps": 1,
            "denoise": 1,
            "model": [
                "20",
                0
            ]
        },
        "class_type": "SDTurboScheduler",
        "_meta": {
            "title": "SDTurboScheduler"
        }
    },
    "25": {
        "inputs": {
            "images": [
                "8",
                0
            ]
        },
        "class_type": "PreviewImage",
        "_meta": {
            "title": "Preview Image"
        }
    },
    "26": {
        "inputs": {
            "filename_prefix": "wayfair",
            "images": [
                "8",
                0
            ]
        },
        "class_type": "SaveImage",
        "_meta": {
            "title": "Save Image"
        }
    }
}
}
    `;
}