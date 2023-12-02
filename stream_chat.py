import requests
import json
import sys
import time

average_tokens_per_word = 2.4

def make_request():
    url = "http://46.254.21.170:3002/v1/chat/completions"
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
    }

    data = {
        "model": "/model-store/mistralai/Mistral-7B-Instruct-v0.1",
        "messages": [
            {
                "content": "<s>[INST]Вы полезный помощник. Суммаризируй текст пользователя. Отвечайте на вопросы пользователей на русском языке.[/INST]",
                "role": "system",
            },
            {
                "content": """
‎                                                     ‎ 
‎                  ‎
‎                  Инструкция по эксплуатации ‎
‎               изделия Focal Chorus SW 700/800 V
‎                       ‎ ‎               ‎
‎                                                                 Благодарим Вас за то, что вы выбрали акустику Focal!‎
Focal(r) является зарегистрированной торговой маркой Focal-JMlab -BP 374 -108, rue de l'Avenir - 42353 La Talaudiere cedex- France - ‎
Tel. (+33) 04 77 43 57 00 - Fax (+33) 04 77 43 57 04 - www.focal-fr.com ‎
‎ www.focal-audio.ru ‎
ИЗГОТОВИТЕЛЬ: Фокал-Джи Эм Лаб, Франция, 42353 Ла Талодьер седекс, рю де л'Авенир, ВР 374-108, тел. (33) 04 77 43 5700‎
ИМПОРТЕР: ЭКСКЛЮЗИВНЫЙ ДИСТРИБЬЮТОР ООО "Чернов Аудио". Россия, 123007, Москва, ул. 3-я Магистральная, д. 30, стр. ‎
‎2, тел. + 7 (495) 721 1381, www.tchernovaudio.ru.‎
Товар сертифицирован                                                         ‎ 
Сертификат соответствия  №  РОСС FR.АЯ46.В14949. Срок действия сертификата по 19.03.2011 г. ‎
Адрес органа сертификации (почтовый) : 117418 , Москва, Нахимовский проспект, д.31. Телефон (495) 129 26 00 ‎
Страна происхождения : Франция
Назначение: Сабвуфер. Излучатель низких частот.‎

‎ Мы рады поделиться с Вами нашей философией: "the Spirit of Sound".Focal - акустика высокого уровня, которая включает в себя ‎
последние разработки компании в сфере дизайна и высоких технологий для максимально достоверного воспроизведения фонограмм. ‎
‎                                                                                              ‎ 
Восклицательный знак в равностороннем треугольнике предупреждает пользователя о существовании важных инструкций по ‎
эксплуатации и обслуживанию (сервису), прилагаемых к изделию.‎
Для того, чтобы получить максимальный результат от прослушивания акустики, мы рекомендуем Вам прочитать данную инструкцию ‎
по эксплуатации и сохранить ее, чтобы в дальнейшем обращаться к ней в случае возникновения вопросов.‎
В связи с постоянно прогрессирующей технологией, Focal оставляет за собой право вносить изменения в спецификации без ‎
предварительного уведомления. Визуальные изображения могут не точно соответствовать определенному продукту.       ‎

‎                                                                                               ‎ ‎                              ‎
‎                                                   ‎
Если вы приобрели акустические системы у авторизованного дилера, рекомендуем Вам обратится к его помощи при инсталляции ‎
‎(подключения и настройки основных рабочих параметров) системы с участием его уполномоченного специалиста. Не пользуйтесь ‎
услугами лиц, не имеющих достаточной квалификации и опыта работы с дорогостоящей бытовой аудио-видео аппаратурой! ‎
В случае, если в районе, где вы проживаете нет авторизованных дилеров или центров по продаже и обслуживанию данной аппаратуры, ‎
или вы все же решили подключить систему сами, подробно изучите инструкцию по эксплуатации и проконсультируйтесь у нас по ‎
телефону    (495) 721 13 81 или 8 800 200 00 81 (бесплатная линия поддержки) с 9 - 30 до 18-30 московского времени .‎
‎                                                                                                 ‎ 
Внимательно ознакомьтесь с  настоящей инструкцией и условиями  гарантийного (послегарантийного) обслуживания купленной вами ‎
аппаратуры. Только после этого приступайте к подключению! ‎

Запрещается включать АС в сеть переменного тока или трансляционные сети через акустические терминалы! ‎
Запрещается использовать бытовые АС с электромузыкальными инструментами в качестве мониторов! ‎
Убедитесь, что акустические системы стоят устойчиво и не могут быть опрокинуты!‎
Мы не несем ответственности в случае падения наших систем на людей или домашних животных! ‎
Категорически запрещается использовать не оригинальные предохранители других номиналов и типов! ‎


‎                                                                                                       ‎ 
Изображение молнии в равностороннем треугольнике предупреждает о наличии неизолированных токопроводящих частей внутри ‎
корпуса изделия, находящихся под напряжением , которое может иметь достаточную величину для возникновения риска поражения ‎
человека электричеством.‎
‎                                                                                              ‎ ‎                                                                                                 ‎
Предупреждение! Внутри данного изделия отсутствуют части, которые Вы можете самостоятельно обслуживать!‎
Внутри данного изделия есть напряжения опасные для жизни! Категорически запрещено вскрывать данное изделие!‎
В связи с постоянно прогрессирующей технологией, Focal оставляет за собой право вносить изменения в спецификации без ‎
предварительного уведомления. Визуальные изображения могут не точно соответствовать определенному продукту.                                      ‎

Динамики, которые используются в акустической системе, являются сложными электромеханическими устройствами и требуют ‎
определенного периода "приработки" перед тем, как раскрыть свои лучшие качества. Они должны адаптироваться к температуре и ‎
влажности в помещении. Период ввода в эксплуатацию зависит от условий и может длиться до нескольких недель. Для того, чтобы ‎
сократить этот период, мы рекомендуем позволить Вашей системе поработать вначале примерно 20 часов. Как только компоненты ‎
полностью войдут в рабочий режим, станет возможным насладиться всеми преимуществами Вашей акустической системы. ‎
‎                                                                                                           ‎ 
Убедитесь , что переключатель напряжения (voltage selection) находится в положении  230 вольт! Ни когда не пытайтесь ‎
переключить данное изделие на другое напряжение питания, это приведет к потере его работоспособности.  После этого Вы ‎
можете включить питание (power) в положение ON. ‎
‎      Любые подключения к сабвуферу производить только  при отключенном  сетевом (питающем) кабеле!                      ‎

‎                          ‎ 

‎                      Подключение и размещение Focal Chorus SW 700/800 V
‎                                                                                                              ‎
 

 
 ‎   ‎ 

При первом включении рекомендуем установить в среднее положение регулятор уровня громкости НЧ с  помощью  ручки Volume , ‎
находящейся на сабвуфере.‎
Установите ручку Crossover в положение  100 Hz .‎
Переключатель (тумблер) POWER, имеющий положения Auto - On, переведите в положение On. В дальнейшем рекомендуем ‎
использовать положение Auto (автовключение от входного сигнала , при отсутствии сигнала на входе сабвуфер отключится ) .‎
Переключатель (тумблер) Phase переведите в положение 0.‎

Высокоуровневые входы
Если используется обычный двухканальный стереоусилитель, сабвуфер должен быть подключен с помощью высокоуровневых входов. ‎
Две Ваши  акустические системы подключаются либо напрямую к выходным клеммам Вашего усилителя (Рис. В) или к выходным ‎
клеммам высокоуровневого выхода на сабвуфере (Рис. А).‎
‎ Важно! Не перепутайте полярность при подключении! Клемма "+" усилителя (красного цвета) должна быть соединена с ‎
аналогичной клеммой на сабвуфере. Клемма "-" усилителя (черного цвета) должна быть соединена с аналогичной клеммой на ‎
сабвуфере. ‎

Линейные входы RCA
При использовании двухканального стереоусилителя с линейными выходами предварительного усилителя, сабвуфер следует ‎
подключать через стереовход с разъемами RCA, обозначенный "line inputs Left/Right " (Рис. С). Такое подключение обеспечит более ‎
чистое звучание, чем при подаче сигнала на входы высокого уровня.‎
Вход LFE
При использовании многоканального A/V усилителя или ресивера следует подключить его монофонический выход с обозначением ‎
‎"Subwoofer" к входу LFE сабвуфера (Рис. D).‎
Размещение
В отличие от традиционных Hi-Fi громкоговорителей, которые нужно устанавливать на значительном удалении от стен и углов ‎
помещения, мы рекомендуем разместить сабвуфер в углу комнаты прослушивания. (Рис. E, F,G). При размещении сабвуфера рядом ‎
только с одной стеной, или слишком далеко от стен, воспроизводимые сабвуфером басовые звуки с очень большой длиной волны ‎
будут возбуждать непредсказуемые резонансы в комнате. При этом нарушится линейность амплитудно-частотной характеристики, что ‎
повлияет на достоверность передачи баса (недостаточная глубина, "ухающий" звук, слабый бас, затрудненность или невозможность ‎
согласования с другими громкоговорителями). При установке сабвуфера в углу помещения резонансные частоты помещения будут ‎
более предсказуемыми, а АЧХ более линейной. Такое размещение обеспечивает не только оптимальное восприятие басового ‎
частотного диапазона, но и усиление уровня баса на 6 дБ (Рис. G). Если особенности формы помещения не позволяют установить ‎
сабвуфер в углу, мы рекомендуем попробовать различные места установки, чтобы найти место, где он будет звучать лучше всего. ‎
Общая рекомендация - устанавливать сабвуфер вдоль передней стены комнаты прослушивания. Поскольку низкочастотные колебания ‎
распространяются одинаково во все стороны, рассеивание звука не будет зависеть от какого-либо предмета мебели или другого ‎
препятствия, стоящего между сабвуфером и слушателем. Поэтому, если это не влияет на рассеивание басовых частот, сабвуфер можно ‎
спрятать за какой-либо мебелью.‎
Помехи от магнитного поля
Сабвуфер излучает  магнитное поле, которое может создавать помехи для других чувствительных приборов. Мы настоятельно ‎
рекомендуем не устанавливать сабвуфер ближе 50 см к экрану телевизора (Рис. Н). При установке громкоговорителя слишком близко к ‎
электронно-лучевой трубке могут возникать сильные искажения геометрии изображения и цветопередачи. В целом не следует ‎
помещать любые чувствительные к магнитным полям предметы (аудиокассеты, видеопленки, магнитные носители данных, ЭЛТ ‎
проекторы и эпископы) близко к любому неэкранированному громкоговорителю. ‎
Это поле не влияет  на плазменные панели и LCD телевизоры.    ‎
Включение
Переведите выключатель питания на задней панели сабвуфера в положение "On" (Включено). ‎
При отсутствии входного аудиосигнала в течение примерно 15 минут сабвуфер автоматически переходит в режим ожидания (Stand-by).‎
Если сабвуфер не будет использоваться в течение нескольких дней, то рекомендуется выключить его, переведя выключатель ‎
питания на задней панели в положение "Off" (Выключено).‎
Во время грозы отключайте кабель питания от розетки питания.‎
Регулировка громкости
Регулировка громкости  позволяет установить правильный уровень громкости сабвуфера в соответствии с громкостью остальных ‎
громкоговорителей системы.‎
‎ При прослушивании музыки установите желаемый уровень низких частот  с помощью ручки уровня  Volume, находящейся на ‎
сабвуфере.‎
‎               ‎ 
‎ ‎
Ночной режим (Night) Только для  SW 800 V.‎
Это специальный режим динамического сжатия сигнала, который позволяет слушателю избежать большой разницы в уровне громкости ‎
при воспроизведении слабых и сильных сигналов. Слабые сигналы дополнительно усиливаются, и бас получается более ощутимым и ‎
достаточным даже на малых уровнях громкости, в то время как амплитуда мощных сигналов делается меньше. Эта функция ‎
обеспечивает исключительный комфорт для слушателя при воспроизведении низких частот на очень низкой громкости и позволяет при ‎
этом не беспокоить соседей и других находящихся неподалеку людей.‎
Режим "Night" включается и выключается кнопкой "Night" .‎
Форсированный режим (Boost Mode) Только для  SW 800 V.‎
Этот режим поднимает на +3 дБ уровень низких частот на 40 Гц. Он используется при желании или необходимости на многоканальных ‎
записях для создания очень динамичного баса.‎
Режим инфразвукового фильтра (Subsonic Mode) Только для  SW 800 V.‎
Сабвуфер оснащен низкочастотным фильтром. Этот фильтр может пригодиться, если сабвуфер устанавливается в небольшом ‎
помещении и/или в углу, или если стены комнаты тонкие или недостаточно жесткие. В такой комнате может возникнуть чрезмерный ‎
уровень звукового давления в нижнем басовом диапазоне, могут появиться вибрации и резонансы. Фильтр инфразвуковых частот ‎
служит для подавления этих неприятных явлений и сохранения чистого и сильного звучания баса.‎
Примечание 1: этот фильтр может также применяться при долговременном воспроизведении на высоких уровнях громкости. Он ‎
подавляет чрезмерное перемещение диафрагмы динамика (выворачивание) и препятствует возникновению искажений.                      ‎
‎                                                                 Технические характеристики ‎
‎                                                    Технические характеристики  Chorus 700 V
Динамик
‎11' НЧ (270 мм) динамик с конусным полигласс ‎
диффузором ‎
Частотный диапазон
от 37 Гц до 160 Гц
Усилитель
‎300 Вт эфф. (450 Вт макс.) BASH(r) Переключение фазы ‎
‎0° / 180° ‎

Входы
LFE / Стерео /Высокоуровневый вход ‎
Режимы питания
Включено / Выключено / Автоматический
Размеры (ВxШxГ)‎
‎420 x 326 x 433 мм
Вес
‎15,3 кг
Технические характеристики  Chorus 800 V‎

Динамик
‎11' НЧ( 270 мм) динамик с конусным полигласс ‎
диффузором ‎
Частотный диапазон
от 32 Гц до 160 Гц
Усилитель
‎350 Вт эфф. (500 Вт макс.) BASH(r) Переключение фазы ‎
‎0° / 180° ‎

Дополнительные ‎
возможности

Инфразвуковой фильтр 35 гц ,24 дб/октаву‎
Форсированный режим +3 дб на 40 гц‎
Ночной режим

Входы
LFE / Стерео /Высокоуровневый вход ‎
Режимы питания
Включено / Выключено / Автоматический
Размеры (ВxШxГ)‎
‎456 x 324 x 426 мм
Вес
‎18,8 кг

</s>]
""",
                "role": "user",
            },
        ],
        "stream": "true",
        "max_tokens": "512",
        "temperature": 0.22,
        "frequency_penalty": 1.2
    }

    try:
        response = requests.post(url, headers=headers, json=data, stream=True, timeout=3600)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error making the request: {e}")
        sys.exit(1)

def process_response(response):
    accumulated_text = ""  # Store all received text for metrics
    current_line = ""  # Buffer for the current line
    line_length_limit = 96  # Maximum length of a line
    start_time = time.time()

    for response_line in response.iter_lines():
        if response_line.startswith(b'data: '):
            line_content = response_line[len(b'data: '):]

            if b'[DONE]' in line_content:
                break

            try:
                json_data = json.loads(line_content)
                if "choices" in json_data and json_data["choices"]:
                    new_text = json_data["choices"][0]["delta"].get("content", "")

                    for char in new_text:
                        if char != '\n' and not (char.isspace() and len(current_line) >= line_length_limit):
                            current_line += char  # Continue adding to the current line
                            print(char, end='', flush=True)  # Print character immediately
                            accumulated_text += char  # Add to accumulated text
                        else:
                            # When the line limit is reached or a newline is encountered
                            print()  # Move to the next line
                            accumulated_text += '\n'  # Add newline to accumulated text
                            current_line = ""  # Reset the current line
                            if char.isspace():
                                continue  # Do not start a new line with whitespace
                            current_line += char
                            print(char, end='', flush=True)
                            accumulated_text += char  # Add to accumulated text

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                print(f"Raw content: {line_content}")
                continue

    elapsed_time = time.time() - start_time
    if current_line:  # Add any remaining text in the buffer
        accumulated_text += '\n'

    print_metrics(accumulated_text, elapsed_time)

def print_metrics(accumulated_text, elapsed_time):
    word_count = len(accumulated_text.split())
    character_count = len(accumulated_text.replace('\n', ''))  # Count characters excluding newlines
    words_per_second = word_count / elapsed_time if elapsed_time > 0 else 0
    characters_per_second = character_count / elapsed_time if elapsed_time > 0 else 0

    # print("\n\nFinal Accumulated Text:\n" + accumulated_text)
    print("\n\nPerformance Metrics:")
    print(f" - Tokens per second: {words_per_second*average_tokens_per_word:.2f} tokens per second")
    print(f" - Characters per second: {characters_per_second:.2f} characters per second")
    print(f" - Overall Response Time: {elapsed_time:.2f} seconds")
    print(f" - Total Tokens: {word_count*average_tokens_per_word:.0f} tokens")
    print(f" - Total Characters: {character_count:.2f} characters")




def main():
    response = make_request()
    process_response(response)

if __name__ == "__main__":
    main()
