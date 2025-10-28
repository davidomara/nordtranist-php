'use strict';

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

  const vehicleTable = $('#vehicleTable');

  const statusObj = {
    1: { title: 'Available', class: 'bg-label-success' },
    0: { title: 'Unavailable', class: 'bg-label-danger' }
  };

  const categoryObj = {
    'Container': { title: 'Container' },
    '10 ton Capacity': { title: 'Light Truck' },
    '20 ton Capacity': { title: 'Heavy Truck' }
  };

  const categoryBadgeObj = {
    'Container': '<span class="avatar-sm rounded-circle bg-label-info p-2 me-2"><i class="ti ti-package ti-sm"></i></span>',
    'Light Truck': '<span class="avatar-sm rounded-circle bg-label-warning p-2 me-2"><i class="ti ti-truck ti-sm"></i></span>',
    'Heavy Truck': '<span class="avatar-sm rounded-circle bg-label-danger p-2 me-2"><i class="ti ti-building-factory ti-sm"></i></span>'
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
      text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Vehicle</span>',
      className: 'add-new btn btn-primary ms-2 ms-sm-0 waves-effect waves-light',
      action: function () {
        window.location.href = 'app-vechicle-add.php';
      }
    });
  }
  
  if (vehicleTable.length) {

    const dt = vehicleTable.DataTable({
      ajax: 'app-vechicle-list.php?fetch=1',
      columns: [
        { data: 'veh_id' },
        { data: 'veh_reg' },
        { data: 'veh_type' },
        { data: 'chesisno' },
        { data: 'brand' },
        { data: 'veh_color' },
        { data: 'veh_regdate' },
        { data: 'veh_description' },
        { data: 'veh_photo', orderable: false, searchable: false },
        { data: 'veh_available' },
        { data: null, orderable: false, searchable: false }
      ],
      columnDefs: [
        {
          targets: 7,
          render: function (data) {
            const desc = data.trim();
            const category = categoryObj[desc]?.title || desc;
            const badge = categoryBadgeObj[category] || '';
            return "<span class='d-flex align-items-center'>" + badge + category + '</span>';
          }
        },
        {
          targets: 9,
          render: function (data, type, full) {
            const status = full['veh_available'] === 'Available' ? 1 : 0;
            return `<span class="badge ${statusObj[status].class}">${statusObj[status].title}</span>`;
          }
        },
        {
          targets: 10,
          render: function (data, type, full) {
            const id = full['veh_id'];
            const reg = full['veh_reg'];
            let Button = '';
          
            if (isAdmin) {
              Button = `
                <div class="d-inline-flex">
                  <a href="app-vechicle-edit.php?id=${id}" class="btn btn-sm btn-icon btn-outline-primary me-2" title="Edit">
                    <i class="ti ti-edit"></i>
                  </a>
                  <button class="btn btn-sm btn-icon btn-outline-danger delete-vehicle" data-id="${id}" data-reg="${reg}" title="Delete">
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
        '<"d-flex align-items-center gap-2"lB>' + // 👈 tight button layout
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
        searchPlaceholder: 'Search vehicles...',
        paginate: {
          previous: '<',
          next: '>'
        },
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ vehicles'
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

        // Type Filter Brand
        api.columns(4).every(function () {
          const column = this;
          const select = $('<select class="form-select text-capitalize"><option value="">Select Brand</option></select>')
            .appendTo('.product_category')
            .on('change', function () {
              const val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? '^' + val + '$' : '', true, false).draw();
            });

          column.data().unique().sort().each(function (d) {
            select.append('<option value="' + d + '">' + d + '</option>');
          });
        });

        // Type Filter
        api.columns(2).every(function () {
          const column = this;
          const select = $('<select class="form-select text-capitalize"><option value="">Select Type</option></select>')
            .appendTo('.product_type')
            .on('change', function () {
              const val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? '^' + val + '$' : '', true, false).draw();
            });

          column.data().unique().sort().each(function (d) {
            select.append('<option value="' + d + '">' + d + '</option>');
          });
        });
      }
    });

    // Delete handler
    vehicleTable.on('click', '.delete-vehicle', function () {
      const vehicleId = $(this).data('id');
      const vehicleReg = $(this).data('reg');
    
      Swal.fire({
        title: 'Delete Vehicle?',
        text: `Are you sure you want to delete vehicle [${vehicleReg}]?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          $.post('app-vechicle-delete.php', { id: vehicleId }, function () {
            dt.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `Vehicle [${vehicleReg}] has been removed.`,
              timer: 2000,
              showConfirmButton: false
            });
          });
        }
      });
    });
        
    // Remove small input styles
    setTimeout(() => {
      $('.dataTables_filter .form-control').removeClass('form-control-sm');
      $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
