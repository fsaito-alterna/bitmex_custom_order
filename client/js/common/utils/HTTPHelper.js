/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import superagent from 'superagent-bluebird-promise';

const CANCEL = 'CANCEL'; // cancel event default action
const PROCESS = 'PROCESS'; // process event default action

const Request = superagent.Request;

const origEnd = Request.prototype.end;

let activeCount = 0;
let activeCountMode = CANCEL;

class HTTPHelper {
  static setupSuperAgent(token) {
    Request.prototype.end = function (cb) {
      activeCount += 1;
      this.on('end', () => {
        activeCount -= 1;
      });
      /*
      if (!this.get('Authorization')) {
        this.set('Authorization', token);
      }
      */
      return origEnd.call(this, cb);
    };
  }

  // similar with $.active
  static getActiveCount() {
    return activeCount;
  }

  static setActiveCountMode(mode) {
    activeCountMode = mode;
  }

  static getActiveCountMode() {
    return activeCountMode;
  }

  static get CANCEL() {
    return CANCEL;
  }

  static get PROCESS() {
    return PROCESS;
  }

  static get request() {
    // TODO: implement more chainable functions #77244
    return superagent;
  }
}

export default HTTPHelper;
