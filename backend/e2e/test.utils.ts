import * as fs from 'fs';
import * as path from 'path';
import { Connection } from 'typeorm';

interface IEntity {
  name: string;
  tableName: string;
  order: number;
}

export class TestUtils {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Ger order id
   *
   * @param   {string}  entityName  - The entity name of which you want to have the order from
   *
   * @return  {number}              - Returns the order id
   */
  private getOrder(entityName: string): number {
    const order: string[] = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fixtures/_order.json'), 'utf8'));
    return order.indexOf(entityName);
  }

  /**
   * Get the entities
   *
   * @return  {Promise<IEntity[]>}  - Returns the entites of the database
   */
  private async getEntities(): Promise<IEntity[]> {
    const entities: IEntity[] = [];
    (await this.connection.entityMetadatas).forEach(
      x => entities.push({ name: x.name, tableName: x.tableName, order: this.getOrder(x.name) })
    );

    return entities;
  }

  /**
   * Insert the data from the e2e/fixtures folder
   *
   * @return  {Promise<void>}
   */
  public async load(): Promise<void> {
    const entities: IEntity[] = await this.getEntities();

    try {
      for (const entity of entities.sort((a, b) => a.order - b.order)) {
        const repository: any = await this.connection.getRepository(entity.name);
        const fixtureFile: any = path.resolve(__dirname, 'fixtures', `${entity.tableName}.json`);

        if (fs.existsSync(fixtureFile)) {
          const items: any = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));

          const newItems = items.map((item: any) => {
            const data = {};
            Object.keys(item).forEach((key: any) => {
              const newKey = key.replace(/(\_\w)/g, (m: any) => {
                return m[1].toUpperCase();
              });

              data[newKey] = item[key];
            });

            return data;
          });

          await repository
            .createQueryBuilder(entity.name)
            .insert()
            .values(newItems)
            .execute();
        }
      }
    } catch (error) {
      throw new Error(`ERROR [TestUtils.load()]: Loading fixtures on test db: ${error}`);
    }
  }
}
