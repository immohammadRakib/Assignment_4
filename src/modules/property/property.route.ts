import express from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middleware/auth'; // Apnar auth middleware
import { Role } from '../../../generated/prisma/browser';

const router = express.Router();

// Publicly properties dekhate auth lagbe na
router.get('/properties', PropertyController.getAllProperties);

// Shudhu authenticated landlord-ra post korte parbe
router.post('/landlord/properties', auth( Role.LANDLORD ), PropertyController.createProperty);

export const PropertyRoutes = router;
