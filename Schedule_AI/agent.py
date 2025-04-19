import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
import numpy as np

class QNetwork(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class ReplayMemory:
    def __init__(self, capacity=10000):
        self.memory = deque(maxlen=capacity)

    def push(self, transition):
        self.memory.append(transition)

    def sample(self, batch_size):
        return random.sample(self.memory, batch_size)

    def __len__(self):
        return len(self.memory)

class ScheduleRLAgent:
    def __init__(self, input_dim, env, lr=1e-3, gamma=0.9, epsilon=1.0, epsilon_min=0.05, epsilon_decay=0.995):
        self.q_net = QNetwork(input_dim)
        self.target_net = QNetwork(input_dim)
        self.target_net.load_state_dict(self.q_net.state_dict())
        self.optimizer = optim.Adam(self.q_net.parameters(), lr=lr)
        self.memory = ReplayMemory()
        self.env = env
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay

    def train(self, episodes=500, batch_size=64):
        update_target_every = 50
        step_count = 0

        for episode in range(episodes):
            done = False
            if random.random() < self.epsilon:
                action = random.randint(0, len(self.env.schedules) - 1)
            else:
                q_vals = []
                for i in range(len(self.env.schedules)):
                    state = self.env.get_state_action_pair(i).unsqueeze(0)
                    with torch.no_grad():
                        q = self.q_net(state).item()
                    q_vals.append(q)
                action = int(np.argmax(q_vals))

            state = self.env.get_state_action_pair(action).unsqueeze(0)
            reward, done = self.env.step(action)
            next_state = state  # nếu môi trường có thay đổi sau step thì chỉnh lại chỗ này

            self.memory.push((state, reward, next_state, done))

            if len(self.memory) >= batch_size:
                batch = self.memory.sample(batch_size)
                state_batch = torch.cat([b[0] for b in batch])
                reward_batch = torch.tensor([b[1] for b in batch], dtype=torch.float32)
                next_state_batch = torch.cat([b[2] for b in batch])
                done_batch = torch.tensor([b[3] for b in batch], dtype=torch.float32)

                q_values = self.q_net(state_batch).squeeze()
                next_q_values = self.target_net(next_state_batch).squeeze()
                target_q = reward_batch + self.gamma * next_q_values * (1 - done_batch)

                loss = nn.MSELoss()(q_values, target_q.detach())

                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()

            step_count += 1
            if step_count % update_target_every == 0:
                self.target_net.load_state_dict(self.q_net.state_dict())

            self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

            if episode % 10 == 0:
                print(f"Episode {episode}: Last reward {reward}, Epsilon {self.epsilon:.4f}")

    def save_model(self, path):
        """Lưu lại model vào file."""
        torch.save(self.q_net.state_dict(), path)
        print(f"Model saved to {path}")

    def load_model(self, path):
        """Load lại model từ file."""
        self.q_net.load_state_dict(torch.load(path))
        self.q_net.eval()
        print(f"Model loaded from {path}")
