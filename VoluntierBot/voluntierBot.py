import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
import requests
import json

TOKEN = "6356825284:AAGGLIVlV4G2JUAF105CNzQUqYl8hPWNhDE"
# voluntier_bot

TEST_TOKEN = "6932538410:AAFmQo09aFoLT3MbciPTSe7thD8Kq5GpJ5g"
# test_jawBot

bot = telebot.TeleBot(TOKEN)
# https://hack4good.onrender.com
uri = 'https://hack4good.onrender.com'

# -------------------------------------------   ATTENDANCE   ----------------------------------------------------


@bot.message_handler(commands=['attend'])
def check_attendance(message):
    chat_id = message.chat.id

    # Get list of events user is signed up for
    events = get_user_events()

    if not events:
        bot.send_message(chat_id, "No events yet !!")

    event_list = ""
    for i, event in enumerate(events):
        event_list += f"{i+1}. {event['name']}\n"

    keyboard = InlineKeyboardMarkup()
    for i, event in enumerate(events):
        keyboard.add(InlineKeyboardButton(text=f"{event['name']}", callback_data=f"attend_{event['event_id']}"))

    bot.send_message(chat_id, f"Choose the event to mark attendance", reply_markup=keyboard)


@bot.callback_query_handler(func=lambda call: call.data.startswith("attend_"))
def handle_event_selection(call):
    event_id = call.data.split("_", 1)
    # Mark attendance
    mark_attendance(bot.get_me().id, event_id)
    bot.send_message(call.message.chat.id, "Attendance is marked successfully !")


def mark_attendance(user_id, event_id):
    print(f"User: {user_id} marked as present for Event: {event_id}")


# -------------------------------------------   SURVEYS   ----------------------------------------------------

question_dict = {}


@bot.message_handler(commands=['poll'])
def start_poll(message):
    chat_id = message.chat.id

    user_events = get_user_events()

    if not user_events:
        bot.send_message(chat_id, "No events yet !!")

    keyboard = InlineKeyboardMarkup()
    for i, event in enumerate(user_events):
        keyboard.add(InlineKeyboardButton(text=f"{event['name']}", callback_data=f"survey_{event['event_id']}"))

    bot.send_message(chat_id, f"Choose Event", reply_markup=keyboard)


@bot.callback_query_handler(func=lambda call: call.data.startswith("survey_"))
def create_survey(call):
    chat_id = call.message.chat.id
    event_id = call.data.split("_", 1)[1]

    # Empty the dictionary
    question_dict.clear()

    # Fetch the survey object from database

    data = {
        "eventId": event_id
    }

    questions_data = None

    try:
        response = requests.get(f"{uri}/questions", json=data)

        if response.status_code == 200:
            questions_data = response.json()
    except Exception as e:
        print("Error: ", e)

    print("Retrieved from db : ", questions_data)

    for q in questions_data:
        question = q['question_text']
        curr_event_id = q['event_id']
        question_id = q['question_id']

        options = None

        try:
            data = {
                "questionId": question_id
            }
            res = requests.get(f"{uri}/options", json=data)
            if res.status_code == 200:
                options = res.json()
        except Exception as e:
            print("Error: ", e)

        print(f"text: {question}, event_id: {curr_event_id}, q_id: {question_id}, Chosen event: {event_id}")

        print(curr_event_id == event_id)

        option_texts = [o['option_text'] for o in options]
        print(f"options: {options}")

        if len(options) > 10:
            option_texts = option_texts[:10]

        if int(curr_event_id) == int(event_id):
            # MUST ALSO CHECK IF THEY HAVE NOT ATTEMPTED A QUIZ --> Check by fetching quiz_answer table ?
            poll = bot.send_poll(chat_id, question=question, options=option_texts, is_anonymous=False)

            poll_id = poll.json['poll']['id']
            poll_obj = poll.json['poll']

            question_dict[poll_id] = poll_obj, event_id, options, question_id


@bot.poll_answer_handler()
def handle_answer(ans):
    poll_id = ans.poll_id
    option_id = ans.option_ids[0]
    user_id = ans.user.id
    user_name = ans.user.username
    print("User name", user_name)

    poll_obj = question_dict[poll_id][0]
    event_id = question_dict[poll_id][1]
    options = question_dict[poll_id][2]
    question_id = question_dict[poll_id][3]

    poll_answer = poll_obj['options'][option_id]['text']
    question_text = poll_obj['question']

    # print("OPTIONS: ", options)
    # print("OPTION INDEX:", option_id)
    # print("OPTIONS ID DB:", options[option_id]['option_id'])

    option_id_db = options[option_id]['option_id']

    submission = {
        "eventId": event_id,
        "volunteerId": user_id,
        "optionId": option_id_db,
        "questionId": question_id
    }

    user = {
        "volunteerId": user_id,
        "userName": user_name
    }

    print("Event id: ", event_id)
    print("Question: ", question_text)
    print("User id: ", user_id)
    print("Answer: ", poll_answer)

    # Create user
    try:
        resp = requests.post(f"{uri}/volunteer", json=user)
        if resp.status_code == 200:
            print("User created")
    except Exception as e:
        print("User alr exists", e)

    # Submission to DB

    try:
        res = requests.post(f"{uri}/submission", json=submission)
        print("RES: ", res)
        if res.status_code == 200:
            print("Successful")
    except Exception as e:
        print("Error: ", e)


def get_user_events():
    # Fetch events from DB

    response = requests.get(f'{uri}/events')
    print("Response: ", response.status_code)

    events = response.json()
    print("Events: ", events)

    return events


bot.infinity_polling()
