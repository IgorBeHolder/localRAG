import requests
import json
import sys
import time
import warnings

average_tokens_per_word = 2.4


def make_request():
    url = "http://46.254.21.170:3002/v1/completions"

    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
    }

    data = {
        "model": "llama2",
        "stream": "true",
        # "prompt": "Какая разница между машинным и глубоким обучением? Отвечай на вопросы пользователей на русском языке.",
        # "prompt": "Как выводить на печать в Powershell? Отвечай на вопросы пользователей на русском языке",
        "prompt": "\n\n### Instructions:\n Чем отличается Powershell от терминала в macOS? Отвечай на вопросы пользователей на русском языке\n\n### Response:\n",
        # "stop": ["\n", "###"],
        "max_tokens": 512,
        "temperature": 0.22,
    }

    try:
        response = requests.post(url, headers=headers, json=data, stream=True)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error making the request: {e}")
        sys.exit(1)

    return response


def process_response(response):
    accumulated_text = ""
    current_line = ""  # Buffer for the current line
    line_length_limit = 96  # Maximum length of a line
    start_time = time.time()

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
    if current_line:  # Add any remaining text in the buffer
        accumulated_text += "\n"

    print_metrics(accumulated_text, elapsed_time)


def print_metrics(accumulated_text, elapsed_time):
    word_count = len(accumulated_text.split())
    character_count = len(accumulated_text.replace("\n", ""))
    words_per_second = word_count / elapsed_time if elapsed_time > 0 else 0
    characters_per_second = character_count / elapsed_time if elapsed_time > 0 else 0

    print("\n\nPerformance Metrics:")
    print(
        f" - Tokens per second: {words_per_second*average_tokens_per_word:.2f} tokens per second"
    )
    print(
        f" - Characters per second: {characters_per_second:.2f} characters per second"
    )
    print(f" - Overall Response Time: {elapsed_time:.2f} seconds")
    print(f" - Total Tokens: {word_count*average_tokens_per_word:.0f} tokens")
    print(f" - Total Characters: {character_count:.2f} characters")


def main():
    response = make_request()
    process_response(response)


if __name__ == "__main__":
    main()
