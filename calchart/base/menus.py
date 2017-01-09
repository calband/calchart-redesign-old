"""
Defines menus and toolbars used throughout the site, to be passed to templates as JSON strings in
script tags. Items in the menus/toolbars are represented by helper classes that output the HTML
for the menu/toolbar when rendered.

Menu and toolbar items are grouped into menu groups and toolbar groups, respectively. In the UI,
these groups will be separated by a line.

Actions are strings that represent an action defined in the associated ApplicationController
class. See ApplicationController._parseAction for more details.
"""

from django.templatetags.static import static as get_static_path
from django.utils.html import format_html, format_html_join, mark_safe
from django.utils.text import slugify

from base.constants import DOT_TYPES

### MENU CLASSES ###

def _collapse(items):
    """
    _collapse([1,2,3]) -> [1,2,3]
    _collapse([[1,2,3]]) -> [1,2,3]
    """
    if len(items) == 1 and isinstance(items[0], list):
        return items[0]
    else:
        return items


class Menu(object):
    """
    A Calchart Menu, in the format

    <ul class="menu">
        # for each submenu
        {{ SubMenu.render }}
    </ul>
    """
    def __init__(self, *submenus):
        self.submenus = _collapse(submenus)

    def render(self):
        return format_html(
            '<ul class="menu">{}</ul>',
            mark_safe(''.join(submenu.render() for submenu in self.submenus))
        )

class SubMenu(object):
    """
    A Calchart SubMenu, in the format

    <li>
        {{ name }}
        <div class="submenu hover-menu">
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

    def render(self):
        menu_groups = mark_safe(''.join(self.render_group(group) for group in self.groups))
        return format_html(
            '<li>{}<div class="submenu hover-menu">{}</div></li>',
            self.name, menu_groups
        )

    def render_group(self, group):
        return format_html(
            '<ul class="menu-group">{}</ul>',
            mark_safe(''.join(menu_item.render() for menu_item in group))
        )

class MenuItem(object):
    """
    A Calchart MenuItem, in the format

    <li data-action="{{ action }}">{{ name }}</li>
    """
    def __init__(self, name, action):
        self.name = name
        self.action = action

    def render(self):
        return format_html(
            '<li data-action="{}">{}</li>',
            self.action, self.name
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

    <ul class="toolbar-group {{ kwargs.classes }}">
        # for each item
        {{ ToolbarItem.render }}
    </ul>
    """
    def __init__(self, *items, **kwargs):
        self.items = _collapse(items)
        self.classes = kwargs.get('classes', '')

    def render(self):
        return format_html(
            '<ul class="{}">{}</ul>',
            self._get_classes(), mark_safe(''.join(item.render() for item in self.items))
        )

    def _get_classes(self):
        return 'toolbar-group %s' % self.classes

class ToolbarContextGroup(ToolbarGroup):
    """
    A Calchart ToolbarContextGroup, in the format

    <ul class="toolbar-group hide {{ name }}-group">
        # for each item
        {{ ToolbarItem.render }}
    </ul>
    """
    def __init__(self, name, *items, **kwargs):
        items = _collapse(items)

        super(ToolbarContextGroup, self).__init__(*items, **kwargs)
        self.name = name

    def _get_classes(self):
        classes = super(ToolbarContextGroup, self)._get_classes()
        return '%s hide %s-group' % (classes, self.name)

class ToolbarItem(object):
    """
    A Calchart ToolbarItem, in the format

    <li class="toolbar-item {{ class }}" data-name="{{ name }}" data-action="{{ action }}">
        <i class="icon-{{ icon }}"></i>
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, icon, action):
        self.name = name
        # icon class, e.g. "plus" (see css/fonts/icons-reference.html)
        self.icon = icon
        self.action = action

    def render(self):
        return format_html(
            '<li class="toolbar-item {}" data-name="{}" data-action="{}">{}</li>',
            slugify(self.name), self.name, self.action, mark_safe(self._render_contents())
        )

    def _render_contents(self):
        return format_html('<i class="icon-{}"></i>', self.icon)

class ImageToolbarItem(ToolbarItem):
    """
    A Calchart ToolbarItem, in the format

    <li class="toolbar-item {{ class }}" data-name="{{ name }}" data-action="{{ action }}">
        <img src="{% static 'img/' + src %}">
    </li>

    where the class is the slugified name
    """
    def __init__(self, name, src, action):
        super(ImageToolbarItem, self).__init__(name, None, action)
        self.src = src

    def _render_contents(self):
        src = get_static_path('img/%s' % self.src)
        return format_html('<img src="{}">', src)

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
        ToolbarItem('Selection', 'selection', 'loadSelection(box)'),
        ToolbarItem('Lasso', 'lasso', 'loadSelection(lasso)'),
        classes='dot-selection',
    ),
    ToolbarContextGroup(
        'edit-dots',
        [
            ImageToolbarItem(label, 'dot-%s.png' % slug, 'changeDotType(%s)' % slug)
            for label, slug in DOT_TYPES
        ]
    ),
    ToolbarContextGroup(
        'edit-continuity',
        ToolbarItem('Previous Beat', 'chevron-left', 'prevBeat'),
        CustomToolbarItem('Seek', '<span class="bar"></span><span class="marker"></span>'),
        ToolbarItem('Next Beat', 'chevron-right', 'nextBeat'),
        ToolbarItem('Check Continuities', 'check', 'checkContinuities'),
    ),
)
