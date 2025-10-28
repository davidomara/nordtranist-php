$(function () {
  // Get the value of isAdmin from the <body> data attribute
  const isAdmin = $('body').data('is-admin'); // This will be a boolean (true for admin, false for regular user)

  console.log('Is Admin:', isAdmin);  // Check if isAdmin is correctly set to true/false

  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  const bookingTable = $('#bookingTable');

  const statusObj = {
    1: { title: 'Confirmed', class: 'bg-label-success' },
    0: { title: 'Not Confirmed', class: 'bg-label-danger' }
  };

  if (bookingTable.length) {
    const dt = bookingTable.DataTable({
      ajax: 'app-booking-list.php?fetch=1',
      columns: [
        { data: 'booking_id' },
        { data: 'name' },
        { data: 'pic_date' },
        { data: 'destination' },
        { data: 'confirmation', render: function(data) { return data == 1 ? 'Confirmed' : 'Not Confirmed'; } },
        { data: null, orderable: false, searchable: false }
      ],
      columnDefs: [
        {
          targets: 5,
          render: function (data, type, full) {
            const bookingId = full['booking_id'];
            const name = full['name'];
            const isConfirmed = full['confirmation'] == 1;

            let confirmButton = '';

            // Admins can always see the "Confirm Booking" button
            if (isAdmin && !isConfirmed) {
              confirmButton = `
              <button class="btn btn-sm btn-icon btn-outline-success confirm-booking" data-id="${bookingId}" data-name="${name}" title="Confirm Booking">
                <i class="ti ti-check"></i>
              </button>
              `;
            } else {
              confirmButton = ''; // No confirm button for non-admins or already confirmed bookings
            }

            // Return the row HTML, including the confirm button for admins
            return `
              <div class="d-inline-flex">
                <a href="app-booking-edit.php?id=${bookingId}" class="btn btn-sm btn-icon btn-outline-primary me-2" title="Edit">
                  <i class="ti ti-edit"></i>
                </a>
                <button class="btn btn-sm btn-icon btn-outline-danger delete-booking me-2" data-id="${bookingId}" data-name="${name}" title="Delete">
                  <i class="ti ti-trash"></i>
                </button>
                ${confirmButton} <!-- Show confirm button only for admins -->
              </div>
            `;
          }
        },
      ],
      dom:
        '<"card-header d-flex flex-wrap justify-content-between align-items-center"' +
        '<"d-flex align-items-center gap-2"lB>' +
        '<"me-2 ms-auto"f>' +
        '>' +
        't' +
        '<"row mt-3"<"col-md-6"i><"col-md-6"p>>',

      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle me-4 waves-effect waves-light',
          text: '<i class="ti ti-upload me-1 ti-xs"></i>Export',
          buttons: ['print', 'csv', 'excel', 'pdf', 'copy']
        },
        {
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Booking</span>',
          className: 'add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light',
          action: function () {
            window.location.href = 'app-booking-add.php';
          }
        }
      ],
      order: [[0, 'desc']],
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      responsive: true,
      language: {
        searchPlaceholder: 'Search bookings...',
        paginate: {
          previous: '<',
          next: '>'
        },
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ bookings'
      },

      initComplete: function () {
        const api = this.api();
        api.columns(4).every(function () {
          const column = this;
          const select = $('<select class="form-select text-capitalize"><option value="">Select Status</option></select>')
            .appendTo('.product_status')
            .on('change', function () {
              const val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? '^' + val + '$' : '', true, false).draw();
            });

          $.each(statusObj, function (_, value) {
            select.append('<option value="' + value.title + '">' + value.title + '</option>');
          });
        });
      }
    });

    bookingTable.on('click', '.delete-booking', function () {
      const bookingId = $(this).data('id');
      const bookingName = $(this).data('name');
      const bookingStatus = $(this).closest('tr').find('td').eq(4).text(); // Get the status of the booking

      // Only allow deletion of "Not Confirmed" bookings for regular users
      if (!isAdmin && bookingStatus !== 'Not Confirmed') {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'You can only delete "Not Confirmed" bookings.',
          showConfirmButton: true
        });
        return;
      }

      Swal.fire({
        title: 'Delete Booking?',
        text: `Are you sure you want to delete booking [${bookingName}]?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-booking-delete.php', { id: bookingId }, function () {
            dt.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Booking [${bookingName}] has been removed.`,
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      });
    });

    bookingTable.on('click', '.confirm-booking', function () {
      const bookingId = $(this).data('id');
      const bookingName = $(this).data('name');

      if (!isAdmin) {
        // If the user is not an admin, display a message to contact admins
        Swal.fire({
          icon: 'info',
          title: 'Contact Admins',
          text: 'You cannot confirm this booking. Please contact the admins for assistance.',
          confirmButtonText: 'Okay'
        });
        return; // Prevent further execution if the user is not an admin
      }
      
      $.ajax({
        url: 'api-get-available-drivers-vehicles.php',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          const drivers = data.drivers.map(d => `<option value="${d.driverid}">${d.drname}</option>`).join('');
          const vehicles = data.vehicles.map(v => `<option value="${v.veh_reg}">${v.veh_reg} ${v.veh_type}</option>`).join('');
    
          Swal.fire({
            title: `Confirm Booking [${bookingName}]`,
            html: `
              <label class="form-label">Assign Driver</label>
              <select id="driver_id" class="swal2-select">${drivers}</select>
              <label class="form-label mt-3">Assign Vehicle</label>
              <select id="vehicle_id" class="swal2-select">${vehicles}</select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Confirm Booking',
            preConfirm: () => {
              const driverId = $('#driver_id').val();
              const vehicleId = $('#vehicle_id').val();
              if (!driverId || !vehicleId) {
                Swal.showValidationMessage('Please select both driver and vehicle');
                return false;
              }
              return { driverId, vehicleId };
            }
          }).then((result) => {
            if (result.isConfirmed) {
              $.post('app-booking-confirm.php', {
                id: bookingId,
                driver_id: result.value.driverId,
                vehicle_id: result.value.vehicleId
              }, function (response) {
                const data = JSON.parse(response);
                if (data.status === 'success') {
                  dt.ajax.reload(); // Reload data table to reflect changes
                  Swal.fire({
                    icon: 'success',
                    title: 'Confirmed!',
                    text: `Booking [${bookingName}] has been confirmed.`,
                    timer: 2000,
                    showConfirmButton: false
                  });
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to confirm the booking. Please try again.',
                    showConfirmButton: true
                  });
                }
              });
            }
          });
        }
      });
    });
  }
});
