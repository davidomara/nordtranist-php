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

  const dt_contact_table = $('.datatables-contacts');

  if (dt_contact_table.length) {
    const dt_contact = dt_contact_table.DataTable({
      ajax: 'fetch-contactus.php',
      columns: [
        { data: 'id' },
        { data: 'full_name' },
        { data: 'email' },
        { data: 'message' },
        { data: 'created_at' },
        { data: null } // actions
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
          targets: 5,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: (data, type, full) => `
            <div class="d-flex align-items-center">
              <a href="javascript:;" class="btn btn-icon btn-text-danger waves-effect delete-record" data-id="${full.id}">
                <i class="ti ti-trash ti-md"></i>
              </a>
            </div>
          `
        }
      ],
      order: [[4, 'desc']],
      dom:
        '<"row"<"col-md-6"l><"col-md-6"f>>' +
        '<"table-responsive"tr>' +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      language: {
        searchPlaceholder: 'Search messages...',
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>'
        }
      }
    });

    // Delete message row (front-end only unless integrated with backend)
    $('.datatables-contacts tbody').on('click', '.delete-record', function () {
      dt_contact.row($(this).parents('tr')).remove().draw();
      // Optional: Trigger an AJAX delete call here using data-id
    });

    // UI polish
    setTimeout(() => {
      $('.dataTables_filter .form-control').removeClass('form-control-sm');
      $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
