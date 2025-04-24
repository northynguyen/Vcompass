from data_loader import load_input
from analyzer import ScheduleAnalyzer
from schedule_env import ScheduleEnv
from agent import ScheduleRLAgent
import json
import torch

def main():
    input_data = load_input()
    user = input_data.get('user', {}).get('user')
    user_schedule = input_data.get('user', {}).get('schedules', [])
    schedules = input_data['schedules']

    favorites = (user or {}).get('favorites', {})
    following = (user or {}).get('following', [])
    interaction_summary = input_data.get('user', {}).get('interactionSummary')

    analyzer = ScheduleAnalyzer(user_schedule, favorites, following, interaction_summary)
    behavior = analyzer.behavior
    user_vector = analyzer.user_to_vector()

    if isinstance(schedules[0], str):
        schedules = [json.loads(s) for s in schedules]

    env = ScheduleEnv(user_vector, schedules, behavior, favorites, following, analyzer)
    input_dim = len(user_vector) + len(analyzer.schedule_to_vector(schedules[0]))
    agent = ScheduleRLAgent(input_dim, env)

    agent.q_net.load_state_dict(torch.load("model_RecommentSchedule.pth"))

    q_vals = []
    for i in range(len(env.schedules)):
        state = env.get_state_action_pair(i).unsqueeze(0)
        with torch.no_grad():
            q = agent.q_net(state).item()
        q_vals.append((i, q))

    q_vals.sort(key=lambda x: x[1], reverse=True)
    top_schedules = [env.schedules[idx] for idx, _ in q_vals[:10]]
    with open("recommend.json", "w", encoding="utf-8") as f:
        json.dump(top_schedules, f, ensure_ascii=False)

if __name__ == "__main__":
    print ("Predicting schedules...")
    main()
