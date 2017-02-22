import _ from 'underscore';
import Store from './Store';
import Collection from './Collection';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Media from './Media';
import Error from './Error';
import * as CONST from './constants';

const Indicia = {
  /* global LIB_VERSION */
  VERSION: LIB_VERSION, // replaced by build

  Store,
  Collection,

  Sample,
  Occurrence,
  Media,
  Error,
};

_.extend(Indicia, CONST);

export { Indicia as default };
