import { Entity, BaseEntity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/* TODO: Refacto Webhook
ATM the webhook does not respect SingleResponsabilityPrinciple
It has the synchronous request and response payload when we do requests to Treezor
It also stores the webhooks payload
The refacto consists in separating webhooks into 2 TreezorCalls and TreezorWebhooks

The refacto is done when all the fields are non nullable
The TreezorWebhook webhook id will be a primary key
*/

@Entity()
export class Webhook extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  accessTag: string;

  @Column({ type: 'simple-json', nullable: true })
  requestPayload: any;

  @Column({ type: 'simple-json', nullable: true })
  responsePayload: any;

  @Column({ nullable: true })
  webhook: string;

  @Column({ nullable: true })
  webhookId: number;

  @Column({ nullable: true })
  object: string;

  @Column({ nullable: true })
  objectId: number;

  @Column({ type: 'simple-json', nullable: true })
  objectPayload: any;

  @Column({ nullable: true })
  objectPayloadSignature: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
