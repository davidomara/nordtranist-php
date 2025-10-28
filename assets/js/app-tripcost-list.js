$(function () {
  const tripCostTable = $('#tripCostTable');

  if (tripCostTable.length) {
    const dt = tripCostTable.DataTable({
      ajax: 'app-tripcost-list.php?fetch=1',
      columns: [
        { data: 'id' },
        { data: 'booking_id' },
        { data: 'username' },
        { data: 'total_km' },
        { data: 'fuel_cost' },
        { data: 'extra_cost' },
        { data: 'total_cost' },
        { data: 'paid', render: function(data) { return data == 1 ? 'Yes' : 'No'; } },
        { data: null, orderable: false, searchable: false }
      ],
      columnDefs: [
        {
          targets: 8,
          render: function (data, type, full) {
            const tripCostId = full['id'];
            const isPaid = full['paid'] == 1;
            
            return `
              <div class="d-inline-flex">
                <a href="app-tripcost-edit.php?id=${tripCostId}" class="btn btn-sm btn-icon btn-outline-primary me-2" title="Edit" ${isPaid ? 'disabled' : ''} style="${isPaid ? 'pointer-events: none; opacity: 0.5;' : ''}">
                  <i class="ti ti-edit"></i>
                </a>
                <button class="btn btn-sm btn-icon btn-outline-danger delete-tripcost me-2" data-id="${tripCostId}" title="Delete">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            `;
          }
        },
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
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Trip Cost</span>',
          className: 'add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light',
          action: function () {
            window.location.href = 'app-tripcost-add.php';
          }
        }
      ],
      order: [[0, 'desc']],
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      responsive: true,
      language: {
        searchPlaceholder: 'Search trip costs...',
        paginate: {
          previous: '<',
          next: '>'
        },
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ trip costs'
      }
    });

    tripCostTable.on('click', '.delete-tripcost', function () {
      const tripCostId = $(this).data('id');
      Swal.fire({
        title: 'Delete Trip Cost?',
        text: `Are you sure you want to delete this trip cost?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-tripcost-delete.php', { id: tripCostId }, function () {
            dt.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The trip cost has been removed.',
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      });
    });
  }
});