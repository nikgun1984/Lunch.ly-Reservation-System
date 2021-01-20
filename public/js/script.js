$(document).on("click", "i.fas.fa-edit", async function () {
	const id = parseInt($(this).closest("li").attr("id"));
	const reservation = await axios.get(`/reservation/${id}`);
	$("#back-to-add").removeClass("is-hidden");
	changeReservation(
		reservation.data.startAt,
		reservation.data.numGuests,
		reservation.data.notes,
		"Edit Reservation",
		"Edit",
		`/${reservation.data.customerId}/edit-reservation/${id}`
	);
});

$("#back-to-add").on("click", (evt) => {
	evt.preventDefault();
	const id = $("#add-form").attr("action").split("/")[1];
	$("#back-to-add").addClass("is-hidden");
	changeReservation(
		"",
		"",
		"",
		"Add Reservation",
		"Add",
		`/${id}/add-reservation/`
	);
});

function changeReservation(date, numGuests, notes, title, buttonTxt, link) {
	$("#start").val(date);
	$("#num-guests").val(numGuests);
	$("#notes").val(notes);
	$("#new-reservation").text(title);
	$(".add").text(buttonTxt);
	$("#add-form").attr("action", link);
}
