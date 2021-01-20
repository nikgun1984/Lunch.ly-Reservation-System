/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
	try {
		const customers = await Customer.all();
		return res.render("customer_list.html", { customers });
	} catch (err) {
		return next(err);
	}
});

/** Get list of 10 customers who made most reservations */

router.get("/best-customers", async function (req, res, next) {
	try {
		const customers = await Customer.findBestCustomers();
		return res.render("customer_list.html", { customers });
	} catch (err) {
		return next(err);
	}
});

/** Get a customer by Search */

router.get("/search", async function (req, res, next) {
	try {
		const customers = await Customer.search(req.query.first_name);
		return res.render("customer_list.html", { customers });
	} catch (err) {
		return next(err);
	}
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
	try {
		return res.render("customer_new_form.html");
	} catch (err) {
		return next(err);
	}
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
	try {
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;
		const phone = req.body.phone;
		const notes = req.body.notes;

		const customer = new Customer({ firstName, lastName, phone, notes });
		await customer.save();

		return res.redirect(`/${customer.id}/`);
	} catch (err) {
		return next(err);
	}
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
	try {
		const customer = await Customer.get(req.params.id);

		const reservations = await customer.getReservations();

		return res.render("customer_detail.html", { customer, reservations });
	} catch (err) {
		return next(err);
	}
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
	try {
		const customer = await Customer.get(req.params.id);

		res.render("customer_edit_form.html", { customer });
	} catch (err) {
		return next(err);
	}
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
	try {
		const customer = await Customer.get(req.params.id);
		customer.firstName = req.body.firstName;
		customer.lastName = req.body.lastName;
		customer.phone = req.body.phone;
		customer.notes = req.body.notes;
		await customer.save();

		return res.redirect(`/${customer.id}/`);
	} catch (err) {
		return next(err);
	}
});

/* Get reservation */

router.get("/reservation/:id", async function (req, res, next) {
	let id = +req.params.id;
	console.log("IN BACKEND");
	let reservation = await Reservation.getById(id);
	console.log(reservation);
	return res.json(reservation);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
	try {
		const customerId = req.params.id;
		const startAt = new Date(req.body.startAt);
		const numGuests = req.body.numGuests;
		const notes = req.body.notes;

		const reservation = new Reservation({
			customerId,
			startAt,
			numGuests,
			notes,
		});
		await reservation.save();

		return res.redirect(`/${customerId}/`);
	} catch (err) {
		return next(err);
	}
});

router.post("/:id/edit-reservation/:resId", async (req, res, next) => {
	let reservation = await Reservation.getById(+req.params.resId);
	reservation.startAt = new Date(req.body.startAt);
	reservation.numGuests = req.body.numGuests;
	reservation.notes = req.body.notes;
	await reservation.save();
	return res.redirect(`/${req.params.id}/`);
});

module.exports = router;
