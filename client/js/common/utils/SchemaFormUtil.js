// @flow
import _ from 'lodash';

import LocaleHelper from './LocaleHelper';

type FieldOptions = {
  isRemovable?: boolean,
  isMovable?: boolean,
};

function sortProperties(schema: Object) {
  const xFieldOrder = schema['x-field-order'];
  const array = _.map(schema.properties, (value, id) => {
    return {id, value};
  });
  if (!xFieldOrder) {
    return array;
  }
  return _.sortBy(array, ({id}) => {
    const index = _.indexOf(xFieldOrder, id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  });
}

class CommonProperty {
  static getTitle(schema: Object): ?string {
    return _.get(schema, `x-title.${LocaleHelper.lang}`);
  }

  static getTitleMap(schema: Object): ?Object {
    return _.get(schema, `x-title-map.${LocaleHelper.lang}`);
  }

  static getButtonTitle(schema: Object): ?string {
    return _.get(schema, `x-schema-form.xButtonTitle.${LocaleHelper.lang}`);
  }

  static getXCol(schema: Object): ?string {
    return _.get(schema, 'x-col');
  }

  static appendItemsFieldIfNeeded(
    base: Object,
    value: Object,
    key: string,
    options: FieldOptions,
    iterator: Function,
  ): Object {
    if (value.type === 'array' && value.items && value.items.type === 'object') { // "items" is not array
      return {
        ...base,
        items: iterator(value.items, `${key}[]`, options),
      };
    } else if (value.properties) {
      return {
        ...base,
        items: _.flatMap(sortProperties(value), ({id, value: propertyValue}) => {
          return iterator(propertyValue, `${key}.${id}`, options);
        }),
      };
    }
    return base;
  }

  static createFields(value: Object, key: string): Array<Object> {
    const base = _.assign({
      key,
      notitle: true,
      title: this.getTitle(value),
      titleMap: this.getTitleMap(value),
      'x-hidden': value['x-hidden'],
      'x-col': this.getXCol(value),
    }, value['x-schema-show-form']);

    return [CommonProperty.appendItemsFieldIfNeeded(base, value, key, {}, CommonProperty.createFields)]; // eslint-disable-line no-use-before-define
  }

  static secretLevelLabelClass(value: Object): ?string {
    const level = value['x-secret-level'];
    if (!level) {
      return undefined;
    }
    return `label-secret-level-${level}`;
  }

  static createEditFields(value: Object, key: string): Array<Object> {
    const base = _.assign({
      key,
      title: this.getTitle(value),
      titleMap: this.getTitleMap(value),
      buttonTitle: this.getButtonTitle(value),
      'x-hidden': value['x-hidden'],
      labelHtmlClass: CommonProperty.secretLevelLabelClass(value),
      fieldHtmlClass: value['x-field-class'] || undefined,
    }, value['x-schema-edit-form']);

    const isRemovable = _.get(value, 'x-schema-form.xVariableItems', false);
    const isMovable = _.get(value, 'x-schema-form.xMovableItems', false);
    return [CommonProperty.appendItemsFieldIfNeeded(
      base,
      value,
      key,
      {isRemovable, isMovable},
      CommonProperty.createEditFields, // eslint-disable-line no-use-before-define
    )];
  }
}

class SchemaFormUtil {
  static splitterText = '/';

  static createFieldsBySchema(schema: Object, baseFieldId: ?string): Array<Object> {
    return _.reduce(sortProperties(schema), (m, {id, value}) => {
      const key = baseFieldId ? `${baseFieldId}.${id}` : id;
      return m.concat(CommonProperty.createFields(value, key));
    }, []);
  }

  static createEditFieldsBySchema(schema: Object, baseFieldId: ?string): Array<Object> {
    return _.reduce(sortProperties(schema), (m, {id, value}) => {
      const key = baseFieldId ? `${baseFieldId}.${id}` : id;
      return m.concat(CommonProperty.createEditFields(value, key));
    }, []);
  }
}

export default SchemaFormUtil;
