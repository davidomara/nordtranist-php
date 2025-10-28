'use strict';

$(function () {
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

  const employeeTable = $('#employeeTable');

  if (employeeTable.length) {
    const dt = employeeTable.DataTable({
      ajax: 'app-employee-list.php?fetch=1',
      columns: [
        { data: 'id' },
        { data: 'employee_code' },
        { data: 'first_name' },
        { data: 'last_name' },
        { data: 'gender' },
        { data: 'date_of_birth' },
        { data: 'email' },
        { data: 'phone_number' },
        { data: 'national_id_number' },
        { data: 'address' },
        { data: 'photo', orderable: false, searchable: false },
        { data: null, orderable: false, searchable: false }
      ],
      columnDefs: [
        // {
        //   targets: 10,
        //   render: function (data, type, full) {
        //     return `<img src="assets/img/employee_photos/${full['photo']}`;
        //   }
        // },
        {
          targets: 11,
          render: function (data, type, full) {
            const id = full['id'];
            const name = `${full['first_name']} ${full['last_name']}`;
            return `
              <div class="d-inline-flex">
                <a href="app-employee-edit.php?id=${id}" class="btn btn-sm btn-icon btn-outline-primary me-2" title="Edit">
                  <i class="ti ti-edit"></i>
                </a>
                <button class="btn btn-sm btn-icon btn-outline-danger delete-employee" data-id="${id}" data-name="${name}" title="Delete">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            `;
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

      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle me-4 waves-effect waves-light',
          text: '<i class="ti ti-upload me-1 ti-xs"></i>Export',
          buttons: ['print', 'csv', 'excel', 'pdf', 'copy']
        },
        {
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Employee</span>',
          className: 'add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light',
          action: function () {
            window.location.href = 'app-employee-add.php';
          }
        }
      ],
      order: [[0, 'asc']],
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      responsive: true,
      language: {
        searchPlaceholder: 'Search employees...',
        paginate: {
          previous: '<',
          next: '>'
        },
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ employees'
      }
    });

    // Delete handler
    employeeTable.on('click', '.delete-employee', function () {
      const employeeId = $(this).data('id');
      const employeeName = $(this).data('name');

      Swal.fire({
        title: 'Delete Employee?',
        text: `Are you sure you want to delete employee [${employeeName}]?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-employee-delete.php', { id: employeeId }, function () {
            dt.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Employee [${employeeName}] has been removed.`,
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
