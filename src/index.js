import Sample from './Sample';
import Occurrence from './Occurrence';
import Media from './Media';
import * as CONST from './constants';

const Indicia = {
  /* global LIB_VERSION */
  VERSION: LIB_VERSION, // replaced by build

  Sample,
  Occurrence,
  Media,

  ...CONST,
};

export { Sample, Occurrence, Media };
export default Indicia;
