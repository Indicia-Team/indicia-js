import _ from 'underscore';
import Manager from './Manager';
import Sample from './Sample';
import CONST from './constants';
import Occurrence from './Occurrence';
import Image from './Image';
import Error from './Error';

const Morel = {
  VERSION: '0', // library version, generated/replaced by grunt

  Manager,
  Sample,
  Occurrence,
  Image,
  Error,
};

_.extend(Morel, CONST);

export { Morel as default };
