import torch
import torch.nn as nn

class ETALSTM(nn.Module):
    def __init__(self, input_size=4, hidden_size=16, num_layers=1):
        super(ETALSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1) # Output: Minutes remaining

    def forward(self, x):
        # x shape: (batch, seq_len, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # Take last time step
        out = self.fc(out[:, -1, :])
        return out
