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
    - Menu item with a submenu
        - name (str, required): label to display in the menu
        - submenu (list, required): submenu to list next to the menu item

Panels are a list of dictionaries in the following format:
    - icon (str, required): the font-awesome icon class; e.g. "fa-plus" (http://fontawesome.io/icons/)
    - function (str, required): the name of the Javascript function (defined in the Javascript file
        to run when clicking on the item)
"""

editor_menu = [
    {
        'name': 'File',
        'submenu': [
            {
                'name': 'Save',
                'function': 'saveShow',
            },
        ],
    },
    {
        'name': 'Edit',
        'submenu': [
            {
                'name': 'Undo',
                'function': 'undo',
            },
            {
                'name': 'Redo',
                'function': 'redo',
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
                        'function': 'viewMarching',
                    },
                    {
                        'name': 'Music View',
                        'function': 'viewMusic',
                    },
                    {
                        'name': '3D View',
                        'function': 'view3d',
                    },
                ],
            },
        ],
    },
]

editor_panel = [
    {
        'icon': 'fa-plus',
        'function': 'addStuntsheet',
    },
    {
        'icon': 'fa-undo',
        'function': 'undo',
    },
    {
        'icon': 'fa-repeat',
        'function': 'redo',
    },
]
