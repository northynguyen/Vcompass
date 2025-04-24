import numpy as np
from collections import defaultdict
class ScheduleAnalyzer:
    def __init__(self, schedules, favorites=None, following=None, interaction_summary=None):
        self.schedules = schedules
        self.favorites = favorites or {}
        self.following = following or []
        self.interaction_summary = interaction_summary or []
        self.behavior = self._analyze_behavior()
        self.tag_scores = self._calculate_tag_scores()

    def _analyze_behavior(self):
        if not self.schedules:
            return {
                'averageCost': 800000,
                'frequentAttractions': [],
                'frequentFoods': [],
                'frequentAccommodations': [],
                'cities': set() # Mới thêm: Lưu trữ các thành phố đã đi qua
            }
        total_cost, count = 0, 0
        attraction_count, food_count, accommodation_count = {}, {}, {}
        cities = set()  # Mới thêm: Để lưu trữ các thành phố đã xuất hiện

        for s in self.schedules:
            cities.add(s.get('city', ''))  # Lưu thành phố trong lịch trình
            for item in s.get('activities', []):
                for act in item.get('activity', []):
                    total_cost += act.get('cost', 0)
                    t = act.get('activityType')
                    id_ = act.get('idDestination')
                    if not id_:
                        continue
                    if t == 'Attraction':
                        attraction_count[id_] = attraction_count.get(id_, 0) + 1
                    elif t == 'FoodService':
                        food_count[id_] = food_count.get(id_, 0) + 1
                    elif t == 'Accommodation':
                        accommodation_count[id_] = accommodation_count.get(id_, 0) + 1
            count += 1

        return {
            'averageCost': int(total_cost / count) if count else 0,
            'frequentAttractions': sorted(attraction_count, key=attraction_count.get, reverse=True),
            'frequentFoods': sorted(food_count, key=food_count.get, reverse=True),
            'frequentAccommodations': sorted(accommodation_count, key=accommodation_count.get, reverse=True),
            'cities': cities  # Thêm cities vào kết quả
        }

    def _calculate_tag_scores(self):
        scores = defaultdict(int)
        for entry in self.interaction_summary:
            tags = entry.get("tags", [])
            view_count = entry.get("viewCount", 0)
            edit_count = entry.get("editCount", 0)

            for tag in tags:
                scores[tag] += view_count * 2 + edit_count * 5
        return dict(scores)

    def calculate_reward(self, schedule):
        reward = 0
        cost = sum(
            act.get('cost', 0)
            for item in schedule.get('activities', [])
            for act in item.get('activity', [])
        )
        cost_diff = abs((cost / schedule.get('totalPeople', 1)) - self.behavior['averageCost'])
        reward -= int(cost_diff / 100000)

        for item in schedule.get('activities', []):
            for act in item.get('activity', []):
                id_ = act.get('idDestination')
                t = act.get('activityType')
                if t == 'Attraction' and id_ in self.behavior['frequentAttractions']:
                    reward += 5
                if t == 'FoodService' and id_ in self.behavior['frequentFoods']:
                    reward += 4
                if t == 'Accommodation' and id_ in self.behavior['frequentAccommodations']:
                    reward += 3
                if id_ in self.favorites.get('attraction', []):
                    reward += 10
                if id_ in self.favorites.get('foodService', []):
                    reward += 8
                if id_ in self.favorites.get('accommodation', []):
                    reward += 6

        if str(schedule.get('idUser')) in self.following:
            reward += 15

        for item in schedule.get('activities', []):
            types = set()
            times = []
            for act in item.get('activity', []):
                types.add(act.get('activityType'))
                times.append((act.get('timeStart'), act.get('timeEnd')))
            if len(types) >= 3:
                reward += 10
            else:
                reward -= 5
            for i in range(len(times)):
                for j in range(i + 1, len(times)):
                    if times[i][0] < times[j][1] and times[j][0] < times[i][1]:
                        reward -= 10
            if not item.get('activity'):
                reward -= 10

        # Reward thêm nếu lịch trình có nhiều tag trùng với sở thích interactionSummary
        schedule_tags = schedule.get('tags', [])
        for tag in schedule_tags:
            reward += self.tag_scores.get(tag, 0)

        return reward

    def user_to_vector(self):
        avg_cost = self.behavior['averageCost'] / 1e6 if self.behavior['averageCost'] else 0
        return np.array([
            avg_cost,  # Giá trung bình
            len(self.behavior['frequentAttractions']),  # Số nhà hàng
            len(self.behavior['frequentFoods']),  # Số khách sạn
            len(self.behavior['frequentAccommodations']),  # Số điểm đến
            len(self.behavior['cities']),  # Số thành phố đã đi qua
            len(self.tag_scores),  # Số tag đã cộng điểm
        ])

    def schedule_to_vector(self, schedule):
        totalCost = sum(
            act.get('cost', 0)
            for item in schedule.get('activities', [])
            for act in item.get('activity', [])
        ) / 1e6
    
        num_attraction = num_food = num_accommodation = 0
        for item in schedule.get('activities', []):
            for act in item.get('activity', []):
                t = act.get('activityType')
                if t == 'Attraction':
                    num_attraction += 1
                elif t == 'FoodService':
                    num_food += 1
                elif t == 'Accommodation':
                    num_accommodation += 1
    
        return np.array([totalCost, num_attraction, num_food, num_accommodation])
