import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@nhannt-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
