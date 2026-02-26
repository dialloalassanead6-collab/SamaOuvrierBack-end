// server.ts
import app from './app.js';
import dotenv from 'dotenv';
import { PORT } from './shared/config/index.js';

dotenv.config();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});