import { fetchAllUsers } from '#controllers/user.controller.js';
import express from 'express';

const router = express.Router();

router.get('/', fetchAllUsers);

router.get('/:id', (req, res) => {
  res.send('GET /users:/id');
});

router.put('/', (req, res) => {
  res.send('PUT /users/:id');
});

router.delete('/', (req, res) => {
  res.send('GET /users/:id');
});

export default router;
