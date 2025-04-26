import json

def load_input():
    try:
        with open('../Schedule_AI/user.json', 'r', encoding='utf-8') as user_file:
            user = json.load(user_file)
    except (FileNotFoundError, json.JSONDecodeError):
        user = None

    with open('../Schedule_AI/All_schedules.json', 'r', encoding='utf-8') as schedules_file:
        schedules = json.load(schedules_file)
        
    return {'user': user, 'schedules': schedules}