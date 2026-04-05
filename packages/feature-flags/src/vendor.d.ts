declare module "murmurhash-js" {
  const murmur: {
    murmur3(key: string, seed: number): number;
    murmur2(key: string, seed: number): number;
  };
  export default murmur;
}
