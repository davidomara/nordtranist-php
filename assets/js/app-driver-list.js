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

  const driverTable = $('#driverTable');

  const statusObj = {
    1: { title: 'Available', class: 'bg-label-success' },
    0: { title: 'Unavailable', class: 'bg-label-danger' }
  };

  let buttonsConfig = [
    {
      extend: 'collection',
      className: 'btn btn-label-secondary dropdown-toggle me-4 waves-effect waves-light',
      text: '<i class="ti ti-upload me-1 ti-xs"></i>Export',
      buttons: ['print', 'csv', 'excel', 'pdf', 'copy']
}
  ];
  
  if (isAdmin) {
    buttonsConfig.push({
      text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Driver</span>',
      className: 'add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light',
      action: function () {
        window.location.href = 'app-driver-add.php';
      }
});
  }

  if (driverTable.length) {
    const dt = driverTable.DataTable({
      ajax: 'app-driver-list.php?fetch=1',
      columns: [
        { data: 'driverid' },
        { data: 'drname' },
        { data: 'drjoin' },
        { data: 'drmobile' },
        { data: 'employee_code' },
        { data: 'drlicense' },
        { data: 'drlicensevalid' },
        { data: 'draddress' },
        { data: 'drphoto', orderable: false, searchable: false },
        { data: 'dr_available' },
        { data: null, orderable: false, searchable: false }
      ],
      columnDefs: [
        {
          targets: 9,
          render: function (data, type, full) {
            const status = full['dr_available'] === 'Available' ? 1 : 0;
            return `<span class="badge ${statusObj[status].class}">${statusObj[status].title}</span>`;
          }
        },
        {
          targets: 10,
          render: function (data, type, full) {
            const id = full['driverid'];
            const name = full['drname'];
            let Button = '';
          
            if (isAdmin) {
              Button = `
                <div class="d-inline-flex">
                  <a href="app-driver-edit.php?id=${id}" class="btn btn-sm btn-icon btn-outline-primary me-2" title="Edit">
                    <i class="ti ti-edit"></i>
                  </a>
                  <button class="btn btn-sm btn-icon btn-outline-danger delete-driver" data-id="${id}" data-name="${name}" title="Delete">
                    <i class="ti ti-trash"></i>
                  </button>
                </div>
              `;
            }
          
            return Button;
          }
        }
      ],
      dom:
        '<"card-header d-flex flex-wrap justify-content-between align-items-center"' +
        '<"d-flex align-items-center gap-2"lB>' +
        '<"me-2 ms-auto"f>' +
        '>' +
        't' +
        '<"row mt-3"<"col-md-6"i><"col-md-6"p>>',

      buttons: buttonsConfig,

      order: [[0, 'asc']],
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      responsive: true,
      language: {
        searchPlaceholder: 'Search drivers...',
        paginate: {
          previous: '<',
          next: '>'
        },
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ drivers',
        emptyTable: 'No drivers available', // Custom message for empty table
      },
      drawCallback: function () {
        const api = this.api();
        if (api.rows({ page: 'current' }).data().length === 0) {
          // You can handle the display of an empty message here if needed
          // Example: Add a class to highlight the empty state
          driverTable.find('tbody').append('<tr><td colspan="10" class="text-center">No drivers available</td></tr>');
        }
      },
      initComplete: function () {
        const api = this.api();

        // Status Filter
        api.columns(9).every(function () {
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

    // Delete handler
    driverTable.on('click', '.delete-driver', function () {
      const driverId = $(this).data('id');
      const driverName = $(this).data('name');

      Swal.fire({
        title: 'Delete Driver?',
        text: `Are you sure you want to delete driver [${driverName}]?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-driver-delete.php', { id: driverId }, function () {
            dt.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Driver [${driverName}] has been removed.`,
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      });
    });

    // UI polish
    setTimeout(() => {
      $('.dataTables_filter .form-control').removeClass('form-control-sm');
      $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
