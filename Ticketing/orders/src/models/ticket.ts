import { OrderStatus } from '@ferhatadibelli/ferhatadibelli/build/events/types/orders-status';
import mongoose, { Date } from 'mongoose';
import { Order } from './orders';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  id: string;
}

interface Event {
  id: string;
  version: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved: () => Promise<boolean>;
}

interface TicketModal extends mongoose.Model<TicketDoc> {
  build: (item: TicketAttrs) => TicketDoc;
  findByEvent: ({ id, version }: Event) => Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
//For model itself

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
// ticketSchema.pre('save', function (done) {
//   this.$where = {
//     version: this.get('version') - 1,
//   };
//   done();
// });

ticketSchema.statics.findByEvent = ({ id, version }: Event) => {
  return Ticket.findOne({
    _id: id,
    version: version - 1,
  });
};
ticketSchema.statics.build = (props: TicketAttrs) => {
  return new Ticket({
    _id: props.id,
    title: props.title,
    price: props.price,
  });
};
//For documents itself
ticketSchema.methods.isReserved = async function () {
  const existing = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existing;
};

const Ticket = mongoose.model<TicketDoc, TicketModal>('Ticket', ticketSchema);

export { Ticket };
