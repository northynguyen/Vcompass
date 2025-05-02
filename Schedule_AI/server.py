from typing import Dict, List, Optional
from data_loader import load_input
import torch
from agent import ScheduleRLAgent
from analyzer import ScheduleAnalyzer
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from schedule_env import ScheduleEnv

app = FastAPI()

def load_model():
    return torch.load("model_RecommentSchedule.pth")

model = load_model()



from typing import List, Optional

from pydantic import BaseModel

# Định nghĩa các class khác để mô phỏng cấu trúc dữ liệu của bạn

class Activity(BaseModel):
    activityType: str
    idDestination: str
    cost: int

class DaySchedule(BaseModel):
    day: int
    activity: List[Activity]

class Schedule(BaseModel):
    _id: str
    idUser: str
    address: str
    numDays: int
    activities: List[DaySchedule]
    tags: List[str]

class InteractionSummary(BaseModel):
    scheduleId: str
    viewCount: int
    editCount: int
    tags: List[str]
    address: str
    _id: str
    name: str
    email: str
    phone_number: Optional[str] = ""
    address: str
    avatar: str
    date_of_birth: str
    gender: str
    password: str
    status: str
    createdAt: str
    updatedAt: str
    __v: int
    follower: List[str]
    following: List[str]

# Cấu trúc chính UserData
class UserData(BaseModel):
    userId: str
    schedules: list
    interactionSummary: list
    topTags: list

@app.post("/predict")
async def predict(data: UserData):
    user_schedule = data.schedules
    topTags = data.topTags
    interactionSummary= data.interactionSummary
    input_data = load_input()
    schedules = input_data['schedules']
    analyzer = ScheduleAnalyzer(user_schedule,None, None, interactionSummary, topTags)
    behavior = analyzer.behavior
    user_vector = analyzer.user_to_vector()

    env = ScheduleEnv(user_vector, schedules, behavior, None, None, analyzer)
    input_dim = len(user_vector) + len(analyzer.schedule_to_vector(schedules[0]))
    agent = ScheduleRLAgent(input_dim, env)

    # Tải trọng số của mô hình
    agent.q_net.load_state_dict(torch.load("model_RecommentSchedule.pth"))

    q_vals = []
    for i in range(len(env.schedules)):
        state = env.get_state_action_pair(i).unsqueeze(0)
        with torch.no_grad():
            q = agent.q_net(state).item()
        q_vals.append((i, q))

    # Sắp xếp theo giá trị q để lấy lịch hẹn top
    q_vals.sort(key=lambda x: x[1], reverse=True)

    top_schedules = []
    for idx, _ in q_vals:
        schedule = env.schedules[idx]
        id_user_in_schedule = schedule.get('idUser', {}).get('_id')
        if str(id_user_in_schedule) == str(data.userId):
            continue
        top_schedules.append(schedule)
        if len(top_schedules) == 10:
            break
    return {"status": "success", "recommendedSchedules": top_schedules}
