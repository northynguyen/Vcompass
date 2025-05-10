from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from stable_baselines3 import DQN
import random
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from collections import Counter
import gymnasium as gym
from gymnasium import spaces

app = FastAPI()

# Load input data (giữ nguyên)
def load_input():
    try:
        with open('../Schedule_AI/All_users.json', 'r', encoding='utf-8') as user_file:
            users = json.load(user_file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading All_users.json: {e}")
        users = []
    try:
        with open('../Schedule_AI/All_schedules.json', 'r', encoding='utf-8') as schedules_file:
            schedules = json.load(schedules_file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading All_schedules.json: {e}")
        schedules = []
    return {'users': users, 'schedules': schedules}

# Preprocess user data (giữ nguyên)
def preprocess_users(users):
    gender_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    address_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    scaler = MinMaxScaler()

    ages = []
    genders = []
    addresses = []
    average_days = []
    average_costs = []
    num_restaurants = []
    num_accommodations = []
    num_attractions = []
    preference_vectors = []
    tag_vectors = []
    user_ids = []

    all_restaurant_ids = set()
    all_accommodation_ids = set()
    all_attraction_ids = set()
    all_tags = set()

    for user in users:
        all_restaurant_ids.update(user.get('restaurants', []))
        all_accommodation_ids.update(user.get('accommodations', []))
        all_attraction_ids.update(user.get('attractions', []))
        all_tags.update(user.get('topTags', []))
        user_ids.append(user['userId'])

    restaurant_id_map = {id: idx for idx, id in enumerate(all_restaurant_ids)}
    accommodation_id_map = {id: idx for idx, id in enumerate(all_accommodation_ids)}
    attraction_id_map = {id: idx for idx, id in enumerate(all_attraction_ids)}
    tag_map = {tag: idx for idx, tag in enumerate(all_tags)}

    for user in users:
        age = user.get('age', 0) or 0
        ages.append([age])
        average_days.append([user.get('averageDays', 0)])
        average_costs.append([user.get('averageCost', 0)])
        num_restaurants.append([user.get('numRestaurants', 0)])
        num_accommodations.append([user.get('numAccommodations', 0)])
        num_attractions.append([user.get('numAttractions', 0)])

        gender = user.get('gender', '') or 'unknown'
        genders.append([gender])
        address = user.get('address', '') or 'unknown'
        addresses.append([address])

        restaurant_counts = Counter(user.get('restaurants', []))
        accommodation_counts = Counter(user.get('accommodations', []))
        attraction_counts = Counter(user.get('attractions', []))

        restaurant_vector = np.zeros(len(restaurant_id_map), dtype=np.float32)
        accommodation_vector = np.zeros(len(accommodation_id_map), dtype=np.float32)
        attraction_vector = np.zeros(len(attraction_id_map), dtype=np.float32)

        for rid, count in restaurant_counts.items():
            if rid in restaurant_id_map:
                restaurant_vector[restaurant_id_map[rid]] = count
        for aid, count in accommodation_counts.items():
            if aid in accommodation_id_map:
                accommodation_vector[accommodation_id_map[aid]] = count
        for tid, count in attraction_counts.items():
            if tid in attraction_id_map:
                attraction_vector[attraction_id_map[tid]] = count

        preference_vector = np.concatenate([restaurant_vector, accommodation_vector, attraction_vector])
        preference_vectors.append(preference_vector)

        tag_vector = np.zeros(len(tag_map), dtype=np.float32)
        for tag in user.get('topTags', []):
            if tag in tag_map:
                tag_vector[tag_map[tag]] = 1
        tag_vectors.append(tag_vector)

    ages = scaler.fit_transform(ages).astype(np.float32)
    average_days = scaler.fit_transform(average_days).astype(np.float32)
    average_costs = scaler.fit_transform(average_costs).astype(np.float32)
    num_restaurants = scaler.fit_transform(num_restaurants).astype(np.float32)
    num_accommodations = scaler.fit_transform(num_accommodations).astype(np.float32)
    num_attractions = scaler.fit_transform(num_attractions).astype(np.float32)

    genders_encoded = gender_encoder.fit_transform(genders).astype(np.float32)
    addresses_encoded = address_encoder.fit_transform(addresses).astype(np.float32)

    user_feature_vectors = []
    for i in range(len(users)):
        feature_vector = np.concatenate([
            ages[i], average_days[i], average_costs[i],
            num_restaurants[i], num_accommodations[i], num_attractions[i],
            genders_encoded[i], addresses_encoded[i]
        ]).astype(np.float32)
        user_feature_vectors.append(feature_vector)

    return {
        'user_features': np.array(user_feature_vectors, dtype=np.float32),
        'user_preferences': np.array(preference_vectors, dtype=np.float32),
        'user_tags': np.array(tag_vectors, dtype=np.float32),
        'user_ids': user_ids,
        'restaurant_id_map': restaurant_id_map,
        'accommodation_id_map': accommodation_id_map,
        'attraction_id_map': attraction_id_map,
        'tag_map': tag_map
    }

# Preprocess schedule data (giữ nguyên)
def preprocess_schedules(schedules, restaurant_id_map, accommodation_id_map, attraction_id_map, tag_map):
    scaler = MinMaxScaler()
    num_days = []
    total_costs = []
    schedule_vectors = []
    tag_vectors = []

    for schedule in schedules:
        num_days.append([schedule.get('numDays', 0)])
        total_costs.append([schedule.get('totalCost', 0)])

        restaurant_vector = np.zeros(len(restaurant_id_map), dtype=np.float32)
        accommodation_vector = np.zeros(len(accommodation_id_map), dtype=np.float32)
        attraction_vector = np.zeros(len(attraction_id_map), dtype=np.float32)

        for rid in schedule.get('restaurants', []):
            if rid in restaurant_id_map:
                restaurant_vector[restaurant_id_map[rid]] = 1
        for aid in schedule.get('accommodations', []):
            if aid in accommodation_id_map:
                accommodation_vector[accommodation_id_map[aid]] = 1
        for tid in schedule.get('attractions', []):
            if tid in attraction_id_map:
                attraction_vector[attraction_id_map[tid]] = 1

        schedule_vector = np.concatenate([restaurant_vector, accommodation_vector, attraction_vector])
        schedule_vectors.append(schedule_vector)

        tag_vector = np.zeros(len(tag_map), dtype=np.float32)
        for tag in schedule.get('tags', []):
            if tag in tag_map:
                tag_vector[tag_map[tag]] = 1
        tag_vectors.append(tag_vector)

    num_days = scaler.fit_transform(num_days).astype(np.float32)
    total_costs = scaler.fit_transform(total_costs).astype(np.float32)

    schedule_feature_vectors = []
    for i in range(len(schedules)):
        feature_vector = np.concatenate([num_days[i], total_costs[i]]).astype(np.float32)
        schedule_feature_vectors.append(feature_vector)

    return {
        'schedule_features': np.array(schedule_feature_vectors, dtype=np.float32),
        'schedule_items': np.array(schedule_vectors, dtype=np.float32),
        'schedule_tags': np.array(tag_vectors, dtype=np.float32)
    }

# Create state (giữ nguyên)
def create_state(user_idx, schedule_idx, suggested_schedules, user_data, schedule_data):
    schedule_idx = min(schedule_idx, len(schedule_data['schedule_features']) - 1)
    state = np.concatenate([
        user_data['user_features'][user_idx],
        user_data['user_preferences'][user_idx],
        user_data['user_tags'][user_idx],
        suggested_schedules,
        schedule_data['schedule_features'][schedule_idx],
        schedule_data['schedule_items'][schedule_idx],
        schedule_data['schedule_tags'][schedule_idx]
    ]).astype(np.float32)
    return state

# Travel recommendation environment (cập nhật điều kiện dừng)
class TravelRecommendationEnv(gym.Env):
    def __init__(self, user_data, schedule_data, schedules, max_schedules, users, schedules_all, valid_schedule_indices=None):
        super(TravelRecommendationEnv, self).__init__()
        self.user_data = user_data
        self.schedule_data = schedule_data
        self.schedules = schedules
        self.users = users
        self.schedules_all = schedules_all
        self.num_schedules = len(schedules)
        self.max_schedules = max_schedules
        self.num_users = len(user_data['user_features'])
        self.valid_schedule_indices = valid_schedule_indices if valid_schedule_indices is not None else list(range(self.num_schedules))

        state_dim = (
            user_data['user_features'].shape[1] +
            user_data['user_preferences'].shape[1] +
            user_data['user_tags'].shape[1] +
            self.max_schedules +
            schedule_data['schedule_features'].shape[1] +
            schedule_data['schedule_items'].shape[1] +
            schedule_data['schedule_tags'].shape[1]
        )

        self.observation_space = spaces.Box(low=0, high=np.inf, shape=(state_dim,), dtype=np.float32)
        self.action_space = spaces.Discrete(max_schedules)
        self.current_user_idx = None
        self.suggested_schedules = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        if seed is not None:
            np.random.seed(seed)
        self.current_user_idx = np.random.randint(self.num_users)
        self.suggested_schedules = np.zeros(self.max_schedules, dtype=np.float32)
        initial_schedule_idx = random.choice(self.valid_schedule_indices)
        state = create_state(
            self.current_user_idx, initial_schedule_idx, self.suggested_schedules,
            self.user_data, self.schedule_data
        )
        return state, {}

    def step(self, action):
        schedule_idx = action
        if schedule_idx >= self.num_schedules:
            reward = -1.0
            state = create_state(
                self.current_user_idx, 0, self.suggested_schedules,
                self.user_data, self.schedule_data
            )
            done = bool(np.sum(self.suggested_schedules) >= 10)  # Dừng sau 10 lịch trình
            truncated = False
            info = {'invalid_action': True}
            return state, reward, done, truncated, info

        reward = self.calculate_reward(self.current_user_idx, schedule_idx, self.suggested_schedules)
        self.suggested_schedules[schedule_idx] = 1
        state = create_state(
            self.current_user_idx, schedule_idx, self.suggested_schedules,
            self.user_data, self.schedule_data
        )
        done = bool(np.sum(self.suggested_schedules) >= 10)  # Dừng sau 10 lịch trình
        truncated = False
        info = {}
        return state, reward, done, truncated, info

    def calculate_reward(self, user_idx, schedule_idx, suggested_schedules):
        if schedule_idx >= self.num_schedules:
            return -1.0

        user = {
            'features': self.user_data['user_features'][user_idx],
            'preferences': self.user_data['user_preferences'][user_idx],
            'tags': self.user_data['user_tags'][user_idx]
        }
        schedule = {
            'features': self.schedule_data['schedule_features'][schedule_idx],
            'items': self.schedule_data['schedule_items'][schedule_idx],
            'tags': self.schedule_data['schedule_tags'][schedule_idx],
            'original': self.schedules[schedule_idx]
        }

        tag_similarity = cosine_similarity([user['tags']], [schedule['tags']])[0][0].item()
        item_similarity = cosine_similarity([user['preferences']], [schedule['items']])[0][0].item()
        feature_diff = np.abs(user['features'][1:3] - schedule['features']).sum()
        feature_reward = 1.0 - feature_diff / 2.0
        total_reward = 0.5 * tag_similarity + 0.5 * item_similarity + 0.2 * feature_reward

        if suggested_schedules[schedule_idx] == 1:
            total_reward -= 0.7

        return float(max(total_reward, -1.0))

# Pydantic model for request body (giữ nguyên)
class UserRequest(BaseModel):
    userId: str
    topK: int = 10  # Mặc định trả về 10 lịch trình

# Pydantic model for response (giữ nguyên)
class RecommendationResponse(BaseModel):
    status: str
    recommendedSchedules: List[str]

# API endpoint to get schedule recommendations (cập nhật để trả về 10 lịch trình phù hợp nhất)
@app.post("/recommend_schedules/", response_model=RecommendationResponse)
async def recommend_schedules(request: UserRequest):
    # Load data
    data = load_input()
    users = data['users']
    schedules = data['schedules']
    max_schedules = len(schedules)

    # Kiểm tra số lượng lịch trình và người dùng
    print(f"Loaded {len(users)} users and {max_schedules} schedules")
    if len(users) != 17 or max_schedules != 40:
        print(f"Warning: Expected 17 users and 40 schedules, got {len(users)} users and {max_schedules} schedules")
    if max_schedules < request.topK:
        print(f"Warning: Only {max_schedules} schedules available, cannot return {request.topK} schedules.")
    if len(users) == 0:
        raise HTTPException(status_code=404, detail="No users found in data.")

    # Preprocess data
    user_data = preprocess_users(users)
    schedule_data = preprocess_schedules(
        schedules, 
        user_data['restaurant_id_map'], 
        user_data['accommodation_id_map'],
        user_data['attraction_id_map'], 
        user_data['tag_map']
    )
    
    # Find user index
    user_ids = user_data['user_ids']
    try:
        user_idx = user_ids.index(request.userId)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"User {request.userId} not found")

    # Load trained model
    try:
        model = DQN.load("../Schedule_AI/dqn_travel_recommendation_train")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")

    # Create environment
    all_schedule_ids = {s['scheduleId']: idx for idx, s in enumerate(schedules)}
    valid_schedule_indices = [all_schedule_ids[s['scheduleId']] for s in schedules]
    print(f"Valid schedule indices: {len(valid_schedule_indices)} schedules available")
    
    env = TravelRecommendationEnv(
        user_data, 
        schedule_data, 
        schedules, 
        max_schedules, 
        users, 
        schedules,
        valid_schedule_indices=valid_schedule_indices
    )
    
    # Generate recommendations using DQN
    env.current_user_idx = user_idx
    env.suggested_schedules = np.zeros(max_schedules, dtype=np.float32)
    state = create_state(
        user_idx, 
        valid_schedule_indices[0] if valid_schedule_indices else 0, 
        env.suggested_schedules, 
        user_data, 
        schedule_data
    )
    
    recommended_indices = []
    top_k = min(request.topK, max_schedules)
    max_attempts = top_k * 5  # Tăng số lần thử để tránh trùng lặp

    for attempt in range(max_attempts):
        if len(recommended_indices) >= top_k:
            break
        action, _ = model.predict(state, deterministic=True)
        action = int(action)
        schedule_idx = action
        if schedule_idx < len(schedules) and schedule_idx not in recommended_indices:
            recommended_indices.append(schedule_idx)
            env.suggested_schedules[schedule_idx] = 1
            print(f"Iteration {len(recommended_indices)}: Selected schedule_idx={schedule_idx}, scheduleId={schedules[schedule_idx]['scheduleId']} (DQN)")
        else:
            print(f"Iteration {attempt+1}: Skipped schedule_idx={schedule_idx} (already selected or invalid)")
        state = create_state(
            user_idx, 
            schedule_idx if schedule_idx < len(schedules) else 0, 
            env.suggested_schedules, 
            user_data, 
            schedule_data
        )

    # Fallback: Use cosine similarity if not enough schedules
    if len(recommended_indices) < top_k:
        print(f"Warning: DQN only selected {len(recommended_indices)} schedules, using cosine similarity for remaining")
        remaining_k = top_k - len(recommended_indices)
        user_tags = user_data['user_tags'][user_idx]
        user_prefs = user_data['user_preferences'][user_idx]
        user_features = user_data['user_features'][user_idx][1:3]  # averageDays, averageCost

        # Tính độ tương đồng cho tất cả lịch trình
        tag_similarities = cosine_similarity([user_tags], schedule_data['schedule_tags'])[0]
        item_similarities = cosine_similarity([user_prefs], schedule_data['schedule_items'])[0]
        feature_diffs = np.array([np.abs(user_features - schedule_data['schedule_features'][i]).sum() for i in range(len(schedules))])
        feature_rewards = 1.0 - feature_diffs / 2.0
        combined_scores = 0.5 * tag_similarities + 0.5 * item_similarities + 0.2 * feature_rewards

        # Chọn các lịch trình chưa được chọn
        available_indices = [i for i in range(len(schedules)) if i not in recommended_indices]
        sorted_indices = sorted(available_indices, key=lambda i: combined_scores[i], reverse=True)
        for idx in sorted_indices[:remaining_k]:
            recommended_indices.append(idx)
            print(f"Iteration {len(recommended_indices)}: Selected schedule_idx={idx}, scheduleId={schedules[idx]['scheduleId']} (Cosine Similarity)")

    # Convert indices to schedule IDs
    recommended_schedule_ids = [schedules[idx]['scheduleId'] for idx in recommended_indices]
    
    # Log kết quả
    print(f"User {request.userId}: {len(recommended_schedule_ids)} schedules recommended: {recommended_schedule_ids}")
    
    # Kiểm tra nếu không đủ số lịch trình yêu cầu
    if len(recommended_schedule_ids) < request.topK:
        print(f"Warning: Only {len(recommended_schedule_ids)} schedules returned instead of {request.topK} for user {request.userId}")

    # Return response
    return RecommendationResponse(
        status="success",
        recommendedSchedules=recommended_schedule_ids
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)