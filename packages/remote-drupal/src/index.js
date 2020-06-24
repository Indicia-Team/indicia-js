import { Sample, Occurrence, Media } from '@indicia-js/core';
import addToOccurrence from './Occurrence';
import addToSample from './Sample';
import addToMedia from './Media';

const classesMatch = (Class1, Class2) =>
  Class2 === Class1 || Class2.prototype.isPrototypeOf(Class1);

export default function init(ModelClass) {
  if (classesMatch(Sample, ModelClass)) {
    return addToSample(ModelClass);
  }

  if (classesMatch(Occurrence, ModelClass)) {
    return addToOccurrence(ModelClass);
  }

  if (classesMatch(Media, ModelClass)) {
    return addToMedia(ModelClass);
  }

  throw new Error("Didn't match any Indicia model classes");
}
