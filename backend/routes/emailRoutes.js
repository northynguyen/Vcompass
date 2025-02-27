import express from 'express';
import {  sendPasswordReset ,sendEmailTripmate} from '../controllers/emailController.js';

const emailRouter = express.Router();


emailRouter.post('/password',  sendPasswordReset);
emailRouter.post('/invite',  sendEmailTripmate);

export default emailRouter