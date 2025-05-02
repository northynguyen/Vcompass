from data_loader import load_input
from analyzer import ScheduleAnalyzer
from schedule_env import ScheduleEnv
from agent import ScheduleRLAgent
import json

def main():
    input_data = load_input()
    user = input_data.get('user', {}).get('user')
    user_schedule = input_data.get('user', {}).get('schedules', [])
    schedules = input_data['schedules']
    topTags = input_data.get('user', {}).get('topTags', [])

    favorites = (user or {}).get('favorites', {})
    following = (user or {}).get('following', [])
    interaction_summary = input_data.get('user', {}).get('interactionSummary')

    analyzer = ScheduleAnalyzer(user_schedule, favorites, following, interaction_summary, topTags)
    behavior = analyzer.behavior
    user_vector = analyzer.user_to_vector()

    if isinstance(schedules[0], str):
        schedules = [json.loads(s) for s in schedules]

    env = ScheduleEnv(user_vector, schedules, behavior, favorites, following, analyzer)
    input_dim = len(user_vector) + len(analyzer.schedule_to_vector(schedules[0]))
    agent = ScheduleRLAgent(input_dim, env)
    agent.train()
    agent.save_model("model_RecommentSchedule.pth")
if __name__ == "__main__":
    print("Training model...")
    main()