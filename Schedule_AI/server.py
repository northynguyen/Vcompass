from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from stable_baselines3 import DQN
from utils import load_input, preprocess_users, preprocess_schedules, create_state, TravelRecommendationEnv
from sklearn.metrics.pairwise import cosine_similarity

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

    # Check number of schedules and users
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
    max_attempts = top_k * 5  # Increase attempts to avoid duplicates

    for attempt in range(max_attempts):
        if len(recommended_indices) >= top_k:
            break
        action, _ = model.predict(state, deterministic=True)
        action = int(action)
        schedule_idx = valid_schedule_indices[action % len(valid_schedule_indices)]
        schedule = schedules[schedule_idx]
        # Skip schedules with matching userId
        if schedule.get('userId') == request.userId:
            print(f"Iteration {attempt+1}: Skipped schedule_idx={schedule_idx}, scheduleId={schedule['scheduleId']} (matches userId)")
            continue
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

        tag_similarities = cosine_similarity([user_tags], schedule_data['schedule_tags'])[0]
        item_similarities = cosine_similarity([user_prefs], schedule_data['schedule_items'])[0]
        feature_diffs = np.array([np.abs(user_features - schedule_data['schedule_features'][i]).sum() for i in range(len(schedules))])
        feature_rewards = 1.0 - feature_diffs / 2.0
        combined_scores = 0.5 * tag_similarities + 0.5 * item_similarities + 0.2 * feature_rewards

        available_indices = [
            i for i in range(len(schedules)) 
            if i not in recommended_indices and schedules[i].get('userId') != request.userId
        ]
        sorted_indices = sorted(available_indices, key=lambda i: combined_scores[i], reverse=True)
        for idx in sorted_indices[:remaining_k]:
            recommended_indices.append(idx)
            print(f"Iteration {len(recommended_indices)}: Selected schedule_idx={idx}, scheduleId={schedules[idx]['scheduleId']} (Cosine Similarity)")

    # Convert indices to schedule IDs
    total_schedules = len(recommended_indices)
    recommended_schedule_ids = [schedules[idx]['scheduleId'] for idx in recommended_indices]
    
    # Log results
    print(f"User {request.userId}: {total_schedules} schedules returned: {recommended_schedule_ids}")
    
    # Check if not enough schedules
    if total_schedules == 0:
        print(f"Warning: No schedules available for user {request.userId}")
        raise HTTPException(status_code=400, detail="No schedules available")
    if total_schedules < request.topK:
        print(f"Warning: Only {total_schedules} schedules returned instead of {request.topK} for user {request.userId}")

    # Return response
    return RecommendationResponse(
        status="success",
        recommendedSchedules=recommended_schedule_ids,
        totalSchedules=total_schedules
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)