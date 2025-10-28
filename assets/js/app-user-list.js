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

  const statusObj = {
    1: { title: 'Pending', class: 'bg-label-warning' },
    2: { title: 'Active', class: 'bg-label-success' },
    3: { title: 'Inactive', class: 'bg-label-secondary' }
  };

  const userView = 'app-user-view-account.php';
  const dt_user_table = $('.datatables-users');

  if (dt_user_table.length) {
    const dt_user = dt_user_table.DataTable({
      ajax: 'fetch-users.php',
      columns: [
        { data: 'id' },
        { data: 'id' },
        { data: 'full_name' },
        { data: 'role' },
        { data: 'current_plan' },
        { data: 'billing' },
        { data: 'status' },
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
          orderable: false,
          searchable: false,
          checkboxes: {
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          },
          render: () => '<input type="checkbox" class="dt-checkboxes form-check-input" >'
        },
        {
          targets: 2,
          render: (data, type, full) => {
            const initials = full.full_name.match(/\b\w/g).join('').toUpperCase();
            const avatar = `<span class="avatar-initial rounded-circle bg-label-primary">${initials}</span>`;
            return `
              <div class="d-flex align-items-center">
                <div class="avatar avatar-sm me-3">${avatar}</div>
                <div class="d-flex flex-column">
                  <a href="${userView}" class="text-heading text-truncate">
                    <span class="fw-medium">${full.full_name}</span>
                  </a>
                  <small>${full.email}</small>
                </div>
              </div>
            `;
          }
        },
        {
          targets: 3,
          render: (data) => {
            const icon = data === 'Admin'
              ? '<i class="ti ti-device-desktop ti-md text-danger me-2"></i>'
              : '<i class="ti ti-user ti-md text-primary me-2"></i>';
            return `<span class='d-flex align-items-center'>${icon}${data}</span>`;
          }
        },
        {
          targets: 4,
          render: (data) => `<span class="text-heading">${data}</span>`
        },
        {
          targets: 6,
          render: (data) =>
            `<span class="badge ${statusObj[data].class}">${statusObj[data].title}</span>`
        },
        {
          targets: -1,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: () => `
            <div class="d-flex align-items-center">
              <a href="javascript:;" class="btn btn-icon btn-text-secondary waves-effect delete-record">
                <i class="ti ti-trash ti-md"></i>
              </a>
              <a href="${userView}" class="btn btn-icon btn-text-secondary waves-effect">
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
        searchPlaceholder: 'Search user',
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>'
        }
      }
    });

    // Delete action
    $('.datatables-users tbody').on('click', '.delete-record', function () {
      dt_user.row($(this).parents('tr')).remove().draw();
    });

    // Styling adjustments
    setTimeout(() => {
      $('.dataTables_filter .form-control').removeClass('form-control-sm');
      $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
