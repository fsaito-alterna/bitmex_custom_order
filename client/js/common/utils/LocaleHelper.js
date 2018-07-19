// @flow
import moment from 'moment-timezone';

class LocaleHelper {
  static lang = 'ja';

  static moment(params: ?any): Object {
    return moment(params).tz('Asia/Tokyo');
  }

  static getCurrentLocale() {
  // NOTE: Returns one of locale that Moment.js have,
  //       the structure of the dictionary of i18next is to follow it.

    return 'ja'; // Currentlly, this problem supports ja only.
  }
}

export default LocaleHelper;
