import express from 'express';
import clientIdempotencyRouter from "./src/router/clientIdempotencyRouter.js";

const app = express();

const PORT = process.env.APP_PORT || 3000;

// To parse json
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API', version: '1.0.1',
  })
});

app.use('/', clientIdempotencyRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error', error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})