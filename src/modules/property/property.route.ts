import express from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middleware/auth'; 
import { Role } from '../../../generated/prisma/enums';




const router = express.Router();


// Publicly Properties
router.get('/properties', PropertyController.getAllProperties);


// Only Authenticated Landlord
router.post('/landlord/properties', auth( Role.LANDLORD ), PropertyController.createProperty);
router.get('/landlord/properties', auth( Role.LANDLORD ), PropertyController.getAllProperties);
router.patch('/landlord/properties/isAvailable/:propertyId', auth( Role.LANDLORD ), PropertyController.toggleAvailability);
router.delete('/landlord/properties/:propertyId', auth( Role.LANDLORD ), PropertyController.deleteProperty);
router.put('/landlord/properties/:propertyId', auth( Role.LANDLORD ), PropertyController.updateProperty);



// Admin Properties 
router.get('/admin/properties', auth( Role.ADMIN ), PropertyController.getAllProperties);
// Change Property Status Only for Admin
router.patch(
    '/admin/properties/change-status/:propertyId', 
    auth(Role.ADMIN), 
    PropertyController.changePropertyStatus
);


// Dynamic Properties by Id
router.get('/properties/:propertyId', PropertyController.getPropertyById);


export const PropertyRoutes = router;
