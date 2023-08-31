export class Greeter {
  greeting: string

  constructor() {
    this.greeting = 'Hello'
  }

  private sayBye(): string {
    return `Bye, kiddos!`
  }

  public greet(): string {
    return `${this.greeting} there!`
  }
}
