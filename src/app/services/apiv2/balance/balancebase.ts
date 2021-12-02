export abstract class BalBase {
  name: string;
  constructor(name: string) {
    this.name = name;
    this.init();
  }

  abstract init(): void;
  abstract getBalance(data: any): Promise<number>;
}
