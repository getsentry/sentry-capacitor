export const IsTextEncoderAvailable = (): boolean => {
  return typeof TextEncoder !== 'undefined';
};
