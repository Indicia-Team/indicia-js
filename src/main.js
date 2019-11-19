import Store from './Store';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Media from './Media';
import Report from './Report';
import * as CONST from './constants';

const Indicia = {
  /* global LIB_VERSION */
  VERSION: LIB_VERSION, // replaced by build

  Store,

  Sample,
  Occurrence,
  Media,
  Report,

  ...CONST,
};

export { Indicia as default };
