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
            '<ul class="toolbar-group">{}</ul>',
            mark_safe(''.join(item.render() for item in self.items))
        )

class ToolbarItem(object):
    """
    A Calchart ToolbarItem, in the format

    <li class="{{ class }}" data-name="{{ name }}" data-function="{{ function }}">
        <i class="fa {{ icon }}"></i>
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, icon, function):
        self.name = name
        # font-awesome icon class; e.g. "fa-plus" (http://fontawesome.io/icons/)
        self.icon = icon
        self.function = function

    def render(self):
        return format_html(
            '<li class="{}" data-name="{}" data-function="{}"><i class="fa {}"></i></li>',
            slugify(self.name), self.name, self.function, self.icon
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
        ToolbarItem('Add Stuntsheet', 'fa-plus', 'addStuntsheet'),
        ToolbarItem('Undo', 'fa-undo', 'undo'),
        ToolbarItem('Redo', 'fa-repeat', 'redo'),
    ),
    ToolbarGroup(
        ToolbarItem('Edit Dots', 'fa-dot-circle-o', 'loadContext(default)'),
        ToolbarItem('Edit Continuity', 'fa-pencil-square-o', 'loadContext(continuity)'),
    ),
)
