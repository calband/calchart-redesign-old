"""
Defines menus used throughout the site, to be passed to templates as JSON strings in
script tags. Menus are a list of dictionaries of the following format:
    - name (str, required): label to display in the menu
    - submenu (list, optional): any submenus to nest under the menu
    - shortcut (str, optional): keyboard shortcut to run the same action. Separate keys
        with "+". e.g. "ctrl+s" or "ctrl+shift_s". Meta keys: ctrl (same as cmd on Mac),
        alt, shift.
    - function (str, optional): the name of the Javascript function (defined in the
        Javascript file) to run when clicking on the menu.
"""

editor_menu = [
    {
        'name': 'File',
        'submenu': [
            {
                'name': 'Save',
                'shortcut': 'ctrl+s',
                'function': 'saveShow',
            },
        ],
    },
    {
        'name': 'Edit',
        'submenu': [],
    },
]
