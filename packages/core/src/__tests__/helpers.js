import { Sample, Occurrence } from '../';

function getRandomSample(samples = [], occurrences = []) {
  if (!occurrences.length) {
    const occurrence = new Occurrence({
      taxon: 1234,
    });
    occurrences.push(occurrence);
  }

  class ReandomSample extends Sample {
    attrs = { location: ' 12.12, -0.23' };

    samples = samples || [];

    occurrences = occurrences || [];
  }

  return new ReandomSample();
}

export default getRandomSample;
