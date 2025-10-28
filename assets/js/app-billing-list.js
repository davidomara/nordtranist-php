$(document).ready(function() {
  const billingTable = $('#billingTable');

  if (billingTable.length) {
    const dt = billingTable.DataTable({
      ajax: 'app-billing-list.php?fetch=1', // Fetch the data from PHP
      columns: [
        { data: 'bill_id' },
        { data: 'id' },               // 'id' is used for the booking ID
        { data: 'fare' },              // 'fare' for the total fare
        { data: 'other' },             // 'other' for additional costs
        { data: 'fuel' },              // 'fuel' for fuel cost
        { data: 'tcost' },             // 'tcost' for total cost
        { data: 'username' },          // 'username' for the user's name
        { data: null, orderable: false, searchable: false }
      ],
      columnDefs: [
        {
          targets: 7,
          render: function(data, type, full) {
            const billId = full['bill_id'];
            const editButton = `
              <a href="app-billing-edit.php?id=${billId}" class="btn btn-sm btn-icon btn-outline-primary me-2" title="Edit">
                <i class="ti ti-edit"></i>
              </a>`;
            const deleteButton = `
              <button class="btn btn-sm btn-icon btn-outline-danger delete-bill me-2" data-id="${billId}" title="Delete">
                <i class="ti ti-trash"></i>
              </button>`;

            return `<div class="d-inline-flex">${editButton}${deleteButton}</div>`;
          }
        }
      ],
      dom: '<"card-header d-flex flex-wrap justify-content-between align-items-center"' +
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
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Billing</span>',
          className: 'add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light',
          action: function () {
            window.location.href = 'app-billing-add.php';
          }
        }
      ],
      order: [[0, 'desc']],
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      responsive: true,
      language: {
        searchPlaceholder: 'Search billings...',
        paginate: {
          previous: '<',
          next: '>'
        },
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ billings'
      }
    });

    billingTable.on('click', '.delete-bill', function () {
      const billId = $(this).data('id');
      Swal.fire({
        title: 'Delete Billing?',
        text: `Are you sure you want to delete this billing?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-billing-delete.php', { id: billId }, function () {
            dt.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The billing has been removed.',
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      });
    });
  }
});
