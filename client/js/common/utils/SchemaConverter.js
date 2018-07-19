/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';
import bluebird from 'bluebird';
/* eslint-disable */
function mapDeep(object, iteratee) {
  if (!_.isObject(object)) {
    // primitive types(no child)
    return iteratee(object);
  }
  // array or object
  const object2 = _.transform(object, (acc, value, keyOrIndex) => {
    acc[keyOrIndex] = mapDeep(value, iteratee);
  });
  return iteratee(object2);
}

class SchemaConverter {
  // convert required
  //   input: http://tools.ietf.org/html/draft-fge-json-schema-validation-00
  //   output: https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03
  static convertRequired(baseSchema) {
    return mapDeep(baseSchema, (schema) => {
      if (_.isObject(schema) && !_.isArray(schema)) {
        if (schema.type === 'object' && _.isArray(schema.required)) {
          const properties = _.transform(schema.required, (acc, name) => {
            if (!_.has(acc, name)) {
              console.warn('no property specified by required', schema, name);
            }
            acc[name] = _.assign({}, acc[name], {required: true});
          }, _.clone(schema.properties));
          return _.assign({}, _.omit(schema, 'required'), {properties: properties});
        }
      }
      return schema;
    });
  }

  // {"$ref": "x-ac://{collectionName}#{path}"}
  static createDerefOptions(itemMap) {
    const resolver = {
      order: 1,
      canRead: true,
      read: function (file, done) {
        let schema;
        const m = file.url.match(/^x-ac:\/\/(.+)/);
        if (m) {
          const name = m[1];
          schema = _.get(itemMap, [name, 'data']);
        }
        if (!schema) {
          console.error('unknown url', file.url);
          // return a empty schema to stop fallback to http, file
          done(null, {});
          return;
        }
        done(null, schema);
      },
    };
    const options = {
      resolve: {
        ac: resolver,
      },
    };
    return options;
  }

  // $ref
  static deref(schema, options) {
    return window.$RefParser.dereference(_.cloneDeep(schema), options);
  }

  static convertItems(items) {
    const itemMap = _.indexBy(items, '_id');
    const options = SchemaConverter.createDerefOptions(itemMap);
    return bluebird.map(items, (item) => {
      return SchemaConverter.deref(item.data, options)
      .then(SchemaConverter.convertRequired)
      .then((schema) => {
        return {_id: item._id, data: schema};
      });
    });
  }
}

export default SchemaConverter;
