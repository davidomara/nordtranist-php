'use strict';

$(function () {
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

  const statusObj = {
    'Scheduled': { title: 'Scheduled', class: 'bg-label-warning' },
    'Completed': { title: 'Completed', class: 'bg-label-success' },
    'Overdue': { title: 'Overdue', class: 'bg-label-danger' }
  };

  const serviceView = '#';
  const dt_service_table = $('.datatables-service');

  if (dt_service_table.length) {
    const dt_service = dt_service_table.DataTable({
      ajax: 'fetch-service-schedule.php',
      columns: [
        { data: 'ServiceID' },
        { data: 'ServiceType' },
        { data: 'ServiceDate' },
        { data: 'NextServiceDate' },
        { data: 'ServiceStatus' },
        { data: 'ServiceCost' },
        { data: 'ServiceCenter' },
        { data: 'Remarks' },
        { data: 'VehicleReg' }, // Column for Vehicle Registration
        { data: 'action' }
      ],
      columnDefs: [
        {
          targets: 0,
          className: 'control',
          searchable: false,
          orderable: false,
          render: () => ''
        },
        {
          targets: 1,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 2,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 3,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 4,
          render: (data) => 
            `<span class="badge ${statusObj[data].class}">${statusObj[data].title}</span>`
        },
        {
          targets: 5,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 6,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 7,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 8,
          render: (data) => `<span class="text-heading">${data}</span>` // Vehicle Registration
        },
        {
          targets: -1,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: (data, type, row) => `
            <div class="d-flex align-items-center">
              <a href="javascript:;" class="btn btn-icon btn-text-secondary waves-effect delete-record" data-id="${row.ServiceID}" data-name="${row.ServiceType}">
                <i class="ti ti-trash ti-md"></i>
              </a>
              <a href="${serviceView}" class="btn btn-icon btn-text-secondary waves-effect">
                <i class="ti ti-eye ti-md"></i>
              </a>
            </div>
          `
        }
      ],
      order: [[2, 'asc']],
      dom:
        '<"row"<"col-md-6"l><"col-md-6"f>>' +
        '<"table-responsive"tr>' +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      language: {
        searchPlaceholder: 'Search service',
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>'
        }
      }
    });

    // Delete action
    $('.datatables-service tbody').on('click', '.delete-record', function () {
      const serviceId = $(this).data('id');
      const serviceName = $(this).data('name');
      const serviceStatus = $(this).closest('tr').find('td').eq(4).text(); // Get the status of the service

      // Only allow deletion of "Scheduled" services for regular users
      if (!isAdmin && serviceStatus !== 'Scheduled') {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'You can only delete "Scheduled" services.',
          showConfirmButton: true
        });
        return;
      }

      Swal.fire({
        title: 'Delete Service?',
        text: `Are you sure you want to delete service [${serviceName}]?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-service-delete.php', { id: serviceId }, function () {
            dt_service.ajax.reload(); // Reload the table after deletion
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Service [${serviceName}] has been removed.`,
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      });
    });

    // Styling adjustments
    setTimeout(() => {
      $('.dataTables_filter .form-control').removeClass('form-control-sm');
      $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
