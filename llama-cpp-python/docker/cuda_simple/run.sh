#!/bin/sh

printf "Environment variables loaded.\n"
printf "*************************"
printf "Build for $DEVICE.\n"
printf "$COMPLETION_MODEL_NAME\nHOST: $HOST PORT: $MM_PORT n_ctx: $N_CTX.\n"
printf "*************************"

python3 -m llama_cpp.server \
    --model "/app/model-store/$COMPLETION_MODEL_NAME" \
    --host $HOST \
    --port $MM_PORT \
    --n_gpu_layers $N_GPU_LAYERS \
    --main-gpu 0
    # --n_ctx $N_CTX
    # --tensor_split $TP_SIZE \
    
# usage: __main__.py [-h] [--model MODEL] [--model_alias MODEL_ALIAS]
#                    [--n_gpu_layers N_GPU_LAYERS] [--main_gpu MAIN_GPU]
#                    [--tensor_split [TENSOR_SPLIT ...]]
#                    [--vocab_only VOCAB_ONLY] [--use_mmap USE_MMAP]
#                    [--use_mlock USE_MLOCK] [--seed SEED] [--n_ctx N_CTX]
#                    [--n_batch N_BATCH] [--n_threads N_THREADS]
#                    [--n_threads_batch N_THREADS_BATCH]
#                    [--rope_scaling_type ROPE_SCALING_TYPE]
#                    [--rope_freq_base ROPE_FREQ_BASE]
#                    [--rope_freq_scale ROPE_FREQ_SCALE]
#                    [--yarn_ext_factor YARN_EXT_FACTOR]
#                    [--yarn_attn_factor YARN_ATTN_FACTOR]
#                    [--yarn_beta_fast YARN_BETA_FAST]
#                    [--yarn_beta_slow YARN_BETA_SLOW]
#                    [--yarn_orig_ctx YARN_ORIG_CTX] [--mul_mat_q MUL_MAT_Q]
#                    [--logits_all LOGITS_ALL] [--embedding EMBEDDING]
#                    [--offload_kqv OFFLOAD_KQV]
#                    [--last_n_tokens_size LAST_N_TOKENS_SIZE]
#                    [--lora_base LORA_BASE] [--lora_path LORA_PATH]
#                    [--numa NUMA] [--chat_format CHAT_FORMAT]
#                    [--clip_model_path CLIP_MODEL_PATH] [--cache CACHE]
#                    [--cache_type CACHE_TYPE] [--cache_size CACHE_SIZE]
#                    [--verbose VERBOSE] [--host HOST] [--port PORT]
#                    [--ssl_keyfile SSL_KEYFILE] [--ssl_certfile SSL_CERTFILE]
#                    [--api_key API_KEY]
#                    [--interrupt_requests INTERRUPT_REQUESTS]
#                    [--config_file CONFIG_FILE]