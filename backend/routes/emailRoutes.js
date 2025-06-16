import express from 'express';
import {  sendPasswordReset ,sendEmailTripmate,sendEmailBlockStatus} from '../controllers/emailController.js';

const emailRouter = express.Router();


emailRouter.post('/password',  sendPasswordReset);
emailRouter.post('/invite',  sendEmailTripmate);
emailRouter.post('/user/status',sendEmailBlockStatus);
export default emailRouter