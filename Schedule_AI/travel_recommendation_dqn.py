import numpy as np
from sklearn.model_selection import train_test_split
from stable_baselines3 import DQN
from utils import load_input, preprocess_users, preprocess_schedules, create_state, TravelRecommendationEnv
from sklearn.metrics.pairwise import cosine_similarity
import uuid

class Analyzer:
    @staticmethod
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
            max_attempts = max_recommendations * 5  # Increase attempts to avoid duplicates
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

    @staticmethod
    def create_ground_truth(users, schedules, user_data, schedule_data, top_n=10):
        ground_truth = {user['userId']: [] for user in users}
        for user_idx, user in enumerate(users):
            user_id = user['userId']
            user_tags = user_data['user_tags'][user_idx]
            user_prefs = user_data['user_preferences'][user_idx]
            user_features = user_data['user_features'][user_idx][1:3]  # averageDays, averageCost

            tag_similarities = cosine_similarity([user_tags], schedule_data['schedule_tags'])[0]
            item_similarities = cosine_similarity([user_prefs], schedule_data['schedule_items'])[0]
            feature_diffs = np.array([np.abs(user_features - schedule_data['schedule_features'][i]).sum() for i in range(len(schedules))])
            feature_rewards = 1.0 - feature_diffs / 2.0
            combined_scores = 0.5 * tag_similarities + 0.5 * item_similarities + 0.2 * feature_rewards

            top_indices = np.argsort(combined_scores)[::-1][:top_n]
            top_schedule_ids = [schedules[idx]['scheduleId'] for idx in top_indices]
            ground_truth[user_id] = top_schedule_ids
            print(f"User {user_id}: Assigned {len(top_schedule_ids)} ground truth schedules: {top_schedule_ids}")

        return ground_truth

    @staticmethod
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

    @staticmethod
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

    @staticmethod
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

# Main execution
if __name__ == "__main__":
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

    # Create and debug ground truth
    train_ground_truth = Analyzer.create_ground_truth(users, train_schedules, user_data, train_schedule_data, top_n=10)
    test_ground_truth = Analyzer.create_ground_truth(users, test_schedules, user_data, test_schedule_data, top_n=10)
    filtered_train_ground_truth = Analyzer.debug_ground_truth(users, train_schedules, train_ground_truth, is_test=False)
    filtered_test_ground_truth = Analyzer.debug_ground_truth(users, test_schedules, test_ground_truth, is_test=True)

    # Train model
    env = TravelRecommendationEnv(user_data, train_schedule_data, train_schedules, max_schedules, users, schedules)
    model = DQN(
        policy="MlpPolicy",
        env=env,
        learning_rate=1e-4,
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
    model.learn(total_timesteps=10000)
    model.save("../Schedule_AI/dqn_travel_recommendation_train")

    # Evaluate on training set
    print("\nEvaluating on training set:")
    model = DQN.load("../Schedule_AI/dqn_travel_recommendation_train")
    hit_rate_train, mrr_train = Analyzer.evaluate_model(
        model, users, train_schedules, user_data, train_schedule_data, filtered_train_ground_truth, top_k=10, max_schedules=max_schedules
    )
    print(f"Training Hit Rate: {hit_rate_train:.4f}")
    print(f"Training MRR: {mrr_train:.4f}")

    # Evaluate on test set
    print("\nEvaluating on test set:")
    hit_rate_test, mrr_test = Analyzer.evaluate_model(
        model, users, test_schedules, user_data, test_schedule_data, filtered_test_ground_truth, top_k=10, max_schedules=max_schedules
    )
    print(f"Test Hit Rate: {hit_rate_test:.4f}")
    print(f"Test MRR: {mrr_test:.4f}")

    # Test reward function
    print("\nTesting reward function for all user-schedule pairs:")
    env = TravelRecommendationEnv(user_data, test_schedule_data, test_schedules, max_schedules, users, schedules)
    for user_idx, user in enumerate(users):
        user_id = user['userId']
        true_schedules = filtered_test_ground_truth.get(user_id, [])
        print(f"Testing rewards for user {user_id}, Ground truth: {true_schedules}")
        for schedule_idx, schedule in enumerate(test_schedules):
            env.suggested_schedules = np.zeros(env.max_schedules, dtype=np.float32)
            reward = env.calculate_reward(user_idx, schedule_idx, env.suggested_schedules)
            schedule_id = test_schedules[schedule_idx]['scheduleId']
            is_ground_truth = schedule_id in filtered_test_ground_truth.get(user_id, [])
            print(f"User {user_id}, Schedule {schedule_id}, Reward: {reward:.4f}, Ground truth: {is_ground_truth}")

    # Analyze features
    Analyzer.analyze_features(user_data, test_schedule_data)

    # Suggest improvements
    Analyzer.suggest_improvements(hit_rate_train, mrr_train, hit_rate_test, mrr_test)