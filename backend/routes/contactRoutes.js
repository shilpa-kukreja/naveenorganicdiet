import exprees from 'express';
import { addContact, deleteContact, getContacts } from '../controllers/contactControllers.js';


const contactRouter = exprees.Router();

contactRouter.post('/contact', addContact);
contactRouter.get('/contacts', getContacts);
contactRouter.delete('/contact/:id', deleteContact);

export default contactRouter;