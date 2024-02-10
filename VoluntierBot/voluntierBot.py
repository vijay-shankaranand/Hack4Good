import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "6356825284:AAGGLIVlV4G2JUAF105CNzQUqYl8hPWNhDE"

bot = telebot.TeleBot(TOKEN)

# -------------------------------------------   ATTENDANCE   ----------------------------------------------------


@bot.message_handler(commands=['attend'])
def check_attendance(message):
    chat_id = message.chat.id

    # Get list of events user is signed up for
    events = get_user_events(bot.get_me().id)

    if not events:
        bot.send_message(chat_id, "You are not registered for any events !!")

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


@bot.message_handler(commands=['poll'])
def start_poll(message):
    chat_id = message.chat.id

    user_events = get_user_events(bot.get_me())

    if not user_events:
        bot.send_message(chat_id, "You are not registered for any events !!")

    keyboard = InlineKeyboardMarkup()
    for i, event in enumerate(user_events):
        keyboard.add(InlineKeyboardButton(text=f"{event['name']}", callback_data=f"survey_{event['event_id']}"))

    bot.send_message(chat_id, f"Choose Event", reply_markup=keyboard)


@bot.callback_query_handler(func=lambda call: call.data.startswith("survey_"))
def create_survey(call):
    chat_id = call.message.chat.id
    event_id = call.data.split("_", 1)[1]

    # Fetch the survey object from database
    sample_survey_data = [
        {
            "survey_id": "ksndkjnjk!wojrw$%%lskdjo",
            "event_id": "1",
            "question": "How did you find today's session ?",
            "options": ["Didnt like it", "Could have been better", "Went great !!", "Loved it"],
            "type": "regular"
        },
        {
            "survey_id": "kjasdijah!!@@@@jo",
            "event_id": "2",
            "question": "How much kilo of rice did you donate ?",
            "options": ["0-1", "1-5", "5-10", "10-20"],
            "type": "regular"
        },
        {
            "survey_id": "kjasdijdfdah!!@@@@jo",
            "event_id": "2",
            "question": "Some random question ?",
            "options": ["Help", "Out of here"],
            "type": "regular"
        },
        {
            "survey_id": "kjasdijdfdah!!@@@@jo",
            "event_id": "2",
            "question": "WOah waobha ksj ?",
            "options": ["HMMMM", "WAHHAHAHAH", "yessir"],
            "type": "regular"
        },
        {
            "survey_id": "kjasdijdfdah!!@@@@jo",
            "event_id": "2",
            "question": "Help ?",
            "options": ["Yes", "No"],
            "type": "regular"
        },
    ]

    for p in sample_survey_data:
        question = p['question']
        options = p['options']
        q_type = p['type']
        curr_event_id = p['event_id']

        if curr_event_id == event_id:
            # MUST ALSO CHECK IF THEY HAVE NOT ATTEMPTED A QUIZ --> Check by fetching quiz_answer table ?
            bot.send_poll(chat_id, question=question, options=options, type=q_type, is_anonymous=False)


@bot.poll_answer_handler()
def handle_answer(ans):
    print("Poll id: ", ans.poll_id)
    print("Poll Ans Object : ", ans.option_ids)


def get_user_events(user_id):
    # Fetch events from DB using user_id

    sample_events_data = [
      {
        "event_id": "1",
        "name": "Help the kids in Yishun",
        "start_date": "2024-02-10",
        "end_date": "2024-02-10",
        "is_active": True
      },
      {
        "event_id": "2",
        "name": "Clearing litter at the beach",
        "start_date": "2024-02-05",
        "end_date": "2024-02-20",
        "is_active": True
      }
    ]

    return sample_events_data


bot.infinity_polling()
