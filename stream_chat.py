import requests
import json
import sys
import time

average_tokens_per_word = 2.4


def make_request():
    start_time = time.time()
    url = "http://46.254.21.170:3002/v1/chat/completions"
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
    }

    data = {
        "model": "/model-store/mistralai/Mistral-7B-Instruct-v0.1",
        "messages": [
            {
                "content": "<s>[INST]Вы полезный помощник. Суммаризируй текст пользователя. Отвечайте на вопросы пользователя на русском языке.[/INST]",
                "role": "system",
            },
            {
                "content": """
Text:\n\n
**Yuri Gagarin: The Man Who Touched the Stars**

In the annals of human history, few names resonate as profoundly as Yuri Gagarin's. On April 12, 1961, this Soviet cosmonaut achieved what had been the stuff of dreams and myths for millennia: he journeyed to space. In doing so, Gagarin didn't just orbit the Earth; he transcended earthly constraints, symbolizing the infinite potential of human endeavor.

Gagarin's journey aboard the Vostok 1 spacecraft was a landmark achievement during the Cold War era. At a time when the United States and the Soviet Union were locked in a relentless Space Race, Gagarin's successful orbit around the Earth was not just a triumph of Soviet space technology but also a powerful assertion of Soviet prowess on the global stage. His flight, which lasted just 108 minutes, was brief, yet it changed the course of history and the way humanity perceived its place in the vast expanse of the universe.

Born on March 9, 1934, in a small village west of Moscow, Gagarin's early life was marked by the struggles of World War II. His family faced hardships under Nazi occupation, and these experiences instilled in him a resilience that would come to define his character. From flying aircraft at a local flying club to his enrollment in the Soviet Air Force, Gagarin showcased exceptional skills and unwavering determination. Yet, even with his evident talent, no one could have predicted that this young pilot would become the first emissary of humankind to the cosmos.

The choice of Gagarin for the historic Vostok 1 mission was based on a combination of his proficiency, his physique (which suited the compact cockpit of the spacecraft), and his impeccable character. The preparation for the mission was shrouded in secrecy, with rigorous training, simulations, and tests. As the countdown for the mission began, Gagarin, with his characteristic grin, reportedly said, "Let's go!" – a statement that showcased not just his own enthusiasm but the collective aspiration of humanity.

His experience in space, though short, was transformative. As Gagarin orbited the Earth, he was moved by the beauty of our planet, a shimmering blue-and-white gem in the vast darkness of space. His descriptions of the Earth from space underscored a deep sense of unity, an understanding that borders, conflicts, and nationalities are transient divisions on the grand scale of the cosmos.

When Gagarin returned to Earth, he was celebrated as a hero, not just in the Soviet Union but globally. Parades, honors, and accolades were showered upon him. But beyond the political and nationalistic overtones of these celebrations, Gagarin's journey held a deeper significance. He had broken the shackles of terrestrial gravity, symbolizing hope and the boundless possibilities of exploration. In him, people saw a reflection of their own aspirations, making Gagarin an eternal symbol of human achievement.

However, the weight of his newfound status was a double-edged sword. While Gagarin continued to work with the Soviet space program and advocate for space exploration, his life post his historic journey was marked by challenges. The Soviet authorities, recognizing his invaluable symbolic stature, often shielded him from further spaceflights, fearing the potential risk to his life. This protective stance, while understandable, weighed heavily on Gagarin, who yearned to return to space.

Tragically, Gagarin's life was cut short in a training jet crash in 1968. His untimely death was mourned globally. Monuments, streets, and even a city were named in his honor, and his legacy was cemented as the first human to journey into space.

In conclusion, Yuri Gagarin's life, marked by its soaring highs and tragic end, remains an embodiment of humanity's quest for the unknown. His voyage to space aboard Vostok 1 was not just a victory for the Soviet Union but a triumph for mankind. Gagarin's legacy serves as a reminder that the spirit of exploration, the desire to push boundaries, and the pursuit of the unknown are intrinsic to the human experience. In looking up at the stars, we remember Gagarin, the man who touched them first, and in doing so, beckoned us all to reach higher, dream bigger, and journey farther.
Summarization:\n\n
</s>]
""",
                "role": "user",
            },
        ],
        "stream": "true",
        "max_tokens": "512",
        "temperature": 0.22,
        "frequency_penalty": 1.2,
    }

    try:
        response = requests.post(
            url, headers=headers, json=data, stream=True, timeout=3600
        )
        response.raise_for_status()
        return response, start_time
    except requests.exceptions.RequestException as e:
        print(f"Error making the request: {e}")
        sys.exit(1)


def process_response(response, start_time):
    accumulated_text = ""
    current_line = ""
    line_length_limit = 96
    first_token_time = None  # New variable to track first token generation time

    for response_line in response.iter_lines():
        if response_line.startswith(b"data: "):
            line_content = response_line[len(b"data: ") :]

            if b"[DONE]" in line_content:
                break

            try:
                json_data = json.loads(line_content)
                if "choices" in json_data and json_data["choices"]:
                    new_text = json_data["choices"][0]["delta"].get("content", "")

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

    if current_line:
        accumulated_text += "\n"

    print_metrics(accumulated_text, elapsed_time, start_up_time)


def print_metrics(accumulated_text, elapsed_time, start_up_time):
    word_count = len(accumulated_text.split())
    character_count = len(
        accumulated_text.replace("\n", "")
    )  # Count characters excluding newlines
    words_per_second = word_count / elapsed_time if elapsed_time > 0 else 0
    characters_per_second = character_count / elapsed_time if elapsed_time > 0 else 0

    # print("\n\nFinal Accumulated Text:\n" + accumulated_text)
    print("\n\nPerformance Metrics:")
    print(
        f" - Start-up Time: {start_up_time:.2f} seconds"
    )  # Print the new start-up time metric
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
    response, start_time = make_request()
    process_response(response, start_time)


if __name__ == "__main__":
    main()
