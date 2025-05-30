declare module 'colorthief' {
    export default class ColorThief {
      getColor(sourceImage: HTMLImageElement): [number, number, number];
      getPalette(
        sourceImage: HTMLImageElement,
        colorCount?: number,
        quality?: number
      ): [number, number, number][];
    }
  }
  