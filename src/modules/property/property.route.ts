import express from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middleware/auth'; // Apnar auth middleware
import { Role } from '../../../generated/prisma/browser';

const router = express.Router();

// Publicly properties dekhate auth lagbe na
router.get('/properties', PropertyController.getAllProperties);
router.get('/properties/:propertyId', PropertyController.getPropertyById);


// Shudhu authenticated landlord-ra property korte parbe
router.post('/landlord/properties', auth( Role.LANDLORD ), PropertyController.createProperty);
router.put('/landlord/properties/:propertyId', auth( Role.LANDLORD ), PropertyController.updateProperty);
router.delete('/landlord/properties/:propertyId', auth( Role.LANDLORD ), PropertyController.deleteProperty);

export const PropertyRoutes = router;
