import requests
import json
import sys
import time
import warnings

average_tokens_per_word = 2.4


def make_request():
    start_time = time.time()
    url = "http://46.254.21.170:3002/v1/completions"

    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
    }
    BOS, EOS, boi, eoi = "<s>", "</s>", "[INST]", "[/INST]"
    pre_prompt = f"{BOS}{boi}Вы полезный помощник. Ваши ответы должны быть точными. Отвечайте на вопросы пользователей на русском языке.{eoi}"
    data = {
        "model": "llama2",
        "stream": "true",
        # "prompt": pre_prompt + "Какая разница между машинным и глубоким обучением? Отвечай на вопросы пользователей на русском языке.",
        # "prompt": "Как выводить на печать в Powershell? Отвечай на вопросы пользователей на русском языке",
        # "prompt": "\n\n### Instructions:\n Чем отличается Powershell от терминала в macOS? Отвечай на вопросы пользователей на русском языке\n\n### Response:\n",
        # "prompt": "Чем отличается Powershell от терминала в macOS? Отвечай на русском языке.",
        # "prompt": pre_prompt + "Чем отличается Powershell от терминала в macOS?",
        "prompt": "Чем отличается Powershell от терминала в macOS?",
        # "stop": ["\n", "###"],
        "max_tokens": 512,
        "temperature": 0.22,
        "frequency_penalty": 1.2,
    }

    try:
        response = requests.post(url, headers=headers, json=data, stream=True)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error making the request: {e}")
        sys.exit(1)

    return response, start_time


def process_response(response, start_time):
    accumulated_text = ""
    current_line = ""  # Buffer for the current line
    line_length_limit = 96  # Maximum length of a line
    first_token_time = None  # New variable to track first token generation time

    for line in response.iter_lines():
        if line.startswith(b"data: "):
            line_content = line[len(b"data: ") :]

            if b"[DONE]" in line_content:
                break

            try:
                json_data = json.loads(line_content)
                if "choices" in json_data and json_data["choices"]:
                    new_text = json_data["choices"][0].get("text", "")
                    for char in new_text:
                        if first_token_time is None:
                            first_token_time = (
                                time.time()
                            )  # Set the time of first token generation
                        if char != "\n" and not (
                            char.isspace() and len(current_line) >= line_length_limit
                        ):
                            current_line += char  # Continue adding to the current line
                            print(
                                char, end="", flush=True
                            )  # Print character immediately
                            accumulated_text += char  # Add to accumulated text
                        else:
                            # When the line limit is reached or a newline is encountered
                            print()  # Move to the next line
                            accumulated_text += "\n"  # Add newline to accumulated text
                            current_line = ""  # Reset the current line
                            if char.isspace():
                                continue  # Do not start a new line with whitespace
                            current_line += char
                            print(char, end="", flush=True)
                            accumulated_text += char  # Add to accumulated text

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                print(f"Raw content: {line_content}")
                continue

    elapsed_time = time.time() - start_time
    start_up_time = (
        first_token_time - start_time if first_token_time else 0
    )  # Calculate start-up time
    if current_line:  # Add any remaining text in the buffer
        accumulated_text += "\n"

    print_metrics(accumulated_text, elapsed_time, start_up_time)


def print_metrics(accumulated_text, elapsed_time, start_up_time):
    word_count = len(accumulated_text.split())
    character_count = len(accumulated_text.replace("\n", ""))
    words_per_second = word_count / elapsed_time if elapsed_time > 0 else 0
    characters_per_second = character_count / elapsed_time if elapsed_time > 0 else 0

    print("\n\nPerformance Metrics:")
    print(f" - Start-up Time: {start_up_time:.1f} s")
    print(
        f" - Tokens per second: {words_per_second*average_tokens_per_word:.1f} tok/s"
    )
    print(
        f" - Characters per second: {characters_per_second:.1f} ch/s"
    )
    print(f" - Overall Response Time: {elapsed_time:.1f} s")
    print(f" - Total : {word_count*average_tokens_per_word:.0f} tokens")
    print(f" -       : {character_count:.0f} characters")


def main():
    response, start_time = make_request()
    process_response(response, start_time)


if __name__ == "__main__":
    main()
