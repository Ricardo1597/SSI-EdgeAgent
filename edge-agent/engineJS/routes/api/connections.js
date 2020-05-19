// const express = require('express');
// const router = express.Router();
// const { check, validationResult } = require('express-validator');

// const agentService = require('../../services/AgentService');


// // Get all connections
// router.get('/', async (req, res, next) => {
//     const allConnections = await agentService.getConnections();

//     res.status(200).send({allConnections});
// });

// // Get active connections
// router.get('/active', async (req, res, next) => {
//     const allConnections = await agentService.getConnections();
//     const connections = allConnections.filter(connection => connection.state === 'active' || connection.state === 'request');

//     res.status(200).send({connections});
// });

// // Get pending connections
// router.get('/pending', async (req, res, next) => {
//     const allConnections = await agentService.getConnections();
//     const connections = allConnections.filter(connection => connection.state === 'invitation');

//     res.status(200).send({connections});
// });

// // Create invitation
// router.post('/new', async (req, res, next) => {

//     const invitation = await agentService.createInvitation();
//     if (invitation) {
//         invitation.invitation = JSON.stringify(invitation.invitation, null, 4);
//     }
//     res.status(200).send({invitation: invitation});
// });

// // Accept invitation
// router.post('/accept', [
//     check('invitation_object')
//         .notEmpty()
//         .withMessage('Invitation object is required'),
//     check('invitation_object')
//         .custom((value) => {
//             try {
//                 JSON.parse(value);
//                 return true;
//               } catch (error) {
//                   throw new Error(`Invalid object: ${error.message}`);
//               }
//         })
// ], async (req, res, next) => {

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         req.errors = errors.array({ onlyFirstError: true });
//         req.invitaion = req.body;
//         return res.status(422).send({
//             errors: req.errors || null,
//             invitation: req.invitation
//         });
//     }

//     await agentService.receiveInvitation(req.body.invitation_object);
//     res.status(201).send('Connection established.');
// });

// // Remove connection
// router.get('/remove/:id', async (req, res, next) => {
//     const connectionId = req.params.id;

//     if (connectionId) {
//         await agentService.removeConnection(connectionId);
//     }
// });


// module.exports = router;