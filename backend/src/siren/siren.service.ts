import { SirenStrategy } from './strategies/siren.strategy';
import { TreezorStrategy } from './strategies/treezor.strategy';
import { Injectable, Logger } from '@nestjs/common';

enum Strategies {
  SirenStrategy = 'SirenStrategy',
  TreezorStrategy = 'TreezorStrategy'
}

@Injectable()
export class SirenService {
  private strategy: Strategies = Strategies.SirenStrategy;

  constructor(
    private readonly sirenStrategy: SirenStrategy,
    private readonly treezorStrategy: TreezorStrategy,
    private readonly logger: Logger
  ) {}

  public switchStrategy(strategy: Strategies) {
    this.strategy = strategy;
    this.logger.log(`Search - Switch to ${strategy}`);
    setTimeout(() => {
      this.strategy = Strategies.SirenStrategy;
    }, 600000); // 10m
  }

  public async search(query: string, orderBy?: string, limit?: number, offset?: number): Promise<any> {
    if (this.strategy === Strategies.SirenStrategy) {
      try {
        const results = await this.sirenStrategy.search(query, orderBy, limit, offset);
        return results;
      } catch (err) {
        if (err.error && err.error.code && (err.error.code === 'ETIMEDOUT' || err.error.code === 'ESOCKETTIMEDOUT')) {
          this.switchStrategy(Strategies.TreezorStrategy);
        }
      }
    }

    return this.treezorStrategy.search(query, orderBy, limit, offset);
  }
}
