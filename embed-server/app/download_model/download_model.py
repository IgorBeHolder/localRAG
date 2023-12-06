from transformers import AutoModelForCausalLM, AutoTokenizer
import os

def download_model(model_name, save_directory):
    # Check if the directory exists, if not create it
    if not os.path.exists(save_directory):
        os.makedirs(save_directory)

    # Download and cache the model and tokenizer
    model = AutoModelForCausalLM.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Save the model and the tokenizer to the specified directory
    model.save_pretrained(save_directory)
    tokenizer.save_pretrained(save_directory)

if __name__ == "__main__":
    model_name = "meta-llama/Llama-2-7b-chat-hf"
    save_directory = "/model-store"
    download_model(model_name, save_directory)
