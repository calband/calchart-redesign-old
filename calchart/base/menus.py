"""
Defines menus and panels used throughout the site, to be passed to templates as JSON strings in
script tags.

Menus are a list of dictionaries of the following format:
    - name (str, required): label to display in the menu
    - submenu (list, required): any submenus to nest under the menu

Submenus are a list of menu items. The formats for the different types of menu items include:
    - Normal menu item
        - name (str, required): label to display in the menu
        - function (str, required): the name of the Javascript function (defined in the
            Javascript file) to run when clicking on the menu.
        - shortcut (str, optional): keyboard shortcut to run the same action. Separate keys
            with "+". e.g. "ctrl+s" or "ctrl+shift_s". Meta keys need to be in this order:
            ctrl (alias for cmd on Mac), alt, shift.
    - Menu item with a submenu
        - name (str, required): label to display in the menu
        - submenu (list, required): submenu to list next to the menu item

Panels are a list of dictionaries in the following format:
    - icon (str, required): the font-awesome icon class; e.g. "fa-plus" (http://fontawesome.io/icons/)
    - help_text (str, optional): help text to display on hover
    - function (str, required): the name of the Javascript function (defined in the Javascript file
        to run when clicking on the item)
"""

editor_menu = [
    {
        'name': 'File',
        'submenu': [
            {
                'name': 'Save',
                'function': 'save_show',
                'shortcut': 'ctrl+s',
            },
        ],
    },
    {
        'name': 'Edit',
        'submenu': [
            {
                'name': 'Undo',
                'function': 'undo',
                'shortcut': 'ctrl+z',
            },
            {
                'name': 'Redo',
                'function': 'redo',
                'shortcut': 'ctrl+shift+z',
            },
        ],
    },
    {
        'name': 'View',
        'submenu': [
            {
                'name': 'View Mode',
                'function': 'change_workspace',
                'submenu': [
                    {
                        'name': 'Marching View',
                        'function': 'view_marching',
                    },
                    {
                        'name': 'Music View',
                        'function': 'view_music',
                    },
                    {
                        'name': '3D View',
                        'function': 'view_3d',
                    },
                ],
            },
        ],
    },
]

editor_panel = [
    {
        'icon': 'fa-plus',
        'help_text': 'Add stuntsheet',
        'function': 'add_stuntsheet',
    },
    {
        'icon': 'fa-undo',
        'help_text': 'Undo',
        'function': 'undo',
    },
    {
        'icon': 'fa-repeat',
        'help_text': 'Redo',
        'function': 'redo',
    },
]
