/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
	constructor({ id, customerId, numGuests, startAt, notes }) {
		this.id = id;
		this.customerId = customerId;
		this.numGuests = numGuests;
		this.startAt = startAt;
		this.notes = notes;
	}

	get notes() {
		return this._notes;
	}

	set notes(val) {
		if (!val) {
			this._notes = "";
		} else {
			this._notes = val;
		}
	}

	get numGuests() {
		return this._numGuests;
	}

	set numGuests(val) {
		if (val < 1 && val !== null) {
			throw Error("Gotta be at least 1 guest!!!");
		} else {
			this._numGuests = val;
		}
	}

	get startAt() {
		return this._startAt;
	}

	set startAt(val) {
		this._startAt = new Date(val);
	}

	/** formatter for startAt */

	getformattedStartAt() {
		return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
	}

	getRelativeTime() {
		return moment(this.startAt).fromNow();
	}

	/** given a customer id, find their reservations. */

	static async getReservationsForCustomer(customerId) {
		const results = await db.query(
			`SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
		 WHERE customer_id = $1`,
			[customerId]
		);

		return results.rows.map((row) => new Reservation(row));
	}

	/** Get the last Reservation for each customer */

	static async getLastReservations() {
		const results = await db.query(
			`
			SELECT c.id AS "customerId",
			r.id AS "id",
			r.notes AS "notes",
			r.start_at AS "startAt",
			r.num_guests AS "numGuests"
			FROM customers c
			LEFT JOIN (SELECT id, customer_id, notes, start_at, num_guests 
			FROM reservations WHERE id IN (SELECT MAX(id) AS id
			FROM reservations 
			GROUP BY customer_id)) r
			ON c.id=r.customer_id
			ORDER BY c.id
			`
		);
		return results.rows.map((row) => new Reservation(row));
	}

	static async getById(id) {
		const result = await db.query(
			`SELECT customer_id, start_at, num_guests, notes FROM reservations WHERE id=$1`,
			[id]
		);
		if (result.rows.length === 0) {
			throw new Error(`No such reservation: ${id}`);
		}
		let r = result.rows[0];

		return new Reservation({
			id,
			customerId: +r.customer_id,
			startAt: r.start_at,
			numGuests: +r.num_guests,
			notes: r.notes,
		});
	}

	async save() {
		if (this.id === undefined) {
			const result = await db.query(
				`INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
				[this.customerId, this.startAt, this.numGuests, this.notes]
			);
			this.id = result.rows[0].id;
		} else {
			await db.query(
				`UPDATE reservations SET start_at=$1, num_guests=$2, notes=$3
             WHERE id=$4 RETURNING id, customer_id, start_at, num_guests, notes`,
				[this.startAt, this.numGuests, this.notes, this.id]
			);
		}
	}
}

module.exports = Reservation;
