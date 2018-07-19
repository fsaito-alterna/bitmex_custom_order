'use strict'

const ObjectID = require('bson-objectid')
const { group_id, root_key } = require('config').dodai
const { get, post, delete_ } = require('../../lib/dodai')

const listBlocks = (req, res) => {
  const reqQuery = buildReqQuery(req.query)
  get(`/${group_id}/data/block`, reqQuery, root_key).then(({ status, body }) => {
    if (status === 200) {
      res.status(200).json({ blocks: body.map(fromDataEntity) })
    } else {
      res.status(status).json(body)
    }
  })
}

const buildReqQuery = (query) => {
  let reqQuery = {}
  if (query.toolId) {
    // Exact-match for toolId in prefix of _id
    reqQuery['_id'] = { '$regex': `^${query.toolId}-` }
  }
  if (query.sdkVersion) {
    // Assuming semantic versioning is used for `sdkVersion`; though their string-based comparison is inaccurate. See swagger.yaml
    reqQuery['data.sdkVersion'] = { '$lte': query.sdkVersion }
  }
  if (query.deviceId) { reqQuery['data.deviceId'] = query.deviceId }
  if (query.vendorId) { reqQuery['data.vendorId'] = query.vendorId }
  if (query.blockType) { reqQuery['data.blockType'] = query.blockType }
  if (Object.keys(reqQuery).length === 0) {
    return {}
  } else {
    return { query: JSON.stringify(reqQuery) }
  }
}

const postBlock = (req, res) => {
  const reqBody = toCreateReqBody(req.body)
  post(`/${group_id}/data/block`, reqBody, root_key).then(({ status, body }) => {
    if (status === 201) {
      res.status(201).json(fromDataEntity(body))
    } else {
      res.status(status).json(body)
    }
  })
}

const toCreateReqBody = (reqBody) => {
  const blockId = generateBlockId(reqBody.toolId)
  delete reqBody.toolId
  return { _id: blockId, data: reqBody }
}

// Note: in prototype, we do not check existence of toolId
const generateBlockId = (toolId) => `${toolId}-${ObjectID()}`

const fromDataEntity = ({ _id, data }) => {
  const [toolId] = _id.split('-')
  return Object.assign({}, data, { id: _id, toolId: toolId })
}

const getBlock = (req, res) => {
  const id = req.swagger.params.id.value
  get(`/${group_id}/data/block/${id}`, {}, root_key).then(({ status, body }) => {
    if (status === 200) {
      res.status(200).json(fromDataEntity(body))
    } else {
      res.status(status).json(body)
    }
  })
}

const deleteBlock = (req, res) => {
  const id = req.swagger.params.id.value
  delete_(`/${group_id}/data/block/${id}`, {}, root_key).then(({ status, body }) => {
    if (status === 204) {
      res.status(204).end()
    } else {
      res.status(status).json(body)
    }
  })
}

module.exports = {
  listBlocks,
  postBlock,
  getBlock,
  deleteBlock
}
