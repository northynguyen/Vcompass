import express from 'express';
import { addActivityLog } from '../controllers/activityLogController.js';

const activityLogrouter = express.Router();

activityLogrouter.post('/', addActivityLog);

export default activityLogrouter; 