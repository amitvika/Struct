const ClientModel = require("../models/client.model");
const ChangeTracking = require("../models/ChangeTracking.model");
const GoDaddyAPI = require('../config/godaddy');
const _ = require('lodash');
const { mapClients, mapClient } = require('../map/clients')
const { getObjectId } = require('../utils/helper')

exports.get = async (req, res) => {
    try {

        const query = buildQuery(req)

        let clients = [];

        if (query.$and.length > 0) {
            clients = await ClientModel.find(query)
                .populate("created_by")
                .populate("updated_by")
                .sort({ updatedAt: -1 })

        }
        else {
            clients = await ClientModel
                .find()
                .populate("created_by",)
                .populate("updated_by")
                .sort({ updatedAt: -1 })

        }

        res.json(mapClients(clients));

    }
    catch (error) {
        console.log('get', error)
        res.status(500).send(error)
    };
}


const buildQuery = (req) => {
    let query = { $and: [] };

    if (req.query.id) {
        query.$and.push({ _id: getObjectId(req.query.id) });
    }

    if (req.query.accessId) {
        query.$and.push({ accessId: getObjectId(req.query.accessId) });
    }

    if (req.query.item_id) {
        query.$and.push({ "linkedItems": getObjectId(req.query.item_id) });
    }

    if (req.query.name) {
        query.$and.push({ name: { '$regex': new RegExp(`${req.query.name}`, "i") } })
    }

    return query
}

exports.upsert = async (req, res) => {
    try {

        let client = await ClientModel.findById(req.body.id);

        if (client) {
            req.body.updated_by = req.user.id;
            client = await ClientModel.findByIdAndUpdate(
                req.body.id,
                { $set: req.body },
                { new: true });
        }
        else {
            req.body.created_by = req.user.id;
            req.body.updated_by = req.user.id;
            client = await ClientModel.create(req.body);
        }

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: client,
            model: "Client",
            updateType: "Upsert",
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        res.json(mapClient(client))
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}

// exports.get = async (req, res) => {
//     const access = req.access;
//     const userId = req.user.id;

//     try {
//         let query = { $and: [] };
// query.$and.push({
//     "deletedAt": { "$exists": false }
// });

// if (req.query.item_id) {
//     query.$and.push({
//         "linkedItems": req.query.item_id
//     });
// }

// const clients = await Client.find(query)
//     .populate("author", "name")
//     .sort({ createdAt: -1 }) //sorts descending

//         const filterClients = clients.filter(client => {
//             if (access[client._id] || (access.PGOA_3_V && String(userId) === String(client.author._id))) {
//                 return true;
//             }
//             return false
//         })
//             .map(client => ({
//                 _id: client._id,
//                 name: client.name,
//                 domain_name: client.domain_name,
//                 is_domain_active: client.is_domain_active,
//                 author: client.author,
//                 logoName: client.logoName,
//                 logoUrl: client.logoUrl ? `http://${req.headers.host}/logo/${client.logoName}` : ''
//             }))

//         res.json(filterClients)

//     } catch (error) {
//         return res
//             .status(500)
//             .send({ message: 'Some unexpected error occurred' })
//     }
// }

// exports.getOne = (req, res) => {
//     Client.findById(req.params.id)
//         .populate("author", "name")
//         .sort({ date: -1 })
//         .then(data => {
//             data.logoName = data.logoName;
//             data.logoUrl = data.logoUrl ? `http://${req.headers.host}/logo/${data.logoName}` : '';
//             data.linkedItems = data.linkedItems || []
//             res.json(data)
//         })
//         .catch(error => {
//             return res
//                 .status(500)
//                 .send({ message: 'Some unexpected error occurred' })
//         });
// }

// exports.create = async (req, res) => {
//     try {
//         const saveObject = {
//             name: req.body.name,
//             author: req.user.id
//         };
//         const client = new Client(saveObject);
//         let newClient = await client.save()


//         if (!newClient) {
//             throw { message: 'Unable to save client' }
//         }

//         newClient = await Client
//             .findById(newClient._id)
//             .populate("author", "name")

//         const changeTracking = new ChangeTracking({
//             client: newClient._id,
//             update: saveObject,
//             model: "Client",
//             updateType: "Create",
//             updatedObject: newClient._id,
//             updatedBy: req.user.id
//         });

//         await changeTracking.save();
//         res.json(newClient);
//     } catch (error) {
//         console.log(error)

//         return res
//             .status(500)
//             .send({ message: error.message })
//     }
// }

// exports.delete = (req, res) => {

//     let data = { isArchived: true }
//     Client.findByIdAndUpdate(req.params.id, { $set: data })
//         .then(() => {
//             const changeTracking = new ChangeTracking({
//                 client: req.params.id,
//                 update: data,
//                 model: "Client",
//                 updateType: "Delete",
//                 updatedObject: req.params.id,
//                 updatedBy: req.user.id
//             });
//             changeTracking.save().catch(error => console.log(error));

//             res.json({ success: true });
//         })
//         .catch(err => res.status(404).json({ success: false }));

// }

// exports.update = async (req, res) => {
//     const saveObject = {
//         name: req.body.name,
//         // domain_name: req.body.domain_name,
//         // is_domain_active: req.body.is_domain_active,
//         logoName: req.body.logoName,
//         logoUrl: req.body.logoUrl,
//         linkedItems: req.body.linkedItems
//     };

//     try {

//         const updateClient = await Client
//             .findByIdAndUpdate(req.params.id, { $set: saveObject }, { new: true })
//             .populate("author", "name")

//         const changeTracking = new ChangeTracking({
//             client: req.params.id,
//             update: updateClient,
//             model: "Client",
//             updateType: "Update",
//             updatedObject: req.params.id,
//             updatedBy: req.user.id
//         });

//         await changeTracking.save()

//         res.json(updateClient);

//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ success: false })
//     }
// }

exports.createPersonalSubdomain = async (req, res) => {

    try {

        const client = await ClientModel.findOne(
            {
                $and: [{
                    _id: {
                        $ne: req.params.id
                    }
                },
                { domain_name: req.body.domain_name }]
            });

        if (req.body.domain_name && client) {
            return res.send({ success: true, message: 'Website Name already taken', isWebsiteNameAvailable: false })
        }

        const currentClient = await ClientModel.findById(req.params.id);
        let subdomain;
        if (_.get(currentClient, 'domain_name', '').length > 0) {

            //check if old subdmain exsits
            const isSubDomainAlreadyExist = await GoDaddyAPI.isSubDomainAlreadyExist({ name: currentClient.domain_name });
            if (isSubDomainAlreadyExist) {

                let recordList = await GoDaddyAPI.getSubdomains();

                if (req.body.is_domain_active) {
                    recordList = recordList.map(record => {
                        if (record.name === currentClient.domain_name) {
                            return ({
                                ...record,
                                name: req.body.domain_name
                            })
                        }
                        else {
                            return record;
                        }
                    })
                }
                else {
                    recordList = recordList.filter(record => {
                        if (record.name === currentClient.domain_name) {
                            return false
                        }
                        else {
                            return true;
                        }
                    })
                }

                subdomain = await GoDaddyAPI.updateSubDomainName({ recordList });
                console.log('Updated domain', recordList)
            }
            else if (req.body.is_domain_active) {
                subdomain = await GoDaddyAPI.addNewSubdomain({ name: req.body.domain_name });
                console.log('Added domain', subdomain)
            }

        }
        else if (req.body.is_domain_active) {
            subdomain = await GoDaddyAPI.addNewSubdomain({ name: req.body.domain_name });
            console.log('Added domain', subdomain)
        }

        const updateClient = await ClientModel
            .findByIdAndUpdate(req.params.id, {
                $set: {
                    is_domain_active: req.body.is_domain_active,
                    domain_name: req.body.domain_name
                }
            }, { new: true })

        res.send({ success: true, message: 'Domain created successfully', isWebsiteNameAvailable: false })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Unable to process your request', })
    }

}
