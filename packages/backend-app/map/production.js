const isArray = require('lodash/isArray');
const get = require('lodash/get');


exports.mapProductions = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapProduction(item)
        })
    }
    else {
        return []
    }
}

exports.mapProduction = (item = {}) => {
    if (item === null) {
        return {}
    }

    return {
        id: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        factory_name: get(item, 'factory_id.name', ''),
        factory_id: get(item, 'factory_id._id', ''),
        created_by_name: get(item, 'created_by.name', ''),
        created_by: get(item, 'created_by._id', ''),
        is_archived: item.is_archived,
        item_id: item.item_id,
        productionApprovedBy: mapUserInfo(item.productionApprovedBy),
        isApprovedforProduction: item.isApprovedforProduction,
        approval_list: mapApprovalList(item.approval_list)
    }
}


const mapUserInfo = (user) => {

    if (!user || user === null) {
        return null;
    }

    return {
        name: user.name,
        email: user.email,
        id: user._id
    }
}


exports.mapProductionsForItem = (data) => {
    if (isArray(data)) {
        return data
            .filter(item => item.item_id)
            .map((item, index) => {
                return mapProductionForItem(item)
            })
    }
    else {
        return []
    }
}

const mapProductionForItem = (value) => {
    return {
        _id: value.item_id._id,
        name: value.item_id.name,
        source: value.item_id.source,
        production_name: value.name,
        production_id: value.id,
        isApprovedforProduction: value.isApprovedforProduction,
        approval_list: mapApprovalList(value.approval_list)
    }
}

const mapApprovalList = (approvalList) => {
    if (!approvalList) {
        return []
    }

    return approvalList
        .filter(item => item.author)
        .map(item => {
            return {
                author: item.author._id,
                author_name: item.author.name,
                approval_time: item.time,
                is_checked: item.isApproved
            }
        })

}