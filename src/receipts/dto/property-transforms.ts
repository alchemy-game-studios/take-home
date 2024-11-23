export class PropertyTransforms {
  static currency(value: string): number {
    return parseFloat(value);
  }
}
