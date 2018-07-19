// @flow
import _ from 'lodash';

const AppConfig = {
  userPasswordMin: 8,
  limitQueryMax: 1000,
};

appConfig = _.assign(appConfig || {}, AppConfig);
export default AppConfig;
