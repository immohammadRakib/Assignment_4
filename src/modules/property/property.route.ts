import express from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middleware/auth'; // Apnar auth middleware
import { Role } from '../../../generated/prisma/enums';

const router = express.Router();

// Publicly properties dekhate auth lagbe na
router.get('/properties', PropertyController.getAllProperties);


// Shudhu authenticated landlord-ra property korte parbe
router.post('/landlord/properties', auth( Role.LANDLORD ), PropertyController.createProperty);
router.patch('/landlord/properties/isAvailable/:propertyId', auth( Role.LANDLORD ), PropertyController.toggleAvailability);
router.delete('/landlord/properties/:propertyId', auth( Role.LANDLORD ), PropertyController.deleteProperty);
router.put('/landlord/properties/:propertyId', auth( Role.LANDLORD ), PropertyController.updateProperty);


// Change Property Status Only for Admin
router.patch(
    '/admin/properties/change-status/:propertyId', 
    auth(Role.ADMIN), 
    PropertyController.changePropertyStatus
);


// Dynamic Properties by Id
router.get('/properties/:propertyId', PropertyController.getPropertyById);


export const PropertyRoutes = router;
