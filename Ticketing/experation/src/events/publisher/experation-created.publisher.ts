import { Publisher } from '@ferhatadibelli/ferhatadibelli/build/events/base-publisher';
import { Subjects } from '@ferhatadibelli/ferhatadibelli/build/events/subjects';
import { ExperationCreatedEvent } from '@ferhatadibelli/ferhatadibelli/build/events/experation-created-event';

export class ExperationCreatedPublisher extends Publisher<ExperationCreatedEvent> {
  readonly subject = Subjects.ExperationCreated;
}
