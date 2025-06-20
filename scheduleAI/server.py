from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import os
from stable_baselines3 import DQN
from utils import load_input, preprocess_users, preprocess_schedules, create_state, TravelRecommendationEnv
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder
from collections import Counter
import glob

app = FastAPI()

# Pydantic model for request body
class UserRequest(BaseModel):
    userId: str
    topK: int = 30  # Default to 10 schedules

# Pydantic model for response
class RecommendationResponse(BaseModel):
    status: str
    recommendedSchedules: List[str]
    totalSchedules: int

# Create a default user profile for new users
def create_default_user(user_data, users):
    # Helper function to clean numerical field and replace None with 0
    def clean_numerical_field(values, field_name):
        cleaned = []
        none_count = 0
        for v in values:
            if v is None:
                none_count += 1
                cleaned.append(0)
            else:
                cleaned.append(v)
        if none_count > 0:
            print(f"Warning: Found {none_count} None values in {field_name}")
        return np.array(cleaned, dtype=np.float32).reshape(-1, 1)

    # Extract and clean numerical fields
    ages = clean_numerical_field([u.get('age', 0) for u in users], 'age')
    average_days = clean_numerical_field([u.get('averageDays', 0) for u in users], 'averageDays')
    average_costs = clean_numerical_field([u.get('averageCost', 0) for u in users], 'averageCost')
    num_restaurants = clean_numerical_field([u.get('numRestaurants', 0) for u in users], 'numRestaurants')
    num_accommodations = clean_numerical_field([u.get('numAccommodations', 0) for u in users], 'numAccommodations')
    num_attractions = clean_numerical_field([u.get('numAttractions', 0) for u in users], 'numAttractions')

    # Use most common gender and address
    genders = [u.get('gender', 'unknown') for u in users]
    addresses = [u.get('address', 'unknown') for u in users]
    none_gender_count = sum(1 for g in genders if g is None)
    none_address_count = sum(1 for a in addresses if a is None)
    if none_gender_count > 0:
        print(f"Warning: Found {none_gender_count} None values in gender")
    if none_address_count > 0:
        print(f"Warning: Found {none_address_count} None values in address")
    genders = ['unknown' if g is None else g for g in genders]
    addresses = ['unknown' if a is None else a for a in addresses]
    most_common_gender = max(set(genders), key=genders.count, default='unknown')
    most_common_address = max(set(addresses), key=addresses.count, default='unknown')

    # Create default feature vector (all 2D arrays)
    default_features = np.concatenate([
        np.median(ages).reshape(1, -1),  # Shape: (1, 1)
        np.median(average_days).reshape(1, -1),  # Shape: (1, 1)
        np.median(average_costs).reshape(1, -1),  # Shape: (1, 1)
        np.median(num_restaurants).reshape(1, -1),  # Shape: (1, 1)
        np.median(num_accommodations).reshape(1, -1),  # Shape: (1, 1)
        np.median(num_attractions).reshape(1, -1),  # Shape: (1, 1)
        user_data['gender_encoder'].transform([[most_common_gender]]).astype(np.float32),  # Shape: (1, k)
        user_data['address_encoder'].transform([[most_common_address]]).astype(np.float32)  # Shape: (1, m)
    ], axis=1).astype(np.float32)  # Concatenate along axis=1

    # Create default preference and tag vectors (zeros, assuming no prior preferences)
    default_prefs = np.zeros(user_data['user_preferences'].shape[1], dtype=np.float32)
    default_tags = np.zeros(user_data['user_tags'].shape[1], dtype=np.float32)

    # Set most common tags (e.g., top 5 tags across users)
    all_tags = []
    for user in users:
        tags = user.get('topTags', [])
        if tags is None:
            print("Warning: Found None in topTags for a user")
            continue
        all_tags.extend(tags)
    common_tags = [tag for tag, _ in Counter(all_tags).most_common(5)]
    for tag in common_tags:
        if tag in user_data['tag_map']:
            default_tags[user_data['tag_map'][tag]] = 1

    return {
        'features': default_features,
        'preferences': default_prefs,
        'tags': default_tags
    }

# API endpoint to get all recommended schedules
@app.post("/recommend_schedules/", response_model=RecommendationResponse)
async def recommend_schedules(request: UserRequest):
    # Validate topK
    if request.topK < 1:
        raise HTTPException(status_code=400, detail="topK must be at least 1")

    # Load data
    data = load_input()
    users = data['users']
    schedules = data['schedules']
    max_schedules = len(schedules)
    
    # Check if data is loaded successfully
    if not users:
        raise HTTPException(status_code=500, detail="No user data available - failed to load ALL_users.json")
    if not schedules:
        raise HTTPException(status_code=500, detail="No schedule data available - failed to load All_schedules.json")
    
    print(f"Loaded {len(users)} users and {len(schedules)} schedules")

    # Preprocess data
    user_data = preprocess_users(users)
    user_data['gender_encoder'] = OneHotEncoder(sparse_output=False, handle_unknown='ignore').fit([[u.get('gender', 'unknown')] for u in users])
    user_data['address_encoder'] = OneHotEncoder(sparse_output=False, handle_unknown='ignore').fit([[u.get('address', 'unknown')] for u in users])
    schedule_data = preprocess_schedules(
        schedules, 
        user_data['restaurant_id_map'], 
        user_data['accommodation_id_map'],
        user_data['attraction_id_map'], 
        user_data['tag_map']
    )

    # Find user index or create default user
    user_ids = user_data['user_ids']
    is_new_user = request.userId not in user_ids
    if is_new_user:
        print(f"New user {request.userId}: Creating default user profile")
        default_user = create_default_user(user_data, users)
        user_idx = len(user_ids)  # Temporary index
        user_data['user_features'] = np.vstack([user_data['user_features'], default_user['features']])
        user_data['user_preferences'] = np.vstack([user_data['user_preferences'], default_user['preferences']])
        user_data['user_tags'] = np.vstack([user_data['user_tags'], default_user['tags']])
        user_data['user_ids'].append(request.userId)
    else:
        try:
            user_idx = user_ids.index(request.userId)
        except ValueError:
            raise HTTPException(status_code=404, detail=f"User {request.userId} not found")

    # Load trained model
    try:
        # Try relative path first, then absolute path for production
        model_paths = [
            "dqn_travel_recommendation_train",  # Same directory
            "./dqn_travel_recommendation_train",  # Explicit current directory
            "../Schedule_AI/dqn_travel_recommendation_train",  # Parent directory
            "/opt/render/project/src/Schedule_AI/dqn_travel_recommendation_train"  # Render absolute path
        ]
        
        model = None
        for path in model_paths:
            try:
                model = DQN.load(path)
                print(f"Successfully loaded model from: {path}")
                break
            except:
                continue
        
        if model is None:
            raise Exception("Could not load model from any path")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")

    # Create environment
    all_schedule_ids = {s['scheduleId']: idx for idx, s in enumerate(schedules)}
    valid_schedule_indices = [
        idx for idx, s in enumerate(schedules) 
        if s.get('userId') != request.userId
    ]
    print(f"Valid schedule indices: {len(valid_schedule_indices)} schedules available after filtering")

    if not valid_schedule_indices:
        print(f"Warning: No valid schedules available for user {request.userId}")
        raise HTTPException(status_code=400, detail="No schedules available after filtering")

    env = TravelRecommendationEnv(
        user_data, 
        schedule_data, 
        schedules, 
        max_schedules, 
        users, 
        schedules,
        valid_schedule_indices=valid_schedule_indices
    )

    # Generate recommendations using DQN with reward scoring
    env.current_user_idx = user_idx
    env.suggested_schedules = np.zeros(max_schedules, dtype=np.float32)
    state = create_state(
        user_idx, 
        valid_schedule_indices[0], 
        env.suggested_schedules, 
        user_data, 
        schedule_data
    )

    recommendations = []
    top_k = min(request.topK, len(valid_schedule_indices))
    max_attempts = top_k * 5

    for attempt in range(max_attempts):
        if len(recommendations) >= top_k:
            break
        action, _ = model.predict(state, deterministic=True)
        action = int(action)
        schedule_idx = valid_schedule_indices[action % len(valid_schedule_indices)]
        if schedule_idx < len(schedules) and schedule_idx not in [r['index'] for r in recommendations]:
            # Calculate reward for sorting
            reward = env.calculate_reward(user_idx, schedule_idx, env.suggested_schedules)
            recommendations.append({
                'index': schedule_idx,
                'scheduleId': schedules[schedule_idx]['scheduleId'],
                'reward': reward
            })
            env.suggested_schedules[schedule_idx] = 1
            print(f"Iteration {len(recommendations)}: Selected schedule_idx={schedule_idx}, scheduleId={schedules[schedule_idx]['scheduleId']}, Reward={reward:.4f} (DQN)")
        else:
            print(f"Iteration {attempt+1}: Skipped schedule_idx={schedule_idx} (already selected or invalid)")
        state = create_state(
            user_idx, 
            schedule_idx if schedule_idx < len(schedules) else valid_schedule_indices[0], 
            env.suggested_schedules, 
            user_data, 
            schedule_data
        )

    # Fallback: Use cosine similarity if not enough schedules
    if len(recommendations) < top_k:
        print(f"Warning: DQN only selected {len(recommendations)} schedules, using cosine similarity for remaining")
        remaining_k = top_k - len(recommendations)
        user_tags = user_data['user_tags'][user_idx]
        user_prefs = user_data['user_preferences'][user_idx]
        user_features = user_data['user_features'][user_idx][1:3]

        tag_similarities = cosine_similarity([user_tags], schedule_data['schedule_tags'])[0]
        item_similarities = cosine_similarity([user_prefs], schedule_data['schedule_items'])[0]
        feature_diffs = np.array([np.abs(user_features - schedule_data['schedule_features'][i]).sum() for i in range(len(schedules))])
        feature_rewards = 1.0 - feature_diffs / 2.0
        combined_scores = 0.5 * tag_similarities + 0.5 * item_similarities + 0.2 * feature_rewards

        available_indices = [
            i for i in valid_schedule_indices 
            if i not in [r['index'] for r in recommendations]
        ]
        scored_indices = [
            {'index': i, 'score': combined_scores[i]} 
            for i in available_indices
        ]
        scored_indices.sort(key=lambda x: x['score'], reverse=True)
        for item in scored_indices[:remaining_k]:
            # Use reward function for consistency
            reward = env.calculate_reward(user_idx, item['index'], env.suggested_schedules)
            recommendations.append({
                'index': item['index'],
                'scheduleId': schedules[item['index']]['scheduleId'],
                'reward': reward
            })
            env.suggested_schedules[item['index']] = 1
            print(f"Iteration {len(recommendations)}: Selected schedule_idx={item['index']}, scheduleId={schedules[item['index']]['scheduleId']}, Reward={reward:.4f} (Cosine Similarity)")

    # Sort recommendations by reward in descending ordervalidindigo_schedule_indices
    recommendations.sort(key=lambda x: x['reward'], reverse=True)
    recommended_schedule_ids = [r['scheduleId'] for r in recommendations]
    total_schedules = len(recommended_schedule_ids)

    # Log results
    print(f"User {request.userId} ({'new' if is_new_user else 'existing'}): {total_schedules} schedules returned: {recommended_schedule_ids}")
    if total_schedules < request.topK:
        print(f"Warning: Only {total_schedules} schedules returned instead of {request.topK} for user {request.userId}")

    # Return response
    return RecommendationResponse(
        status="success",
        recommendedSchedules=recommended_schedule_ids,
        totalSchedules=total_schedules
    )

# Debug endpoint to check file system
@app.get("/debug")
async def debug_info():
    import os
    import glob
    
    current_dir = os.getcwd()
    
    # Get all files recursively
    all_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            all_files.append(os.path.join(root, file))
    
    # Look specifically for JSON files
    json_files = glob.glob('**/*.json', recursive=True)
    
    debug_info = {
        "current_working_directory": current_dir,
        "files_in_current_directory": os.listdir("."),
        "all_files_recursive": all_files,
        "json_files_found": json_files,
        "environment": {
            "PORT": os.environ.get("PORT", "Not set"),
            "PYTHONPATH": os.environ.get("PYTHONPATH", "Not set")
        }
    }
    
    # Check specific paths
    paths_to_check = [
        'ALL_users.json',
        'All_schedules.json',
        '../Schedule_AI/ALL_users.json',
        'Schedule_AI/ALL_users.json',
        './ALL_users.json',
        './All_schedules.json'
    ]
    
    path_status = {}
    for path in paths_to_check:
        exists = os.path.exists(path)
        path_status[path] = {
            "exists": exists,
            "is_file": os.path.isfile(path) if exists else False,
            "size": os.path.getsize(path) if exists else 0
        }
    
    debug_info["path_existence"] = path_status
    
    # Check if we're in the right directory by looking for server.py
    debug_info["expected_files"] = {
        "server.py": os.path.exists("server.py"),
        "utils.py": os.path.exists("utils.py"),
        "requirements.txt": os.path.exists("requirements.txt")
    }
    
    return debug_info

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)