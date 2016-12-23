"""
Defines menus and toolbars used throughout the site, to be passed to templates as JSON strings in
script tags. Items in the menus/toolbars are represented by helper classes that output the HTML
for the menu/toolbar when rendered.

Menu and toolbar items are grouped into menu groups and toolbar groups, respectively. In the UI,
these groups will be separated by a line.

Functions are strings that represent a function defined in the associated ApplicationController
class. Functions can be of the form:
    - '<name>': the name of the function, to be run without arguments
    - '<name>(<args>, ...)': the name of the function, run with the given arguments. Arguments will try
      to be cast to a number, otherwise will be passed as a string. e.g. 'foo(bar)' runs `foo("bar")`
      and 'foo(1)' runs `foo(1)`.
"""

from django.utils.html import format_html, format_html_join, mark_safe
from django.utils.text import slugify

### MENU CLASSES ###

class Menu(object):
    """
    A Calchart Menu, in the format

    <ul class="menu">
        # for each submenu
        {{ SubMenu.render }}
    </ul>
    """
    def __init__(self, *submenus):
        self.submenus = submenus

    def render(self):
        return format_html(
            '<ul class="menu">{}</ul>',
            mark_safe(''.join(submenu.render(top_level=True) for submenu in self.submenus))
        )

class SubMenu(object):
    """
    A Calchart SubMenu, in the format

    <li class="has-submenu"> # .has-submenu if not top level
        <span>{{ name }}</span>
        <div class="submenu">
            # for each group
            <ul class="menu-group">
                # for each menu item, either SubMenu or MenuItem
                {{ item.render }}
            </ul>
        </div>
    </li>
    """
    def __init__(self, name, *groups):
        self.name = name
        self.groups = groups

    def render(self, top_level=False):
        li_class = '' if top_level else 'has-submenu'
        menu_groups = mark_safe(''.join(self.render_group(group) for group in self.groups))
        return format_html(
            '<li class="{}"><span>{}</span><div class="submenu">{}</div></li>',
            li_class, self.name, menu_groups
        )

    def render_group(self, group):
        return format_html(
            '<ul class="menu-group">{}</ul>',
            mark_safe(''.join(menu_item.render() for menu_item in group))
        )

class MenuItem(object):
    """
    A Calchart MenuItem, in the format

    <li data-function="{{ function }}">
        <span>{{ name }}</span>
    </li>
    """
    def __init__(self, name, function):
        self.name = name
        self.function = function

    def render(self):
        return format_html(
            '<li data-function="{}"><span>{}</span></li>',
            self.function, self.name
        )

class Toolbar(object):
    """
    A Calchart Toolbar, in the format

    <div class="toolbar">
        # for each group
        {{ ToolbarGroup.render }}
    </div>
    """
    def __init__(self, *groups):
        self.groups = groups

    def render(self):
        return format_html(
            '<div class="toolbar">{}</div>',
            mark_safe(''.join(group.render() for group in self.groups))
        )

class ToolbarGroup(object):
    """
    A Calchart ToolbarGroup, in the format

    <ul class="toolbar-group">
        # for each item
        {{ ToolbarItem.render }}
    </ul>
    """
    def __init__(self, *items):
        self.items = items

    def render(self):
        return format_html(
            '<ul class="{}">{}</ul>',
            self._get_classes(), mark_safe(''.join(item.render() for item in self.items))
        )

    def _get_classes(self):
        return 'toolbar-group'

class ToolbarContextGroup(ToolbarGroup):
    """
    A Calchart ToolbarContextGroup, in the format

    <ul class="toolbar-group hide {{ name }}-group">
        # for each item
        {{ ToolbarItem.render }}
    </ul>
    """
    def __init__(self, name, *items):
        super(ToolbarContextGroup, self).__init__(*items)
        self.name = name

    def _get_classes(self):
        classes = super(ToolbarContextGroup, self)._get_classes()
        return '%s hide %s-group' % (classes, self.name)

class ToolbarItem(object):
    """
    A Calchart ToolbarItem, in the format

    <li class="toolbar-item {{ class }}" data-name="{{ name }}" data-function="{{ function }}">
        <i class="icon-{{ icon }}"></i>
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, icon, function):
        self.name = name
        # icon class, e.g. "plus" (see css/fonts/icons-reference.html)
        self.icon = icon
        self.function = function

    def render(self):
        return format_html(
            '<li class="toolbar-item {}" data-name="{}" data-function="{}"><i class="icon-{}"></i></li>',
            slugify(self.name), self.name, self.function, self.icon
        )

class CustomToolbarItem(object):
    """
    A Calchart ToolbarItem, with custom HTML contents, in the format

    <li class="{{ name }}">
        {{ contents }}
    </li>
    """
    def __init__(self, name, contents):
        self.name = name
        self.contents = contents

    def render(self):
        return format_html(
            '<li class="{}">{}</li>',
            slugify(self.name), mark_safe(self.contents)
        )

### MENUS ###

editor_menu = Menu(
    SubMenu('File', [
        MenuItem('Save', 'saveShow'),
    ]),
    SubMenu('Edit', [
        MenuItem('Undo', 'undo'),
        MenuItem('Redo', 'redo'),
    ]),
    SubMenu('View', [
        SubMenu('View Mode', [
            MenuItem('Dot Editor', 'loadContext(default)'),
            MenuItem('Continuity Editor', 'loadContext(continuity)'),
            # MenuItem('Music Editor', 'loadContext(default)'),
            # MenuItem('3D View', 'loadContext(default)'),
        ]),
    ], [
        SubMenu('Zoom', [
            MenuItem('100%', ''), # TODO
        ]),
    ]),
)

editor_toolbar = Toolbar(
    ToolbarGroup(
        ToolbarItem('Add Stuntsheet', 'file-o', 'addStuntsheet'),
        ToolbarItem('Undo', 'undo', 'undo'),
        ToolbarItem('Redo', 'repeat', 'redo'),
    ),
    ToolbarGroup(
        ToolbarItem('Edit Dots', 'dot-circle-o', 'loadContext(dot)'),
        ToolbarItem('Edit Continuity', 'pencil-square-o', 'loadContext(continuity)'),
    ),
    ToolbarContextGroup(
        'edit-dots',
        ToolbarItem('Selection', 'selection', 'TODO'),
        ToolbarItem('Lasso', 'lasso', 'TODO'),
    ),
    ToolbarContextGroup(
        'edit-continuity',
        ToolbarItem('Previous Beat', 'chevron-left', 'TODO'),
        CustomToolbarItem('Seek', '<span>TODO</span>'), # TODO: seek bar
        ToolbarItem('Next Beat', 'chevron-right', 'TODO'),
    ),
)
