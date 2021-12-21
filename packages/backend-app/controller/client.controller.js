const ClientModel = require('../models/client.model');
const ChangeTracking = require('../models/ChangeTracking.model');
const GoDaddyAPI = require('../config/godaddy');
const _ = require('lodash');
const { mapClients, mapClient } = require('../map/clients');
const { getObjectId, createSearchQuery } = require('../utils/helper');

exports.get = async (req, res) => {
  try {
    const query = buildQuery(req);

    let clients = [];

    if (query.$and.length > 0) {
      clients = await ClientModel.find(query)
        .populate('created_by')
        .populate('updated_by')
        .sort({ updatedAt: -1 });
    } else {
      clients = await ClientModel.find()
        .populate('created_by')
        .populate('updated_by')
        .sort({ updatedAt: -1 });
    }

    res.json(mapClients(clients));
  } catch (error) {
    console.log('get', error);
    res.status(500).send(error);
  }
};

const buildQuery = (req) => {
  let query = { $and: [] };

  if (req.query.id) {
    query.$and.push({ _id: getObjectId(req.query.id) });
  }

  if (req.query.accessId) {
    query.$and.push({ accessId: getObjectId(req.query.accessId) });
  }

  if (req.query.item_id) {
    query.$and.push({ linkedItems: getObjectId(req.query.item_id) });
  }

  if (req.query.name) {
    query.$and.push({ name: { $regex: new RegExp(`${req.query.name}`, 'i') } });
  }

  if (req.query.full_search) {
    query.$and.push(createSearchQuery(req.query.full_search, ['name']));
  }

  return query;
};

exports.upsert = async (req, res) => {
  try {
    let client = await ClientModel.findById(req.body.id);

    if (client) {
      req.body.updated_by = req.user.id;
      client = await ClientModel.findByIdAndUpdate(
        req.body.id,
        { $set: req.body },
        { new: true }
      );
    } else {
      req.body.created_by = req.user.id;
      req.body.updated_by = req.user.id;
      client = await ClientModel.create(req.body);
    }

    const changeTracking = new ChangeTracking({
      client: req.body.id,
      update: client,
      model: 'Client',
      updateType: 'Upsert',
      updatedObject: req.body.id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(mapClient(client));
  } catch (error) {
    console.log('upsert', error);
    res.status(500).send(error);
  }
};

exports.createPersonalSubdomain = async (req, res) => {
  try {
    const client = await ClientModel.findOne({
      $and: [
        {
          _id: {
            $ne: req.params.id
          }
        },
        { domain_name: req.body.domain_name }
      ]
    });

    if (req.body.domain_name && client) {
      return res.send({
        success: true,
        message: 'Website Name already taken',
        isWebsiteNameAvailable: false
      });
    }

    const currentClient = await ClientModel.findById(req.params.id);
    let subdomain;
    if (_.get(currentClient, 'domain_name', '').length > 0) {
      //check if old subdmain exsits
      const isSubDomainAlreadyExist = await GoDaddyAPI.isSubDomainAlreadyExist({
        name: currentClient.domain_name
      });
      if (isSubDomainAlreadyExist) {
        let recordList = await GoDaddyAPI.getSubdomains();

        if (req.body.is_domain_active) {
          recordList = recordList.map((record) => {
            if (record.name === currentClient.domain_name) {
              return {
                ...record,
                name: req.body.domain_name
              };
            } else {
              return record;
            }
          });
        } else {
          recordList = recordList.filter((record) => {
            if (record.name === currentClient.domain_name) {
              return false;
            } else {
              return true;
            }
          });
        }

        subdomain = await GoDaddyAPI.updateSubDomainName({ recordList });
        console.log('Updated domain', recordList);
      } else if (req.body.is_domain_active) {
        subdomain = await GoDaddyAPI.addNewSubdomain({
          name: req.body.domain_name
        });
        console.log('Added domain', subdomain);
      }
    } else if (req.body.is_domain_active) {
      subdomain = await GoDaddyAPI.addNewSubdomain({
        name: req.body.domain_name
      });
      console.log('Added domain', subdomain);
    }

    const updateClient = await ClientModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          is_domain_active: req.body.is_domain_active,
          domain_name: req.body.domain_name
        }
      },
      { new: true }
    );

    res.send({
      success: true,
      message: 'Domain created successfully',
      isWebsiteNameAvailable: false
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Unable to process your request' });
  }
};
