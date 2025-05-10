import json
import numpy as np
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import DQN
import random
import uuid

# Step 1: Load input data (giữ nguyên)
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

# Step 2: Preprocess user data (giữ nguyên)
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

# Step 3: Preprocess schedule data (giữ nguyên)
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

# Step 4: Create state (giữ nguyên)
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

# Step 5: Build environment (giữ nguyên)
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
        schedule_idx = self.valid_schedule_indices[action % len(self.valid_schedule_indices)]
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

# Step 6: Evaluate model (cập nhật để đảm bảo trả về 10 lịch trình)
def evaluate_model(model, users, schedules, user_data, schedule_data, ground_truth, top_k=10, max_schedules=None):
    all_schedule_ids = {s['scheduleId']: idx for idx, s in enumerate(user_data['schedules_all'])}
    valid_schedule_indices = [all_schedule_ids[s['scheduleId']] for s in schedules if s['scheduleId'] in all_schedule_ids]
    
    print(f"Evaluating with {len(valid_schedule_indices)} valid schedules")
    if len(valid_schedule_indices) < top_k:
        print(f"Warning: Only {len(valid_schedule_indices)} valid schedules available, cannot return {top_k} schedules.")

    env = TravelRecommendationEnv(
        user_data, schedule_data, schedules, max_schedules, users, user_data['schedules_all'],
        valid_schedule_indices=valid_schedule_indices
    )
    hits = 0
    reciprocal_ranks = []
    valid_users = 0
    schedule_id_to_idx = {s['scheduleId']: idx for idx, s in enumerate(schedules)}
    
    for user_idx, user in enumerate(users):
        user_id = user['userId']
        true_schedules = ground_truth.get(user_id, [])
        if not true_schedules:
            print(f"Skipping user {user_id}: No ground truth schedules")
            continue
        
        valid_users += 1
        env.current_user_idx = user_idx
        env.suggested_schedules = np.zeros(max_schedules, dtype=np.float32)
        state = create_state(user_idx, valid_schedule_indices[0], env.suggested_schedules, user_data, schedule_data)
        
        recommended_indices = []
        max_recommendations = min(top_k, len(valid_schedule_indices))
        max_attempts = max_recommendations * 5  # Tăng số lần thử để tránh trùng lặp
        attempts = 0

        while len(recommended_indices) < max_recommendations and attempts < max_attempts:
            action, _ = model.predict(state, deterministic=True)
            action = int(action)
            schedule_idx = env.valid_schedule_indices[action % len(env.valid_schedule_indices)]
            if schedule_idx not in recommended_indices and schedule_idx < len(schedules):
                recommended_indices.append(schedule_idx)
                env.suggested_schedules[schedule_idx] = 1
                print(f"User {user_id}, Iteration {len(recommended_indices)}: Selected schedule_idx={schedule_idx}, scheduleId={schedules[schedule_idx]['scheduleId']}")
            else:
                print(f"User {user_id}, Iteration {len(recommended_indices)+1}: Skipped schedule_idx={schedule_idx} (already selected or invalid)")
            state = create_state(user_idx, schedule_idx, env.suggested_schedules, user_data, schedule_data)
            attempts += 1

        recommended_schedule_ids = [schedules[idx]['scheduleId'] for idx in recommended_indices]
        print(f"User {user_id}: {len(recommended_schedule_ids)} schedules recommended: {recommended_schedule_ids}")
        
        hit = any(sid in true_schedules for sid in recommended_schedule_ids)
        if hit:
            hits += 1
        
        for rank, sid in enumerate(recommended_schedule_ids, 1):
            if sid in true_schedules:
                reciprocal_ranks.append(1.0 / rank)
                break
        else:
            reciprocal_ranks.append(0.0)
    
    hit_rate = hits / valid_users if valid_users > 0 else 0.0
    mrr = np.mean(reciprocal_ranks) if reciprocal_ranks else 0.0
    return hit_rate, mrr

# Step 7: Split data and train (cập nhật để đánh giá toàn bộ cặp user-lịch trình)
data = load_input()
users = data['users']
schedules = data['schedules']
max_schedules = len(schedules)

print(f"Loaded {len(users)} users and {max_schedules} schedules")
if len(users) != 17 or max_schedules != 40:
    print(f"Warning: Expected 17 users and 40 schedules, got {len(users)} users and {max_schedules} schedules")

user_data = preprocess_users(users)
user_data['schedules_all'] = schedules

train_schedules, test_schedules = train_test_split(schedules, test_size=0.2, random_state=42)
train_schedule_data = preprocess_schedules(
    train_schedules, user_data['restaurant_id_map'], user_data['accommodation_id_map'],
    user_data['attraction_id_map'], user_data['tag_map']
)
test_schedule_data = preprocess_schedules(
    test_schedules, user_data['restaurant_id_map'], user_data['accommodation_id_map'],
    user_data['attraction_id_map'], user_data['tag_map']
)

# Data consistency check
assert len(test_schedules) == len(test_schedule_data['schedule_features']), \
    f"Mismatch: len(test_schedules)={len(test_schedules)}, len(test_schedule_data['schedule_features'])={len(test_schedule_data['schedule_features'])}"

# Check for NaN or Inf
for key, value in user_data.items():
    if isinstance(value, np.ndarray):
        if np.any(np.isnan(value)) or np.any(np.isinf(value)):
            print(f"Found NaN or Inf in user_data['{key}']")
for key, value in test_schedule_data.items():
    if isinstance(value, np.ndarray):
        if np.any(np.isnan(value)) or np.any(np.isinf(value)):
            print(f"Found NaN or Inf in test_schedule_data['{key}']")

# Create ground truth for all user-schedule pairs
def create_ground_truth(users, schedules, user_data, schedule_data, top_n=10):
    ground_truth = {user['userId']: [] for user in users}
    for user_idx, user in enumerate(users):
        user_id = user['userId']
        user_tags = user_data['user_tags'][user_idx]
        user_prefs = user_data['user_preferences'][user_idx]
        user_features = user_data['user_features'][user_idx][1:3]  # averageDays, averageCost

        # Tính độ tương đồng cho tất cả lịch trình
        tag_similarities = cosine_similarity([user_tags], schedule_data['schedule_tags'])[0]
        item_similarities = cosine_similarity([user_prefs], schedule_data['schedule_items'])[0]
        feature_diffs = np.array([np.abs(user_features - schedule_data['schedule_features'][i]).sum() for i in range(len(schedules))])
        feature_rewards = 1.0 - feature_diffs / 2.0
        combined_scores = 0.5 * tag_similarities + 0.5 * item_similarities + 0.2 * feature_rewards

        # Chọn top-N lịch trình
        top_indices = np.argsort(combined_scores)[::-1][:top_n]
        top_schedule_ids = [schedules[idx]['scheduleId'] for idx in top_indices]
        ground_truth[user_id] = top_schedule_ids
        print(f"User {user_id}: Assigned {len(top_schedule_ids)} ground truth schedules: {top_schedule_ids}")

    return ground_truth

# Tạo ground truth cho tập train và test
train_ground_truth = create_ground_truth(users, train_schedules, user_data, train_schedule_data, top_n=10)
test_ground_truth = create_ground_truth(users, test_schedules, user_data, test_schedule_data, top_n=10)

# Debug ground truth
def debug_ground_truth(users, schedules, ground_truth, is_test=True):
    schedule_ids = {s['scheduleId'] for s in schedules}
    valid_users = 0
    total_ground_truth = 0
    invalid_entries = 0
    filtered_ground_truth = {user['userId']: [] for user in users}

    for user in users:
        user_id = user['userId']
        true_schedules = ground_truth.get(user_id, [])
        valid_schedules = [sid for sid in true_schedules if sid in schedule_ids]
        filtered_ground_truth[user_id] = valid_schedules
        if valid_schedules:
            valid_users += 1
            total_ground_truth += len(valid_schedules)
            for schedule_id in true_schedules:
                if schedule_id not in schedule_ids:
                    invalid_entries += 1
                    print(f"Invalid schedule ID {schedule_id} for user {user_id} not in {'test' if is_test else 'train'} schedules")
    
    print(f"{'Test' if is_test else 'Train'} Ground Truth:")
    print(f"Users with non-empty ground truth: {valid_users}/{len(users)}")
    print(f"Total schedules in ground truth: {total_ground_truth}")
    print(f"Invalid schedule entries: {invalid_entries}")
    print(f"Average schedules per user: {total_ground_truth / valid_users if valid_users > 0 else 0:.2f}")
    return filtered_ground_truth

filtered_train_ground_truth = debug_ground_truth(users, train_schedules, train_ground_truth, is_test=False)
filtered_test_ground_truth = debug_ground_truth(users, test_schedules, test_ground_truth, is_test=True)

# Train model
env = TravelRecommendationEnv(user_data, train_schedule_data, train_schedules, max_schedules, users, schedules)
model = DQN(
    policy="MlpPolicy",
    env=env,
    learning_rate=1e-4,  # Giảm learning rate để hội tụ ổn định
    buffer_size=50000,
    learning_starts=5000,
    batch_size=128,
    tau=1.0,
    gamma=0.99,
    train_freq=4,
    target_update_interval=1000,
    exploration_fraction=0.3,
    exploration_final_eps=0.01,
    verbose=0
)
model.learn(total_timesteps=10000)  # Tăng số bước huấn luyện
model.save("../Schedule_AI/dqn_travel_recommendation_train")

# Evaluate on training set
print("\nEvaluating on training set:")
model = DQN.load("../Schedule_AI/dqn_travel_recommendation_train")
hit_rate_train, mrr_train = evaluate_model(model, users, train_schedules, user_data, train_schedule_data, filtered_train_ground_truth, top_k=10, max_schedules=max_schedules)
print(f"Training Hit Rate: {hit_rate_train:.4f}")
print(f"Training MRR: {mrr_train:.4f}")

# Evaluate on test set
print("\nEvaluating on test set:")
hit_rate_test, mrr_test = evaluate_model(model, users, test_schedules, user_data, test_schedule_data, filtered_test_ground_truth, top_k=10, max_schedules=max_schedules)
print(f"Test Hit Rate: {hit_rate_test:.4f}")
print(f"Test MRR: {mrr_test:.4f}")

# Step 8: Analyze reward function (cập nhật để kiểm tra toàn bộ cặp)
def test_reward_function(env, user_idx, schedule_idx, schedules):
    env.suggested_schedules = np.zeros(env.max_schedules, dtype=np.float32)
    reward = env.calculate_reward(user_idx, schedule_idx, env.suggested_schedules)
    schedule_id = schedules[schedule_idx]['scheduleId']
    user_id = users[user_idx]['userId']
    is_ground_truth = schedule_id in filtered_test_ground_truth.get(user_id, [])
    print(f"User {user_id}, Schedule {schedule_id}, Reward: {reward:.4f}, Ground truth: {is_ground_truth}")
    return reward

print("\nTesting reward function for all user-schedule pairs:")
env = TravelRecommendationEnv(user_data, test_schedule_data, test_schedules, max_schedules, users, schedules)
for user_idx, user in enumerate(users):
    user_id = user['userId']
    true_schedules = filtered_test_ground_truth.get(user_id, [])
    print(f"Testing rewards for user {user_id}, Ground truth: {true_schedules}")
    for schedule_idx, schedule in enumerate(test_schedules):
        test_reward_function(env, user_idx, schedule_idx, test_schedules)

# Step 9: Analyze features (giữ nguyên)
def analyze_features(user_data, schedule_data):
    print("\nFeature analysis:")
    print("User features shape:", user_data['user_features'].shape)
    print("User preferences shape:", user_data['user_preferences'].shape)
    print("User tags shape:", user_data['user_tags'].shape)
    print("Schedule features shape:", schedule_data['schedule_features'].shape)
    print("Schedule items shape:", schedule_data['schedule_items'].shape)
    print("Schedule tags shape:", schedule_data['schedule_tags'].shape)

    for key, value in user_data.items():
        if isinstance(value, np.ndarray):
            print(f"{key} - Mean: {np.mean(value):.4f}, Std: {np.std(value):.4f}")
    for key, value in schedule_data.items():
        if isinstance(value, np.ndarray):
            print(f"{key} - Mean: {np.mean(value):.4f}, Std: {np.std(value):.4f}")

analyze_features(user_data, test_schedule_data)

# Step 10: Suggest improvements (cập nhật)
def suggest_improvements(hit_rate_train, mrr_train, hit_rate_test, mrr_test):
    print("\nImprovement suggestions based on performance:")
    if hit_rate_train < 0.3:
        print("- Low training performance. Try:")
        print("  + Increase total_timesteps (currently 500000).")
        print("  + Add contextual features (e.g., time, location).")
        print("  + Check tag and item distribution in training data.")
    if hit_rate_train > 0.5 and hit_rate_test < 0.3:
        print("- Model overfitting. Try:")
        print("  + Add regularization (e.g., dropout in policy network).")
        print("  + Increase exploration_fraction (currently 0.3).")
        print("  + Check distribution differences between train and test schedules.")
    if mrr_test < 0.3:
        print("- Low MRR, relevant schedules not ranked highly. Try:")
        print("  + Increase item_similarity weight in reward function.")
        print("  + Use a more complex model (e.g., DQN with dueling network).")
        print("  + Add pre-filtering based on similarity to reduce action space.")
    if hit_rate_test < 0.5:
        print("- Low test Hit Rate. Try:")
        print("  + Verify ground truth includes diverse schedules (currently top-10 per user).")
        print("  + Increase test data size or balance data.")
    print("- Ensure all 17 users × 40 schedules are evaluated during training.")
    print("- Check logs from evaluate_model to verify 10 schedules are returned per user.")

suggest_improvements(hit_rate_train, mrr_train, hit_rate_test, mrr_test)

if __name__ == "__main__":
    pass