import express from 'express';
import {  sendPasswordReset } from '../controllers/emailController.js';

const emailRouter = express.Router();


emailRouter.post('/password',  sendPasswordReset);

export default emailRouter