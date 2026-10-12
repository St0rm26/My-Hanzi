import { MongoServerError, type Collection, type Db } from "mongodb";

export class AlreadyReserved extends Error {}
export class NoSuchReservation extends Error {}

export type Reservation = string & { readonly __brand: "Reservation" };

interface ReservationDocument<User, Resource> {
  _id: Reservation;
  user: User;
  resource: Resource;
}

/** Holds each resource for at most one user until its reservation is canceled. */
export class ReservingConcept<
  User extends string,
  Resource extends string,
> {
  private readonly reservations: Collection<
    ReservationDocument<User, Resource>
  >;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "Reserving") {
    this.reservations = database.collection(
      `${name.toLowerCase()}.reservations`,
    );
  }

  /** Ensures MongoDB, rather than a race-prone preflight read, owns uniqueness. */
  #ready() {
    this.indexes ??= this.reservations
      .createIndex({ resource: 1 }, { unique: true })
      .catch((error: unknown) => {
        this.indexes = undefined;
        throw error;
      });
    return this.indexes;
  }

  async reserve({ user, resource }: { user: User; resource: Resource }) {
    await this.#ready();
    const reservation = crypto.randomUUID() as Reservation;
    try {
      await this.reservations.insertOne({ _id: reservation, user, resource });
    } catch (error) {
      if (
        error instanceof MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.resource === 1
      ) {
        throw new AlreadyReserved("That resource is already reserved.");
      }
      throw error;
    }
    return { reservation };
  }

  async cancel({ reservation }: { reservation: Reservation }) {
    const { deletedCount } = await this.reservations.deleteOne({
      _id: reservation,
    });
    if (deletedCount === 0) {
      throw new NoSuchReservation("There is no such reservation.");
    }
    return { reservation };
  }

  async _all(_input: Record<string, never>) {
    const rows = await this.reservations.find().sort({ resource: 1 }).toArray();
    return rows.map(({ _id, user, resource }) => ({
      reservation: _id,
      user,
      resource,
    }));
  }
}
