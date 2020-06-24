import Sample from './Sample';
import Occurrence from './Occurrence';
import Media from './Media';
import * as CONST from './constants';

const Indicia = {
  Sample,
  Occurrence,
  Media,

  ...CONST,
};

export { Sample, Occurrence, Media };
export default Indicia;
