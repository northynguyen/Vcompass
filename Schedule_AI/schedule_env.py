import torch
import numpy as np

class ScheduleEnv:
    def __init__(self, user_vector, schedules, behavior, favorites, following, analyzer):
        self.user_vector = user_vector
        self.schedules = schedules
        self.behavior = behavior
        self.favorites = favorites
        self.following = following
        self.analyzer = analyzer

    def get_state_action_pair(self, schedule_idx):
        sched_vector = self.analyzer.schedule_to_vector(self.schedules[schedule_idx])
        combined = np.concatenate([self.user_vector, sched_vector])
        return torch.FloatTensor(combined)

    def step(self, action_idx):
        schedule = self.schedules[action_idx]
        if np.all(self.user_vector == 0):
            reward = 0
            for item in schedule.get('activities', []):
                types = set(act.get('activityType') for act in item.get('activity', []))
                if len(types) >= 2:
                    reward += 5
            reward += len(schedule.get('activities', []))
            return reward, True
        else:
            reward = self.analyzer.calculate_reward(schedule)
            return reward, True
